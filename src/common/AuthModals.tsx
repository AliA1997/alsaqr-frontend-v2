import { ModalBody, ModalPortal } from "@common/Modal";
import { useStore } from "@stores/index";
import { Formik, FormikErrors } from "formik";
import { motion } from "framer-motion";
import { observer } from "mobx-react-lite";
import { useCallback, useMemo, useState } from "react";
import { useConnect, useConnectors } from "wagmi";
import type { UserItemToDisplay, UserRegisterForm } from "@typings";
import { HobbiesAndOptionalInfoFormInputs, PersonalInfoFormInputs } from "./RegisterForm";
import UsersFeed from "@components/users/UsersFeed";
import { ReviewForm, ReviewUserHobbiesAndOtherInfo, ReviewUserPersonalInfo, ReviewUsersAdded } from "./ReviewForm";
import { ProfileImagePreview } from "./Containers";
import { DangerAlert } from "./Alerts";
import { MyInput } from "./Inputs";
import { supabase } from "@utils/infrastructure/supabase";
import { OAUTH_OPTIONS, ROUTES_USER_CANT_ACCESS } from "@utils/constants";
import { useLocation } from "react-router";
import { PageTitleNoPadding } from "./Titles";
import { capitalize } from "lodash";
import agent from "@utils/api/agent";
import { CommonUpsertBoxTypes, FilterKeys } from '@enums';
import { ButtonLoader, SkeletonLoader } from "./CustomLoader";

const NO_WALLET_MESSAGE = "No crypto wallet was found in this browser. Install MetaMask (metamask.io), Trust Wallet, or another web3 wallet extension, then reload this page to login with web3.";


export const LoginModal = observer(() => {
  const { pathname } = useLocation();
  const { authStore, modalStore } = useStore();
  const { auth, currentSessionUser, loginWithWeb3 } = authStore;
  const { closeModal, showModal } = modalStore;
  const { connectAsync, isPending: connectingWeb3 } = useConnect();
  const connectors = useConnectors();
  const [web3Error, setWeb3Error] = useState<string | undefined>(undefined);
  const [walletPickerOpen, setWalletPickerOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const currentToken = useMemo(() => auth?.getToken(), [auth?.getToken()]);

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

  // wagmi lists the generic injected() connector plus every EIP-6963 wallet it
  // discovers (MetaMask, Trust Wallet, …). Prefer discovered wallets; de-dupe by name.
  const walletChoices = useMemo(() => {
    const seen = new Set<string>();
    const unique = connectors.filter((c) => !seen.has(c.name) && seen.add(c.name));
    const discovered = unique.filter((c) => c.id !== "injected");
    return discovered.length > 0 ? discovered : unique;
  }, [connectors]);

  const connectWalletAndSignIn = useCallback(
    async (connector: (typeof walletChoices)[number]) => {
      setWeb3Error(undefined);
      try {
        const { accounts } = await connectAsync({ connector });
        setSubmitting(true);
        const sessionUser = await loginWithWeb3(accounts[0]);
        // Existing users are simply logged in; new users get the complete
        // registration modal from PageContainer once the session user is set.
        if (sessionUser) {
          closeModal();
          if(!sessionUser.isCompleted) showModal(<RegisterModal userInfo={sessionUser} />);
        }
      } catch (error) {
        const raw = error instanceof Error ? error.message : "";
        setWeb3Error(
          raw.includes("Provider not found")
            ? NO_WALLET_MESSAGE
            : raw.includes("rejected")
              ? "You dismissed the connection request in your wallet."
              : "Wallet connection failed. Please try again."
        );
      } finally {
        setSubmitting(false);
      }
    },
    [connectAsync, loginWithWeb3]
  );

  const handleWeb3SignIn = () => {
    setWeb3Error(undefined);
    const hasProvider = typeof window !== "undefined" && "ethereum" in window;
    if (!hasProvider && walletChoices.every((c) => c.id === "injected")) {
      setWeb3Error(NO_WALLET_MESSAGE);
      return;
    }

    if (walletChoices.length > 1) {
      setWalletPickerOpen((open) => !open);
      return;
    }

    void connectWalletAndSignIn(walletChoices[0]);
  };

  return (
    <ModalPortal>
      <ModalBody 
        canCloseLoginModal={!(ROUTES_USER_CANT_ACCESS.some(r => pathname.includes(r))) || !!currentToken}
        onClose={() => {
          const canCloseLoginModal = !(ROUTES_USER_CANT_ACCESS.some(r => pathname.includes(r)));

          if (canCloseLoginModal || currentSessionUser)
            closeModal();

        }}
      >
        <div className='flex flex-col justify-center'>
          
          {web3Error && (
            <DangerAlert
              title="Unable to login with Web3"
              message={web3Error}
              onClose={() => setWeb3Error(undefined)}
              className="mt-2"
            />
          )}

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

          <button
            className={`
                  flex items-center p-3 border rounded-lg font-medium
                  text-gray-600 border-gray-300 hover:bg-gray-100 hover:text-gray-800
                  dark:text-gray-200 dark:border-gray-600 dark:hover:bg-gray-700 dark:hover:text-white
                  disabled:opacity-40
                `}
            onClick={handleWeb3SignIn}
            disabled={connectingWeb3}
            data-testid="loginwithweb3button"
          >
            {connectingWeb3 || submitting ? (
              <ButtonLoader />
            ) : (
              <svg
                className="mr-2 h-[30px] w-[30px]"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth={1.5}
                aria-hidden="true"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M21 12a2.25 2.25 0 0 0-2.25-2.25H15a3 3 0 1 1-6 0H5.25A2.25 2.25 0 0 0 3 12m18 0v6a2.25 2.25 0 0 1-2.25 2.25H5.25A2.25 2.25 0 0 1 3 18v-6m18 0V9M3 12V9m18 0a2.25 2.25 0 0 0-2.25-2.25H5.25A2.25 2.25 0 0 0 3 9m18 0V6a2.25 2.25 0 0 0-2.25-2.25H5.25A2.25 2.25 0 0 0 3 6v3"
                />
              </svg>
            )}
            {connectingWeb3 ? "Check your wallet…" : submitting ? "Connecting..." : "Login with Web3"}

          </button>

          {walletPickerOpen && walletChoices.length > 1 && (
            <div className="mt-2 rounded-lg border border-gray-300 dark:border-gray-600 p-2">
              <p className="px-2 pb-1 pt-1 text-xs uppercase tracking-wide text-gray-400">
                Choose a wallet
              </p>
              {walletChoices.map((connector) => (
                <button
                  key={connector.uid}
                  onClick={() => {
                    setWalletPickerOpen(false);
                    void connectWalletAndSignIn(connector);
                  }}
                  className={`
                    flex w-full items-center gap-2 rounded-lg px-2 py-1.5 text-left text-sm
                    text-gray-600 hover:bg-gray-100 dark:text-gray-200 dark:hover:bg-gray-700
                  `}
                >
                  {connector.icon && (
                    <img src={connector.icon} alt="" className="h-4 w-4 rounded" />
                  )}
                  {connector.name}
                </button>
              ))}
            </div>
          )}
        </div>

      </ModalBody>
    </ModalPortal>
  );
});

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
    setCurrentSessionUser,
    resetCompleteRegistration,
    web3Address
  } = authStore;
  const { closeModal } = modalStore;
  const loggedInUserId = useMemo(() => userInfo?.id, [userInfo]);
  const walletAddress = useMemo(() => userInfo?.web3_address ?? web3Address ?? '', [userInfo, web3Address]);
  const isWeb3User = useMemo(() => !!walletAddress, [walletAddress]);

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
          {!userInfo?.username ? (
           <SkeletonLoader count={6} />
          ) : (
            <>
          <Formik
            initialValues={{
              avatar: currentRegistrationForm.avatar ? currentRegistrationForm.avatar : userInfo?.avatar ?? '',
              bgThumbnail: currentRegistrationForm.bgThumbnail ? currentRegistrationForm.bgThumbnail : userInfo?.bgThumbnail ?? '',
              username: currentRegistrationForm.username ? currentRegistrationForm.username : userInfo?.username ?? '',
              bio: currentRegistrationForm.bio ? currentRegistrationForm.bio : userInfo?.bio ?? '',
              email: currentRegistrationForm.email ? currentRegistrationForm.email : userInfo?.email ?? '',
              firstName: currentRegistrationForm.firstName ? currentRegistrationForm.firstName : userInfo?.firstName ?? '',
              lastName: currentRegistrationForm.lastName ? currentRegistrationForm.lastName : userInfo?.lastName ?? '',
              dateOfBirth: currentRegistrationForm.dateOfBirth ? currentRegistrationForm.dateOfBirth : userInfo?.dateOfBirth,
              countryOfOrigin: currentRegistrationForm.countryOfOrigin ? currentRegistrationForm.countryOfOrigin : userInfo?.countryOfOrigin ?? '',
              hobbies: currentRegistrationForm.hobbies ? currentRegistrationForm.hobbies : userInfo?.hobbies ?? [],
              maritalStatus: capitalize(currentRegistrationForm.maritalStatus ? currentRegistrationForm.maritalStatus : userInfo?.maritalStatus ?? "single"),
              religion: currentRegistrationForm.religion ? currentRegistrationForm.religion : userInfo?.religion ??  "Prefer Not To Disclose",
              followingUsers: currentRegistrationForm.followingUsers ? userInfo?.following : [],
              walletAddress
            } as UserRegisterForm}
            validate={values => {
              const errors: FormikErrors<any> = {};

              if (!values.username)
                errors.username = 'Username is required';
              // Web3 wallet users register without an email.
              if (!isWeb3User && !values.email)
                errors.email = 'Email is required';

              return errors;
            }}
            onSubmit={async (values, { setSubmitting }) => {
              await completeRegistration(loggedInUserId, values);
              setSubmitting(false);
              const checkData = isWeb3User
                ? await agent.userApiClient.web3SessionCheck(walletAddress)
                : await agent.userApiClient.sessionCheck((userInfo as any)["email"]);
              setCurrentSessionUser(checkData.result);
              auth?.setUser(checkData.result);
              window.location.href = '/';
              closeModal();
              resetCompleteRegistration();
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
                  <>
                    {isWeb3User && (
                      <MyInput
                        name="walletAddress"
                        label="Web3 Wallet Address"
                        aria-label="Web3 Wallet Address"
                        disabled
                        className="mb-1 h-8 text-base"
                      />
                    )}
                    <PersonalInfoFormInputs isWeb3={isWeb3User} />
                  </>
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
                                    web3Address={values.walletAddress}
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
                          <ButtonLoader />
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
            </>
          )}
        </motion.div>
      </ModalBody>
    </ModalPortal>
  );
});