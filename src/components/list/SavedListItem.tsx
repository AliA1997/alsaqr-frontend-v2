import {
  useMemo,
} from "react";
import TimeAgo from "react-timeago";
import type { CommunityToDisplay, ListToDisplay } from "@typings";
import { useStore } from "@stores/index";
import { ListItemToDisplay } from "@models/list";
import CommunityItemComponent from "@components/community/CommunityItem";
import { convertDateToDisplay } from "@utils/index";
import { TagOrLabel } from "@common/Titles";
import { ConfirmModal } from "@common/Modal";
import { SavedCommunityDiscussionItem, SavedCommunityDiscussionMessageItem, SavedPostItem, SavedUserItem } from "./EntityItems";
import { observer } from "mobx-react-lite";


interface Props {
  savedListItemToDisplay: ListItemToDisplay;
  selectedList: ListToDisplay | undefined;
}

function SavedListItem({
  savedListItemToDisplay,
  selectedList
}: Props) {
  const { authStore, listFeedStore, modalStore } = useStore();
  const { showModal, closeModal } = modalStore;
  const { loadingUpsert, deleteSavedListItem, loadSavedListItems } = listFeedStore;


  const RelatedEntityNode = () => {
    if (savedListItemToDisplay.postId)
      return <SavedPostItem listItem={savedListItemToDisplay} />;
    else if (savedListItemToDisplay.savedUserId)
      return <SavedUserItem listItem={savedListItemToDisplay} />;
    else if (savedListItemToDisplay.communityId)
      return <CommunityItemComponent
        community={{
          communityId: savedListItemToDisplay.communityId,
          communityName: savedListItemToDisplay.communityName,
          communityAvatar: savedListItemToDisplay.communityDescription,
          communityBannerImage: savedListItemToDisplay.communityBannerImage,
          communityCreatedAt: savedListItemToDisplay.communityCreatedAt,
          founderUsername: savedListItemToDisplay.communityFounderUsername,
          founderAvatar: savedListItemToDisplay.communityFounderAvatar,
          totalMembers: savedListItemToDisplay.communityTotalMembers
        } as CommunityToDisplay}
      />;
    else if (savedListItemToDisplay.communityDiscussionId)
      return <SavedCommunityDiscussionItem listItem={savedListItemToDisplay} />;
    else if (savedListItemToDisplay.communityDiscussionMessageId)
      return <SavedCommunityDiscussionMessageItem listItem={savedListItemToDisplay} />;
    else
      return <div>{JSON.stringify(savedListItemToDisplay.relatedEntity)}</div>
  }

  const labelColor = useMemo(() => {
    if (savedListItemToDisplay.label === "Post") return "postGradient";
    else if (savedListItemToDisplay.label === "User") return "userGradient";
    else if (savedListItemToDisplay.label === "Community") return "communityGradient";
    else if (savedListItemToDisplay.label === "Community Discussion") return "communityDiscussionGradient";
    else if (savedListItemToDisplay.label === "Community Discussion Message") return "communityDiscussionMessageGradient";
    return "defaultSavedItemGradient";
  }, [savedListItemToDisplay]);

  return (
    <div
      className="relative flex flex-col space-x-3 border-y border-gray-100 p-5 hover:shadow-lg dark:border-gray-800 dark:hover:bg-[#000000]"
    >
      <div className='flex justify-between'>
        <div className='absolute top-0 right-20 text-sm text-gray-500 dark:text-gray-400'>
          Saved{" "}
          <TimeAgo

            className="text-sm text-gray-500 dark:text-gray-400"
            date={convertDateToDisplay(savedListItemToDisplay.savedAt)}
          />
        </div>

        <TagOrLabel
          color={labelColor}
          size="md"
          className="absolute top-0 right-0"
        >
          {savedListItemToDisplay.label}
        </TagOrLabel>
      </div>
      <div className='relative'>
        {RelatedEntityNode()}
      </div>

      <button
        type='button'
        disabled={loadingUpsert}
        className={`
          rounded-full bg-[#55a8c2] px-5 py-2 font-bold text-white disabled:opacity-40 w-48 self-center
          cursor-pointer
        `}
        onClick={(e) => {
          e.preventDefault();

          showModal(
            <ConfirmModal
              title="Are you sure?"
              confirmMessage=""
              confirmButtonClassNames="bg-red-700"
              confirmFunc={async () => {
                await deleteSavedListItem(authStore.currentSessionUser?.id!, savedListItemToDisplay?.listId!, savedListItemToDisplay.listItemId);
                await loadSavedListItems(authStore.currentSessionUser?.id!, selectedList?.listId!)
                closeModal();
              }}
              declineButtonText="Cancel"
              confirmButtonText="Remove"
              onClose={() => closeModal()}
            >
              {RelatedEntityNode()}
              <p className='my-2'>{`Are you sure you want to remove this from your list named ${selectedList?.listName}?`}</p>
            </ConfirmModal>
          );
        }}
      >
        {loadingUpsert ? (
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
          'Remove'
        )}
      </button>
    </div>
  );
}

export default observer(SavedListItem);
