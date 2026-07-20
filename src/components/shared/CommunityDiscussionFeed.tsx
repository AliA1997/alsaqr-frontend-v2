import { useCallback, useEffect, useMemo, useState } from "react";
import {
  CommonUpsertBoxTypes,
} from '@models/enums';
import { observer } from "mobx-react-lite";
import { useStore } from "@stores/index";
import { PagingParams } from "@models/common";
import { PageTitle } from '@common/Titles';


import type { CommunityDiscussionToDisplay } from "@models/community";
import ListOrCommunityUpsertModal from "@common/ListOrCommunityUpsertModal";
import { SkeletonLoader } from "@common/CustomLoader";
import CommunityDiscussionItemComponent from "@components/community/CommunityDiscussionItem";
import { OpenUpsertModalButton } from "@common/Buttons";
import { DEFAULT_VIRTUALIZED_ITEMS_PERPAGE, inTestMode, SEARCH_TERM_KEY_FOR_PREDICATE } from "@utils/constants";
import SearchBar from "@common/SearchBar";
import { VirtualizedCardFeed } from "./VirtualizedFeed";
import { leadingDebounce } from "@utils/api/agent";

interface Props {
  communityId: string;
}

const CommunityDiscussionFeed = observer(({ communityId }: Props) => {
  const { authStore, modalStore, communityDiscussionFeedStore } = useStore();
  const { auth, currentSessionUser } = authStore;
  const [mounted, setMounted] = useState<boolean>(false);
  const {
    setPagingParams,
    setPredicate,
    predicate,
    loadingInitial,
    pagination,
    loadCommunityDiscussions
  } = communityDiscussionFeedStore;

  async function getRecords() {
    // Virtualized feeds load a large first page; paging kicks in at end of list.
    setPagingParams(new PagingParams(1, +DEFAULT_VIRTUALIZED_ITEMS_PERPAGE));

    await loadCommunityDiscussions(communityId!);
  }
  const fetchMoreItems = async (pageNum: number) => {
    setPagingParams(new PagingParams(pageNum, +DEFAULT_VIRTUALIZED_ITEMS_PERPAGE))
    await loadCommunityDiscussions(communityId!);
  };
  
  useEffect(() => {
    const isLoggedIn = inTestMode() ? auth?.isLoggedIn() : currentSessionUser?.id;

    if(isLoggedIn) {
      leadingDebounce(async () => {
        await getRecords();
        setMounted(true);
      }, 10000);
    }

    return () => {
      setMounted(false);
    }
  }, [currentSessionUser?.id]);

  const loadedRecords = useMemo(() => {
    return communityDiscussionFeedStore.communityDiscussions;

  }, [loadingInitial]);

  const renderDiscussion = useCallback(
    (_: number, record: CommunityDiscussionToDisplay) => (
      <CommunityDiscussionItemComponent
        communityDiscussionToDisplay={record}
        fitParent
      />
    ),
    []
  );

  const commonUpsertBoxType = useMemo(() => CommonUpsertBoxTypes.CommunityDiscussion, [])

  const noRecordsTitle = useMemo(() =>  'You are not part of any discussions', []);

  if(!mounted && loadingInitial && !loadedRecords.length)
    return <SkeletonLoader count={8} />

  return (
    <div className="col-span-7 text-left scrollbar-hide border-x max-h-screen overflow-scroll lg:col-span-5 dark:border-gray-800">
      <PageTitle>Community Discussions</PageTitle>
      <SearchBar
        fullWidth
        placeholder="Search discussions..."
        value={(predicate.get(SEARCH_TERM_KEY_FOR_PREDICATE) as string) ?? ""}
        onChange={(value) => setPredicate(SEARCH_TERM_KEY_FOR_PREDICATE, value)}
        onSearch={async () => {
          await loadCommunityDiscussions(communityId);
        }}
        classNames="p-0"
      />
      <OpenUpsertModalButton
        testId="createcommunitydiscussionbutton"
        onClick={() => modalStore.showModal(
                        <ListOrCommunityUpsertModal
                          loggedInUserId={currentSessionUser?.id!}
                          type={commonUpsertBoxType}
                          communityId={communityId}
                        />
        )}
      >
        Create Community Discussion
      </OpenUpsertModalButton>
      {loadingInitial || !mounted ? (
        <SkeletonLoader count={8} />
      ) : (
        <VirtualizedCardFeed<CommunityDiscussionToDisplay>
          items={loadedRecords}
          pagination={pagination}
          loading={loadingInitial}
          onEndReached={fetchMoreItems}
          itemContent={renderDiscussion}
          computeItemKey={(index, record) => record.communityDiscussionId ?? index}
          emptyText={noRecordsTitle}
          itemClassNames="w-full pb-4 md:w-[21rem] lg:w-[49%] 3xl:w-[30%]"
        />
      )}
    </div>
  );
});


export default CommunityDiscussionFeed;
