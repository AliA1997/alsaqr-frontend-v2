import agent from "@utils/api/agent";
import { DEFAULT_MEDIUM_ITEMS_PERPAGE, DEFAULT_SMALL_ITEMS_PERPAGE } from "@utils/constants";



export type PrefetchPayloadData = {
    notifications: any[];
    notificationsPagination: any;
    bookmarks: any[];
    bookmarksPagination: any;
    communities: any[];
    communitiesPagination: any;
    lists: any[];
    listsPagination: any;
    messageHistory: any[];
    messageHistoryPagination: any;
}

if (typeof self !== 'undefined') {
    (self as any).global = self;
}


// Prevent polyfill crashing
(self as any).__vite_plugin_react_preamble_installed__ = true;

function defineListUrlParams() {
    const params = new URLSearchParams();
    params.append("currentPage", "1");
    params.append("itemsPerPage", DEFAULT_SMALL_ITEMS_PERPAGE);

    return params;
}

function defineCommonUrlParams() {
    const params = new URLSearchParams();
    params.append("currentPage", "1");
    params.append("itemsPerPage", DEFAULT_MEDIUM_ITEMS_PERPAGE);

    return params;
}

// User Data Worker
self.onmessage = async (event) => {
    debugger;
    const { loggedInUserId } = event.data;
    let result: PrefetchPayloadData | null = null;
    // 1. Perform heavy background fetching/processing
    try {
        const { items: notifications, pagination: notificationsPagination } = await agent.notificationApiClient.getNotifications(loggedInUserId, defineCommonUrlParams());
        const { items: bookmarks, pagination: bookmarksPagination } = await agent.postApiClient.getBookmarkedPosts(defineCommonUrlParams(), loggedInUserId);

        const { items: communities, pagination: communitiesPagination } = await agent.communityApiClient.getCommunities(defineCommonUrlParams(), loggedInUserId);
        const { items: lists, pagination: listsPagination } = await agent.listApiClient.getLists(defineListUrlParams(), loggedInUserId);
        const { items: messageHistory, pagination: messageHistoryPagination } = await agent.messageApiClient.loadDirectMessageHistory(loggedInUserId, defineCommonUrlParams());
        result = {
            notifications,
            notificationsPagination,
            bookmarks,
            bookmarksPagination,
            communities,
            communitiesPagination,
            lists,
            listsPagination,
            messageHistory,
            messageHistoryPagination
        };
    } catch {
        console.log("Error prefetching data for loggedin user.");
    }

    // 3. Send plain loggedin user back to main thread
    self.postMessage({ type: 'DATA_PREFETCHED', payload: result });
};