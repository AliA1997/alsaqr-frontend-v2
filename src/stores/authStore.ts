import Auth from '@utils/auth';
import agent from '@utils/common';
import { DEFAULT_USER_REGISTRATION_FORM, inTestMode } from '@utils/constants';
import { testAuthUser } from '@utils/testData';
import { makeAutoObservable, runInAction } from 'mobx';
import { User, UserRegisterForm, UserRegisterFormDto } from 'typings';


export default class AuthStore {
  processingUserCheck: boolean = false;
  currentSessionUser: User | undefined = undefined;
  auth: Auth | undefined = undefined;
  constructor() {
    this.auth = new Auth();
    makeAutoObservable(this);
  }
  initializeFromStorage = async () => {
    if (!this.auth)
      this.auth = new Auth();

    if(inTestMode()) {
        this.auth.setUser(testAuthUser)
        this.setCurrentSessionUser(testAuthUser);
    } else if(!inTestMode() && this.auth?.isTestUser()) {
      this.resetAuthState();
      return;      
    } else {
      const loggedInUser = this.auth?.getUser();
      if (loggedInUser) {
        this.setCurrentSessionUser(loggedInUser);
      }
    }
  }
  loadingRegistration: boolean = false;
  loadingUpsert: boolean = false;
  currentStepInUserRegistration: number | undefined = 0;
  currentRegistrationForm: UserRegisterForm = DEFAULT_USER_REGISTRATION_FORM;

  setProcessingUserCheck = (val: boolean) => {
    this.processingUserCheck = val;
  }
  setLoadingRegistration = (val: boolean) => {
    this.loadingRegistration = val;
  }
  setLoadingUpsert = (val: boolean) => {
    this.loadingUpsert = val;
  }
  setCurrentStepInUserRegistration = (val: number | undefined) => {
    this.currentStepInUserRegistration = val;
  }
  setCurrentRegistrationForm = (val: UserRegisterForm) => {
    this.currentRegistrationForm = val;
  }

  setCurrentSessionUser = (currentUserPayload: User | undefined) => {
    this.currentSessionUser = currentUserPayload;
    if(currentUserPayload)
      this.auth?.setUser(currentUserPayload);

  };

  navigateBackToHome = () => {
    window.location.href = `${import.meta.env.VITE_PUBLIC_BASE_URL}/`;
  };

  resetAuthState = () => {
    if(this.auth) {
      this.auth?.clearToken();
      this.auth?.clearUser();
    }
    this.currentSessionUser = undefined;
  };

  completeRegistration = async (userId: string, registerForm: UserRegisterForm) => {

      this.setLoadingRegistration(true);
      try {
        const registerFormDto: UserRegisterFormDto = {...registerForm, followingUsers: registerForm.followingUsers.map(u => u.user.id)};

        await agent.userApiClient.completeRegistration(userId, registerFormDto) ?? {};

        runInAction(() => {
          this.setCurrentRegistrationForm(DEFAULT_USER_REGISTRATION_FORM);
          this.setCurrentStepInUserRegistration(0);
        });

      } finally {
          this.setLoadingRegistration(false);
      }

  }
  
}
