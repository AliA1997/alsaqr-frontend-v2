import React, { useCallback, useEffect, useMemo, useState } from "react";
import type {
  UserItemToDisplay,
} from "@typings";
import { FilterKeys } from "@enums";

import { convertQueryStringToObject } from "@utils/index";
import { ModalLoader } from "@common/CustomLoader";
import { observer } from "mobx-react-lite";
import { useStore } from "@stores/index";
import { PageTitle } from "@common/Titles";
import { PagingParams } from "@models/common";
import UserItemComponent from "./UserItem";
import { DEFAULT_VIRTUALIZED_ITEMS_PERPAGE, SEARCH_TERM_KEY_FOR_PREDICATE } from "@utils/constants";
import SearchBar from "@common/SearchBar";
import { VirtualizedFeed } from "@components/shared/VirtualizedFeed";

interface Props {
  title?: string;
  loggedInUserId?: string;
  filterKey: FilterKeys;
  usersAlreadyAddedOrFollowedByIds: string[];
  onAddOrFollow: (u: UserItemToDisplay) => void;
}

function FeedContainer({ children }: React.PropsWithChildren<any>) {
  return (
    <div className="col-span-7 scrollbar-hide border-x max-h-screen overflow-scroll lg:col-span-5 dark:border-gray-800">
      {children}
    </div>
  );
}


const UsersFeed = observer(({ title, loggedInUserId, filterKey, usersAlreadyAddedOrFollowedByIds, onAddOrFollow }: Props) => {
  const [loading, setLoading] = useState<boolean>(false);
  const { searchStore } = useStore();
  const {
    searchUsersLoadingInitial,
    setSearchedUsersPagingParams,
    searchedUsersPredicate,
    setSearchedUsersPredicate,
    searchedUsersPagination,
    loadSearchedUsers
  } = searchStore;

  const feedLoadingInitial = useMemo(() => {
    return searchUsersLoadingInitial;
  }, [searchUsersLoadingInitial]);

  const userFilterPredicate: Map<string, any> = useMemo(() => {
    return searchedUsersPredicate;
  }, []);

  const loadUsers = async () => {
    await loadSearchedUsers();
  }

  async function getUsers() {
    setLoading(true);
    try {
      const paramsFromQryString = convertQueryStringToObject(
        window.location.search
      );

      if (
        (paramsFromQryString.currentPage && paramsFromQryString.itemsPerPage)
        && (paramsFromQryString.currentPage !== userFilterPredicate.get('currentPage')
          || paramsFromQryString.itemsPerPage !== userFilterPredicate.get('itemsPerPage')
          || paramsFromQryString.searchTerm != userFilterPredicate.get('searchTerm'))) {

        setSearchedUsersPagingParams(new PagingParams(paramsFromQryString.currentPage, paramsFromQryString.itemsPerPage));
        setSearchedUsersPredicate('searchTerm', paramsFromQryString.searchTerm);
      } else {
        // Virtualized feeds load a large first page; paging kicks in at end of list.
        setSearchedUsersPagingParams(new PagingParams(1, +DEFAULT_VIRTUALIZED_ITEMS_PERPAGE));
      }

      await loadUsers();
    } finally {
      setLoading(false);
    }
  }

  const fetchMoreItems = async (pageNum: number) => {
    setSearchedUsersPagingParams(new PagingParams(pageNum, +DEFAULT_VIRTUALIZED_ITEMS_PERPAGE))
    await loadUsers();
  };


  useEffect(() => {

    if (!filterKey) return;

    getUsers();
  }, []);

  const loadedUsers = useMemo(() => {
    return searchStore.searchedUsers;
  }, [searchStore.searchedUsers]);

  const renderUser = useCallback(
    (_: number, userRec: UserItemToDisplay) => (
      <UserItemComponent
        loggedInUserId={loggedInUserId}
        filterKey={filterKey}
        userItemToDisplay={userRec}
        usersAlreadyFollowedOrAddedIds={usersAlreadyAddedOrFollowedByIds}
        onAddOrFollow={onAddOrFollow}
        canAddOrFollow={true}
        onModal={true}
      />
    ),
    [loggedInUserId, filterKey, usersAlreadyAddedOrFollowedByIds, onAddOrFollow]
  );

  const isCompact = filterKey === FilterKeys.SearchUsers || filterKey === FilterKeys.Register;

  return (
    <div
      className={`
        col-span-7 scrollbar-hide border-x ${isCompact ? 'z-[100] max-h-[60vh]' : 'max-h-screen'}
        lg:col-span-5 dark:border-gray-800
      `}
    >
      {title && <PageTitle>{title}</PageTitle>}
      <div>
        {loggedInUserId && (
            <SearchBar
              fullWidth
              placeholder="Search users..."
              value={(searchedUsersPredicate.get(SEARCH_TERM_KEY_FOR_PREDICATE) as string) ?? ""}
              onChange={(value) => setSearchedUsersPredicate(SEARCH_TERM_KEY_FOR_PREDICATE, value)}
              onSearch={loadSearchedUsers}
            />
        )}
      </div>

      <div className="text-center">
        {loading && (!loadedUsers || !loadedUsers.length) ? (
          <ModalLoader />
        ) : (
          <VirtualizedFeed<UserItemToDisplay>
            items={loadedUsers ?? []}
            pagination={searchedUsersPagination}
            loading={feedLoadingInitial}
            onEndReached={fetchMoreItems}
            itemContent={renderUser}
            computeItemKey={(index, userRec) => userRec.id ?? index}
            emptyText="No Users to show"
            height={isCompact ? '40vh' : '100vh'}
          />
        )}
      </div>
    </div>
  );
});

export { FeedContainer };

export default UsersFeed;
