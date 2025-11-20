import { useEffect, useMemo, useRef, useState } from "react";
import { 
  CommonUpsertBoxTypes,
} from '@models/enums';
import { convertQueryStringToObject } from "@utils/index";

import { observer } from "mobx-react-lite";
import { useStore } from "@stores/index";
import { PagingParams } from "@models/common";
import { NoRecordsTitle, PageTitle } from '@common/Titles';


import type { CommunityDiscussionToDisplay } from "@models/community";
import ListOrCommunityUpsertModal from "@common/ListOrCommunityUpsertModal";
import CustomPageLoader from "@common/CustomLoader";
import { ContentContainerWithRef } from "@common/Containers";
import CommunityDiscussionItemComponent from "@components/community/CommunityDiscussionItem";
import { OpenUpsertModalButton } from "@common/Buttons";
import { useThrottle } from "@hooks/useThrottle";

interface Props {
  communityId: string;
}

const CommunityDiscussionFeed = observer(({ communityId }: Props) => {
  const { authStore, modalStore, communityDiscussionFeedStore } = useStore();
  const { auth, currentSessionUser } = authStore;
  const containerRef = useRef(null);
  const loaderRef = useRef(null);
  const [mounted, setMounted] = useState<boolean>(false);
  const {
    pagingParams,
    setPagingParams,
    setPredicate,
    predicate,
    loadingInitial,
    pagination,
    loadCommunityDiscussions
  } = communityDiscussionFeedStore;

  async function getRecords() {
    const paramsFromQryString = convertQueryStringToObject(
      window.location.search
    );


    if (
      (paramsFromQryString.currentPage && paramsFromQryString.itemsPerPage)
      && (paramsFromQryString.currentPage !== predicate.get('currentPage')
        || paramsFromQryString.itemsPerPage !== predicate.get('itemsPerPage')
        || paramsFromQryString.searchTerm != predicate.get('searchTerm'))) {

      setPagingParams(new PagingParams(paramsFromQryString.currentPage, paramsFromQryString.itemsPerPage));
      setPredicate('searchTerm', paramsFromQryString.searchTerm);
    }

    if(!communityDiscussionFeedStore.communityDiscussions.length)
      await loadFeedRecords();

  }
  const fetchMoreItems = async (pageNum: number) => {
    setPagingParams(new PagingParams(pageNum, 25))
    await loadFeedRecords();
  };
  const loadFeedRecords = useThrottle(async () => {
    const authUserId = import.meta.env.VITE_PUBLIC_IS_TEST_MODE ? auth?.getUser()?.id : currentSessionUser?.id;
    
    await loadCommunityDiscussions(authUserId ?? 'undefined', communityId!)
  }, 30_000);

  useEffect(() => {
    const isLoggedIn = import.meta.env.VITE_PUBLIC_IS_TEST_MODE ? auth?.isLoggedIn() : currentSessionUser?.id;

    if(isLoggedIn) {
      getRecords();
      setMounted(true);
    }

    return () => {
      setMounted(false);
    }
  }, [currentSessionUser?.id]);

  const loadedRecords = useMemo(() => {
    return communityDiscussionFeedStore.communityDiscussions;

  }, [loadingInitial]);

  const LoadMoreTrigger = () => {
    return (
      <div ref={loaderRef} style={{ height: '20px' }}>
        {loadingInitial && <div>Loading more community discussions...</div>}
      </div>
    );
  };

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        const firstEntry = entries[0];
        const currentPage = pagination?.currentPage ?? 1;
        const itemsPerPage = pagination?.itemsPerPage ?? 25;
        const totalItems = pagination?.totalItems ?? 0;

        const nextPage = currentPage + 1;
        const totalItemsOnNextPage = nextPage * itemsPerPage;
        const hasMoreItems = (totalItems > totalItemsOnNextPage);
        if (firstEntry?.isIntersecting && !loadingInitial && hasMoreItems && mounted) {
          fetchMoreItems(pagingParams.currentPage + 1);
        }
      },
      {
        root: containerRef.current,
        rootMargin: '100px',
        threshold: 0.1
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
  }, []);

  const commonUpsertBoxType = useMemo(() => CommonUpsertBoxTypes.CommunityDiscussion, [])

  const noRecordsTitle = useMemo(() =>  'You are not part of any discussions', []);

  return (
    <div className="col-span-7 text-left scrollbar-hide border-x max-h-screen overflow-scroll lg:col-span-5 dark:border-gray-800">
      <PageTitle>Community Discussions</PageTitle>
      <OpenUpsertModalButton
        testId="createcommunitydiscussionbutton"
        onClick={() => modalStore.showModal(
                        <ListOrCommunityUpsertModal 
                          loggedInUserId={currentSessionUser?.id!} 
                          type={commonUpsertBoxType}
                          communityId={communityId}
                        />
        )}
      >
        Create Community Discussion
      </OpenUpsertModalButton>
      {loadingInitial || !mounted ? (
        <CustomPageLoader title="Loading" />
      ) : (
        <ContentContainerWithRef
          classNames='flex flex-wrap min-h-100 md:justify-start'
          innerRef={containerRef}
        >
          <>
            {loadedRecords && loadedRecords.length 
              ? loadedRecords.map((record: CommunityDiscussionToDisplay, recordKey) => <CommunityDiscussionItemComponent
                                                                                            key={record.communityDiscussion.id ?? recordKey}
                                                                                            communityDiscussionToDisplay={record}
                                                                                        />)
                : <NoRecordsTitle>{noRecordsTitle}</NoRecordsTitle>}
              <LoadMoreTrigger />
          </>
        </ContentContainerWithRef>
      )}
    </div>
  );
});


export default CommunityDiscussionFeed;
