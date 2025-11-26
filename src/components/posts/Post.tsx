
import { PlusCircleIcon, UploadIcon } from "@heroicons/react/outline";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import {
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import TimeAgo from "react-timeago";

import type { PostToDisplay, User } from "@typings";
import {
  getPercievedNumberOfRecord,
  stopPropagationOnClick,
} from "@utils/index";
import { FilterKeys, useStore } from "@stores/index";
import { LoginModal } from "@common/AuthModals";
import { convertDateToDisplay, formatTimeAgo } from "@utils/index";
import {
  AddOrFollowButton,
  BookmarkedIconButton,
  CommentIconButton,
  LikesIconButton,
  RePostedIconButton
} from "@common/IconButtons";

import { TrashIcon } from "@heroicons/react/solid";
import MoreSection from "@common/MoreSection";
import { ConfirmModal } from "@common/Modal";
import { SaveToListModal } from "@components/list/ListModal";
import { ROUTES_USER_CANT_ACCESS } from "@utils/constants";
import CommentFeed from "@components/shared/CommentFeed";
import { TagOrLabel } from "@common/Titles";
import { usePDF } from "react-to-pdf";
import { PDFDownloadLink } from '@react-pdf/renderer';
import PostPDF from "@components/pdf/PostPdf";
import { OptimizedImage, OptimizedPostImage } from "@common/Image";
import CommentBox from "./CommentBox";


interface Props {
  postToDisplay: PostToDisplay;
  filterKey?: FilterKeys;
  canAdd?: boolean;
  onAdd?: (pst: PostToDisplay) => void;
  postsAlreadyAddedByIds?: string[];
  showLabel?: boolean;
  onlyDisplay?: boolean;
}

function PostComponent({
  postToDisplay,
  filterKey,
  canAdd,
  onAdd,
  postsAlreadyAddedByIds,
  showLabel,
  onlyDisplay
}: Props) {
  const [mounted, setMounted] = useState<boolean>(false);
  const navigate = useNavigate();
  const { authStore, commentFeedStore, feedStore, modalStore } = useStore();
  const { currentSessionUser } = authStore;
  const { showModal, closeModal } = modalStore;
  const {
    rePost,
    likedPost,
    bookmarkPost,
    deleteYourPost
  } = feedStore;
  const { addComment } = commentFeedStore;

  const [commentBoxOpen, setCommentBoxOpen] = useState<boolean>(false);
  const [isBookmarked, setIsBookmarked] = useState<boolean>(false);
  const [isRePosted, setIsRePosted] = useState<boolean>(false);
  const [isLiked, setIsLiked] = useState<boolean>(false);
  const [isAdded, setIsAdded] = useState<boolean>(false);

  const initiallyBooleanValues = useRef<{
    retweeted: boolean;
    liked: boolean;
    commented: boolean;
  }>({
    retweeted: false,
    liked: false,
    commented: false,
  });

  useEffect(() => {
    setMounted(true);

    return () => {
      setMounted(false);
    }
  }, [])

  const numberOfRetweets = useMemo(
    () =>
      getPercievedNumberOfRecord<User>(
        isRePosted,
        initiallyBooleanValues.current?.retweeted,
        postToDisplay.reposters ?? [],
        mounted,
        currentSessionUser?.id
      ),
    [(mounted && isRePosted), (mounted && !isRePosted)]
  );
  const numberOfLikes = useMemo(
    () =>
      getPercievedNumberOfRecord<User>(
        isLiked,
        initiallyBooleanValues.current?.liked,
        postToDisplay.likers ?? [],
        mounted,
        currentSessionUser?.id
      ),
    [(mounted && isLiked), (mounted && !isLiked)]
  );
  const numberOfComments = useMemo(() => {
    return postToDisplay.comments.length;
  }, [postToDisplay, addComment, commentBoxOpen]);

  const postInfo = postToDisplay.post;
  const { targetRef } = usePDF({ filename: `${postInfo.id}.pdf` })

  const checkUserIsLoggedInBeforeUpdatingTweet = async (
    callback: () => Promise<void>
  ) => {
    if (!currentSessionUser)
      return showModal(<LoginModal />);

    await callback();
  };

  useLayoutEffect(() => {
    //If any of the bookmarks are not undefined, that means
    if (currentSessionUser) {
      const likedPosts = currentSessionUser ? (currentSessionUser as any)["likedPosts"] : [];
      const postAlreadyLiked = postToDisplay.likers.some(l => l.id === currentSessionUser?.id);
      const reposts = currentSessionUser ? (currentSessionUser as any)["reposts"] : [];
      const postAlreadyReposted = postToDisplay.reposters.some(l => l.id === currentSessionUser?.id);

      const twtAlreadyLiked =
        postAlreadyLiked ||
        (likedPosts?.some((likedPost: string) => likedPost === postInfo.id) ?? false);

      const twtAlreadyRetweeted =
        postAlreadyReposted ||
        (reposts?.some((repost: string) => repost === postInfo.id) ?? false);

      const twtAlreadyBookmarked =
        (currentSessionUser as any).bookmarks?.some((bk: string) => bk === postInfo.id) ?? false;

      if (postsAlreadyAddedByIds)
        setIsAdded(postsAlreadyAddedByIds.some(pstId => pstId === postInfo.id));

      initiallyBooleanValues.current = {
        liked: twtAlreadyLiked,
        retweeted: twtAlreadyRetweeted,
        commented: false,
      };
      setIsBookmarked(twtAlreadyBookmarked);
      setIsRePosted(twtAlreadyRetweeted);
      setIsLiked(twtAlreadyLiked);
    }
  }, [currentSessionUser]);

  useEffect(() => {

    setIsLiked(initiallyBooleanValues.current?.liked ?? false);
    setIsRePosted(initiallyBooleanValues.current?.retweeted ?? false);
  }, [initiallyBooleanValues.current])

  const navigateToTweetUser = () => {
    navigate(`/users/${postToDisplay.username}`);
  };

  const navigateToTweet = () => {
    navigate(`/status/${postInfo.id}`);
  };

  const onLikeTweet = async () => {
    const beforeUpdate = isLiked;
    try {
      await checkUserIsLoggedInBeforeUpdatingTweet(async () => {
        setIsLiked(!isLiked);
        await likedPost({
          statusId: postInfo.id,
          userId: userId!,
          liked: isLiked
        });
      });
    } catch {
      setIsLiked(beforeUpdate);
    }
  };

  const onRetweet = async () => {
    const beforeUpdate = isRePosted;
    try {
      await checkUserIsLoggedInBeforeUpdatingTweet(async () => {
        setIsRePosted(!isRePosted);

        await rePost({
          statusId: postInfo.id,
          userId: userId!,
          reposted: isRePosted
        });
      });
    } catch {
      setIsRePosted(beforeUpdate);
    }
  };

  const onBookmarkTweet = async () => {
    const beforeUpdate = isBookmarked;
    try {
      await checkUserIsLoggedInBeforeUpdatingTweet(async () => {
        setIsBookmarked(!isBookmarked);
        await bookmarkPost({
          statusId: postInfo.id,
          userId: userId!,
          bookmarked: isBookmarked
        });
      });
    } catch {
      setIsBookmarked(beforeUpdate);
    }
  };


  const userId = useMemo(() => currentSessionUser ? currentSessionUser.id : "", [currentSessionUser]);
  const isSearchedPosts = useMemo(() => (filterKey ?? FilterKeys.Normal) === FilterKeys.SearchPosts, [filterKey]);
  const onIsAlreadyAdded = async () => {
    const beforeUpdate = isAdded;
    try {
      await checkUserIsLoggedInBeforeUpdatingTweet(async () => {
        setIsAdded(!isAdded);
        onAdd!(postToDisplay);
      });
    } catch {
      setIsAdded(beforeUpdate);
    }
  };


  const moreOptions = useMemo(() => {
    const defaultOpts = [
      {
        title: 'Save to List',
        onClick: async () => {
          showModal(
            <SaveToListModal
              relatedEntityType="post"
              info={postToDisplay}
              onClose={() => {
                const canCloseLoginModal = !(ROUTES_USER_CANT_ACCESS.some(r => window.location.href.includes(r)));

                if (currentSessionUser && currentSessionUser.id && canCloseLoginModal)
                  closeModal();
              }}
            />
          )
        },
        Icon: PlusCircleIcon,
      }
    ];

    if (postInfo.userId === currentSessionUser?.id)
      defaultOpts.push({
        title: 'Delete Your Post',
        onClick: async () => {
          showModal(
            <ConfirmModal
              title="Delete this Post"
              confirmButtonClassNames="bg-red-700 text-gray-100"
              onClose={() => closeModal()}
              declineButtonText="Cancel"
              confirmFunc={async () => {
                await deleteYourPost(postInfo.id);
                closeModal();
              }}
              confirmMessage="Are you sure you want to delete this post forever?"
              confirmButtonText="Delete Post"
            >
              <PostComponent
                postToDisplay={postToDisplay}
                onlyDisplay={true}
              />
            </ConfirmModal>
          )

        },
        Icon: TrashIcon,
      });

    return defaultOpts;
  }, [postInfo.id]);

  return (
    <div
      className={`
        relative flex flex-col space-x-3 border-y border-x border-gray-100 p-5 
        dark:border-gray-800 ${!onlyDisplay && 'hover:shadow-lg dark:hover:bg-[#000000]'}  
      `}
      ref={targetRef}
      data-testid="postcard"
    >
      {showLabel && (
        <TagOrLabel
          testId="posttag"
          color="postGradient"
          size="md"
          className="absolute top-0 right-0"
        >
          Post
        </TagOrLabel>
      )}
      {canAdd && (
        <AddOrFollowButton
          isAdded={isAdded ?? false}
          filterKey={filterKey ?? FilterKeys.Normal}
          onIsAlreadyAdded={onIsAlreadyAdded!}
        />
      )}

      <div className="relative flex space-x-3 cursor-pointer">
        <div className='absolute top-0 bg-transparent w-full h-full z-10'
          onClick={(e) => {
            if (onlyDisplay)
              return;
            else
              return stopPropagationOnClick(e, navigateToTweet)
          }}
        />
        <OptimizedImage
          classNames="h-10 w-10 rounded-full object-cover z-50 hover:bg-blue-200"
          src={postToDisplay.profileImg}
          alt={postToDisplay.username}
          onClick={(e) => {
            if (onlyDisplay)
              return;
            else
              return stopPropagationOnClick(e, navigateToTweetUser)
          }}
        />
        <div className='text-left'>
          <div className="flex item-center space-x-1">
            <p
              data-testid="usernamelink"
              className={`font-bold mr-1 text-black dark:text-gray-50 hover:underline`}
              onClick={(e) => {
                if (onlyDisplay)
                  return;
                else
                  return stopPropagationOnClick(e, navigateToTweetUser);
              }}
            >
              {postToDisplay.username}
            </p>
            {userId === postToDisplay.username && (
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="currentColor"
                className="w-5 h-5 text-[#00ADED] mr-1 mt-auto mb-auto"
              >
                <path
                  fillRule="evenodd"
                  d="M8.603 3.799A4.49 4.49 0 0112 2.25c1.357 0 2.573.6 3.397 1.549a4.49 4.49 0 013.498 1.307 4.491 4.491 0 011.307 3.497A4.49 4.49 0 0121.75 12a4.49 4.49 0 01-1.549 3.397 4.491 4.491 0 01-1.307 3.497 4.491 4.491 0 01-3.497 1.307A4.49 4.49 0 0112 21.75a4.49 4.49 0 01-3.397-1.549 4.49 4.49 0 01-3.498-1.306 4.491 4.491 0 01-1.307-3.498A4.49 4.49 0 012.25 12c0-1.357.6-2.573 1.549-3.397a4.49 4.49 0 011.307-3.497 4.49 4.49 0 013.497-1.307zm7.007 6.387a.75.75 0 10-1.22-.872l-3.236 4.53L9.53 12.22a.75.75 0 00-1.06 1.06l2.25 2.25a.75.75 0 001.14-.094l3.75-5.25z"
                  clipRule="evenodd"
                />
              </svg>
            )}
            <p
              data-testid="postusername"
              className="hidden text-sm text-gray-500 sm:inline dark:text-gray-400 hover:underline"
              onClick={(e) => {
                if (onlyDisplay)
                  return;
                else
                  return stopPropagationOnClick(e, navigateToTweetUser);
              }}
            >
              @
              {postToDisplay.username ? postToDisplay.username.replace(/\s+/g, "") : ""}
              .
            </p>
            <TimeAgo
              className="text-sm text-gray-500 dark:text-gray-400"
              date={convertDateToDisplay(postInfo?.createdAt)}
            />
          </div>
          <p data-testid="postcardtext" className="pt-1 text-black dark:text-gray-50">{postInfo.text}</p>
          <div style={{ display: 'flex', gap: '4px', }} className="my-5">
            {postInfo.tags.map((tag, index) => (
              <span
                key={index}
                style={{
                  backgroundColor: '#e0f2fe',
                  color: '#0369a1',
                  padding: '2px 6px',
                  borderRadius: '4px'
                }}
              >
                {tag}
              </span>
            ))}
          </div>
          {postInfo.image && (
            <div className="w-[300px] h-[200px] overflow-hidden flex justify-center items-center">
              <OptimizedPostImage
                src={postInfo.image}
                alt="img/post"
                classNames="m-5 ml-0 w-full h-full object-cover shadow-sm"
              />
            </div>

          )}
        </div>
      </div>

      {!isSearchedPosts && (
        <>
          {!onlyDisplay && (
            <>
              <MoreSection
                moreOptions={moreOptions}
                moreOptionClassNames={`${showLabel ? 'right-10' : ''}`}
              />
              <div className="mt-5 flex justify-between">
                <CommentIconButton
                  onClick={(e) =>
                    stopPropagationOnClick(e, () => {
                      if (!currentSessionUser)
                        showModal(<LoginModal />);

                      setCommentBoxOpen(!commentBoxOpen);
                    })}
                  numberOfComments={numberOfComments}
                  disabled={onlyDisplay ?? false}
                  classNames={`${commentBoxOpen ? 'text-[#55a8c2] hover:text-gray-50' : ''}`}
                />
                <RePostedIconButton
                  onClick={(e) => stopPropagationOnClick(e, onRetweet)}
                  numberOfRePosts={numberOfRetweets}
                  isRePosted={isRePosted}
                  disabled={onlyDisplay ?? false}
                />
                <LikesIconButton
                  onClick={(e) => stopPropagationOnClick(e, onLikeTweet)}
                  numberOfLikes={numberOfLikes}
                  isLiked={isLiked}
                  disabled={onlyDisplay ?? false}
                />
                <div className="flex gap-2">
                  <BookmarkedIconButton
                    onClick={(e) => stopPropagationOnClick(e, onBookmarkTweet)}
                    isBookmarked={isBookmarked}
                    disabled={onlyDisplay ?? false}
                  />
                  <motion.div
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    className="flex cursor-pointer item-center space-x-3 text-gray-400"
                    onClick={(e) => {
                      if(onlyDisplay)
                        return;
                      else
                        return stopPropagationOnClick(e, () => console.log('stopped propagation'));
                    }}
                  >
                    {postInfo.createdAt
                      ? (
                        <PDFDownloadLink
                          fileName={`${postInfo.id}.pdf`}
                          document={
                            <PostPDF
                              postToDisplay={postToDisplay}
                              showLabel={showLabel ?? false}
                              userId={currentSessionUser?.id ?? ''}
                              createdAt={formatTimeAgo(convertDateToDisplay(postInfo.createdAt))}
                            />
                          }>
                          <UploadIcon className="h-5 w-5" />
                        </PDFDownloadLink>
                      )
                      : (
                        <UploadIcon className="h-5 w-5" />
                      )}
                  </motion.div>
                </div>
              </div>
            </>
          )}
        </>
      )}

      {!isSearchedPosts && commentBoxOpen && (
        <>
          {userId && (
            <CommentBox 
              postId={postInfo.id}
              userId={postInfo.userId!}
              setCommentBoxOpen={setCommentBoxOpen}
            />
          )}
        </>
      )}
      {!isSearchedPosts && commentBoxOpen && (
        <>
          <CommentFeed postId={postInfo.id} />
        </>
      )}
    </div>
  );
}

export default PostComponent;
