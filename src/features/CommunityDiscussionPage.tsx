import { useEffect, useState } from "react";
import { observer } from "mobx-react-lite";
import CommunityDiscussionMessageRoom from "@components/community/CommunityDiscussionMessageRoom";
import { useStore } from "@stores/index";
import CustomPageLoader from "@common/CustomLoader";
import { useParams } from "react-router-dom";


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
        return <CustomPageLoader title="Loading..." />

};


export default observer(CommunityDiscussionForumPage);