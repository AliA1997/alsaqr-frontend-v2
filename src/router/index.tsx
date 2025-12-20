import { createBrowserRouter, RouteObject } from "react-router-dom";

import App from '../App';
import HomePage from "@features/Home";
import MessagesPage from '@features/Messages';
import BookmarksPage from "@features/Bookmarks";
import CommunitiesPage from "@features/Communities";
import ExplorePage from "@features/Explore";
import ListsPage from "@features/Lists";
import NotificationsPage from "@features/Notifications";
import SettingsPage from "@features/Settings";
import StatusPage from '@features/Status';
import UserProfilePage from "@features/User";
import PrivacyPage from "@features/PrivacyPolicy";
import TermsAndConditionsPage from "@features/TermsAndConditions";
import CommunityPage from "@features/CommunityPage";
import CommunityDiscussionPage from "@features/CommunityDiscussionPage";
import ListPage from "@features/ListPage";

export const routes: RouteObject[] = [
  {
    element: <App />,
    children: [
      { index: true, element: <HomePage /> },
      { path: "bookmarks", element: <BookmarksPage /> },
      { path: "communities", element: <CommunitiesPage /> },
      { path: "communities/:community_id", element: <CommunityPage /> },
      { path: "communities/:community_id/:community_discussion_id", element: <CommunityDiscussionPage /> },
      { path: "explore", element: <ExplorePage /> },
      { path: "lists", element: <ListsPage /> },
      { path: "lists/:list_id", element: <ListPage /> },
      { path: "messages", element: <MessagesPage /> },
      { path: "notifications", element: <NotificationsPage /> },
      { path: "settings", element: <SettingsPage /> },
      { path: "privacy-policy", element: <PrivacyPage /> },
      { path: "terms-and-conditions", element: <TermsAndConditionsPage /> },
      { path: "status/:status_id", element: <StatusPage /> },
      { path: "users/:name", element: <UserProfilePage /> },
    ],
  },
]

export const router = createBrowserRouter(routes);