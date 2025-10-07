import Feed from "@components/shared/Feed";
import { FilterKeys } from "@stores/index";


export default function BookmarksPage() {
    return (
        <Feed title="Bookmarks" filterKey={FilterKeys.MyBookmarks} hideTweetBox={true} />
    );
}