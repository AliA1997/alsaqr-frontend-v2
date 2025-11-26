import { useEffect, useMemo, useRef, useState } from "react";
import { 
  CommonUpsertBoxTypes,
} from '@models/enums';
import type {
  ListToDisplay,
} from "@typings";
import { convertQueryStringToObject } from "@utils/index";

import { observer } from "mobx-react-lite";
import { useStore } from "@stores/index";
import { PagingParams } from "@models/common";
import { NoRecordsTitle, PageTitle } from '@common/Titles';
import { ContentContainerWithRef } from "@common/Containers";
import ListItemComponent from "@components/list/ListItem";
import CustomPageLoader from "@common/CustomLoader";
import ListOrCommunityUpsertModal from "@common/ListOrCommunityUpsertModal";
import { OpenUpsertModalButton } from "@common/Buttons";
import { useThrottle } from "@hooks/useThrottle";
import { inTestMode } from "@utils/constants";

interface Props {
}

const ListFeed = observer(({}: Props) => {
  const { authStore, modalStore, listFeedStore } = useStore();
  const { auth, currentSessionUser } = authStore;
  const containerRef = useRef(null);
  const loaderRef = useRef(null);
  const [mounted, setMounted] = useState<boolean>(false);
  const { 
    setPagingParams,
    pagingParams,
    setPredicate,
    predicate,
    pagination,
    loadingInitial,
    lists,
    loadLists
  } = listFeedStore;

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

    if(!lists.length)
      await loadFeedRecords();

  }

  const fetchMoreItems = async (pageNum: number) => {
    setPagingParams(new PagingParams(pageNum, 25))
    await loadFeedRecords();
  };
  const loadFeedRecords = useThrottle( async () => {
    const authUserId =  inTestMode() ? auth?.getUser()?.id : currentSessionUser?.id;

    await loadLists(authUserId ?? 'undefined');
  }, 30_000);

  useEffect(() => {
    const isLoggedIn =  inTestMode() ? auth?.isLoggedIn() : currentSessionUser?.id;

    if(isLoggedIn) {
      getRecords();
      setMounted(true);
    }

    return () => {
      setMounted(false);
    }
  }, [currentSessionUser?.id, auth]);


  const LoadMoreTrigger = () => {
    return (
      <div ref={loaderRef} style={{ height: '20px' }}>
        {loadingInitial && <div>Loading more lists...</div>}
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
        rootMargin: '10px',
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
  }, []);

  const commonUpsertBoxType = useMemo(() => CommonUpsertBoxTypes.List, [])

  const noRecordsTitle = useMemo(() => 'You don\'t have any lists', []);

  if(!mounted && !lists.length)
    return <CustomPageLoader title="Loading" />;

  return (
    <div className="text-left col-span-7 scrollbar-hide max-h-screen overflow-scroll lg:col-span-5 dark:border-gray-800">
      <PageTitle>Lists</PageTitle>
      <OpenUpsertModalButton
        testId="createlistbutton" 
        onClick={() => modalStore.showModal(
                                <ListOrCommunityUpsertModal 
                                  loggedInUserId={currentSessionUser?.id!} 
                                  type={commonUpsertBoxType}
                                />
                )}
      >
        Create List
      </OpenUpsertModalButton>
      {loadingInitial || !mounted ? (
        <CustomPageLoader title="Loading" />
      ) : (
        <ContentContainerWithRef
          classNames='flex flex-wrap min-h-100 md:justify-start px-5'
          innerRef={containerRef}
        >
          <>
            {lists && lists.length 
              ? lists.map((record: ListToDisplay, recordKey) => (<ListItemComponent
                                                                    key={record.list.id ?? recordKey}
                                                                    listToDisplay={record}
                                                                  />))
                : <NoRecordsTitle>{noRecordsTitle}</NoRecordsTitle>}
              <LoadMoreTrigger />
          </>
        </ContentContainerWithRef>
      )}
    </div>
  );
});


export default ListFeed;
