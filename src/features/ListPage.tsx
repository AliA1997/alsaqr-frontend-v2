import { useEffect, useState } from "react";
import { observer } from "mobx-react-lite";
import SavedListItemsFeed from "@components/list/SavedListItemsFeed";
import { useParams } from "react-router";
import { SuspenseLoader } from "@common/CustomLoader";
import { PageTitle } from "@common/Titles";
import { ListToDisplay } from "typings";
import { listApiClient } from "@utils/api/listsApiClient";


const ListPage = () => {
  const { list_id } = useParams();
  const [selectedList, setSelectedList] = useState<ListToDisplay>();
  
  async function getListDetails() {
    var listDetails = await listApiClient.getListDetails(list_id ?? '');

    setSelectedList(listDetails);
  }

  const [mounted, setMounted] = useState<boolean>(false);
  useEffect(() => {
    setMounted(true);
    if(list_id)
      getListDetails();
    return () => {
      setMounted(false);
    }
  }, []);

  if(mounted && selectedList)
    return (
      <>
        <div
          className="relative flex flex-col justify-end p-4 min-h-[10rem] bg-cover bg-center bg-no-repeat"
          style={
            selectedList?.listBannerImage
              ? { backgroundImage: `url(${selectedList.listBannerImage})` }
              : undefined
          }
        >
          <div className="absolute inset-0 bg-black/50" />
          <div className="relative z-10 text-white">
            <PageTitle classNames='bg-transparent'>{selectedList?.listName} Items</PageTitle>
            <div className="flex justify-center gap-4 text-sm text-gray-200 mt-1">
              <span>{selectedList?.itemCounts?.totalItems ?? 0} items</span>
              {selectedList?.listCreatedAt && (
                <span>
                  Created: {new Date(selectedList.listCreatedAt).toLocaleDateString()}
                </span>
              )}
            </div>
          </div>
        </div>
        <SavedListItemsFeed listId={list_id!} selectedList={selectedList} />
      </>
    );
  
  return <SuspenseLoader />
};


export default observer(ListPage);