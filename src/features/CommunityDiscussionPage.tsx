import React from "react";
import { useEffect, useState } from "react";
import { observer } from "mobx-react-lite";
import { useStore } from "@stores/index";
import { useParams } from "react-router-dom";
import { SkeletonLoader } from "@common/CustomLoader";
const CommunityDiscussionMessageRoom = React.lazy(() => import("@components/community/CommunityDiscussionMessageRoom"))


const CommunityDiscussionForumPage = () => {
    const { community_id, community_discussion_id } = useParams();

    const [mounted, setMounted] = useState<boolean>(false);
    const { authStore } = useStore();
    const { currentSessionUser } = authStore;

    useEffect(() => {
        setMounted(true);

        () => {
            setMounted(false);
        }
    }, [])

    if (currentSessionUser && currentSessionUser?.id)
        return <CommunityDiscussionMessageRoom
                    loggedInUser={currentSessionUser!}
                    communityDiscussionId={community_discussion_id!}
                    communityId={community_id!}
                />
    else if (mounted)
        return (
            <div>You need to be logged in to access this chat.</div>
        );
    else
        return <SkeletonLoader count={6} />

};


export default observer(CommunityDiscussionForumPage);