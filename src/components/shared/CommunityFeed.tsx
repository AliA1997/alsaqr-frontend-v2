import { useCallback, useEffect, useMemo, useState } from "react";
import {
  CommonUpsertBoxTypes,
} from '@models/enums';
import type {
  CommunityToDisplay,
} from "@typings";

import { observer } from "mobx-react-lite";
import { useStore } from "@stores/index";
import { PagingParams } from "@models/common";
import { PageTitle } from '@common/Titles';
import { SkeletonLoader } from "@common/CustomLoader";
import ListOrCommunityUpsertModal from "@common/ListOrCommunityUpsertModal";
import CommunityItemComponent from "@components/community/CommunityItem";
import { OpenUpsertModalButton } from "@common/Buttons";
import { DEFAULT_VIRTUALIZED_ITEMS_PERPAGE, inTestMode, SEARCH_TERM_KEY_FOR_PREDICATE } from "@utils/constants";
import SearchBar from "@common/SearchBar";
import { VirtualizedCardFeed } from "./VirtualizedFeed";
import { leadingDebounce } from "@utils/api/agent";

interface Props {
}

const CommunityFeed = observer(({ }: Props) => {
  const { authStore, modalStore, communityFeedStore } = useStore();
  const { auth, currentSessionUser } = authStore;
  const [mounted, setMounted] = useState<boolean>(false);
  const {
    setPagingParams,
    pagination,
    predicate,
    setPredicate,
    loadingInitial,
    loadCommunities,
    communities
   } = communityFeedStore;
  const authUserId = useMemo(() => inTestMode() ? auth?.getUser()?.id : currentSessionUser?.id, [auth, currentSessionUser]);


  async function getRecords() {
    setPagingParams(new PagingParams(1, +DEFAULT_VIRTUALIZED_ITEMS_PERPAGE));
   
    if(!communities.length)
      await loadCommunities();

  }

  const fetchMoreItems = async (pageNum: number) => {
    setPagingParams(new PagingParams(pageNum, +DEFAULT_VIRTUALIZED_ITEMS_PERPAGE))
    // Not getRecords(): that resets back to page 1 and bails out once the
    // registry is non-empty, so paging never advanced.
    await loadCommunities();
  };

  useEffect(() => {
    const isLoggedIn = inTestMode() ? auth?.isLoggedIn() : currentSessionUser?.id;

    if(isLoggedIn) {
      leadingDebounce(async () => {
        await getRecords()
        setMounted(true);
      }, 10000);
    }

    return () => {
      setMounted(false);
    }
  }, [currentSessionUser?.id, auth]);

  const renderCommunity = useCallback(
    (_: number, record: CommunityToDisplay) => (
      <CommunityItemComponent community={record} fitParent />
    ),
    []
  );

  const commonUpsertBoxType = useMemo(() => CommonUpsertBoxTypes.Community, [])

  const noRecordsTitle = useMemo(() => 'You are not part of any communities', []);

  if(loadingInitial && !communities.length)
    return <SkeletonLoader count={10} />

  return (
    <div className="col-span-7  text-left scrollbar-hide max-h-screen overflow-scroll lg:col-span-5 dark:border-gray-800">
      <PageTitle>Communities</PageTitle>
        {authUserId && (
            <SearchBar
              fullWidth
              placeholder="Search communities..."
              value={(predicate.get(SEARCH_TERM_KEY_FOR_PREDICATE) as string) ?? ""}
              onChange={(value) => setPredicate(SEARCH_TERM_KEY_FOR_PREDICATE, value)}
              onSearch={async () => {
                await loadCommunities(true);
              }}
              classNames="p-0"
            />
        )}

      <OpenUpsertModalButton
          testId="createcommunitybutton"
          onClick={() => modalStore.showModal(
                          <ListOrCommunityUpsertModal
                            loggedInUserId={currentSessionUser?.id!}
                            type={commonUpsertBoxType}
                          />
          )}
      >
        Create Community
      </OpenUpsertModalButton>
      {mounted && (
        <VirtualizedCardFeed<CommunityToDisplay>
          items={communities}
          pagination={pagination}
          loading={loadingInitial}
          onEndReached={fetchMoreItems}
          itemContent={renderCommunity}
          computeItemKey={(index, record) => record.communityId ?? index}
          emptyText={noRecordsTitle}
          itemClassNames="w-full pb-2 lg:w-[49%] 3xl:w-[30%]"
        />
      )}
    </div>
  );
});


export default CommunityFeed;
