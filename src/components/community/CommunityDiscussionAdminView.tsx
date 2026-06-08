import { observer } from "mobx-react-lite";
import { useNavigate } from "react-router";
import { convertDateToDisplay } from "@utils/index";
import { FilterKeys, useStore } from "@stores/index";
import RequestedInvitesModal from "@common/RequestedInvitesModal";
import UpdateCommunityDiscussionModal from "@common/UpdateCommunityDiscussionModal";
import type { CommunityDiscussionAdminInfo } from "@models/community";
import { InfoCardContainer } from "@common/Containers";
import { ConfirmModal } from "@common/Modal";
import { TagOrLabel } from "@common/Titles";
import { CommonLink } from "@common/Links";

type Props = {
    communityDiscussionAdminInfo: CommunityDiscussionAdminInfo;
    refreshCommunityDiscussionAdminInfo: (communityId: string) => Promise<void>;
}

function CommunityDiscussionAdminView({
    communityDiscussionAdminInfo,
    refreshCommunityDiscussionAdminInfo,
}: Props) {
    const navigate = useNavigate();
    const { modalStore, communityDiscussionFeedStore } = useStore();
    const { showModal, closeModal } = modalStore;

    if (communityDiscussionAdminInfo)
        return (
            <>
                <div className='flex justify-between items-center p-5'>
                     <h1 className='text-4xl'>
                        {`A Discussion Starter Welcome `}
                    </h1>
                    <div className='flex space-x-2'>
                        <CommonLink
                            onClick={() =>
                                showModal(
                                    <UpdateCommunityDiscussionModal
                                        loggedInUserId={communityDiscussionAdminInfo.founder?.userId ?? ''}
                                        communityDiscussionAdminInfo={communityDiscussionAdminInfo}
                                        refreshCommunityDiscussionAdminInfo={refreshCommunityDiscussionAdminInfo}
                                    />,
                                )
                            }
                            animatedLink={false}
                            classNames="border border-[0.1rem] hover:text-[#55a8c2]"
                        >
                            Edit Discussion
                        </CommonLink>
                        <CommonLink
                            onClick={() =>
                                showModal(
                                    <ConfirmModal
                                        title="Delete Discussion"
                                        confirmMessage="Are you sure you want to delete this discussion? This action cannot be undone."
                                        onClose={() => closeModal()}
                                        declineButtonText="Cancel"
                                        confirmButtonText="Delete"
                                        confirmButtonClassNames="bg-red-600"
                                        confirmFunc={async () => {
                                            await communityDiscussionFeedStore.deleteCommunityDiscussion(
                                                communityDiscussionAdminInfo.communityId,
                                                communityDiscussionAdminInfo.discussionId,
                                            );
                                            navigate(-1);
                                        }}
                                    />,
                                )
                            }
                            animatedLink={false}
                            classNames="border border-[0.1rem] text-red-600 hover:text-red-700"
                        >
                            Delete Discussion
                        </CommonLink>
                    </div>
                </div>
                <div className='relative flex'>
                    <InfoCardContainer>
                        <h1 className='text-3xl'>
                            {communityDiscussionAdminInfo.title}
                        </h1>
                    </InfoCardContainer>
                    <TagOrLabel
                        color={(communityDiscussionAdminInfo.isPrivate ?? false) ? 'danger' : 'info'}
                        size='sm'
                        className='absolute bottom-0 right-0'
                    >
                        {(communityDiscussionAdminInfo.isPrivate ?? false) ? 'Private' : 'Public'}
                    </TagOrLabel>
                </div>
                <div className="flex">
                    <InfoCardContainer>
                        <p className='absolute left-0 top-0 w-full text-center text-sm text-gray-700 dark:text-gray-100'>Invited Users:</p>
                        <h1 className='w-full text-center text-3xl'>
                            {communityDiscussionAdminInfo.invitedCount}
                        </h1>
                    </InfoCardContainer>
                    <InfoCardContainer>
                        <p className='absolute left-0 top-0 w-full text-center text-sm text-gray-700 dark:text-gray-100'>Joined Users:</p>
                        <h1 className='w-full text-center text-3xl'>
                            {communityDiscussionAdminInfo.joinedCount}
                        </h1>
                    </InfoCardContainer>
                    {(communityDiscussionAdminInfo.isPrivate ?? false) && (
                        <InfoCardContainer>
                            <p className='absolute left-0 top-0 w-full text-center text-sm text-gray-700 dark:text-gray-100'>Pending Invites:</p>
                            <h1 className='w-full text-center text-3xl'>
                                {communityDiscussionAdminInfo.inviteRequestedUsers?.length ?? 0}
                            </h1>
                            <button
                                type='button'
                                onClick={async (e) => {
                                    e.stopPropagation();
                                    showModal(
                                        <RequestedInvitesModal
                                            invitedUsers={communityDiscussionAdminInfo.inviteRequestedUsers as any[]}
                                            title="Pending Invite Requests"
                                            filterKey={FilterKeys.CommunityDiscussion}
                                            entityInvitedToId={communityDiscussionAdminInfo.communityId}
                                            childEntityInviteToId={communityDiscussionAdminInfo.discussionId}
                                        />
                                    );
                                }}
                                className={`
                                min-w-[4rem] max-w-[12rem] max-h-[3rem] border px-3 py-1
                                font-bold
                                text-gray-900
                                dark:text-white
                                hover:text-[#55a8c2]
                                hover:opacity-90
                                disabled:opacity-40
                                text-xs
                                flex
                                `}
                            >Accept Or Deny Invites</button>
                        </InfoCardContainer>
                    )}
                    <InfoCardContainer>
                        <p className='absolute left-0 top-0 w-full text-center text-sm text-gray-700 dark:text-gray-100'>Created on: </p>
                        <h1 className='w-full text-center mt-2'>
                            {new Date(convertDateToDisplay(communityDiscussionAdminInfo.createdAt)).toLocaleString('default', { dateStyle: 'short' })}
                        </h1>
                    </InfoCardContainer>
                </div>
            </>
        );

    return <></>
}

export default observer(CommunityDiscussionAdminView);
