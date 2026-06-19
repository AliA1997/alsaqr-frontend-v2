import { useRef } from "react";
import type { PostToDisplay } from "@typings";

import { ContentContainerWithRef } from "@common/Containers";
import { NoRecordsTitle } from "@common/Titles";
import MediaPost from "@components/posts/MediaPost";

interface Props {
  mediaPosts: PostToDisplay[];
}

function MediaFeed({ mediaPosts }: Props) {
  const containerRef = useRef(null);

  return (
    <ContentContainerWithRef
      classNames={`
        text-left overflow-y-auto scrollbar-hide
        min-h-[100vh] max-h-[100vh]
      `}
      innerRef={containerRef}
      testId="mediafeedcontaineritems"
    >
      {mediaPosts && mediaPosts.length ? (
        <div className="grid grid-cols-3 gap-1">
          {mediaPosts.map((postRec, postKey) => (
            <MediaPost
              key={postRec.postId ?? postKey}
              postToDisplay={postRec}
            />
          ))}
        </div>
      ) : (
        <NoRecordsTitle>No media to show</NoRecordsTitle>
      )}
    </ContentContainerWithRef>
  );
}

export default MediaFeed;
