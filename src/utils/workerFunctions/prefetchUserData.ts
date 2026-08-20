// UserDataWorker
import { Pagination } from '@models/common';
import { store } from '@stores/index';
import { PrefetchPayloadData } from '@webWorkers/userDataWorker';
import UserDataWorker from '@webWorkers/userDataWorker?worker';
import { CommunityToDisplay, ListToDisplay, MessageHistoryToDisplay, NotificationToDisplay, PostToDisplay } from 'typings';

// Constructed on first use — see prefetchModalData for why module scope is unsafe.
let worker: Worker | undefined;
const getWorker = () => (worker ??= new UserDataWorker());

export type PrefetchPayloadMessageEvent = {
    data: {
        type: any;  
        payload: PrefetchPayloadData | null;
    }
};

function setNotifications(notifications: NotificationToDisplay[], notificationsPagination: Pagination) {
    notifications.forEach((notification: NotificationToDisplay) => {
        store.notificationStore.setNotification(notification.notificationId, notification);
    });
    store.notificationStore.setPagination(notificationsPagination);
}
function setBookmarks(bookmarks: PostToDisplay[], bookmarksPagination: Pagination) {
    bookmarks.forEach((post: PostToDisplay) => {
        store.bookmarkFeedStore.setBookmarkedPost(post.postId, post);
    });
    store.bookmarkFeedStore.setPagination(bookmarksPagination);
}
function setCommunities(communities: CommunityToDisplay[], communityPagination: Pagination) {
    communities.forEach((community: CommunityToDisplay) => {
        store.communityFeedStore.setCommunity(community.communityId, community)
    });
    store.communityFeedStore.setPagination(communityPagination);
}
function setLists(lists: ListToDisplay[], listPagination: Pagination) {
    lists.forEach((list: ListToDisplay) => {
        store.listFeedStore.setList(list.listId, list)
    });
    store.listFeedStore.setPagination(listPagination);
}
function setMessageHistory(messageHistory: MessageHistoryToDisplay[], messageHistoryPagination: Pagination) {
    messageHistory.forEach((messageItem: MessageHistoryToDisplay) => {
        store.messageStore.setDirectMessageHistory(messageItem);
    });
    // History pagination belongs to the thread-list feed, not the open thread's
    // messages. These used to share one field, so this wrote to the wrong one.
    store.messageStore.setHistoryPagination(messageHistoryPagination);
}


export const prefetchUserData = (loggedInUserId: string, accessToken: string) => {
  const worker = getWorker();

  // Send command to worker
  worker.postMessage({ loggedInUserId, accessToken });

  // Listen for worker result
  worker.onmessage = (event: PrefetchPayloadMessageEvent) => {
    const { type, payload } = event.data;
    if (type === 'DATA_PREFETCHED' && payload) {
        setNotifications(payload.notifications, payload.notificationsPagination);
        setBookmarks(payload.bookmarks, payload.bookmarksPagination);
        setCommunities(payload.communities, payload.communitiesPagination);
        setLists(payload.lists, payload.listsPagination);
        setMessageHistory(payload.messageHistory, payload.messageHistoryPagination);
    }
  };
};