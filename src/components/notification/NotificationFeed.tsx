import { useCallback, useEffect, useMemo } from "react";
import { convertQueryStringToObject } from "@utils/index";
import { observer } from "mobx-react-lite";
import { useStore } from "@stores/index";
import { PagingParams } from "@models/common";
import { PageTitle } from "@common/Titles";
import { SkeletonLoader } from "@common/CustomLoader";
import NotificationItemComponent from "./NotificationItem";
import { leadingDebounce } from "@utils/api/agent";
import { DEFAULT_VIRTUALIZED_ITEMS_PERPAGE } from "@utils/constants";
import { VirtualizedFeed } from "@components/shared/VirtualizedFeed";
import type { NotificationToDisplay } from "@typings";

interface Props { }

const NotificationFeed = observer(({ }: Props) => {

  const { authStore } = useStore();
  const { currentSessionUser } = authStore;
  const userId = useMemo(() => currentSessionUser ? currentSessionUser.id : "", [currentSessionUser]);

  const { notificationStore } = useStore();
  const {
    loadNotifications,
    loadingInitial,
    setPagingParams,
    setPredicate,
    predicate,
    pagination,
    notifications
  } = notificationStore;


  async function getNotifications() {
    leadingDebounce(async () => {

      try {
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

        if (userId)
          await loadNotifications(userId);
      } finally {
      }
    }, 10000);
  }

  const fetchMoreItems = async (pageNum: number) => {
    setPagingParams(new PagingParams(pageNum, +DEFAULT_VIRTUALIZED_ITEMS_PERPAGE))
    if (userId)
      await loadNotifications(userId);
  };


  useEffect(() => {
    getNotifications();
  }, []);

  const renderNotification = useCallback(
    (_: number, notificationRecord: NotificationToDisplay) => (
      <NotificationItemComponent
        notificationToDisplay={notificationRecord}
      />
    ),
    []
  );

  return (
    <div className="col-span-7 text-left scrollbar-hide border-x max-h-screen overflow-scroll lg:col-span-5 dark:border-gray-800">
      <PageTitle>Your Notifications</PageTitle>

      <div className="text-center">
        {loadingInitial && !notifications.length ? (
          <SkeletonLoader count={4} />
        ) : (
          <VirtualizedFeed<NotificationToDisplay>
            items={notifications}
            pagination={pagination}
            loading={loadingInitial}
            onEndReached={fetchMoreItems}
            itemContent={renderNotification}
            computeItemKey={(index, record) => record.notificationId ?? index}
            emptyText="No Notifications to show"
          />
        )}
      </div>
    </div>
  );
});


export default NotificationFeed;
