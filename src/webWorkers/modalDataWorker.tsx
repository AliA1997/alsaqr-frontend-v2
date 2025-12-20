import agent from "@utils/api/agent";
import { DEFAULT_MEDIUM_ITEMS_PERPAGE } from "@utils/constants";



export type PrefetchModalPayloadData = {
    usersToAdd: any[];
    usersToAddPagination: any;
    postsToAdd: any[];
    postsToAddPagination: any;
}

if (typeof self !== 'undefined') {
    (self as any).global = self;
}


// Prevent polyfill crashing
(self as any).__vite_plugin_react_preamble_installed__ = true;

function defineCommonUrlParams() {
    const params = new URLSearchParams();
    params.append("currentPage", "1");
    params.append("itemsPerPage", DEFAULT_MEDIUM_ITEMS_PERPAGE);

    return params;
}

// User Data Worker
self.onmessage = async (event) => {
    const { loggedInUserId } = event.data;
    let result: PrefetchModalPayloadData | null = null;
    // 1. Perform heavy background fetching/processing
    try {
        const { items: usersToAdd, pagination: usersToAddPagination } = await agent.userApiClient.getUsersToAdd(loggedInUserId, defineCommonUrlParams());
        const { items: postsToAdd, pagination: postsToAddPagination } = await agent.postApiClient.getPostsToAdd(loggedInUserId, defineCommonUrlParams());

        result = {
            usersToAdd,
            usersToAddPagination,
            postsToAdd,
            postsToAddPagination
        };
    } catch {
        console.log("Error prefetching modal data for loggedin user.");
    }

    // 3. Send plain loggedin user back to main thread
    self.postMessage({ type: 'MODAL_DATA_PREFETCHED', payload: result });
};