;
import { ModalBody, ModalPortal } from "@common/Modal";
import { FilterKeys, useStore } from "@stores/index";
import { Formik, FormikErrors } from "formik";
import { motion } from "framer-motion";
import { PagingParams } from "@models/common";
import { useCallback, useMemo, useState } from "react";
import toast from "react-hot-toast";
import { CommonUpsertBoxTypes, CreateListOrCommunityForm, PostToDisplay, UserItemToDisplay } from "@typings";
import { observer } from "mobx-react-lite";
import { ListOrCommunityFormInputs } from "./ListOrCommunityForm";
import UsersFeed from "@components/users/UsersFeed";
import { default as PostsFeed } from "@components/shared/Feed";
import { ReviewForm, ReviewUpsertListOrCommunity, ReviewPostsAdded, ReviewUsersAdded } from "./ReviewForm";
import { FALLBACK_POST_IMAGE_URL, inTestMode } from "@utils/constants";
import { ModalFooterButtons } from "./Buttons";
import { DangerAlert } from "./Alerts";
import { OptimizedPostImage } from "./Image";

interface Props {
    type: CommonUpsertBoxTypes;
    loggedInUserId: string;
    communityId?: string;
}

function ListOrCommunityUpsertModal({ type, loggedInUserId, communityId }: Props) {
    const toastMessage = useMemo(
        () => type === CommonUpsertBoxTypes.List
            ? 'New List Created'
            : type === CommonUpsertBoxTypes.CommunityDiscussion
                ? "Community Discussion Started" : 'New Community Found',
        [type]
    );

    const { modalStore, communityFeedStore, communityDiscussionFeedStore, listFeedStore } = useStore();
    const { closeModal } = modalStore;
    const [nsfwAlert, setNsfwAlert] = useState<string>('');


    const currentStep = useMemo(() => {
        if (type === CommonUpsertBoxTypes.Community) return (communityFeedStore.currentStepInCommunityCreation ?? 0);
        else if (type === CommonUpsertBoxTypes.CommunityDiscussion) return (communityDiscussionFeedStore.currentStepInCommunityDiscussionCreation ?? 0);
        else return (listFeedStore.currentStepInListCreation ?? 0);
    }, [
        type,
        communityFeedStore.currentStepInCommunityCreation,
        communityFeedStore.setCurrentStepInCommunityCreation,
        communityDiscussionFeedStore.currentStepInCommunityDiscussionCreation,
        communityDiscussionFeedStore.setCurrentStepInCommunityDiscussionCreation,
        listFeedStore.currentStepInListCreation,
        listFeedStore.setCurrentStepInListCreation,
    ]);
    const currentForm = useMemo(() => {
        if (type === CommonUpsertBoxTypes.Community) return communityFeedStore.communityCreationForm;
        else if (type === CommonUpsertBoxTypes.CommunityDiscussion) return (communityDiscussionFeedStore.communityDiscussionCreationForm ?? 0);
        else return listFeedStore.listCreationForm;
    }, [
        type,
        communityFeedStore.currentStepInCommunityCreation,
        communityFeedStore.setCurrentStepInCommunityCreation,
        communityDiscussionFeedStore.currentStepInCommunityDiscussionCreation,
        communityDiscussionFeedStore.setCurrentStepInCommunityDiscussionCreation,
        listFeedStore.currentStepInListCreation,
        listFeedStore.setCurrentStepInListCreation,
    ])


    const setCurrentStep = (val: number, form: CreateListOrCommunityForm, setErrors?: (errs: any) => void) => (e: any) => {
        e.preventDefault();
        const newErrors = validateForm(form);
        const goingForward = currentStep < val;

        if (hasErrors(newErrors) && goingForward) {
            if (setErrors)
                setErrors(newErrors)

            return;
        }

        if (type === CommonUpsertBoxTypes.Community) {
            communityFeedStore.setCommunityCreationForm(form);
            return communityFeedStore.setCurrentStepInCommunityCreation(val)
        }
        else if (type === CommonUpsertBoxTypes.CommunityDiscussion) {
            communityDiscussionFeedStore.setCommunityDiscussionCreationForm(form);
            return communityDiscussionFeedStore.setCurrentStepInCommunityDiscussionCreation(val)
        }
        else {
            listFeedStore.setListCreationForm(form);
            return listFeedStore.setCurrentStepInListCreation(val);
        }
    };


    const resetPagingParams = useCallback(() => {
        if (type === CommonUpsertBoxTypes.Community)
            communityFeedStore.setPagingParams(new PagingParams(1, 10));
        else if (type === CommonUpsertBoxTypes.CommunityDiscussion)
            communityDiscussionFeedStore.setPagingParams(new PagingParams(1, 10));
        else
            listFeedStore.setPagingParams(new PagingParams(1, 10));
    }, [type]);

    const upsert: (form: any, userId: string, communityId?: string) => Promise<void> = useCallback(
        (form: any, userId: string, communityId?: string) => {
            if (type === CommonUpsertBoxTypes.Community)
                return communityFeedStore.addCommunity(form, userId);
            else if (type === CommonUpsertBoxTypes.CommunityDiscussion)
                return communityDiscussionFeedStore.addCommunityDiscussion(form, userId, communityId!);
            else
                return listFeedStore.addList(form, userId);
        },
        [type]
    );

    const postRecord = async (values: any) => {
        let infoToUpsert: CreateListOrCommunityForm | undefined;

        if (type === CommonUpsertBoxTypes.Community)
            infoToUpsert = {
                name: values.name,
                avatarOrBannerImage: values.avatarOrBannerImage,
                isPrivate: values.isPrivate,
                tags: values.tags,
                usersAdded: values.usersAdded,
                postsAdded: []
            };
        else if (type === CommonUpsertBoxTypes.CommunityDiscussion)
            infoToUpsert = {
                name: values.name,
                avatarOrBannerImage: '',
                isPrivate: values.isPrivate,
                tags: values.tags,
                usersAdded: values.usersAdded,
                postsAdded: []
            };
        else if (type === CommonUpsertBoxTypes.List)
            infoToUpsert = {
                name: values.name,
                avatarOrBannerImage: values.avatarOrBannerImage,
                isPrivate: values.isPrivate,
                tags: values.tags,
                usersAdded: values.usersAdded,
                postsAdded: values.postsAdded
            };

        if (type === CommonUpsertBoxTypes.CommunityDiscussion)
            await upsert(infoToUpsert, loggedInUserId, communityId)
        else
            await upsert(infoToUpsert, loggedInUserId)

        resetPagingParams();

        toast(toastMessage, {
            icon: "🚀",
        });

    };

    const showAddPosts = useMemo(() => type === CommonUpsertBoxTypes.List ? currentStep === 1 : false, [currentStep]);
    const showAddUsers = useMemo(() => type === CommonUpsertBoxTypes.List ? currentStep === 2 : currentStep === 1, [currentStep]);
    const showReviewForm = useMemo(() => type === CommonUpsertBoxTypes.List ? currentStep === 3 : currentStep === 2, [currentStep]);

    const reviewInfoSectionTitle = useMemo(() => {
        if (type === CommonUpsertBoxTypes.Community) return "Community Info";
        else if (type === CommonUpsertBoxTypes.CommunityDiscussion) return "Community Discussion Info";
        else return "List Info";
    }, [type]);

    const validateForm = (values: any, setErrors?: (errorValues: any) => void) => {
        const errors: FormikErrors<any> = {};
        if (!values.name) {
            errors.name = 'Name is required';
        } else if (type != CommonUpsertBoxTypes.CommunityDiscussion && !values.avatarOrBannerImage) {
            errors.avatarOrBannerImage = type === CommonUpsertBoxTypes.Community ? 'Community avatar is required' : 'List banner image is required'
        } else if (!values.tags || !values.tags.length) {
            errors.tags = 'Tags is required'
        }

        if (setErrors)
            setErrors(errors);

        return errors;
    }

    const title = useMemo(() => {
        if (type === CommonUpsertBoxTypes.Community)
            return 'Start a New Community';
        else if (type === CommonUpsertBoxTypes.CommunityDiscussion)
            return 'Start a New Discussion';
        else
            return 'Create your List'
    }, [type])
    const hasErrors = (err?: any) => err ? Object.values(err).some(v => !!v) : Object.values(err).some(v => !!v);

    return (
        <ModalPortal>
            <ModalBody
                headerChildren={(
                    <div className='d-flex w-full'>
                        <p className='font-bold text-3xl text-gray-900 dark:text-gray-50 w-full pl-[1.5rem]'>{title}</p>
                        <button
                            onClick={() => closeModal()}
                            style={{ background: 'transparent' }}
                            className="absolute right-6 top-0 text-gray-400 hover:text-gray-600 px-3 py-5 block float-right cursor-pointer"
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
                )}
                onClose={() => closeModal()}
                style={{ background: '#0e1517' }}
            >
                <motion.div
                    initial={{ opacity: 0 }}
                    whileInView={{ opacity: 1 }}
                    viewport={{ once: true }}
                    className="flex flex-col space-x-2 p-5"
                >
                    {nsfwAlert && (
                        <DangerAlert
                            title="NSFW Photos Not Allowed"
                            message={nsfwAlert}
                            onClose={() => setNsfwAlert('')}
                        />
                    )}
                    <Formik
                        initialValues={{
                            name: currentForm?.name ?? '',
                            avatarOrBannerImage: inTestMode() ? FALLBACK_POST_IMAGE_URL : currentForm?.avatarOrBannerImage,
                            isPrivate: currentForm?.isPrivate ?? 'public',
                            tags: currentForm?.tags && currentForm?.tags.length > 0 ? currentForm?.tags : [],
                            usersAdded: currentForm?.usersAdded && currentForm?.usersAdded.length > 0 ? currentForm?.usersAdded : [],
                            postsAdded: []
                        } as CreateListOrCommunityForm}
                        validate={values => {
                            return validateForm(values);
                        }}
                        onSubmit={async (values, { setSubmitting }) => {
                            try {
                                setSubmitting(true);
                                setNsfwAlert(''); // Since we check before they review the list,community or communtiy discussion.
                                await postRecord(values);
                            } finally {
                                setSubmitting(false);
                            }
                        }}
                    >
                        {({
                            values,
                            errors,
                            setErrors,
                            handleSubmit,
                            setFieldValue,
                            setValues,
                            isSubmitting
                        }) => (
                            <form
                                onSubmit={handleSubmit}
                                className="flex flex-1 flex-col"
                                data-testid="modalform"
                            >
                                {type === CommonUpsertBoxTypes.Community
                                    ? (
                                        <OptimizedPostImage
                                            src={values.avatarOrBannerImage ? values.avatarOrBannerImage : 'https://robohash.org/placeholder'}
                                            alt={values.name}
                                            classNames='h-20 w-20 rounded-full'
                                        />
                                    )
                                    : type === CommonUpsertBoxTypes.List
                                        ? (
                                            <motion.div
                                                className="flex justify-center items-center bg-gray-100 w-full h-[10em] relative"
                                                style={{
                                                    backgroundImage: `url('${values.avatarOrBannerImage}')`,
                                                    backgroundSize: 'cover',
                                                    backgroundRepeat: 'no-repeat'
                                                }}
                                            ></motion.div>
                                        ) : null
                                }
                                {currentStep === 0 && (
                                    <ListOrCommunityFormInputs type={type} />
                                )}
                                {showAddPosts && (
                                    <PostsFeed
                                        title="Posts to Add"
                                        hideTweetBox={true}
                                        filterKey={FilterKeys.SearchPosts}
                                        onAdd={(p: PostToDisplay) => {
                                            const postFoundIdx = values.postsAdded.findIndex(pst => pst.post.id === p.post.id);

                                            if (postFoundIdx !== -1) {
                                                const newPostsAddedArray = values.postsAdded.slice();
                                                newPostsAddedArray.splice(postFoundIdx, 1);
                                                setFieldValue('postsAdded', newPostsAddedArray);
                                            } else {
                                                const distinctPosts = Array.from(new Set([...values.postsAdded, p]).values());
                                                setFieldValue('postsAdded', distinctPosts);
                                            }
                                        }}
                                        postsAlreadyAddedByIds={values.postsAdded.map(pst => pst.post.id)}
                                    />
                                )}
                                {showAddUsers && (
                                    <UsersFeed
                                        title="Users to Add"
                                        loggedInUserId={loggedInUserId}
                                        filterKey={FilterKeys.SearchUsers}
                                        onAddOrFollow={(u: UserItemToDisplay) => {
                                            const userFoundIdx = values.usersAdded.findIndex(user => user.user.id === u.user.id);

                                            if (userFoundIdx !== -1) {
                                                const newUsersAddedArray = values.usersAdded.slice();
                                                newUsersAddedArray.splice(userFoundIdx, 1);
                                                setFieldValue('usersAdded', newUsersAddedArray);
                                            } else {
                                                const distinctUsers = Array.from(new Set([...values.usersAdded, u]).values());
                                                setFieldValue('usersAdded', distinctUsers);
                                            }
                                        }}
                                        usersAlreadyAddedOrFollowedByIds={values.usersAdded.map(u => u.user.id)}
                                    />
                                )}
                                {showReviewForm && (
                                    <ReviewForm
                                        sections={
                                            (function () {
                                                var sections = [
                                                    {
                                                        title: reviewInfoSectionTitle,
                                                        jsx: (
                                                            <ReviewUpsertListOrCommunity
                                                                name={values.name}
                                                                avatarOrImage={values.avatarOrBannerImage}
                                                                visibility={values.isPrivate}
                                                                tags={values.tags}
                                                                type={type}
                                                            />
                                                        ),
                                                    },
                                                    {
                                                        title: 'Users Added',
                                                        jsx: (
                                                            <ReviewUsersAdded
                                                                usersAdded={values.usersAdded}
                                                            />
                                                        ),
                                                    }
                                                ];

                                                if (type === CommonUpsertBoxTypes.List)
                                                    sections = [
                                                        sections[0],
                                                        {
                                                            title: 'Posts Added',
                                                            jsx: (
                                                                <ReviewPostsAdded
                                                                    postsAdded={values.postsAdded}
                                                                />
                                                            ),
                                                        },
                                                        sections[1]
                                                    ];

                                                return sections;
                                            }())
                                        }
                                        type={type}
                                    />
                                )}
                                <ModalFooterButtons
                                    errors={errors}
                                    setErrors={setErrors}
                                    values={values}
                                    modalType={type}
                                    submitting={isSubmitting}
                                    nsfwKeysToCheck={type === CommonUpsertBoxTypes.CommunityDiscussion ? [] : ['avatarOrBannerImage']}
                                    setValues={(vals: any) => setValues(vals)}
                                    nsfwAlert={nsfwAlert}
                                    setNsfwAlert={(val: string) => setNsfwAlert(val)}
                                    setCurrentStep={setCurrentStep}
                                />
                            </form>
                        )}
                    </Formik>
                </motion.div>
            </ModalBody>
        </ModalPortal>
    );
}

export default observer(ListOrCommunityUpsertModal);