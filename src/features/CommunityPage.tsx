import { useEffect, useState } from "react";
import { observer } from "mobx-react-lite";
import { useStore } from "@stores/index";
import {
    CommunityToDisplay 
} from "typings";
import { communityApiClient } from "@utils/api/communityApiClient";
import CommunityNonAdminView from "@components/community/CommunityNonAdminView";
import CommunityDiscussionFeed from "@components/shared/CommunityDiscussionFeed";
import { useParams } from "react-router-dom";
import { SkeletonLoader } from "@common/CustomLoader";
import CommunityAdminView from "@components/community/CommunityAdminView";

const CommunityPage = observer(() => {
    const { community_id } = useParams();

    const [loading, setLoading] = useState<boolean>(true);
    const { authStore } = useStore();
    const { currentSessionUser } = authStore;
    const [communityInfo, setCommunityInfo] = useState<CommunityToDisplay | undefined>(undefined);
    
    async function getCommunityInfo() {
        const communityInfoResult = await communityApiClient
            .getCommunityInfo(undefined, community_id!);

        setCommunityInfo(communityInfoResult);
        setLoading(false);
    }


    useEffect(
        () => {
            if (currentSessionUser?.id)
                getCommunityInfo();
        },
        [currentSessionUser]
    );

    if (loading && currentSessionUser)
        return <SkeletonLoader count={8} />
    else
        return (
            <>
                {communityInfo?.founderId == currentSessionUser?.id ? (
                    <CommunityAdminView communityId={community_id ?? ''} />
                ) : (
                    communityInfo && <CommunityNonAdminView communityInfo={communityInfo} />
                )}
                <CommunityDiscussionFeed communityId={community_id ?? ""} />
            </>
        );
});

 

export default CommunityPage;