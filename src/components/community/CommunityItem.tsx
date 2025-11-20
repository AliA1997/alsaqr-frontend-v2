
import { useNavigate } from "react-router-dom";
import {
  useMemo,
  useState,
} from "react";
import TimeAgo from "react-timeago";

import { RelationshipType, type CommunityToDisplay } from "@typings";
import {
  stopPropagationOnClick,
} from "@utils/index";
import { useStore } from "@stores/index";
import { convertDateToDisplay } from "@utils/index";
import { TagOrLabel } from "@common/Titles";
import { ButtonLoader } from "@common/CustomLoader";
import { PlusCircleIcon } from "@heroicons/react/outline";
import { OptimizedImage } from "@common/Image";
import { InfoButton } from "@common/Buttons";

interface Props {
  community: CommunityToDisplay;
}

function CommunityItemComponent({
  community
}: Props) {
  const navigate = useNavigate();
  const { communityFeedStore } = useStore();

  const {
    setNavigateCommunity,
    joinPublicCommunity,
    unjoinPublicCommunity,
    requestToJoinPrivateCommunity,
  } = communityFeedStore;


  const communityInfo = community.community;
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [currentRelationshipType, setCurrentRelationshipType] = useState<RelationshipType>(community.relationshipType)
  const [joined, setJoined] = useState<boolean>(false);

  const navigateToCommunity = () => {
    setNavigateCommunity(community);
    navigate(`/communities/${communityInfo.id}`);
  };

  const hasToRequestPermissionToJoin = useMemo(() => {
    return (community.community.isPrivate && currentRelationshipType === RelationshipType.None)
  }, [community.relationshipType, currentRelationshipType])

  const hasToJoin = useMemo(() => currentRelationshipType === RelationshipType.None, [community.relationshipType, currentRelationshipType]);
  const requestedInvite = useMemo(() => currentRelationshipType === RelationshipType.InviteRequested, [community.relationshipType, currentRelationshipType]);
  const canUnJoin = useMemo(() => currentRelationshipType === RelationshipType.Joined || joined, [community.relationshipType, currentRelationshipType, joined]);

  console.log('community:', community.relationshipType)
  return (
    <>
      <div
        className={`
          flex flex-col relative justify-between space-x-3 border-y border-gray-100 p-5 
          hover:shadow-lg dark:border-gray-800 dark:hover:bg-[#000000] rounded-full 
          p-2 hover:shadow-lg dark:border-gray-800 dark:hover:bg-[#0e1517] rounded-full
          w-full       /* Full width on mobile */
          md:w-[23vw] 
          lg:w-[49%]
          3xl:w-[30%]
          h-[7.5rem]
        `}
        data-testid="communitycard"
      >
        <div className="flex flex-col justify-between h-full space-x-3">
          <div className="flex item-center justify-between space-x-1">
            <div 
              className='flex hover:underline cursor-pointer' 
              data-testid='communitylink'
              onClick={(e) => stopPropagationOnClick(e, navigateToCommunity)}
            >
              <OptimizedImage
                src={communityInfo.avatar}
                alt={communityInfo.name}
              />
              <p  data-testid="communitytext" className='text-sm ml-2 text-black dark:text-gray-50'>
                {communityInfo.name}
              </p>
            </div>

            {communityInfo.createdAt && (
              <TimeAgo
                className="text-xs text-gray-500 dark:text-gray-400"
                date={convertDateToDisplay(communityInfo.createdAt)}
              />
            )}
          </div>
          <TagOrLabel
            color={
              currentRelationshipType === RelationshipType.Founder ? 'gold'
                : currentRelationshipType === RelationshipType.Invited ? 'success'
                  : currentRelationshipType === RelationshipType.Joined ? 'primary'
                    : currentRelationshipType === RelationshipType.InviteRequested ? 'secondary'
                      : 'neutral'
            }
            size="sm"
            className='mt-[-1rem] min-w-[3rem] max-w-fit self-end'
          >
            {requestedInvite ? 'PENDING REQUEST TO JOIN' : currentRelationshipType}
          </TagOrLabel>
          <TagOrLabel
            color={community.community.isPrivate ? 'danger' : 'info'}
            size="sm"
            className='mt-[0.5rem] min-w-[3rem] max-w-fit self-end mr-3 md:mr-3'
          >
            {community.community.isPrivate ? 'Private' : 'Public'}
          </TagOrLabel>
        </div>
        {(hasToJoin || canUnJoin) && (
          <div className="flex absolute top-[4.5rem] left-[4rem] justify-center h-full space-x-3 z-[100]">
            <InfoButton
              disabled={submitting}
              onClick={async (e: any) => {
                e.stopPropagation();
                setSubmitting(true);
                if (hasToRequestPermissionToJoin) {
                  await requestToJoinPrivateCommunity(community.community.id);
                  setCurrentRelationshipType(RelationshipType.InviteRequested);
                }
                else if (canUnJoin) {
                  await unjoinPublicCommunity(community.community.id);
                  setCurrentRelationshipType(RelationshipType.None);
                  setJoined(false);
                }
                else {
                  await joinPublicCommunity(community.community.id);
                  setCurrentRelationshipType(RelationshipType.Joined);
                  setJoined(true);
                }
                setSubmitting(false);
              }}
              classNames="px-0 cursor-default"
            >
              {submitting ? (
                <ButtonLoader />
              ) : (
                <p className={`
                  flex
                  min-w-[4rem] max-w-[12rem] cursor-pointer hover:underline ${canUnJoin ? 'hover:text-red-400' : 'hover:text-[#55a8c2]'}
                `}>
                  <span className={`mt-1 text-inherit`}>
                    {canUnJoin ? 'Leave' : hasToRequestPermissionToJoin ? 'Request to Join' : 'Join'}
                  </span>
                  {!canUnJoin && <PlusCircleIcon className="ml-0 h-[1.5rem] w-[1.5rem] py-1" />}
                </p>
              )}
            </InfoButton>
          </div>
        )}
      </div>
    </>
  );
}

export default CommunityItemComponent;
