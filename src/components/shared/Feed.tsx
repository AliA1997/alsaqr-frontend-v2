
import React, { useCallback, useEffect, useMemo, useState } from "react";
import type {
  PostToDisplay,
} from "@typings";

import PostBox from "../posts/PostBox";
import { observer } from "mobx-react-lite";
import { useStore } from "@stores/index";
import { PagingParams } from "@models/common";
import { leadingDebounce } from "@utils/api/agent";
import { PageTitle } from "@common/Titles";
import PostComponent from "@components/posts/Post";
import { SkeletonLoader } from "@common/CustomLoader";
import { DEFAULT_VIRTUALIZED_ITEMS_PERPAGE, inTestMode } from "@utils/constants";
import { FilterKeys } from '@enums';
import { VirtualizedFeed } from "./VirtualizedFeed";

interface Props {
  title?: string;
  filterKey?: FilterKeys;
  hideTweetBox?: boolean;
  canAdd?: boolean;
  onAdd?: (post: PostToDisplay) => void;
  postsAlreadyAddedByIds?: string[];
}

function FeedContainer({ children }: React.PropsWithChildren<any>) {
  return (
    <div className="col-span-7 scrollbar-hide border-x max-h-screen overflow-scroll lg:col-span-5 dark:border-gray-800">
      {children}
    </div>
  );
}


const Feed = observer(({
  title,
  filterKey,
  hideTweetBox,
  canAdd,
  onAdd,
  postsAlreadyAddedByIds
}: Props) => {
  const { authStore, bookmarkFeedStore, exploreStore, feedStore, searchStore } = useStore();
  const { auth, currentSessionUser, processingUserCheck } = authStore;

  const [loading, setLoading] = useState<boolean>(false);
  const [_, setMounted] = useState<boolean>(false);


  const feedLoadingInitial = useMemo(() => {
    if (filterKey === FilterKeys.Explore) return exploreStore.loadingInitial;
    else if (filterKey === FilterKeys.SearchPosts) return searchStore.searchPostsLoadingInitial;
    else if(filterKey === FilterKeys.MyBookmarks) return bookmarkFeedStore.loadingInitial;
    else return feedStore.loadingInitial;
  }, [
    searchStore.searchPostsLoadingInitial,
    feedStore.loadingInitial,
    exploreStore.loadingInitial,
    bookmarkFeedStore.loadingInitial
  ]);

  const setFeedPagingParams = useMemo(() => {
    if (filterKey === FilterKeys.Explore) return exploreStore.setPagingParams;
    else if(filterKey === FilterKeys.MyBookmarks) return bookmarkFeedStore.setPagingParams;
    else if (filterKey === FilterKeys.SearchPosts) return searchStore.setSearchedPostsPagingParams;
    else return feedStore.setPagingParams;
  }, [
    searchStore.searchedPostsPagingParams.currentPage,
    feedStore.pagingParams.currentPage,
    exploreStore.pagingParams.currentPage,
    bookmarkFeedStore.pagingParams.currentPage
  ]);

  const feedPagination = useMemo(() => {
    if (filterKey === FilterKeys.Explore) return exploreStore.pagination;
    else if(filterKey === FilterKeys.MyBookmarks) return bookmarkFeedStore.pagination;
    else if (filterKey === FilterKeys.SearchPosts) return searchStore.searchedPostsPagination;
    else return feedStore.pagination;
  }, [
    searchStore.searchedPosts,
    searchStore.searchedPostsPagingParams.currentPage,
    feedStore.posts,
    feedStore.pagingParams.currentPage,
    exploreStore.explorePosts,
    exploreStore.pagingParams.currentPage,
    bookmarkFeedStore.bookmarkedPosts,
    bookmarkFeedStore.pagingParams.currentPage
  ]);

  const loadPosts = async () => {
    if(filterKey === FilterKeys.SearchPosts && userId)
      await searchStore.loadSearchedPosts();
    else if(filterKey === FilterKeys.MyBookmarks && userId)
      await bookmarkFeedStore.loadBookmarkedPosts(userId);
    else if(filterKey === FilterKeys.Normal)
      await feedStore.loadPosts();

    return;
  }

  async function getPosts() {
    leadingDebounce(async () => {

      setLoading(true);
      try {
        // Virtualized feeds load a large first page; paging kicks in at end of list.
        setFeedPagingParams(new PagingParams(1, +DEFAULT_VIRTUALIZED_ITEMS_PERPAGE));

        await loadPosts();
      } finally {
        setLoading(false);
      }
    }, 10000);
  }

  useEffect(() => {

    if (!filterKey) return;
    setMounted(true);
    getPosts();

  }, []);

  const loadedPosts = useMemo(() => {

    if (filterKey === FilterKeys.Explore)
      return exploreStore.explorePosts;
    else if(filterKey === FilterKeys.MyBookmarks)
      return bookmarkFeedStore.bookmarkedPosts;
    else if (filterKey === FilterKeys.SearchPosts)
      return searchStore.searchedPosts;
    else
      return feedStore.posts;

  }, [
    feedPagination?.currentPage,
    feedPagination?.itemsPerPage,
    feedPagination?.totalItems,
    filterKey
  ]);

  const fetchMoreItems = useCallback(
    async (pageNum: number) => {
      setFeedPagingParams(new PagingParams(pageNum, +DEFAULT_VIRTUALIZED_ITEMS_PERPAGE))
      await loadPosts();
    },
    [feedPagination?.currentPage, filterKey]
  );

  const userId = useMemo(() =>
      inTestMode()
      ? auth?.getUser()?.id : currentSessionUser ? currentSessionUser.id
      : "",
    [currentSessionUser?.id, auth?.getUser()?.id]);

  const renderPost = useCallback(
    (_: number, postRec: PostToDisplay) => (
      <PostComponent
        filterKey={filterKey}
        postToDisplay={postRec}
        onAdd={onAdd}
        canAdd={canAdd}
        postsAlreadyAddedByIds={postsAlreadyAddedByIds}
      />
    ),
    [filterKey, onAdd, canAdd, postsAlreadyAddedByIds]
  );

  const isFirstPage = (feedPagination?.currentPage ?? 1) <= 1;
  const isInitialLoading = feedLoadingInitial || (loading && isFirstPage);
  const hasPosts = !!loadedPosts?.length;

  return (
    <div
      className="col-span-7 text-left scrollbar-hide max-h-screen overflow-scroll lg:col-span-5 dark:border-gray-800"
    >
      {title && <PageTitle>{title}</PageTitle>}
      <div>
        {processingUserCheck
          ? <SkeletonLoader />
          : currentSessionUser && !hideTweetBox && (
          <PostBox filterKey={filterKey ? filterKey : FilterKeys.Normal} />
          )}
      </div>
      <div className="text-left" data-testid="feedcontaineritems">
        {isInitialLoading && !hasPosts ? (
          // First load, no data yet → skeleton screen (prevents blank flash)
          <SkeletonLoader count={filterKey === FilterKeys.SearchPosts ? 2 : 5} />
        ) : (
          <VirtualizedFeed<PostToDisplay>
            items={loadedPosts}
            pagination={feedPagination}
            loading={feedLoadingInitial}
            onEndReached={fetchMoreItems}
            itemContent={renderPost}
            computeItemKey={(index, post) => post.postId ?? index}
            emptyText={filterKey === FilterKeys.SearchPosts ? 'No Similar Posts to show' : 'No Posts to show'}
            height={filterKey === FilterKeys.SearchPosts ? '40vh' : '100vh'}
          />
        )}
      </div>
    </div>
  );
});

export { FeedContainer };

export default Feed;
