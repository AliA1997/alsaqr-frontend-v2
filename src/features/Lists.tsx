import React from "react";
const ListFeed = React.lazy(() => import("@components/shared/ListFeed"));

export default function ListsPage() {
    return (
        <ListFeed />
    );
}