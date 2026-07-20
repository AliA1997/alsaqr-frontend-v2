// ModalDataWorker
import { Pagination } from '@models/common';
import { store } from '@stores/index';
import { PrefetchModalPayloadData } from '@webWorkers/modalDataWorker';
import ModalDataWorker from '@webWorkers/modalDataWorker?worker';

import { PostToDisplay, UserItemToDisplay } from 'typings';

// Constructed on first use, never at module scope: importing a module must not
// have the side effect of spawning a worker. Worker bundles transitively import
// this file, so a module-scope `new ModalDataWorker()` made every worker spawn
// another worker.
let worker: Worker | undefined;
const getWorker = () => (worker ??= new ModalDataWorker());

export type PrefetchPayloadMessageEvent = {
    data: {
        type: any;
        payload: PrefetchModalPayloadData;
    }
};

function setUsersToAdd(usersToAdd: UserItemToDisplay[], usersToAddPagination: Pagination) {
    usersToAdd.forEach((userItem: UserItemToDisplay) => {
        store.searchStore.setSearchedUser(userItem.id, userItem);
    });
    store.searchStore.setSearchedUsersPagination(usersToAddPagination);
}
function setPostsToAdd(postsToAdd: PostToDisplay[], postsToAddPagination: Pagination) {
    postsToAdd.forEach((postItem: PostToDisplay) => {
        store.searchStore.setSearchedPost(postItem.postId, postItem);
    });
    store.searchStore.setSearchedPostsPagination(postsToAddPagination);
}



export const prefetchModalData = (loggedInUserId: string) => {
  const worker = getWorker();

  // Send command to worker
  worker.postMessage({ loggedInUserId });

  // Listen for worker result
  worker.onmessage = (event: PrefetchPayloadMessageEvent) => {
    const { type, payload } = event.data;
    if (type === 'MODAL_DATA_PREFETCHED') {
    //   console.log('modal data prefetched', payload)
      setUsersToAdd(payload.usersToAdd, payload.usersToAddPagination);
      setPostsToAdd(payload.postsToAdd, payload.postsToAddPagination);
    }
  };
};