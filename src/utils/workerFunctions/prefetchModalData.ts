// ModalDataWorker
import { Pagination } from '@models/common';
import { store } from '@stores/index';
import { PrefetchModalPayloadData } from '@webWorkers/modalDataWorker';
import ModalDataWorker from '@webWorkers/modalDataWorker?worker';

import { PostToDisplay, UserItemToDisplay } from 'typings';

const worker = new ModalDataWorker();

export type PrefetchPayloadMessageEvent = {
    data: {
        type: any;
        payload: PrefetchModalPayloadData;
    }
};

function setUsersToAdd(usersToAdd: UserItemToDisplay[], usersToAddPagination: Pagination) {
    usersToAdd.forEach((userItem: UserItemToDisplay) => {
        store.searchStore.setSearchedUser(userItem.user.id, userItem);
    });
    store.searchStore.setSearchedUsersPagination(usersToAddPagination);
}
function setPostsToAdd(postsToAdd: PostToDisplay[], postsToAddPagination: Pagination) {
    postsToAdd.forEach((postItem: PostToDisplay) => {
        store.searchStore.setSearchedPost(postItem.post.id, postItem);
    });
    store.searchStore.setSearchedPostsPagination(postsToAddPagination);
}



export const prefetchModalData = (loggedInUserId: string) => {
  // Send command to worker
  worker.postMessage({ loggedInUserId });

  // Listen for worker result
  worker.onmessage = (event: PrefetchPayloadMessageEvent) => {
    const { type, payload } = event.data;
    debugger;
    if (type === 'MODAL_DATA_PREFETCHED') {
      console.log('modal data prefetched', payload)
      setUsersToAdd(payload.usersToAdd, payload.usersToAddPagination);
      setPostsToAdd(payload.postsToAdd, payload.postsToAddPagination);
    }
  };
};