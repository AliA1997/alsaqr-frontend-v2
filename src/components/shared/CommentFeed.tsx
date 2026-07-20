import React, { useCallback, useEffect, useMemo, useState } from "react";
import type {
  PostToDisplay,
} from "@typings"
import { convertQueryStringToObject } from "@utils/index";

import { observer } from "mobx-react-lite";
import { useStore } from "@stores/index";
import { PagingParams } from "@models/common";
import { leadingDebounce } from "@utils/api/agent";
import CommentComponent from "@components/posts/Comment";
import { ModalLoader } from "@common/CustomLoader";
import { DEFAULT_VIRTUALIZED_ITEMS_PERPAGE } from "@utils/constants";
import { VirtualizedFeed } from "./VirtualizedFeed";

interface Props {
  postId: string;
  alreadyLoadedComments?: PostToDisplay[];
}

function CommentFeedContainer({ children }: React.PropsWithChildren<any>) {
  return (
    <div className="col-span-7 scrollbar-hide border-x max-h-screen overflow-scroll lg:col-span-5 dark:border-gray-800">
      {children}
    </div>
  );
}


const CommentFeed = observer(({
  postId
}: Props) => {

  const [mounted, setMounted] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);
  const { commentFeedStore } = useStore();

  useEffect(() => {
    setMounted(true);

    return () => {
      setMounted(false);
    }
  }, [])

  const feedLoadingInitial = useMemo(() => {
    return commentFeedStore.loadingInitial;
  }, [
    commentFeedStore.loadingInitial
  ]);

  const setFeedPagingParams = useMemo(() => {
    return commentFeedStore.setPagingParams;
  }, [
    commentFeedStore.pagingParams.currentPage
  ]);
  const setFeedPredicate = useMemo(() => {
    return commentFeedStore.setPredicate;
  }, []);

  const feedPagination = useMemo(() => {
    return commentFeedStore.pagination;
  }, [
    commentFeedStore.comments,
    commentFeedStore.pagingParams.currentPage
  ]);

  const filterPredicate: Map<string, any> = useMemo(() => {
    return commentFeedStore.predicate;
  }, [commentFeedStore.predicate]);

  const loadComments = async () => {
    await commentFeedStore.loadComments(postId);
  }

  async function getComments() {
    leadingDebounce(async () => {

      setLoading(true);
      try {
        const paramsFromQryString = convertQueryStringToObject(
          window.location.search
        );

        if (
          (paramsFromQryString.currentPage && paramsFromQryString.itemsPerPage)
          && (paramsFromQryString.currentPage !== filterPredicate.get('currentPage')
            || paramsFromQryString.itemsPerPage !== filterPredicate.get('itemsPerPage')
            || paramsFromQryString.searchTerm != filterPredicate.get('searchTerm'))) {

          setFeedPagingParams(new PagingParams(paramsFromQryString.currentPage, paramsFromQryString.itemsPerPage));
          setFeedPredicate('searchTerm', paramsFromQryString.searchTerm);
        } else {
          // Virtualized feeds load a large first page; paging kicks in at end of list.
          setFeedPagingParams(new PagingParams(1, +DEFAULT_VIRTUALIZED_ITEMS_PERPAGE));
        }

        await loadComments();
      } finally {
        setLoading(false);
      }
    }, 10000);
  }

  const fetchMoreItems = async (pageNum: number) => {
    setFeedPagingParams(new PagingParams(pageNum, +DEFAULT_VIRTUALIZED_ITEMS_PERPAGE))
    await loadComments();
  };


  useEffect(() => {
    getComments();
  }, []);

  const loadedComments = useMemo(
    () => commentFeedStore.comments,
    [commentFeedStore.comments]);

  const renderComment = useCallback(
    (_: number, commentRec: PostToDisplay) => (
      <CommentComponent
        commentToDisplay={commentRec}
        onlyDisplay={false}
      />
    ),
    []
  );

  if(!loading && mounted)
    return (
      <div className="col-span-7 scrollbar-hide border-x max-h-screen overflow-scroll lg:col-span-5 dark:border-gray-800">
        <div className="text-center">
          <VirtualizedFeed<PostToDisplay>
            items={loadedComments}
            pagination={feedPagination}
            loading={feedLoadingInitial}
            onEndReached={fetchMoreItems}
            itemContent={renderComment}
            computeItemKey={(index, comment) => comment.postId ?? index}
            emptyText="Be the first comment"
            height="40vh"
          />
        </div>
      </div>
    );

  return <ModalLoader />
});

export { CommentFeedContainer };

export default CommentFeed;
