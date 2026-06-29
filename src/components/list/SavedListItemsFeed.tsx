import { useEffect, useRef, useState } from "react";
import { SkeletonLoader } from "@common/CustomLoader";
import { observer } from "mobx-react-lite";
import { useStore } from "@stores/index";
import { NoRecordsTitle, PageTitle } from "@common/Titles";
import { ContentContainerWithRef } from "@common/Containers";
import SavedListItem from "./SavedListItem";
import { ListToDisplay } from "typings";

interface Props {
  listId: string;
  selectedList: ListToDisplay | undefined;
}


const SavedListItemsFeed = observer(({ listId, selectedList }: Props) => {
  const [_, setLoading] = useState(false);
  const { authStore, listFeedStore } = useStore();
  const {
    savedListItems,
    listInfoForSavedListItems,
    loadSavedListItems,
    loadingListItems
  } = listFeedStore;
  const { currentSessionUser } = authStore;
  const containerRef = useRef(null);

  async function getListItems() {
    setLoading(true);
    try {
      await loadSavedListItems(listId);
    } catch(error){
      console.log("Load saved list items", error);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (currentSessionUser?.id)
      getListItems();

  }, [])


  return (
    <div className="col-span-7 scrollbar-hide border-x max-h-screen overflow-scroll lg:col-span-7 dark:border-gray-800">
      <PageTitle>{listInfoForSavedListItems?.name ?? ""}</PageTitle>
      <ContentContainerWithRef testId='savedlistfeed' innerRef={containerRef} style={{ minHeight: '100vh' }}>
        {loadingListItems ? (
          <SkeletonLoader count={8} />
        ) : (
          <>
            {savedListItems && savedListItems.length
              ?
              savedListItems.map((savedListItem) => (
                <SavedListItem key={savedListItem.listItemId} savedListItemToDisplay={savedListItem} selectedList={selectedList} />
              ))
              : <NoRecordsTitle>No saved items for this list.</NoRecordsTitle>}
          </>
        )}
      </ContentContainerWithRef>
    </div>
  );
});

export default SavedListItemsFeed;
