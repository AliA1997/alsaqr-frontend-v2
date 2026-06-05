import React from "react";
import { SkeletonLoader } from "@common/CustomLoader";
const ExploreTabs = React.lazy(() => import("@components/explore/ExploreTabs"));

export default function ExplorePage() {
    return (
        <React.Suspense fallback={<SkeletonLoader count={5} />}>
            <ExploreTabs />
        </React.Suspense>
    );
}