import { useEffect, useMemo, useRef, useState } from "react";
import { useParams } from "react-router";
import { observer } from "mobx-react-lite";
import { useStore } from "@stores/index";
import { ContentContainerWithRef } from "@common/Containers";
import { SkeletonLoader, SuspenseLoader } from "@common/CustomLoader";
import PostComponent from "@components/posts/Post";
import CommentComponent from "@components/posts/Comment";

const StatusPage = () => {
  const { status_id } = useParams();
  const { commentFeedStore, feedStore} = useStore();
  const containerRef = useRef(null);
  const isComment = useMemo(() => status_id?.includes('comment'), [status_id]);
  const [mounted, setMounted] = useState<boolean>(false);

  const { loadPost, loadedPost, loadingPost } = feedStore;
  const { loadComment, loadedComment, loadingComment } = commentFeedStore;

  useEffect(() => {
    setMounted(true);

    return () => {
      setMounted(false);
    }
  }, [])

  useEffect(() => {
    if(status_id){
        if(isComment)
          loadComment(status_id);
        else
          loadPost(status_id);
    }

  },[status_id])

  const isLoading = useMemo(() => {
    if(isComment)
      return (loadingComment && !loadedComment);
    else
      return (loadingPost && !loadedPost);
  }, [status_id]);


  if(((!isComment && !loadingPost) || (isComment && !loadingComment)) && mounted)
    return (
      <div className="col-span-7 scrollbar-hide border-x max-h-screen overflow-scroll lg:col-span-5 dark:border-gray-800">
        <ContentContainerWithRef innerRef={containerRef} style={{ minHeight: '100vh' }}>
          {isLoading ? (
            <SkeletonLoader count={4} />
          ) : (
            <>
              {isComment && loadedComment
                ? (
                  <CommentComponent
                    commentToDisplay={loadedComment}
                    showLabel={true}
                  />
                )
                : loadedPost ? (
                  <PostComponent
                    postToDisplay={loadedPost!}
                    showLabel={true}
                  />
                  )
                  : <div />
              }
            </>
          )}
        </ContentContainerWithRef>
      </div>
    );

  return <SuspenseLoader />
};


export default observer(StatusPage);