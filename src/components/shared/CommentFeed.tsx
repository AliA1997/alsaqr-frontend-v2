import React, { useEffect, useMemo, useRef, useState } from "react";
import type {
  CommentToDisplay,
} from "@typings"
import { convertQueryStringToObject } from "@utils/index";

import { observer } from "mobx-react-lite";
import { useStore } from "@stores/index";
import { PagingParams } from "@models/common";
import { leadingDebounce } from "@utils/common";
import CommentComponent from "@components/posts/Comment";
import { ContentContainerWithRef } from "@common/Containers";
import { ModalLoader } from "@common/CustomLoader";
import { NoRecordsTitle } from "@common/Titles";

interface Props {
  postId: string;
  alreadyLoadedComments?: CommentToDisplay[];
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
  const [_, setIsLoading] = useState(false);
  const containerRef = useRef(null);
  const loaderRef = useRef(null);

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

  const feedPagingParams = useMemo(() => {
    return commentFeedStore.pagingParams;
  }, [
    commentFeedStore.pagingParams.currentPage
  ]);
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
        }

        await loadComments();
      } finally {
        setLoading(false);
      }
    }, 10000);
  }

  const fetchMoreItems = async (pageNum: number) => {
    setIsLoading(true);
    setFeedPagingParams(new PagingParams(pageNum, 10))
    await loadComments();
  };


  useEffect(() => {
    getComments();
  }, []);

  const loadedComments = useMemo(
    () => commentFeedStore.comments,
    [commentFeedStore.comments]);


  const LoadMoreTrigger = () => {
    return (
      <div ref={loaderRef} style={{ height: '20px' }}>
        {feedLoadingInitial && <div>Loading more comments...</div>}
      </div>
    );
  };

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        const firstEntry = entries[0];
        const currentPage = feedPagination?.currentPage ?? 1;
        const itemsPerPage = feedPagination?.itemsPerPage ?? 10;
        const totalItems = feedPagination?.totalItems ?? 0;

        const nextPage = currentPage + 1;
        const totalItemsOnNextPage = nextPage * itemsPerPage;
        const hasMoreItems = (totalItems > totalItemsOnNextPage);

        if (firstEntry?.isIntersecting && !feedLoadingInitial && hasMoreItems) {
          fetchMoreItems(feedPagingParams.currentPage + 1);
        }
      },
      {
        root: containerRef.current,
        rootMargin: '100px',
        threshold: 0.2
      }
    );

    const currentLoader = loaderRef.current;
    if (currentLoader) {
      observer.observe(currentLoader);
    }

    return () => {
      if (currentLoader) {
        observer.unobserve(currentLoader);
      }
    };
  }, [fetchMoreItems]);

  if(!loading && mounted)
    return (
      <div className="col-span-7 scrollbar-hide border-x max-h-screen overflow-scroll lg:col-span-5 dark:border-gray-800">
        <ContentContainerWithRef
          classNames={`
            text-center overflow-y-auto scrollbar-hide
            min-h-[20vh] max-h-[40vh]
          `}
          innerRef={containerRef}
        >
          {loading ? (
            <ModalLoader />
          ) : (
            <>
              {loadedComments && loadedComments.length
                ? loadedComments.map((commentRec) => (
                  <CommentComponent
                    key={commentRec.id}
                    commentToDisplay={commentRec}
                    onlyDisplay={false}
                  />
                ))
                : <NoRecordsTitle>Be the first comment</NoRecordsTitle>}
              <LoadMoreTrigger />
            </>
          )}
        </ContentContainerWithRef>
      </div>
    );

  return <ModalLoader />
});

export { CommentFeedContainer };

export default CommentFeed;
