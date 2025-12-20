import { SkeletonLoader } from "@common/CustomLoader";
const ExploreTabs = React.lazy(() => import("@components/explore/ExploreTabs"));
import React from "react";

export default function ExplorePage() {
    return (
        <React.Suspense fallback={<SkeletonLoader count={5} />}>
            <ExploreTabs />
        </React.Suspense>
    );
}