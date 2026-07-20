import { observer } from "mobx-react-lite";
import { useNavigate } from "react-router";
import type { CommunityAdminInfo } from "typings";
import { convertDateToDisplay } from "@utils/index";
import { useStore } from "@stores/index";
import RequestedInvitesModal from "@common/RequestedInvitesModal";
import { CommonLink } from "@common/Links";
import UpdateCommunityModal from "@common/UpdateCommunityModal";
import { InfoCardContainer } from "@common/Containers";
import { ConfirmModal } from "@common/Modal";
import { AdminViewPanelSubTitle, AdminViewPanelTitle, TagOrLabel } from "@common/Titles";
import { useEffect, useState } from "react";
import { communityApiClient } from "@utils/api/communityApiClient";
import { SkeletonLoader } from "@common/CustomLoader";
import { FilterKeys } from '@enums';

type Props = {
  communityId: string;
};

function CommunityAdminView({ communityId }: Props) {
  const [loading, setLoading] = useState<boolean>(false);
  const [adminCommunityInfo, setAdminCommunityInfo] = useState<
    CommunityAdminInfo | undefined
  >(undefined);

  async function loadAdminCommunityInfo() {
    const communityAdminInfoResult =
      await communityApiClient.getAdminCommunityInfo(
        undefined,
        communityId!,
      );

    setAdminCommunityInfo(communityAdminInfoResult);
    setLoading(false);
  }

  async function refreshAdminCommunityInfo(communityId: string) {
    setLoading(true);
    const communityInfoResult = await communityApiClient.getAdminCommunityInfo(
      undefined,
      communityId,
    );

    setAdminCommunityInfo(communityInfoResult);
    setLoading(false);
  }

  const navigate = useNavigate();
  const { modalStore, communityFeedStore } = useStore();
  const { showModal, closeModal } = modalStore;

  useEffect(() => {
    loadAdminCommunityInfo();
  }, [communityId]);

  if (loading) <SkeletonLoader />;

  if (adminCommunityInfo)
    return (
      <>
        <div className="flex justify-between items-center p-5">
          <h1 className="text-base lg:text-4xl">{`A Founder's Welcome `}</h1>
          <div className="flex space-x-2">
            <CommonLink
              onClick={() =>
                showModal(
                  <UpdateCommunityModal
                    communityAdminInfo={adminCommunityInfo}
                    refreshCommunityAdminInfo={refreshAdminCommunityInfo}
                  />,
                )
              }
              animatedLink={false}
              classNames="border border-[0.1rem] hover:text-[#55a8c2]"
            >
              Edit Community
            </CommonLink>
            <CommonLink
              onClick={() =>
                showModal(
                  <ConfirmModal
                    title="Delete Community"
                    confirmMessage="Are you sure you want to delete this community? This action cannot be undone."
                    onClose={() => closeModal()}
                    declineButtonText="Cancel"
                    confirmButtonText="Delete"
                    confirmButtonClassNames="bg-red-600"
                    confirmFunc={async () => {
                      await communityFeedStore.deleteCommunity(
                        adminCommunityInfo.communityId,
                      );
                      navigate(-1);
                    }}
                  />,
                )
              }
              animatedLink={false}
              classNames="border border-[0.1rem] text-red-600 hover:text-red-700"
            >
              Delete Community
            </CommonLink>
          </div>
        </div>
        <div className="relative flex">
          <img
            className="p-1 h-[5rem] w-[5rem] rounded-full object-cover "
            src={adminCommunityInfo.communityAvatar}
            alt={adminCommunityInfo.communityName}
          />
          <InfoCardContainer>
            <AdminViewPanelTitle>{adminCommunityInfo.communityName}</AdminViewPanelTitle>
          </InfoCardContainer>
          <TagOrLabel
            color={adminCommunityInfo.isPrivate ? "danger" : "info"}
            size="sm"
            className="absolute bottom-0 right-0"
          >
            {adminCommunityInfo.isPrivate ? "Private" : "Public"}
          </TagOrLabel>
        </div>
        <div className="flex flex-5">
          <InfoCardContainer>
            <p className="absolute left-0 top-0 w-full text-center text-sm text-gray-700 dark:text-gray-100">
              Invited Users:
            </p>
            <AdminViewPanelSubTitle>
              {adminCommunityInfo.invitedCount}
            </AdminViewPanelSubTitle>
          </InfoCardContainer>
          <InfoCardContainer>
            <p className="absolute left-0 top-0 w-full text-center text-sm text-gray-700 dark:text-gray-100">
              Joined Users:
            </p>
            <AdminViewPanelSubTitle>
              {adminCommunityInfo.joinedCount}
            </AdminViewPanelSubTitle>
          </InfoCardContainer>
          {adminCommunityInfo.isPrivate && (
            <InfoCardContainer>
              <p className="absolute left-0 top-0 w-full text-center text-sm text-gray-700 dark:text-gray-100">
                Pending Invites:
              </p>
              <AdminViewPanelSubTitle>
                {adminCommunityInfo.inviteRequestedUsers?.length ?? 0}
              </AdminViewPanelSubTitle>
              <button
                type="button"
                onClick={async (e) => {
                  e.stopPropagation();
                  showModal(
                    <RequestedInvitesModal
                      invitedUsers={adminCommunityInfo.inviteRequestedUsers}
                      title="Pending Invite Requests"
                      filterKey={FilterKeys.Community}
                      entityInvitedToId={adminCommunityInfo.communityId}
                    />,
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
              >
                Accept Or Deny Invites
              </button>
            </InfoCardContainer>
          )}
          <InfoCardContainer>
            <p className="absolute left-0 top-0 w-full text-center text-sm text-gray-700 dark:text-gray-100">
              Created on:{" "}
            </p>
            <AdminViewPanelSubTitle>
              {new Date(
                convertDateToDisplay(adminCommunityInfo.communityCreatedAt),
              ).toLocaleString("default", { dateStyle: "short" })}
            </AdminViewPanelSubTitle>
          </InfoCardContainer>
        </div>
      </>
    );

  return <SkeletonLoader count={2} />;
}

export default observer(CommunityAdminView);
