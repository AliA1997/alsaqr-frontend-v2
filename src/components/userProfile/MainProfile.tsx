import { useCallback, useLayoutEffect, useState } from "react";
import type {
  DashboardPostToDisplay,
  PostToDisplay,
  ProfileUser,
  UserProfileDashboardPosts,
} from "@typings";

import { useParams } from "react-router-dom";
import { observer } from "mobx-react-lite";
import { useStore } from "@stores/index";

import { SkeletonLoader } from "@common/CustomLoader";
import Tabs from "@common/Tabs";
import PostComponent from "../posts/Post";
import MediaFeed from "../shared/MediaFeed";
import UserHeader from "./UserHeader";
import agent from "@utils/api/agent";
import { MEDIA_TAB } from "@utils/constants";

const MainProfile = () => {
  const [profileInfo, setProfileInfo] = useState<ProfileUser | undefined>(undefined);
  const [profilePosts, setProfilePosts] = useState<UserProfileDashboardPosts | undefined>(undefined);
  const [profileMediaPosts, setProfileMediaPosts] = useState<PostToDisplay[]>([]);
  const [loadingPosts, setLoadingPosts] = useState<boolean>(false);

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

  const loadOnTabSwitch = useCallback(
    async (tab: string) => {
      if (tab === MEDIA_TAB)
        await loadProfileMediaPosts();
    },
    [username]
  );

  if(profileInfo) 
    return (
      <div className="col-span-7 scrollbar-hide max-h-screen overflow-scroll lg:col-span-5 dark:border-gray-800">
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
                    tabKey: "recent",
                    title: "Recent",
                    testId: 'recenttab',
                    content: profilePosts?.userPosts ?? [],
                    renderer,
                    noRecordsContent: 'No posts'
                  },
                  {
                    tabKey: "reposts",
                    title: "Reposts",
                    testId: 'repoststab',
                    content: profilePosts?.repostedPosts ?? [],
                    renderer,
                    noRecordsContent: 'No reposts found'
                  },
                  {
                    tabKey: "bookmarks",
                    title: "Bookmarks",
                    testId: 'bookmarkstab',
                    content: profilePosts?.bookmarkedPosts ?? [],
                    renderer,
                    noRecordsContent: `No bookmarks found`
                  },
                  {
                    tabKey: "replied-posts",
                    title: "Replies",
                    testId: 'repliestab',
                    content: profilePosts?.repliedPosts ?? [],
                    renderer,
                    noRecordsContent: `No replied posts found`
                  },
                  {
                    tabKey: "liked-posts",
                    title: "Liked Posts",
                    testId: 'likestab',
                    content: profilePosts?.likedPosts ?? [],
                    renderer,
                    noRecordsContent: `No liked posts found`
                  },
                  {
                    tabKey: "media",
                    title: "Media",
                    testId: 'mediatab',
                    content: profileMediaPosts.length ? [profileMediaPosts] : [],
                    renderer: mediaRenderer,
                    noRecordsContent: `No media found`
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
