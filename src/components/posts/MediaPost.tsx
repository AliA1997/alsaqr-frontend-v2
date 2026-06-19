import { useCallback } from "react";
import { motion } from "framer-motion";
import type { PostToDisplay } from "@typings";

import { useStore } from "@stores/index";
import { OptimizedPostImage } from "@common/Image";
import { stopPropagationOnClick } from "@utils/index";
import DisplayPostModal from "./DisplayPostModal";

interface Props {
  postToDisplay: PostToDisplay;
}

function MediaPost({ postToDisplay }: Props) {
  const { modalStore } = useStore();
  const { showModal } = modalStore;

  const onOpenPost = useCallback(
    (e: React.MouseEvent) =>
      stopPropagationOnClick(e, () =>
        showModal(
          <DisplayPostModal
            postId={postToDisplay.postId}
            postToDisplay={postToDisplay}
          />
        )
      ),
    [postToDisplay.postId]
  );

  return (
    <motion.div
      whileHover={{ scale: 1.03 }}
      whileTap={{ scale: 0.97 }}
      data-testid="mediapost"
      className="relative aspect-square overflow-hidden cursor-pointer bg-gray-100 dark:bg-gray-900"
      onClick={onOpenPost}
    >
      <OptimizedPostImage
        src={postToDisplay.bannerImage ?? ""}
        alt={postToDisplay.content || "post media"}
        classNames="w-full h-full object-cover hover:opacity-90 transition-opacity"
      />
    </motion.div>
  );
}

export default MediaPost;
