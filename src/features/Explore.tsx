import CustomPageLoader from "@common/CustomLoader";
import ExploreTabs from "@components/explore/ExploreTabs";
import React from "react";

export default function ExplorePage() {
    return (
        <React.Suspense fallback={<CustomPageLoader title='Loading...' />}>
            <ExploreTabs />
        </React.Suspense>
    );
}