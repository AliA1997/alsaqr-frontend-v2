import React from 'react';
const Feed = React.lazy(() => import("@components/shared/Feed"));
import { FilterKeys } from "@stores/index";

export default function HomePage() {

    return (
        <Feed title="Popular Posts" filterKey={FilterKeys.Normal} />
    );
}