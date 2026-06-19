import { useEffect } from "react";
import { observer } from "mobx-react-lite";
import type { PostToDisplay } from "@typings";

import { useStore } from "@stores/index";
import { ModalBody, ModalPortal } from "@common/Modal";
import { PagingParams } from "@models/common";
import PostComponent from "./Post";

interface Props {
  postId: string;
  postToDisplay: PostToDisplay;
}

const DisplayPostModal = observer(({ postId, postToDisplay }: Props) => {
  const { commentFeedStore, modalStore } = useStore();
  const { closeModal } = modalStore;

  useEffect(() => {
    commentFeedStore.setPagingParams(new PagingParams(1, 10));
    commentFeedStore.loadComments(postId);
  }, [postId]);

  return (
    <ModalPortal>
      <ModalBody
        onClose={closeModal}
        classNames="overflow-y-auto scrollbar-hide"
        bodyClassNames="max-w-3xl max-h-[90vh] overflow-y-auto scrollbar-hide"
      >
        <PostComponent postToDisplay={postToDisplay} showLabel={true} />
      </ModalBody>
    </ModalPortal>
  );
});

export default DisplayPostModal;
