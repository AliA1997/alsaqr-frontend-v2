import { useEffect, useState } from "react";
import { observer } from "mobx-react-lite";
import { useStore } from "@stores/index";
import { CommunityAdminInfo } from "typings";
import { communityApiClient } from "@utils/api/communityApiClient";
import CommunityAdminView from "@components/community/CommunityAdminView";
import CommunityDiscussionFeed from "@components/shared/CommunityDiscussionFeed";
import { useParams } from "react-router-dom";
import { SkeletonLoader } from "@common/CustomLoader";

const CommunityPage = observer(() => {
    const { community_id } = useParams();

    const [loading, setLoading] = useState<boolean>(true);
    const { authStore } = useStore();
    const { currentSessionUser } = authStore;
    const [communityInfo, setCommunityInfo] = useState<CommunityAdminInfo | undefined>(undefined);

    async function getCommunityInfo() {
        const communityInfoResult = await communityApiClient
            .getAdminCommunityInfo(undefined, currentSessionUser?.id!, community_id!);

        setCommunityInfo(communityInfoResult);
        setLoading(false);
    }

    async function refreshCommunityInfo(communityId: string) {
        const communityInfoResult = await communityApiClient
            .getAdminCommunityInfo(undefined, currentSessionUser?.id!, communityId);

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

    if (loading)
        return <SkeletonLoader count={8} />
    else
        return (
            <>
                {communityInfo?.isFounder && (
                    <CommunityAdminView
                        communityAdminInfo={communityInfo!}
                        refreshCommunityAdminInfo={refreshCommunityInfo}
                    />
                )}
                <CommunityDiscussionFeed communityId={community_id ?? ""} />
            </>
        );
});


export default CommunityPage;