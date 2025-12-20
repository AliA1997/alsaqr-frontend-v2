import React from "react";
const CommunityFeed = React.lazy(() => import("@components/shared/CommunityFeed"));

export default function CommunitiesPage() {
    return (
        <CommunityFeed />
    );
}