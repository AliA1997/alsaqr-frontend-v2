import { ModalBody, ModalPortal } from "@common/Modal";
import { useStore } from "@stores/index";
import { Formik, FormikErrors } from "formik";
import { motion } from "framer-motion";
import { PagingParams } from "@models/common";
import { useCallback, useMemo } from "react";
import toast from "react-hot-toast";
import { CommonUpsertBoxTypes } from "@enums";
import { observer } from "mobx-react-lite";
import { ListOrCommunityFormInputs } from "./ListOrCommunityForm";
import { ReviewForm, ReviewUpsertListOrCommunity } from "./ReviewForm";
import { CommunityDiscussionAdminInfo, UpdateCommunityDiscussionForm } from "@models/community";
import { PageTitleNoPadding } from "./Titles";
import { ButtonLoader } from "@common/CustomLoader";

interface Props {
    loggedInUserId: string;
    communityDiscussionAdminInfo: CommunityDiscussionAdminInfo;
    refreshCommunityDiscussionAdminInfo: (communityId: string) => Promise<void>;
}

function UpdateCommunityDiscussionModal({ communityDiscussionAdminInfo, refreshCommunityDiscussionAdminInfo }: Props) {
    const toastMessage = useMemo(() => "Discussion Updated", []);

    const { communityDiscussionFeedStore, modalStore } = useStore();
    const { closeModal } = modalStore;

    const currentStep = useMemo(() => communityDiscussionFeedStore.currentStepInCommunityDiscussionUpdate ?? 0, [communityDiscussionFeedStore.currentStepInCommunityDiscussionUpdate]);
    const currentForm = useMemo(() => communityDiscussionFeedStore.updateCommunityDiscussionForm, [communityDiscussionFeedStore.updateCommunityDiscussionForm]);

    const setCurrentStep = (val: number, form: UpdateCommunityDiscussionForm | undefined) => (e: any) => {
        e.preventDefault();
        communityDiscussionFeedStore.setCurrentStepInCommunityDiscussionUpdate(val);
        communityDiscussionFeedStore.setUpdateCommunityDiscussionForm(form);
    };

    const resetPagingParams = useCallback(() => {
        communityDiscussionFeedStore.setPagingParams(new PagingParams(1, 25));
    }, []);

    const upsert: (form: UpdateCommunityDiscussionForm) => Promise<void> = useCallback(
        async (form: UpdateCommunityDiscussionForm) => {
            await communityDiscussionFeedStore.updateCommunityDiscussion(
                form,
                communityDiscussionAdminInfo.communityId,
                communityDiscussionAdminInfo.discussionId
            );
        },
        [communityDiscussionAdminInfo.communityId, communityDiscussionAdminInfo.discussionId]
    );
    const loadingUpsert = useMemo(() => communityDiscussionFeedStore.loadingUpsert, [communityDiscussionFeedStore.loadingUpsert]);

    const putRecord = async (values: any) => {
        const discussionToUpdate: UpdateCommunityDiscussionForm = {
            name: values.name,
            description: "",
            isPrivate: values.isPrivate,
            tags: values.tags ?? []
        };

        await upsert(discussionToUpdate);
        resetPagingParams();

        await refreshCommunityDiscussionAdminInfo(communityDiscussionAdminInfo.communityId);

        toast(toastMessage, {
            icon: "🚀",
        });
    };

    const discussionDetails = useMemo(() => communityDiscussionAdminInfo, [communityDiscussionAdminInfo]);
    const showReviewForm = useMemo(() => currentStep === 1, [currentStep]);
    const lastStepBeforeReview = useMemo(() => 0, []);
    const reviewInfoSectionTitle = useMemo(() => "Review Discussion Update", []);

    return (
        <ModalPortal>
            <ModalBody onClose={() => closeModal()}>
                <PageTitleNoPadding>Update Discussion</PageTitleNoPadding>
                <motion.div
                    initial={{ opacity: 0 }}
                    whileInView={{ opacity: 1 }}
                    viewport={{ once: true }}
                    className="flex space-x-2 p-5"
                >
                    <Formik
                        initialValues={{
                            name: discussionDetails.title ?? currentForm?.name ?? '',
                            description: discussionDetails.content ?? currentForm?.description ?? '',
                            tags: (discussionDetails as any).tags ?? currentForm?.tags ?? [],
                            isPrivate: discussionDetails?.isPrivate === true ? 'private' : 'public',
                        } as UpdateCommunityDiscussionForm}
                        validate={values => {
                            const errors: FormikErrors<any> = {};
                            if (!values.name) {
                                errors.name = 'Name is required';
                            } else if (!values.isPrivate) {
                                errors.isPrivate = 'Must indicate if it\'s private or public';
                            }

                            return errors;
                        }}
                        onSubmit={async (values) => {
                            await putRecord(values);
                        }}
                    >
                        {({
                            values,
                            errors,
                            handleSubmit,
                        }) => (
                            <form onSubmit={handleSubmit} className="flex flex-1 flex-col">
                                {currentStep === 0 && (
                                    <ListOrCommunityFormInputs type={CommonUpsertBoxTypes.UpdateCommunityDiscussion} />
                                )}

                                {showReviewForm && (
                                    <ReviewForm
                                        sections={[
                                            {
                                                title: reviewInfoSectionTitle,
                                                jsx: (
                                                    <ReviewUpsertListOrCommunity
                                                        name={values.name}
                                                        avatarOrImage={''}
                                                        visibility={values.isPrivate}
                                                        tags={values.tags}
                                                        type={CommonUpsertBoxTypes.UpdateCommunityDiscussion}
                                                    />
                                                ),
                                            }
                                        ]}
                                        type={CommonUpsertBoxTypes.UpdateCommunityDiscussion}
                                    />
                                )}
                                <div className="flex justify-between items-center mt-2 w-full space-x-2">
                                    {currentStep > 0 && (
                                        <button
                                            type="button"
                                            onClick={setCurrentStep(currentStep === 0 ? 0 : currentStep - 1, values)}
                                            className="rounded-full bg-gray-200 px-5 py-2 font-bold text-gray-700"
                                        >
                                            Back
                                        </button>
                                    )}

                                    {currentStep === (lastStepBeforeReview + 1)
                                        ? (
                                            <button
                                                type='submit'
                                                disabled={Object.values(errors).some(v => !!v) || loadingUpsert}
                                                className={`rounded-full bg-[#55a8c2] px-5 py-2 font-bold text-white disabled:opacity-40`}
                                            >
                                                {loadingUpsert ? (
                                                  <ButtonLoader />
                                                ) : (
                                                    'Submit'
                                                )}
                                            </button>
                                        )
                                        : currentStep === lastStepBeforeReview ? (
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
}

export default observer(UpdateCommunityDiscussionModal);
