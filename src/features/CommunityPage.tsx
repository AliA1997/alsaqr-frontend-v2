import { useEffect, useMemo, useState } from "react";
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
import SpacePanel from "@components/spaces/SpacePanel";
import { RelationshipType } from "@enums";

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
            else
                setLoading(false);
        },
        // Key off the id, not the object: currentSessionUser is replaced with a
        // fresh object on every session check, which refetched the community.
        [currentSessionUser?.id]
    );

    // Only community members can join community spaces (backend enforces it;
    // the UI just reflects membership).
    const isCommunityMember = useMemo(() => {
        if (!communityInfo || !currentSessionUser?.id) return false;
        if (communityInfo.founderId === currentSessionUser.id) return true;

        return [
            RelationshipType.Member,
            RelationshipType.Moderator,
            RelationshipType.Founder,
        ].includes(communityInfo.relationshipType as RelationshipType);
    }, [communityInfo, currentSessionUser?.id]);

    // Gate on `loading` alone. Gating on `currentSessionUser` too made this flip
    // false -> true -> false as the session resolved, which mounted, unmounted
    // and remounted SpacePanel — connecting to the space twice and firing its
    // leave-on-unmount cleanup in between.
    if (loading)
        return <SkeletonLoader count={8} />
    else
        return (
            <>
                {communityInfo?.founderId == currentSessionUser?.id ? (
                    <CommunityAdminView communityId={community_id ?? ''} />
                ) : (
                    communityInfo && <CommunityNonAdminView communityInfo={communityInfo} />
                )}
                <SpacePanel
                    kind="community"
                    communityId={community_id ?? ""}
                    isMember={isCommunityMember}
                />
                <CommunityDiscussionFeed communityId={community_id ?? ""} />
            </>
        );
});

 

export default CommunityPage;