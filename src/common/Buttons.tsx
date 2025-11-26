import { useStore } from "@stores/index";
import { observer } from "mobx-react-lite";
import React, { MouseEventHandler, useEffect, useMemo, useState } from "react";
import { CommonUpsertBoxTypes, CreateListOrCommunityForm } from "@typings";
import { FormikErrors } from "formik";
import { checkNsfwInImage, initializeClient } from "@utils/gradio";
import { NOT_ALLOWED_NSFW_CHECKER_RESULTS } from "@utils/constants";
import { ButtonLoader } from "./CustomLoader";

type CommonButtonProps = {
    disabled?: boolean;
    onClick: MouseEventHandler<HTMLButtonElement>
}


type InfoButtonProps = {
    classNames?: string;
} & CommonButtonProps

type OpenUpsertModalButtonProps = {
    testId: string;
} & CommonButtonProps;

type ModalFooterButtonsProps<T> = {
    errors: any;
    values: T;
    nsfwKeysToCheck: string[];
    setValues: (values: T) => void;
    modalType: CommonUpsertBoxTypes;
    setErrors: (errors: FormikErrors<CreateListOrCommunityForm>) => void;
    nsfwAlert: string;
    setNsfwAlert: (alert: string) => void;
    submitting?: boolean;
    setCurrentStep: (val: number, form: CreateListOrCommunityForm, setErrors?: (errs: any) => void) => (e: any) => void;
}

export function InfoButton({ classNames, disabled, onClick, children }: React.PropsWithChildren<InfoButtonProps>) {
    const buttonClassName = useMemo(() => {
        let defaultClassName = `
            flex
            min-w-[4rem] max-w-[12rem] max-h-[3rem] 
            border px-3 py-1 
            font-bold 
            disabled:opacity-40
            text-xs
            border-none
            text-gray-900
            dark:text-gray-50
            cursor-pointer
        `;
        if (classNames)
            defaultClassName += " " + classNames;

        return defaultClassName;
    }, [classNames])

    return (
        <button
            type='button'
            disabled={disabled}
            onClick={onClick}
            className={buttonClassName}
        >
            {children}
        </button>

    );
}

export function AbsoluteSuccessButton({ children, disabled, onClick, }: React.PropsWithChildren<CommonButtonProps>) {
    return (
        <button
            type='button'
            disabled={disabled}
            onClick={onClick}
            className={`
                min-w-[4rem] max-w-[12rem] max-h-[3rem] border px-3 py-1 
                font-bold 
                text-gray-900
                dark:text-white 
                hover:opacity-60
                bg-green-400
                hover:opacity-90
                disabled:opacity-40
                text-xs
                border-none
                flex
             `}
        >
            {children}
        </button>
    );
}

export function AbsoluteDangerButton({ children, disabled, onClick }: React.PropsWithChildren<CommonButtonProps>) {

    return (
        <button
            type='button'
            disabled={disabled}
            onClick={onClick}
            className={`
                min-w-[4rem] max-w-[12rem] max-h-[3rem] border px-3 py-1 
                font-bold 
                text-gray-900
                dark:text-white 
                hover:opacity-90
                bg-red-400
                disabled:opacity-40
                text-xs
                border-none
                flex
            `}
        >
            {children}
        </button>
    );
}

export function OpenUpsertModalButton({ children, onClick, testId }: React.PropsWithChildren<OpenUpsertModalButtonProps>) {
    return (
        <div className="flex justify-items-center align-items-center pt-5 px-5">
            <button
                data-testid={testId}
                type='button'
                className={`
                rounded-full bg-[#55a8c2] px-5 py-2 font-bold text-white disabled:opacity-40
                hover:opacity-80 hover:cursor-pointer
            `}
                onClick={onClick}
            >
                {children}
            </button>
        </div>
    );
}

export const ModalFooterButtons = observer(<T extends CreateListOrCommunityForm>({
    errors,
    modalType,
    setErrors,
    submitting,
    values,
    setValues,
    nsfwKeysToCheck,
    setNsfwAlert,
    setCurrentStep
}: ModalFooterButtonsProps<T>) => {
    const { communityFeedStore, communityDiscussionFeedStore, listFeedStore } = useStore();
    const [nsfwCheckLoading, setNsfwCheckLoading] = useState<boolean>(false);
    const [processNsfwCheck, setProcessNsfwCheck] = useState<boolean>(false);

    const currentStep = useMemo(() => {
        if (modalType === CommonUpsertBoxTypes.Community) return (communityFeedStore.currentStepInCommunityCreation ?? 0);
        else if (modalType === CommonUpsertBoxTypes.CommunityDiscussion) return (communityDiscussionFeedStore.currentStepInCommunityDiscussionCreation ?? 0);
        else return (listFeedStore.currentStepInListCreation ?? 0);
    }, [
        modalType,
        communityFeedStore.currentStepInCommunityCreation,
        communityDiscussionFeedStore.currentStepInCommunityDiscussionCreation,
        listFeedStore.currentStepInListCreation
    ]);

    const navigateAfterNsfwCheck = (val: number, form: CreateListOrCommunityForm) => {
        if (modalType === CommonUpsertBoxTypes.Community) {
            communityFeedStore.setCommunityCreationForm(form);
            return communityFeedStore.setCurrentStepInCommunityCreation(val)
        }
        else if (modalType === CommonUpsertBoxTypes.CommunityDiscussion) {
            communityDiscussionFeedStore.setCommunityDiscussionCreationForm(form);
            return communityDiscussionFeedStore.setCurrentStepInCommunityDiscussionCreation(val)
        }
        else {
            listFeedStore.setListCreationForm(form);
            return listFeedStore.setCurrentStepInListCreation(val);
        }
    };

    useEffect(() => {
        if (processNsfwCheck) {

            initializeClient()
                .then((gradioClient) => {
                    const processedNsfwStatuses: any[] = [];

                    for (let i = 0; i < nsfwKeysToCheck.length; i++) {
                        const nsfwKey = nsfwKeysToCheck[i];
                        processedNsfwStatuses.push(checkNsfwInImage(gradioClient, (values as any)[nsfwKey]))
                    }
                    return Promise.all(processedNsfwStatuses);
                })
                .then((resolvedNsfwStatuses: string[]) => {
                    if (resolvedNsfwStatuses
                        .some(status =>
                            status === NOT_ALLOWED_NSFW_CHECKER_RESULTS['Somewhat Explicit']
                            || status === NOT_ALLOWED_NSFW_CHECKER_RESULTS['Very Explicit'])) {
                        setNsfwAlert("Please choose a different photo — explicit images aren’t allowed in posts.");
                        setValues({ ...values, avatarOrBannerImage: '' });
                        navigateAfterNsfwCheck(0, { ...values, avatarOrBannerImage: '' });
                    } else {
                        navigateAfterNsfwCheck(currentStep + 1, values);
                    }
                })
                .finally(() => {
                    setProcessNsfwCheck(false);
                    setNsfwCheckLoading(false);
                });
        }

        return () => {}
    }, [values, processNsfwCheck]);

    const nsfwCheckBeforeReview = (e: any) => {
        e.stopPropagation();
        if (nsfwKeysToCheck.length) {
            setNsfwCheckLoading(true);
            setProcessNsfwCheck(true);
        } 
    };

    const upsertLoading = useMemo(() => {
        if (modalType === CommonUpsertBoxTypes.Community) return communityFeedStore.loadingUpsert;
        else if (modalType === CommonUpsertBoxTypes.CommunityDiscussion) return communityDiscussionFeedStore.loadingUpsert;
        else return listFeedStore.loadingUpsert;
    }, [
        communityFeedStore.loadingUpsert,
        communityDiscussionFeedStore.loadingUpsert,
        listFeedStore.loadingUpsert
    ]);

    const lastStepBeforeReview = useMemo(() => modalType === CommonUpsertBoxTypes.List ? 2 : 1, [modalType]);
    const hasErrors = (err?: any) => err ? Object.values(err).some(v => !!v) : Object.values(errors).some(v => !!v);
    return (
        <div className="flex justify-between items-center mt-2 w-full space-x-2">
            {currentStep > 0 && (
                <button
                    data-testid="modalbackbutton"
                    type="button"
                    onClick={setCurrentStep(currentStep === 0 ? 0 : currentStep - 1, values, setErrors)}
                    className={`
                        rounded-full bg-gray-200 px-5 py-2 font-bold text-gray-700
                        hover:opacity-90 cursor-pointer 
                    `}
                >
                    Back
                </button>
            )}

            {currentStep === (lastStepBeforeReview + 1)
                ? (
                    <button
                        data-testid="modalsubmitbutton"
                        type='submit'
                        disabled={hasErrors() || upsertLoading || submitting}
                        className={`
                            rounded-full bg-[#55a8c2] px-5 py-2 font-bold text-white disabled:opacity-40
                            hover:opacity-90 hover:cursor-pointer
                        `}
                    >
                        {upsertLoading || (submitting ?? false) ? (
                            <ButtonLoader />
                        ) : (
                            'Submit'
                        )}
                    </button>
                )
                : currentStep === lastStepBeforeReview ? (
                    <button
                        data-testid="modalreviewbutton"
                        type="button"
                        onClick={modalType === CommonUpsertBoxTypes.CommunityDiscussion ? setCurrentStep(currentStep + 1, values, hasErrors) : nsfwCheckBeforeReview}
                        disabled={hasErrors() || nsfwCheckLoading}
                        className={`
                                rounded-full bg-[#55a8c2] px-5 py-2 font-bold text-white disabled:opacity-40
                                hover:opacity-90 hover:cursor-pointer
                            `}
                    >
                        {nsfwCheckLoading ? (
                            <ButtonLoader />
                        ) : (
                            'Review'
                        )}
                    </button>
                ) : (
                    <button
                        data-testid="modalnextbutton"
                        type="button"
                        onClick={setCurrentStep(currentStep + 1, values, hasErrors)}
                        disabled={hasErrors()}
                        className={`
                            rounded-full bg-[#55a8c2] px-5 py-2 font-bold text-white disabled:opacity-40
                            hover:opacity-90 hover:cursor-pointer    
                        `}
                    >
                        Next
                    </button>
                )}
        </div>
    );
})

