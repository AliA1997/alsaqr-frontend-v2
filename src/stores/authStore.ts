import Auth from '@utils/auth';
import agent from '@utils/api/agent';
import { DEFAULT_USER_REGISTRATION_FORM, inTestMode } from '@utils/constants';
import { testAuthUser } from '@utils/testing/testData';
import { makeAutoObservable, runInAction } from 'mobx';
import { User, UserRegisterForm, UserRegisterFormDto } from 'typings';


export default class AuthStore {
  processingUserCheck: boolean = false;
  currentSessionUser: User | undefined = undefined;
  web3Address: string | undefined = undefined;
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
        if (loggedInUser.web3_address)
          this.setWeb3Address(loggedInUser.web3_address);
        return loggedInUser.id;
      }
      return this.currentSessionUser?.id;
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

  setToken = (accessToken: string) => {
    if(this.auth) 
      this.auth.setToken(accessToken);
  }

  setWeb3Address = (val: string | undefined) => {
    this.web3Address = val;
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
    this.web3Address = undefined;
  };

  loginWithWeb3 = async (walletAddress: string) => {
    this.setProcessingUserCheck(true);
    try {
      await agent.userApiClient.web3SessionSignin(walletAddress);
      const checkData = await agent.userApiClient.web3SessionCheck(walletAddress);

      return runInAction(() => {
        this.setWeb3Address(walletAddress);

        if (checkData?.result) {
          const sessionUser: User = { ...checkData.result, web3_address: walletAddress };
          this.setCurrentSessionUser(sessionUser);
          return sessionUser;
        }
        return undefined;
      });
    } finally {
      this.setProcessingUserCheck(false);
    }
  };

  completeRegistration = async (userId: string, registerForm: UserRegisterForm) => {

      this.setLoadingRegistration(true);
      try {
        const registerFormDto: UserRegisterFormDto = {...registerForm, followingUsers: registerForm.followingUsers.filter(u => !!u).map(u => u.id)};

        await agent.userApiClient.completeRegistration(userId, registerFormDto) ?? {};


      } finally {
          this.setLoadingRegistration(false);
      }

  }
  resetCompleteRegistration = () => {
    runInAction(() => {
      this.setCurrentRegistrationForm(DEFAULT_USER_REGISTRATION_FORM);
      this.setCurrentStepInUserRegistration(0);
    });
  }
  
}
