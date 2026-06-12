import Feed from "@components/shared/Feed";
import { FilterKeys } from "@enums";


export default function BookmarksPage() {
    return (
        <Feed title="Bookmarks" filterKey={FilterKeys.MyBookmarks} hideTweetBox={true} />
    );
}