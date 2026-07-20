import { useCallback, useEffect, useMemo, useState } from "react";
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
import { PageTitle } from '@common/Titles';
import ListItemComponent from "@components/list/ListItem";
import { SkeletonLoader } from "@common/CustomLoader";
import ListOrCommunityUpsertModal from "@common/ListOrCommunityUpsertModal";
import { OpenUpsertModalButton } from "@common/Buttons";
import { useThrottle } from "@hooks/useThrottle";
import { DEFAULT_VIRTUALIZED_ITEMS_PERPAGE, inTestMode, SEARCH_TERM_KEY_FOR_PREDICATE } from "@utils/constants";
import SearchBar from "@common/SearchBar";
import { VirtualizedCardFeed } from "./VirtualizedFeed";

interface Props {
}

const ListFeed = observer(({ }: Props) => {
  const { authStore, modalStore, listFeedStore } = useStore();
  const { auth, currentSessionUser } = authStore;
  const [mounted, setMounted] = useState<boolean>(false);
  const {
    setPagingParams,
    setPredicate,
    predicate,
    pagination,
    loadingInitial,
    lists,
    loadLists
  } = listFeedStore;
  const authUserId = useMemo(() => inTestMode() ? auth?.getUser()?.id : currentSessionUser?.id, [auth, currentSessionUser]);


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
    } else {
      // Virtualized feeds load a large first page; paging kicks in at end of list.
      setPagingParams(new PagingParams(1, +DEFAULT_VIRTUALIZED_ITEMS_PERPAGE));
    }

    if (!lists.length)
      await loadFeedRecords();

  }

  const fetchMoreItems = async (pageNum: number) => {
    setPagingParams(new PagingParams(pageNum, +DEFAULT_VIRTUALIZED_ITEMS_PERPAGE))
    await loadFeedRecords();
  };
  const loadFeedRecords = useThrottle(async () => {

    await loadLists();
  }, 5_000);

  useEffect(() => {
    const isLoggedIn = inTestMode() ? auth?.isLoggedIn() : currentSessionUser?.id;

    if (isLoggedIn) {
      getRecords();
      setMounted(true);
    }

    return () => {
      setMounted(false);
    }
  }, [currentSessionUser?.id, auth]);

  const renderList = useCallback(
    (_: number, record: ListToDisplay) => (
      <ListItemComponent listToDisplay={record} fitParent />
    ),
    []
  );

  const commonUpsertBoxType = useMemo(() => CommonUpsertBoxTypes.List, [])

  const noRecordsTitle = useMemo(() => 'You don\'t have any lists', []);

  return (
    <div className="text-left col-span-7 scrollbar-hide max-h-screen overflow-scroll lg:col-span-5 dark:border-gray-800">
      <PageTitle>Lists</PageTitle>
      {authUserId && (
        <SearchBar
          fullWidth
          placeholder="Search your lists..."
          value={(predicate.get(SEARCH_TERM_KEY_FOR_PREDICATE) as string) ?? ""}
          onChange={(value) => setPredicate(SEARCH_TERM_KEY_FOR_PREDICATE, value)}
          onSearch={async () => {
            await loadLists();
          }}
          classNames="p-0"
        />
      )}
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
        <SkeletonLoader count={8} />
      ) : (
        <div className="px-5">
          <VirtualizedCardFeed<ListToDisplay>
            items={lists}
            pagination={pagination}
            loading={loadingInitial}
            onEndReached={fetchMoreItems}
            itemContent={renderList}
            computeItemKey={(index, record) => record.listId ?? index}
            emptyText={noRecordsTitle}
            itemClassNames="w-[30rem] lg:w-[20rem] pr-4 pb-2"
          />
        </div>
      )}
    </div>
  );
});


export default ListFeed;
