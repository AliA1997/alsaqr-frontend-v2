import { useCallback, useLayoutEffect, useState } from "react";
import type {
  CommunityToDisplay,
  DashboardPostToDisplay,
  PostToDisplay,
  ProfileUser,
  UserProfileDashboardPosts,
} from "@typings";
import type { CommunityDiscussionToDisplay } from "@models/community";
import type { GroupRecord } from "@models/group";
import type { EventRecord } from "@models/event";
import type { ProductRecord } from "@models/product";

import { useParams } from "react-router-dom";
import { observer } from "mobx-react-lite";
import { useStore } from "@stores/index";

import { SkeletonLoader } from "@common/CustomLoader";
import Tabs from "@common/Tabs";
import PostComponent from "../posts/Post";
import MediaFeed from "../shared/MediaFeed";
import CommunityItemComponent from "../community/CommunityItem";
import CommunityDiscussionItemComponent from "../community/CommunityDiscussionItem";
import UserGroupsFeed from "./UserGroupsFeed";
import UserEventsFeed from "./UserEventsFeed";
import UserSellingProductsFeed from "./UserSellingProductsFeed";
import UserBuyingProductsFeed from "./UserBuyingProductsFeed";
import UserHeader from "./UserHeader";
import agent from "@utils/api/agent";
import { ProfileTab } from "@models/enums";

// The list endpoints return their rows under `items` (native ALSaqr) or `data`
// (paginated wrapper) depending on the source project; normalize both.
function extractItems<T>(res: any): T[] {
  if (!res) return [];
  if (Array.isArray(res)) return res as T[];
  if (Array.isArray(res.items)) return res.items as T[];
  if (Array.isArray(res.data)) return res.data as T[];
  return [];
}

const MainProfile = () => {
  const [profileInfo, setProfileInfo] = useState<ProfileUser | undefined>(undefined);
  const [profilePosts, setProfilePosts] = useState<UserProfileDashboardPosts | undefined>(undefined);
  const [profileMediaPosts, setProfileMediaPosts] = useState<PostToDisplay[]>([]);
  const [loadingPosts, setLoadingPosts] = useState<boolean>(false);

  const [profileCommunities, setProfileCommunities] = useState<CommunityToDisplay[]>([]);
  const [profileDiscussions, setProfileDiscussions] = useState<CommunityDiscussionToDisplay[]>([]);
  const [userGroups, setUserGroups] = useState<GroupRecord[]>([]);
  const [userEvents, setUserEvents] = useState<EventRecord[]>([]);
  const [sellingProducts, setSellingProducts] = useState<ProductRecord[]>([]);
  const [buyingProducts, setBuyingProducts] = useState<ProductRecord[]>([]);

  const { userStore } = useStore();
  const {
    axiosParams
  } = userStore;
  const params = useParams();
  const { name } = params;
  const username = name as string;

  async function loadProfilePosts() {
    setLoadingPosts(true);
    await agent.userApiClient.getUserProfilePosts(username, axiosParams)
      .then(profilePs => {
        setProfilePosts(profilePs);
      })
      .catch(err => {
        console.log('Get Profile Posts error:', err);
      })
      .finally(() => {
        setLoadingPosts(false);
      });
  }

  async function loadProfileMediaPosts() {
    setLoadingPosts(true);
    await agent.userApiClient.getUserProfileMediaPosts(username, axiosParams)
      .then(mediaPosts => {
        setProfileMediaPosts(mediaPosts ?? []);
      })
      .catch(err => {
        console.log('Get Profile Media Posts error:', err);
      })
      .finally(() => {
        setLoadingPosts(false);
      });
  }

  // 1) Communities the user joined.
  async function loadProfileCommunities() {
    setLoadingPosts(true);
    await agent.userApiClient.getUserProfileCommunities(username, axiosParams)
      .then(res => {
        setProfileCommunities(extractItems<CommunityToDisplay>(res));
      })
      .catch(err => {
        console.log('Get Profile Communities error:', err);
      })
      .finally(() => {
        setLoadingPosts(false);
      });
  }

  // 2) Community discussions the user joined.
  async function loadProfileDiscussions() {
    setLoadingPosts(true);
    await agent.userApiClient.getUserProfileCommunityDiscussions(username, axiosParams)
      .then(res => {
        setProfileDiscussions(extractItems<CommunityDiscussionToDisplay>(res));
      })
      .catch(err => {
        console.log('Get Profile Discussions error:', err);
      })
      .finally(() => {
        setLoadingPosts(false);
      });
  }

  // 3) Meetup groups the user is part of (alsaqr-meetup).
  async function loadUserGroups() {
    setLoadingPosts(true);
    await agent.userApiClient.getUserProfileGroups(username, axiosParams)
      .then(res => {
        setUserGroups(extractItems<GroupRecord>(res));
      })
      .catch(err => {
        console.log('Get User Groups error:', err);
      })
      .finally(() => {
        setLoadingPosts(false);
      });
  }

  // 4) Meetup events the user attended (alsaqr-meetup).
  async function loadUserEvents() {
    setLoadingPosts(true);
    await agent.userApiClient.getUserProfileEvents(username, axiosParams)
      .then(res => {
        setUserEvents(extractItems<EventRecord>(res));
      })
      .catch(err => {
        console.log('Get User Events error:', err);
      })
      .finally(() => {
        setLoadingPosts(false);
      });
  }

  // 5) Zook products the user is selling (alsaqr-zook).
  async function loadSellingProducts() {
    setLoadingPosts(true);
    await agent.userApiClient.getUserProfileSellingProducts(username, axiosParams)
      .then(res => {
        setSellingProducts(extractItems<ProductRecord>(res));
      })
      .catch(err => {
        console.log('Get Selling Products error:', err);
      })
      .finally(() => {
        setLoadingPosts(false);
      });
  }

  // 6) Zook products the user is buying (alsaqr-zook).
  async function loadBuyingProducts() {
    setLoadingPosts(true);
    await agent.userApiClient.getUserProfileBuyingProducts(username, axiosParams)
      .then(res => {
        setBuyingProducts(extractItems<ProductRecord>(res));
      })
      .catch(err => {
        console.log('Get Buying Products error:', err);
      })
      .finally(() => {
        setLoadingPosts(false);
      });
  }

  async function loadProfileInfo() {
    await agent.userApiClient.getUserProfile(username)
      .then(user => {
        setProfileInfo(user);
      })
      .catch(err => {
        console.log("Get profile info error:", err);
      });
  }

  useLayoutEffect(() => {
    async function getProfileInfo() {
      await loadProfileInfo();
      await loadProfilePosts();
    }

    getProfileInfo();
  }, [username]);

  const renderer = useCallback(
    (postToDisplay: DashboardPostToDisplay) => (
      <PostComponent
        key={postToDisplay.postId}
        postToDisplay={postToDisplay}
      />
    ),
    []
  );

  const mediaRenderer = useCallback(
    (mediaPosts: PostToDisplay[]) => (
      <MediaFeed mediaPosts={mediaPosts} />
    ),
    []
  );

  const communityRenderer = useCallback(
    (community: CommunityToDisplay) => (
      <CommunityItemComponent key={community.communityId} community={community} />
    ),
    []
  );

  const discussionRenderer = useCallback(
    (discussion: CommunityDiscussionToDisplay) => (
      <CommunityDiscussionItemComponent
        key={discussion.communityDiscussionId}
        communityDiscussionToDisplay={discussion}
      />
    ),
    []
  );

  const groupsRenderer = useCallback(
    (groups: GroupRecord[]) => <UserGroupsFeed groups={groups} />,
    []
  );

  const eventsRenderer = useCallback(
    (events: EventRecord[]) => <UserEventsFeed events={events} />,
    []
  );

  const sellingProductsRenderer = useCallback(
    (products: ProductRecord[]) => <UserSellingProductsFeed products={products} />,
    []
  );

  const buyingProductsRenderer = useCallback(
    (products: ProductRecord[]) => <UserBuyingProductsFeed products={products} />,
    []
  );

  const loadOnTabSwitch = useCallback(
    async (tab: string) => {
      switch (tab) {
        case ProfileTab.Media:
          await loadProfileMediaPosts();
          break;
        case ProfileTab.Communities:
          await loadProfileCommunities();
          break;
        case ProfileTab.Discussions:
          await loadProfileDiscussions();
          break;
        case ProfileTab.Groups:
          await loadUserGroups();
          break;
        case ProfileTab.Events:
          await loadUserEvents();
          break;
        case ProfileTab.ProductsSelling:
          await loadSellingProducts();
          break;
        case ProfileTab.ProductsBuying:
          await loadBuyingProducts();
          break;
        default:
          break;
      }
    },
    [username]
  );

  if(profileInfo)
    return (
      <div className="w-full md:col-span-7 scrollbar-hide max-h-screen overflow-scroll lg:col-span-5 dark:border-gray-800">
        <div className="mb-[7rem]">
          {profileInfo && (
            <>
              <UserHeader
                refreshProfileInfo={loadProfilePosts}
                profileInfo={profileInfo}
                numberOfPosts={profilePosts?.userPosts?.length ?? 0}
                followerCount={profileInfo.followers?.length ?? 0}
                followingCount={profileInfo.following?.length ?? 0}
              />

              <Tabs
                tabs={[
                  {
                    tabKey: ProfileTab.Recent,
                    title: "Recent",
                    testId: 'recenttab',
                    content: profilePosts?.userPosts ?? [],
                    renderer,
                    noRecordsContent: 'No posts'
                  },
                  {
                    tabKey: ProfileTab.Reposts,
                    title: "Reposts",
                    testId: 'repoststab',
                    content: profilePosts?.repostedPosts ?? [],
                    renderer,
                    noRecordsContent: 'No reposts found'
                  },
                  {
                    tabKey: ProfileTab.Bookmarks,
                    title: "Bookmarks",
                    testId: 'bookmarkstab',
                    content: profilePosts?.bookmarkedPosts ?? [],
                    renderer,
                    noRecordsContent: `No bookmarks found`
                  },
                  {
                    tabKey: ProfileTab.Replies,
                    title: "Replies",
                    testId: 'repliestab',
                    content: profilePosts?.repliedPosts ?? [],
                    renderer,
                    noRecordsContent: `No replied posts found`
                  },
                  {
                    tabKey: ProfileTab.Likes,
                    title: "Liked Posts",
                    testId: 'likestab',
                    content: profilePosts?.likedPosts ?? [],
                    renderer,
                    noRecordsContent: `No liked posts found`
                  },
                  {
                    tabKey: ProfileTab.Media,
                    title: "Media",
                    testId: 'mediatab',
                    content: profileMediaPosts.length ? [profileMediaPosts] : [],
                    renderer: mediaRenderer,
                    noRecordsContent: `No media found`
                  },
                  {
                    tabKey: ProfileTab.Communities,
                    title: "Communities",
                    testId: 'communitiestab',
                    content: profileCommunities,
                    renderer: communityRenderer,
                    noRecordsContent: `Not part of any communities`
                  },
                  {
                    tabKey: ProfileTab.Discussions,
                    title: "Community Discussions",
                    testId: 'discussionstab',
                    content: profileDiscussions,
                    renderer: discussionRenderer,
                    noRecordsContent: `Not part of any community discussions`
                  },
                  {
                    tabKey: ProfileTab.Groups,
                    title: "Meetup Groups",
                    testId: 'groupstab',
                    content: userGroups.length ? [userGroups] : [],
                    renderer: groupsRenderer,
                    noRecordsContent: `Not a member of any group yet`
                  },
                  {
                    tabKey: ProfileTab.Events,
                    title: "Meetup Events",
                    testId: 'eventstab',
                    content: userEvents.length ? [userEvents] : [],
                    renderer: eventsRenderer,
                    noRecordsContent: `No events attended yet`
                  },
                  {
                    tabKey: ProfileTab.ProductsSelling,
                    title: "Selling Products",
                    testId: 'sellingproductstab',
                    content: sellingProducts.length ? [sellingProducts] : [],
                    renderer: sellingProductsRenderer,
                    noRecordsContent: `You are not selling anything yet`
                  },
                  {
                    tabKey: ProfileTab.ProductsBuying,
                    title: "Buying Products",
                    testId: 'buyingproductstab',
                    content: buyingProducts.length ? [buyingProducts] : [],
                    renderer: buyingProductsRenderer,
                    noRecordsContent: `You are not buying anything yet`
                  },
                ]}
                loading={loadingPosts}
                loadOnTabSwitch={loadOnTabSwitch}
              />

            </>
          )}
        </div>
      </div>
  );

  return <SkeletonLoader count={5} />;

};
export default observer(MainProfile);
