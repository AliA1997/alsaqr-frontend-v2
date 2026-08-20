import { ModalBody, ModalPortal } from "@common/Modal";
import { useStore } from "@stores/index";
import { Formik, FormikErrors } from "formik";
import { motion } from "framer-motion";
import { PagingParams } from "@models/common";
import { useCallback, useMemo } from "react";
import toast from "react-hot-toast";
import { CommunityAdminInfo } from "@typings";
import { observer } from "mobx-react-lite";
import { ListOrCommunityFormInputs } from "./ListOrCommunityForm";
import { ReviewForm, ReviewUpsertListOrCommunity } from "./ReviewForm";
import { UpdateCommunityForm } from "@models/community";
import { PageTitleNoPadding } from "./Titles";
import { CommonUpsertBoxTypes } from '@enums';
import { ButtonLoader } from "@common/CustomLoader";

interface Props {
    communityAdminInfo: CommunityAdminInfo;
    refreshCommunityAdminInfo: (communityId: string) => Promise<void>;
}

function UpdateCommunityModal({ communityAdminInfo, refreshCommunityAdminInfo }: Props) {
    const toastMessage = useMemo(
                            () => "Community Updated",
                            []
                        );

    const { communityFeedStore, modalStore } = useStore();
    const { closeModal } = modalStore;

    const currentStep = useMemo(() => communityFeedStore.currentStepInCommunityUpdate ?? 0, [communityFeedStore.currentStepInCommunityUpdate]);
    const currentForm = useMemo(() => communityFeedStore.updateCommunityForm, [communityFeedStore.updateCommunityForm]);


    const setCurrentStep = (val: number, form: UpdateCommunityForm | undefined) => (e: any) => {
        e.preventDefault();
        communityFeedStore.setCurrentStepInCommunityUpdate(val);
        communityFeedStore.setUpdateCommunityForm(form);
    };



    const resetPagingParams = useCallback(() => {
        communityFeedStore.setPagingParams(new PagingParams(1, 10));
    }, []);
    
    const upsert: (form: UpdateCommunityForm) => Promise<void> = useCallback(
        async (form: UpdateCommunityForm) => {
            await communityFeedStore.updateCommunity(form, communityAdminInfo.communityId);
        },
        [communityFeedStore.updateCommunityForm]
    );
    const loadingUpsert = useMemo(() => communityFeedStore.loadingUpsert, [communityFeedStore.loadingUpsert]);

    const putRecord = async (values: any) => {
        const communityToUpdate: UpdateCommunityForm | undefined = {
            id: communityAdminInfo.communityId,
            name: values.name,
            avatar: values.avatar,
            isPrivate: values.isPrivate,
            tags: values.tags
        }

        await upsert(communityToUpdate);
        resetPagingParams();

        await refreshCommunityAdminInfo(communityToUpdate.id);

        toast(toastMessage, {
            icon: "🚀",
        });
    };

    const communityDetails = useMemo(() => communityAdminInfo, [communityAdminInfo]);
    const showReviewForm = useMemo(() => currentStep === 1, [currentStep]);
    const lastStepBeforeReview = useMemo(() => 0, []);
    const reviewInfoSectionTitle = useMemo(() => "Review Community Update", []);

    return (
        <ModalPortal>
            <ModalBody onClose={() => closeModal()}>
                <PageTitleNoPadding>Update Community</PageTitleNoPadding>
                <motion.div
                    initial={{ opacity: 0 }}
                    whileInView={{ opacity: 1 }}
                    viewport={{ once: true }}
                    className="flex space-x-2 p-5"
                >
                    <Formik
                        initialValues={{
                            name: communityDetails.communityName ?? currentForm?.name ?? '',
                            avatar: communityDetails.communityAvatar ?? currentForm?.avatar ?? '',
                            tags: communityDetails.communityTags ?? [],
                            isPrivate: communityDetails?.isPrivate === true ? 'private' : 'public',
                        } as UpdateCommunityForm}
                        validate={values => {
                            const errors: FormikErrors<any> = {};
                            if (!values.name) {
                                errors.name = 'Name is required';
                            } else if (!values.avatar) {
                                errors.avatar = 'Community avatar is required' ;
                            } else if (!values.tags || !values.tags.length) {
                                errors.tags = 'Tags is required'
                            } else if (!values.isPrivate) {
                                errors.tags = 'Must Indicate if it\'s private or public'
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
                                <img
                                    src={values.avatar ? values.avatar : 'https://robohash.org/placeholder'}
                                    alt={values.name}
                                    height={40}
                                    width={40}
                                    className='h-20 w-20 rounded-full'
                                />
                                
                                {currentStep === 0 && (
                                    <ListOrCommunityFormInputs type={CommonUpsertBoxTypes.UpdateCommunity} />
                                )}
              
                                {showReviewForm && (
                                    <ReviewForm
                                        sections={[
                                            {
                                                title: reviewInfoSectionTitle,
                                                jsx: (
                                                    <ReviewUpsertListOrCommunity
                                                        name={values.name}
                                                        avatarOrImage={values.avatar}
                                                        visibility={values.isPrivate}
                                                        tags={values.tags}
                                                        type={CommonUpsertBoxTypes.UpdateCommunity}
                                                    />
                                                ),
                                            }
                                        ]}
                                        type={CommonUpsertBoxTypes.UpdateCommunity}
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

export default observer(UpdateCommunityModal);