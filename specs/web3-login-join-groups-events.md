# Overview 
- Users can login using their web3 wallet such as metamask, trust wallet, and others.
- When a user logs in with their web3 wallet. It should display their account like other users.
- If a new user logs in with their web3 wallet it should show the complete registration modal, and they should put their new username, Email wouldn't be required in this case.


## Implementation Steps
- Install new npm packages for handling web3 login look at wagmi or rainbow kit, which ever one fits a vite project.
- Add to the login modal to have a "Login with Web3" button. If they don't have a digital crypto wallet on their browser, display an error message indicating that they needed to install metamask or another crypto wallet to login with web3.
- Make the username required in the complete registration modal, and the email.


## Rules
- The sidebar should open the login modal, and the modal should display a login with web3 button.
- If an existing user logs in with their web3 wallet, and they have an existing account. It should just log them in.
- If the an new user logs in with their web3 wallet. Should display the complete registration page, and they would have to put in their username.


## Acceptance
- Pass Tests
1) Open the login modal, should open login with web3 button. Should logs the user in.
- Fail Tests
1) Open login modal, should try to login with web3, but they don't have metamask or another web3 provider installed. So they can't login, therefore display an dangeralert indicating they need install a crypto wallet.


# Out of Scope
- SHould not display web3 address on the user profile or anywhere on the app, only the complete registration page, as a disabled field.


# Referenced Code
1) Code on how to login with web3 wallet.
```typescript
"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import {
  useAccount,
  useChains,
  useConnect,
  useDisconnect,
  useSwitchChain,
} from "wagmi";
import { useToasts } from "./Toasts";
import { LAST_WALLET_KEY } from "./Skeleton";
import { shortAddress } from "@/lib/format";
import type { AppConfig } from "@/lib/wagmi";

type ChainId = AppConfig["chains"][number]["id"];

/**
 * Wallet connect + chain switcher. Handles the wallet states the constitution
 * requires: no wallet installed (explicit message), multiple wallet extensions
 * (EIP-6963 picker), connect rejection/failure (surfaced as toasts â€” never
 * silent), wrong/unknown chain, and connected.
 */
export function WalletButton() {
  const { address, chainId, isConnected } = useAccount();
  const { connect, connectors, isPending: connecting, error: connectError } = useConnect();
  const { disconnect } = useDisconnect();
  const { switchChain, isPending: switching } = useSwitchChain();
  const chains = useChains();
  const toasts = useToasts();
  const [menuOpen, setMenuOpen] = useState(false);
  const [pickerOpen, setPickerOpen] = useState(false);

  const activeChain = chains.find((c) => c.id === chainId);

  // Remember the last connected state so the lazy-load skeleton can show it
  // instead of a generic placeholder ("previous state" while loading).
  useEffect(() => {
    try {
      if (isConnected && address) {
        window.localStorage.setItem(
          LAST_WALLET_KEY,
          JSON.stringify({ address, chainName: activeChain?.name }),
        );
      } else {
        window.localStorage.removeItem(LAST_WALLET_KEY);
      }
    } catch {
      // storage unavailable â€” skeleton just stays generic
    }
  }, [isConnected, address, activeChain?.name]);

  // Surface connect failures â€” a silently swallowed error looks like a dead button.
  const reportedError = useRef<unknown>(null);
  useEffect(() => {
    if (!connectError || connectError === reportedError.current) return;
    reportedError.current = connectError;
    const raw = connectError.message;
    const detail = raw.includes("Provider not found")
      ? "No wallet extension responded. Install MetaMask (metamask.io), then reload this page."
      : raw.includes("rejected")
        ? "You dismissed the connection request in your wallet."
        : raw.split("\n")[0];
    toasts.push({ kind: "error", title: "Wallet connection failed", detail });
  }, [connectError, toasts]);

  // wagmi lists the generic injected() connector plus every EIP-6963 wallet it
  // discovers (MetaMask, Rabby, â€¦). Prefer discovered wallets; de-dupe by name.
  const walletChoices = useMemo(() => {
    const seen = new Set<string>();
    const unique = connectors.filter((c) => !seen.has(c.name) && seen.add(c.name));
    const discovered = unique.filter((c) => c.id !== "injected");
    return discovered.length > 0 ? discovered : unique;
  }, [connectors]);

  if (!isConnected || !address) {
    const handleConnect = () => {
      const hasProvider = typeof window !== "undefined" && "ethereum" in window;
      if (!hasProvider && walletChoices.every((c) => c.id === "injected")) {
        toasts.push({
          kind: "error",
          title: "No wallet found",
          detail:
            "This browser has no wallet extension. Install MetaMask from metamask.io, then reload.",
        });
        return;
      }
      if (walletChoices.length > 1) {
        setPickerOpen((open) => !open);
        return;
      }
      connect({ connector: walletChoices[0] });
    };

    return (
      <div className="relative">
        <button className="btn-primary" disabled={connecting} onClick={handleConnect}>
          {connecting ? "Check your walletâ€¦" : "Connect Wallet"}
        </button>
        {pickerOpen && (
          <div className="card absolute right-0 mt-2 w-56 p-2 shadow-2xl">
            <p className="px-2 pb-1 pt-1 text-[11px] uppercase tracking-wide text-zinc-500">
              Choose a wallet
            </p>
            {walletChoices.map((connector) => (
              <button
                key={connector.uid}
                onClick={() => {
                  setPickerOpen(false);
                  connect({ connector });
                }}
                className="flex w-full items-center gap-2 rounded-lg px-2 py-1.5 text-left text-sm text-zinc-200 hover:bg-zinc-800"
              >
                {connector.icon && (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={connector.icon} alt="" className="h-4 w-4 rounded" />
                )}
                {connector.name}
              </button>
            ))}
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="relative">
      <button className="btn-ghost font-mono text-xs" onClick={() => setMenuOpen((open) => !open)}>
        <span
          className={`h-2 w-2 rounded-full ${activeChain ? "bg-emerald-500" : "bg-amber-500"}`}
        />
        {activeChain?.name ?? "Unsupported chain"} Â· {shortAddress(address)}
      </button>

      {menuOpen && (
        <div className="card absolute right-0 mt-2 w-64 p-2 shadow-2xl">
          <p className="px-2 pb-1 pt-1 text-[11px] uppercase tracking-wide text-zinc-500">
            Switch network
          </p>
          {chains.map((chain) => (
            <button
              key={chain.id}
              disabled={switching || chain.id === chainId}
              onClick={() => {
                switchChain({ chainId: chain.id as ChainId });
                setMenuOpen(false);
              }}
              className={`flex w-full items-center justify-between rounded-lg px-2 py-1.5 text-left text-sm hover:bg-zinc-800 disabled:opacity-50 ${
                chain.id === chainId ? "text-emerald-400" : "text-zinc-300"
              }`}
            >
              {chain.name}
              {chain.id === chainId && <span>â—</span>}
            </button>
          ))}
          <div className="mt-1 border-t border-zinc-800 pt-1">
            <button
              onClick={() => {
                disconnect();
                setMenuOpen(false);
              }}
              className="w-full rounded-lg px-2 py-1.5 text-left text-sm text-red-400 hover:bg-zinc-800"
            >
              Disconnect
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
```

2) The auth store to hold the web3 address
```typescript
import Auth from '@utils/auth';
import agent from '@utils/api/agent';
import { DEFAULT_USER_REGISTRATION_FORM, inTestMode } from '@utils/constants';
import { testAuthUser } from '@utils/testing/testData';
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
        const registerFormDto: UserRegisterFormDto = {...registerForm, followingUsers: registerForm.followingUsers.map(u => u.id)};

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

```

3) Login modal where the functionality would live to login with a web3 wallet
```typescript


export const LoginModal = observer(() => {
  const { pathname } = useLocation();
  const { authStore, modalStore } = useStore();
  const { currentSessionUser } = authStore;
  const { closeModal } = modalStore;

  const handleDiscordSignIn = () => supabase.auth.signInWithOAuth({
    provider: "discord",
    options: OAUTH_OPTIONS
  });
  const handleGoogleSignIn = () => supabase.auth.signInWithOAuth({
    provider: "google",
    options: OAUTH_OPTIONS
  });
  const handleFacebookSignIn = () => supabase.auth.signInWithOAuth({
    provider: "facebook",
    options: OAUTH_OPTIONS
  });
  
  return (
    <ModalPortal>
      <ModalBody onClose={() => {
        const canCloseLoginModal = !(ROUTES_USER_CANT_ACCESS.some(r => pathname.includes(r)));

        if (canCloseLoginModal || currentSessionUser)
          closeModal();

      }}>
        <div className='flex flex-col justify-center'>
          <button
            className={`
              flex items-center p-3 border rounded-lg font-medium 
              text-gray-600 border-gray-300 hover:bg-gray-100 hover:text-gray-800
              dark:text-gray-200 dark:border-gray-600 dark:hover:bg-gray-700 dark:hover:text-white
           `}
            onClick={handleGoogleSignIn}
          >
            <img
              src="/google-icon.svg"
              height={30}
              width={30}
              alt="Google Social Button Icon"
              className="mr-2"
            />
            Sign in with Google
          </button>

          <button
            className={`
              flex items-center p-3 border rounded-lg font-medium 
              text-gray-600 border-gray-300 hover:bg-gray-100 hover:text-gray-800
              dark:text-gray-200 dark:border-gray-600 dark:hover:bg-gray-700 dark:hover:text-white
            `}
            onClick={handleFacebookSignIn}
          >
            <img
              src="/facebook-icon.svg"
              height={30}
              width={30}
              alt="Facebook Social Button Icon"
              className="mr-2"
            />
            Sign in with Facebook
          </button>
          
          <button
            className={`
                  flex items-center p-3 border rounded-lg font-medium 
                  text-gray-600 border-gray-300 hover:bg-gray-100 hover:text-gray-800
                  dark:text-gray-200 dark:border-gray-600 dark:hover:bg-gray-700 dark:hover:text-white
                `}
            onClick={handleDiscordSignIn}
          >
            <img
              src="/discord-icon.svg"
              height={30}
              width={30}
              alt="Discord Social Button Icon"
              className="mr-2"
            />
            Sign in with Discord
          </button>
        </div>

      </ModalBody>
    </ModalPortal>
  );
});

```

4) Complete Registration Modal that would have a disabled input with a web3 address.
```typescript

type RegisterModalProps = {
  userInfo: { [key:string]: any } | undefined;
}

export const  RegisterModal = observer(({ userInfo }: RegisterModalProps) => {
  const { authStore, modalStore } = useStore();
  const { 
    setCurrentStepInUserRegistration, 
    loadingRegistration, 
    currentStepInUserRegistration, 
    setCurrentRegistrationForm, 
    currentRegistrationForm,
    completeRegistration,
    auth,
    setCurrentSessionUser
  } = authStore;
  const { closeModal } = modalStore;
  const loggedInUserId = useMemo(() => userInfo?.id, [userInfo]);

  const setCurrentStep = useCallback((val: number, currentForm?: UserRegisterForm) => (e: any) => {
    e.preventDefault();
    setCurrentStepInUserRegistration(val);
    if(val > 0 && currentForm)
      setCurrentRegistrationForm(currentForm!);
  }, [currentStepInUserRegistration])

  const currentStep = useMemo(() => currentStepInUserRegistration ?? 0, [currentStepInUserRegistration]);
  const lastStepBeforeReview = useMemo(() => currentStepInUserRegistration === 2, [currentStepInUserRegistration]);
  const showReviewForm = useMemo(() => currentStepInUserRegistration === 3, [currentStepInUserRegistration]);

  return (
    <ModalPortal className='h-15'>
      <ModalBody 
      headerChildren={
        <div className='flex flex-1 w-full justify-between items-start'>
          <PageTitleNoPadding>Complete your Account</PageTitleNoPadding>
          <button
            onClick={() => {
              closeModal();
            }}
            className="text-gray-400 hover:text-gray-600 block float-right cursor-pointer"
          >
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>
          
      }
      onClose={() => {
        closeModal();
      }}>
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="flex space-x-2 p-5"
        >
          <Formik
            initialValues={{
              avatar: currentRegistrationForm.avatar ? currentRegistrationForm.avatar : userInfo?.avatar ?? '',
              bgThumbnail: currentRegistrationForm.bgThumbnail ? currentRegistrationForm.bgThumbnail : userInfo?.bgThumbnail ?? '',
              username: currentRegistrationForm.username ? currentRegistrationForm.username : userInfo?.username ?? '',
              bio: currentRegistrationForm.bio ? currentRegistrationForm.bio : userInfo?.bio ?? '',
              email: currentRegistrationForm.email ? currentRegistrationForm.email : userInfo?.email ?? '',
              firstName: currentRegistrationForm.firstName ? currentRegistrationForm.firstName : userInfo?.firstName ?? '',
              lastName: currentRegistrationForm.lastName ? userInfo?.lastName : '',
              dateOfBirth: currentRegistrationForm.dateOfBirth ? currentRegistrationForm.dateOfBirth : userInfo?.dateOfBirth,
              countryOfOrigin: currentRegistrationForm.countryOfOrigin ? currentRegistrationForm.countryOfOrigin : userInfo?.countryOfOrigin ?? '',
              hobbies: currentRegistrationForm.hobbies ? currentRegistrationForm.hobbies : userInfo?.hobbies ?? [],
              maritalStatus: capitalize(currentRegistrationForm.maritalStatus ? currentRegistrationForm.maritalStatus : userInfo?.maritalStatus ?? "single"),
              religion: currentRegistrationForm.religion ? currentRegistrationForm.religion : userInfo?.religion ??  "Prefer Not To Disclose",
              followingUsers: currentRegistrationForm.followingUsers ? userInfo?.following : []
            } as UserRegisterForm}
            validate={_ => {
              const errors: FormikErrors<any> = {};


              return errors;
            }}
            onSubmit={async (values, { setSubmitting }) => {
              await completeRegistration(loggedInUserId, values);
              setSubmitting(false);
              const checkData = await agent.userApiClient.sessionCheck((userInfo as any)["email"]);
              setCurrentSessionUser(checkData.result);
              auth?.setUser(checkData.result);
              window.location.href = '/';
              closeModal();
            }}
          >
            {({
              values,
              errors,
              handleSubmit,
              setFieldValue,
            }) => (
              <form onSubmit={handleSubmit} className="flex flex-1 flex-col">
                  {showReviewForm && <h3 className="font-medium text-lg p-4">Review Registration</h3>}
                  <ProfileImagePreview 
                      avatar={values.avatar}
                      bgThumbnail={values.bgThumbnail}
                      username={values.username}
                  />
                
                {currentStepInUserRegistration === 0 && (
                  <PersonalInfoFormInputs />
                )}
                {currentStepInUserRegistration === 1 && (
                  <HobbiesAndOptionalInfoFormInputs />
                )}
                {currentStepInUserRegistration === 2 && (
                    <UsersFeed
                        title="Users to Add"
                        loggedInUserId={loggedInUserId}
                        filterKey={FilterKeys.Register}
                        onAddOrFollow={(u: UserItemToDisplay) => {
                            const userFoundIdx = values.followingUsers.findIndex(userItem => userItem.id === u.id);
                            if (userFoundIdx !== -1) {
                                const newFollowingUsersArray = values.followingUsers.slice();
                                newFollowingUsersArray.splice(userFoundIdx, 1);
                                setFieldValue('followingUsers', newFollowingUsersArray);
                            } else {
                                const distinctUsers = Array.from(new Set([...values.followingUsers, u]).values());
                                setFieldValue('followingUsers', distinctUsers);
                            }
                        }}
                        usersAlreadyAddedOrFollowedByIds={(values.followingUsers ?? []).map(u => u.id)}
                    />
                )}
                
                {showReviewForm && (
                  <ReviewForm
                      sections={[
                        {
                            title: 'User Personal Info',
                            jsx: (
                                <ReviewUserPersonalInfo
                                    email={values.email}
                                    username={values.username}
                                    firstName={values.firstName}
                                    lastName={values.lastName}
                                    avatar={values.avatar}
                                    bgThumbnail={values.bgThumbnail}
                                    dateOfBirth={values.dateOfBirth}
                                />
                            ),
                        },
                        {
                            title: 'Hobbies and Other Info',
                            jsx: (
                                <ReviewUserHobbiesAndOtherInfo
                                    countryOfOrigin={values.countryOfOrigin ?? ''}
                                    hobbies={values.hobbies ?? []}
                                    maritalStatus={values.maritalStatus ?? ''}
                                    religion={values.religion ?? ''}
                                />
                            ),
                        },
                        {
                            title: 'Users Followed',
                            jsx: (
                              <ReviewUsersAdded
                                  usersAdded={values.followingUsers}
                              />
                            ),
                        }
                      ]}
                      type={CommonUpsertBoxTypes.Register}
                      hideTitle={true}
                  />
                )}

                <div className="flex justify-between items-center mt-2 w-full space-x-2">
                  {currentStep > 0 && (
                    <button
                      type="button"
                      onClick={setCurrentStep(currentStep === 0 ? 0 : currentStep - 1)}
                      className="rounded-full bg-gray-200 px-5 py-2 font-bold text-gray-700"
                    >
                      Back
                    </button>
                  )}

                  {showReviewForm
                    ? (
                      <button
                        type='submit'
                        disabled={Object.values(errors).some(v => !!v) || loadingRegistration}
                        className={`rounded-full bg-[#55a8c2] px-5 py-2 font-bold text-white disabled:opacity-40`}
                      >
                        {loadingRegistration ? (
                          <svg
                            aria-hidden="true"
                            className="inline w-6 h-6 text-gray-200 animate-spin dark:text-gray-600 fill-[#55a8c2]"
                            viewBox="0 0 100 101"
                            fill="none"
                            xmlns="http://www.w3.org/2000/svg"
                          >
                            <path
                              d="M100 50.5908C100 78.2051 77.6142 100.591 50 100.591C22.3858 100.591 0 78.2051 0 50.5908C0 22.9766 22.3858 0.59082 50 0.59082C77.6142 0.59082 100 22.9766 100 50.5908ZM9.08144 50.5908C9.08144 73.1895 27.4013 91.5094 50 91.5094C72.5987 91.5094 90.9186 73.1895 90.9186 50.5908C90.9186 27.9921 72.5987 9.67226 50 9.67226C27.4013 9.67226 9.08144 27.9921 9.08144 50.5908Z"
                              fill="currentColor"
                            />
                            <path
                              d="M93.9676 39.0409C96.393 38.4038 97.8624 35.9116 97.0079 33.5539C95.2932 28.8227 92.871 24.3692 89.8167 20.348C85.8452 15.1192 80.8826 10.7238 75.2124 7.41289C69.5422 4.10194 63.2754 1.94025 56.7698 1.05124C51.7666 0.367541 46.6976 0.446843 41.7345 1.27873C39.2613 1.69328 37.813 4.19778 38.4501 6.62326C39.0873 9.04874 41.5694 10.4717 44.0505 10.1071C47.8511 9.54855 51.7191 9.52689 55.5402 10.0491C60.8642 10.7766 65.9928 12.5457 70.6331 15.2552C75.2735 17.9648 79.3347 21.5619 82.5849 25.841C84.9175 28.9121 86.7997 32.2913 88.1811 35.8758C89.083 38.2158 91.5421 39.6781 93.9676 39.0409Z"
                              fill="currentFill"
                            />
                          </svg>
                        ) : (
                          'Submit'
                        )}
                      </button>
                    )
                    : lastStepBeforeReview ? (
                      <button
                        type="button"
                        onClick={setCurrentStep(currentStep + 1, values)}
                        disabled={Object.values(errors).some(v => !!v)}
                        className={`rounded-full bg-[#55a8c2] px-5 py-2 font-bold text-white disabled:opacity-40`}
                      >
                        Review
                      </button>
                    ) : (
                      <button
                        type="button"
                        onClick={setCurrentStep(currentStep + 1, values)}
                        disabled={Object.values(errors).some(v => !!v)}
                        className={`rounded-full bg-[#55a8c2] px-5 py-2 font-bold text-white disabled:opacity-40`}
                      >
                        Next
                      </button>
                    )}
                </div>
              </form>
            )}
          </Formik>
        </motion.div>
      </ModalBody>
    </ModalPortal>
  );
});
```