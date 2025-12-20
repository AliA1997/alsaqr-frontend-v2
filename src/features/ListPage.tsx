import { useEffect, useState } from "react";
import { observer } from "mobx-react-lite";
import SavedListItemsFeed from "@components/list/SavedListItemsFeed";
import { useStore } from "@stores/index";
import { useParams } from "react-router";
import { SuspenseLoader } from "@common/CustomLoader";


const ListPage = () => {
  const { list_id } = useParams();
  const { listFeedStore } = useStore();
  const { loadingListItems } = listFeedStore
  const [mounted, setMounted] = useState<boolean>(false);
  useEffect(() => {
    setMounted(true);

    return () => {
      setMounted(false);
    }
  }, []);

  if(!loadingListItems && mounted)
    return (
      <SavedListItemsFeed listId={list_id!} />
    );
  
  return <SuspenseLoader />
};


export default observer(ListPage);