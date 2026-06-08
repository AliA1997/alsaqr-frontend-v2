import { OptimizedImage, OptimizedPostImage } from "@common/Image";
import { TagOrLabel } from "@common/Titles";
import type { ListItemToDisplay } from "@models/list";
import { MAX_BIO_LENGTH_FEED } from "@utils/constants";
import {
  convertDateToDisplay,
  shortenText,
  stopPropagationOnClick,
} from "@utils/index";
import { capitalize } from "lodash";
import TimeAgo from "react-timeago";

interface CommonEntityItemProps {
  listItem: ListItemToDisplay;
}

export function SavedPostItem({ listItem }: CommonEntityItemProps) {
  const {
    postId,
    postContent,
    postType,
    postTags,
    postCreatedAt,
    postUsername,
    postAvatar,
    postBannerImage,
  } = listItem;

  const navigateToPostUser = () => {
    window.open(`${import.meta.env.VITE_PUBLIC_BASE_URL}/users/${postUsername}`, "_blank");
  };
  const navigateToPost = () => {
    window.open(`${import.meta.env.VITE_PUBLIC_BASE_URL}/status/${postId}`, "_blank");
  };

  return (
    <div
      className={`
        relative flex flex-col space-x-3 border-y border-x border-gray-100 p-5 
        dark:border-gray-800 hover:shadow-lg dark:hover:bg-[#000000]'}  
      `}
      data-testid="postcard"
    >
      {postType && (
        <TagOrLabel
          testId="posttag"
          color="postGradient"
          size="md"
          className="absolute top-0 right-0"
        >
          {capitalize(postType)}
        </TagOrLabel>
      )}
      <div className="relative flex space-x-3 cursor-pointer">
        <div
          className="absolute top-0 bg-transparent w-full h-full z-10"
          onClick={(e) => {
            return stopPropagationOnClick(e, navigateToPost);
          }}
        />
        <OptimizedImage
          classNames="h-10 w-10 rounded-full object-cover z-50 hover:bg-blue-200"
          src={postAvatar ?? ""}
          alt={postUsername ?? ""}
          onClick={(e) => {
            return stopPropagationOnClick(e, navigateToPostUser);
          }}
        />
        <div className="text-left w-full">
          <div className="flex item-center space-x-1">
            <p
              data-testid="usernamelink"
              className={`font-bold mr-1 text-black dark:text-gray-50 hover:underline`}
              onClick={(e) => {
                return stopPropagationOnClick(e, navigateToPostUser);
              }}
            >
              {postUsername}
            </p>

            <p
              data-testid="postusername"
              className="hidden text-sm text-gray-500 sm:inline dark:text-gray-400 hover:underline"
              onClick={(e) => {
                return stopPropagationOnClick(e, navigateToPostUser);
              }}
            >
              @{postUsername ? postUsername.replace(/\s+/g, "") : ""}.
            </p>
            <TimeAgo
              className="text-sm text-gray-500 dark:text-gray-400"
              date={convertDateToDisplay(postCreatedAt)}
            />
          </div>
          <p
            data-testid="postcardtext"
            className="pt-1 text-black dark:text-gray-50"
          >
            {postContent}
          </p>
          <div className="flex flex-wrap w-full gap-[4px] my-5">
            {(postTags ?? []).map((tag, index) => (
              <span
                key={index}
                style={{
                  backgroundColor: "#e0f2fe",
                  color: "#0369a1",
                  padding: "2px 6px",
                  borderRadius: "4px",
                }}
              >
                {tag}
              </span>
            ))}
          </div>
          {postBannerImage && (
            <div className=" w-[200px] h-[150px] md:w-[300px] md:h-[200px] overflow-hidden flex justify-center items-center">
              <OptimizedPostImage
                src={postBannerImage}
                alt="img/post"
                classNames="m-5 ml-0 w-full h-full object-cover shadow-sm"
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export function SavedUserItem({ listItem }: CommonEntityItemProps) {

  const { savedUserUsername, savedUserAvatar, savedUserBio } = listItem;

  const navigateToUser = () => {
    window.open(`${import.meta.env.VITE_PUBLIC_BASE_URL}/users/${savedUserUsername}`, "_blank");
  };

  return (
    <div
      className={`flex relative space-x-3 border-y border-gray-100 p-5 dark:border-gray-800 
                  rounded-sm w-full h-[7em]`}
    >
      <div className="flex flex-col justify-self-stretch grow justify-start h-full space-x-3">
        <div className="flex justify-items-start items-end align-items-end space-x-2 text-gray-900 dark:text-gray-50 cursor-pointer">
          <OptimizedImage
            classNames="h-10 w-10 rounded-full object-cover"
            src={savedUserAvatar ?? ""}
            alt={savedUserUsername ?? ""}
            onClick={(e) => stopPropagationOnClick(e, navigateToUser)}
          />
          <div className="flex flex-col items-start hover:underline">
            <h6>{savedUserUsername}</h6>
            <p className="italic text-gray-400 text-sm">
              {shortenText(savedUserBio ?? "", MAX_BIO_LENGTH_FEED)}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export function SavedCommunityDiscussionMessageItem({
  listItem,
}: CommonEntityItemProps) {
  const {
    communityDiscussionMessageId,
    communityDiscussionMessageAvatar,
    communityDiscussionMessageUsername,
    communityDiscussionMessageContent,
    communityDiscussionMessageMedia,
    communityDiscussionMessageCreatedAt,
  } = listItem;

  return (
    <div
      key={communityDiscussionMessageId}
      className={`flex justify-start`}
      data-testid="communitydiscussionmessagecard"
    >
      <OptimizedImage
        src={communityDiscussionMessageAvatar ?? ""}
        alt={communityDiscussionMessageUsername ?? ""}
        classNames="w-8 h-8 rounded-full mr-2 mt-1"
      />
      <div className={`max-w-xs md:max-w-md lg:max-w-lg`}>
        <span className="text-xs font-medium text-gray-700 mb-1">
          {communityDiscussionMessageUsername}
        </span>
        <div className={`p-3 rounded-lg bg-[#55a8c2] text-white`}>
          <p>{communityDiscussionMessageContent}</p>
          {communityDiscussionMessageMedia && (
            <img
              src={communityDiscussionMessageMedia}
              alt="img/tweet"
              className="m-5 ml-0 max-h-60 rounded-lg object-cover shadow-sm"
            />
          )}
        </div>
        <TimeAgo
          className="text-sm text-gray-500"
          date={convertDateToDisplay(communityDiscussionMessageCreatedAt)}
        />
      </div>
    </div>
  );
}

export function SavedCommunityDiscussionItem({
  listItem,
}: CommonEntityItemProps) {

  const {
    communityId,
    communityDiscussionId,
    communityDiscussionTitle,
    communityDiscussionCreatedAt,
    communityDiscussionUsername,
    communityDiscussionAvatar,
  } = listItem;

  const navigateToCommunityDiscussion = () => {
    window.open(`${import.meta.env.VITE_PUBLIC_BASE_URL}/communities/${communityId}/${communityDiscussionId}`, "_blank");

  };

  return (
    <div
      className={`
          flex flex-col relative justify-around space-x-3 border-y border-gray-100 
          p-5 hover:shadow-lg dark:border-gray-800 dark:hover:bg-[#0e1517] rounded-full
          w-full       /* Full width on mobile */
          md:w-[21rem] 
          lg:w-[49%]
          3xl:w-[30%]
          h-[10rem]
          mb-4         /* Add some bottom margin between items */
        `}
      data-testid="communitydiscussioncard"
    >
      <div className="flex flex-col justify-start h-full space-x-3 p-1">
        <div
          data-testid="communitydiscussionlink"
          className="flex justify-around item-center space-x-1 cursor-pointer hover:underline"
          onClick={(e) =>
            stopPropagationOnClick(e, navigateToCommunityDiscussion)
          }
        >
          <OptimizedImage
            classNames="h-12 w-12 rounded-full object-cover z-50 hover:bg-blue-200"
            src={communityDiscussionAvatar ?? ""}
            alt={communityDiscussionUsername ?? ""}
          />
          <div className="flex flex-col">
            <h6
              data-testid="communitydiscussiontext"
              className="text-sm text-black dark:text-gray-50"
            >
              {communityDiscussionTitle}
            </h6>
          </div>
        </div>
        <TimeAgo
          className="text-xs text-gray-500 dark:text-gray-400 hidden md:block"
          date={convertDateToDisplay(communityDiscussionCreatedAt)}
        />
      </div>
    </div>
  );
}
