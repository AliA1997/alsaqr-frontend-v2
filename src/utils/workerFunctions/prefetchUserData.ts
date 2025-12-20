// UserDataWorker
import { Pagination } from '@models/common';
import { store } from '@stores/index';
import { PrefetchPayloadData } from '@webWorkers/userDataWorker';
import UserDataWorker from '@webWorkers/userDataWorker?worker';
import { CommunityToDisplay, ListToDisplay, MessageHistoryToDisplay, NotificationToDisplay, PostToDisplay } from 'typings';

const worker = new UserDataWorker();

export type PrefetchPayloadMessageEvent = {
    data: {
        type: any;
        payload: PrefetchPayloadData;
    }
};

function setNotifications(notifications: NotificationToDisplay[], notificationsPagination: Pagination) {
    notifications.forEach((notification: NotificationToDisplay) => {
        store.notificationStore.setNotification(notification.notification.id, notification);
    });
    store.notificationStore.setPagination(notificationsPagination);
}
function setBookmarks(bookmarks: PostToDisplay[], bookmarksPagination: Pagination) {
    bookmarks.forEach((post: PostToDisplay) => {
        store.bookmarkFeedStore.setBookmarkedPost(post.post.id, post);
    });
    store.bookmarkFeedStore.setPagination(bookmarksPagination);
}
function setCommunities(communities: CommunityToDisplay[], communityPagination: Pagination) {
    communities.forEach((community: CommunityToDisplay) => {
        store.communityFeedStore.setCommunity(community.community.id, community)
    });
    store.communityFeedStore.setPagination(communityPagination);
}
function setLists(lists: ListToDisplay[], listPagination: Pagination) {
    lists.forEach((list: ListToDisplay) => {
        store.listFeedStore.setList(list.list.id, list)
    });
    store.listFeedStore.setPagination(listPagination);
}
function setMessageHistory(messageHistory: MessageHistoryToDisplay[], messageHistoryPagination: Pagination) {
    messageHistory.forEach((messageItem: MessageHistoryToDisplay) => {
        store.messageStore.setDirectMessageHistory(messageItem);
    });
    store.messageStore.setPagination(messageHistoryPagination);
}


export const prefetchUserData = (loggedInUserId: string) => {
  // Send command to worker
  worker.postMessage({ loggedInUserId });

  // Listen for worker result
  worker.onmessage = (event: PrefetchPayloadMessageEvent) => {
    const { type, payload } = event.data;
    debugger;
    if (type === 'DATA_PREFETCHED') {
      console.log('data prefetched', payload)
      setNotifications(payload.notifications, payload.notificationsPagination);
      setBookmarks(payload.bookmarks, payload.bookmarksPagination);
      setCommunities(payload.communities, payload.communitiesPagination);
      setLists(payload.lists, payload.listsPagination);
      setMessageHistory(payload.messageHistory, payload.messageHistoryPagination);
    }
  };
};