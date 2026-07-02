# Overview
- Logged In users can use yumna chatbot, the amount of times they can request the chatbot is limited based on subscription. 
- All logged in users currently have a basic subscription, which has a daily use of 30 prompts per day. 
- Prompt has a max length of 256 characters .
- When they are prompting it will load, then return the response to the user. 
- Display the count of the number of requests they've done for the day. 
- If they want to continue over their limit, they must subscribe to a pro tier.
- Pro tier not implemented yet, just put a placeholder for it, and give them the ability to prompt 5000 messages.


## Implementation Steps
- Create a new model file for holding typescript model in regards to yumna ai use, and subscription.
- Create new typescript interfaces for yumna ai prompt, user subscription, subscription daily use, add a subscription id to the user class(the currentSessionUser type), and add daily use to the dashboard display interfaces. 
- Create a subscriptionApiClient that will get subscription daily use. 
- Create a yumnaApiClient that will prompt yumna. 
- Add as properties to the common agent, same as postApiClient, etc.
- Create a yumnaFeedStore that will be persistent across rerendering of pages. 
- Yumna prompt messages, and response would be held in the currentYumnaChatRegistry which is a type of Map.
- Remove BariqAI, and it's corresponding route. 
- Then add YumnaAI that is a chatbot that follows similiar UI style to direct messages. 
- Generate an avatar that displays a content robot, and use that as the avatar of the chatbot.
- Update the Main Profile Settings, add a usage page that will display the number of daily use compared to the limit. Displayed like this (daily use/limit)
- If they want to continue usage, need to display a subscription modal that will indicate a pro tier subscription. Set the price to be TBD, and make the button dead or disabled.


## Rules
- Check if the user is logged in, on YumnaChatbot before they prompt, and when they prompt get their daily usage. If over daily usage, display a danger alert, alerting them they are over daily usage.
- When they go to YumnaAI they would the yumna avatar on the top header, and if they are no messages, just display a illustration display a chat bubble with the yumnaai avatar.
- If they keep prompt after seeing the danger alert, display a modal letting them know about the pro subscription tier.
- When prompting it will display a loading indicator which would be 3 dots similar to other popular chatbots. 
- When getting the response, the return the response from the Yumna AI Assistant, it will display the message with the response, with the yumna ai chatbot avatar on the top left corner of the message, with the date it was returned/sent below the response. 
- Have the same context for the prompt, which would be your personal AI assistant.
- Settings should have a Usage page which would indicate updated daily subscription use. Which would be local state. 
- YumnaAI chatbot messages would persist across render of different routes.

## Acceptance
1) Pass Tests
- User is logged in, app check. He is set, then prompts the yumna chatbot. He hasn't prompted today, will prompt would return a response. Update daily use for the user.
- User is logged in, app check. He is set, then prompts the yumna chatbot. He has prompted 20 times today, will prompt would return a response. Update daily use for the user. But will display a warning indicate that prompting requests are about to run out, due to it's less than 10.
- User is logged in, app check. He is set, then prompts the yumna chatbot. He is trying to prompt something under or equal to 256 characters, would be indicated by character count on the bottom right of the input. 
- Yumna chatbot is responsive across mobile, tablet, and desktop.
2) Fail Tests
- User is logged in, app check. He is set, then prompts the yumna chatbot. He prompted 30 times day which is the daily use limit, will prompt would return an exception indicating they are over their limit.
- User is logged in, app check. He is set, then prompts the yumna chatbot. He is trying to prompt something over 256 characters, can't submit the prompt. 
- User not logged in, can't access the Yumna Chatbot, would return a login modal.
- Logged in User doesn't pass a valid prompt or a prompt with no characters, he can't submit the prompt to the yumna chatbot.
- Can't submit files or images to the Yumna chatbot.
- User is logged in, app check. He is set, then prompts the yumna chatbot. He prompted 30 times day which is the daily use limit, will prompt would return an exception indicating they are over their limit.If they prompt again, it would return the subscription tier modal, it would display a pro tier, but the button to subscribe to it would be disabled, and would have a text of "TBD"

## Out of Scope
- Do not implement Yumna Chatbot across post or comments.


## Reference Code
1) Reference model file that would be similar to subscription model file.
```typescript
export interface ListItemToDisplay {
    listItemId: string;
    listId: string;
    itemType: string;
    savedAt: Date;
    //Post Fields
    postId?: string;
    postContent?: string;
    postType?: string;
    postTags?: string[];
    postCreatedAt?: Date;
    postUsername?: string;
    postAvatar?: string;
    postBannerImage?: string;

    // Community fields
    communityId?: string;
    communityName?: string;
    communityDescription?: string;
    communityAvatar?: string;
    communityBannerImage?: string;
    communityTags?: string[];
    communityFounderUsername?: string;
    communityFounderAvatar?: string;
    communityCreatedAt?: Date;
    communityTotalMembers?: number;


    // Saved User Fields
    savedUserId?: string;
    savedUserUsername?: string;
    savedUserAvatar?: string;
    savedUserBio?: string;
    
    // Saved Community Discussion Fields
    communityDiscussionId?: string;
    communityDiscussionTitle?: string;
    communityDiscussionContent?: string;
    communityDiscussionCreatedAt?: Date;
    communityDiscussionUsername?: string;
    communityDiscussionAvatar?: string;
    
    // Saved Community Discussion Message Fields
    communityDiscussionMessageId?: string;
    communityDiscussionMessageContent?: string;
    communityDiscussionMessageMedia?: string;
    communityDiscussionMessageCreatedAt?: Date;
    communityDiscussionMessageUsername?: string;
    communityDiscussionMessageAvatar?: string;
    label: "Post" | "Community" | "Community Discussion" | "Community Discussion Message" | "List" | "User";

    relatedEntity: object;
}
```
2) Reference SQL File for the Subscription models.
```sql
-- Yumna AI agent subscription tables (schema: alsaqr-2026)

create table if not exists "alsaqr-2026".subscriptions (
    id                  uuid primary key default gen_random_uuid(),
    name                text not null,
    daily_request_limit integer not null default 30,
    created_at          timestamptz not null default now(),
    updated_at          timestamptz,
    deleted_at          timestamptz
);

create table if not exists "alsaqr-2026".subscription_daily_use (
    id                 uuid primary key default gen_random_uuid(),
    user_id            uuid not null references "alsaqr-2026".users (id),
    date               date not null default (now() at time zone 'utc')::date,
    number_of_requests integer not null default 0,
    created_at         timestamptz not null default now(),
    updated_at         timestamptz,
    unique (user_id, date)
);

alter table "alsaqr-2026".users
    add column if not exists subscription_id uuid references "alsaqr-2026".subscriptions (id);
```
3) Reference code for creating a subscription client, and yumna client
```typescript
import axios from "axios";
import { axiosRequests, axiosResponseBody } from "./agent";
import { CreatePostForm } from "typings";

export const postApiClient = {
    addPost: (values: CreatePostForm) =>
        axiosRequests.post(`/api/posts`, { values }).then(axiosResponseBody),       
    getPosts: (params: URLSearchParams | undefined) =>
        axios.get(`/api/posts`, { params }).then(axiosResponseBody),
    getPostsToAdd: (params: URLSearchParams) =>
        axios.get(`/api/users/postsToAdd`, { params }).then(axiosResponseBody),
    getBookmarkedPosts: (params: URLSearchParams | undefined, userId: string) =>
        axios.get(`/api/bookmarks/${userId}`, { params }).then(axiosResponseBody),
    getPost: (statusId: string) =>
        axios.get(`/api/posts/${statusId}`, {}).then(axiosResponseBody),
}

```
4) Reference code to integrate with api agent
```typescript
import axios, { AxiosResponse, AxiosError } from 'axios';
import { PaginatedResult } from '../../models/common';
import { supabase } from '../infrastructure/supabase';
import { exploreApiClient } from "./exploreApiClient";
import { listApiClient } from "./listsApiClient";
import { mutatePostApiClient } from "./mutatePostApiClient";
import { postApiClient } from "./postApiClient";
import { notificationApiClient } from "./notificationApiClient";
import { userApiClient } from "./userApiClient";
import { communityApiClient } from "./communityApiClient";
import { messageApiClient } from "./messageApiClient";
import { commentApiClient } from "./commentApiClient";
import { groupsApiClient } from "./groupsApiClient";
import { eventsApiClient } from "./eventsApiClient";
import { productApiClient } from "./productApiClient";

export const extractQryParams = (request: any, paramsToExtract: string[]): (string | null)[] => {
  const qryParams = new URL(request.url!).searchParams;

  let results = (paramsToExtract ?? []).map((p: string) => {

    let valToReturn: string | null = '';
    if (p === 'currentPage')
      valToReturn = qryParams.get(p) ?? '1'
    else if (p === 'itemsPerPage')
      valToReturn = qryParams.get(p) ?? '25'
    else
      valToReturn = qryParams.get(p);

    return valToReturn;
  });

  return results;
}

axios.defaults.baseURL = `${import.meta.env.VITE_PUBLIC_BASE_API_URL}`;

export const axiosResponseBody = (res: AxiosResponse) => res.data;

export const axiosRequests = {
  get: <T>(url: string) => axios.get<T>(url).then(axiosResponseBody),
  post: <T>(url: string, body: {}, options?: {}) =>
    axios.post<T>(url, body, options).then(axiosResponseBody),
  put: <T>(url: string, body: {}) => axios.put<T>(url, body).then(axiosResponseBody),
  patch: <T>(url: string, body: {}) => axios.patch<T>(url, body).then(axiosResponseBody),
  del: <T>(url: string) => axios.delete<T>(url).then(axiosResponseBody),
};

// Attach jwt from supabase.
axios.interceptors.request.use(async (config) => {
  const { data } = await supabase.auth.getSession();
  const token = data.session?.access_token;

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

axios.interceptors.response.use(
  async (response) => {
    const pagination = response.headers["pagination"];
    if (pagination) {
      response.data = new PaginatedResult(
        response.data,
        JSON.parse(pagination)
      );
      return response as AxiosResponse<PaginatedResult<any>>;
    }
    return response;
  },
  (error: AxiosError) => {
    const myResponse = error.response as AxiosResponse;
    const modalStateErrors = [];
    if (!myResponse?.status) {
      return Promise.reject("Error");
    }

    switch (myResponse.status) {
      case 400:
        if (
          myResponse.config.method === "get" &&
          myResponse.data.errors.hasOwnProperty("id")
        ) {
          console.log("Not found")
        }
        if (myResponse.data.errors) {
          for (const key in myResponse.data.errors) {
            if (myResponse.data.errors[key]) {
              modalStateErrors.push(
                'Errors'
              );
            }
          }
          throw modalStateErrors.flat();
        } else {
          console.log("Not found, alot of problems.")
        }
        break;
      case 401:

        if (myResponse.data === "invalid_token") {
          console.log("Invalid Token");
        } else {
          console.log("Authorization Error");
        }
        break;
      case 403:
        console.log("Oops their is a problem");
        break;
      case 404:
        console.log("Not found");
        break;
      case 500:
        console.log("Server error")
        break;
      default:
        console.log("A unique issue.")
        break;
    }

    return Promise.reject(error);
  }
);


const agent = {
  commentApiClient,
  communityApiClient,
  exploreApiClient,
  listApiClient,
  postApiClient,
  messageApiClient,
  mutatePostApiClient,
  notificationApiClient,
  userApiClient,
  groupsApiClient,
  eventsApiClient,
  productApiClient
};

export function leadingDebounce<F extends (...args: any[]) => any>(
  func: F,
  delay: number
) {
  let timeoutId: ReturnType<typeof setTimeout> | null = null;

  if (!timeoutId) {
    func();
  }

  if (timeoutId) {
    clearTimeout(timeoutId);
  }

  timeoutId = setTimeout(() => {
    timeoutId = null;
  }, delay);
}

export default agent;
```
5) Code to Reference for yumnaFeedStore
```typescript
import { makeAutoObservable, runInAction } from "mobx";
import { MessageFormDto, MessageHistoryToDisplay, MessageToDisplay, ProfileUser } from "@typings";
import { Pagination, PagingParams } from "@models/common";
import agent from "@utils/api/agent";

export default class MessageStore {
    constructor() {
        makeAutoObservable(this);
    }
    loadingInitial = false;
    loadingUpsert = false;
    loadingHistory = false;
    predicate = new Map();
    setPredicate = (predicate: string, value: string | number | Date | undefined) => {
        if(value) {
            this.predicate.set(predicate, value);
        } else {
            this.predicate.delete(predicate);
        }
    }
    pagingParams: PagingParams = new PagingParams(1, 10);
    historyPagingParams: PagingParams = new PagingParams(1, 25);
    pagination: Pagination | undefined = undefined;
    historyPagination: Pagination | undefined = undefined;
    currentProfileToMessage: ProfileUser | undefined = undefined;
    directMessageRegistry: Map<string, MessageToDisplay> = new Map<string, MessageToDisplay>();

    directMessageHistoryRegistry: Map<string, MessageHistoryToDisplay> = new Map<string, MessageHistoryToDisplay>();
    selectedDirectMessageHistoryItem: MessageHistoryToDisplay | undefined;

    setPagingParams = (pagingParams: PagingParams) => {
        this.pagingParams = pagingParams;
    }
    setPagination = (value: Pagination | undefined) => {
        this.pagination = value;
    }
    setHistoryPagingParams = (pagingParams: PagingParams) => {
        this.historyPagingParams = pagingParams;
    }
    setHistoryPagination = (value: Pagination | undefined) => {
        this.historyPagination = value;
    }
    setLoadingInitial = (value: boolean) => {
        this.loadingInitial = value;
    }
    setLoadingUpsert = (val: boolean) => {
        this.loadingUpsert = val;
    }
    setLoadingHistory = (val: boolean) => {
        this.loadingHistory = val;
    }
    setDirectMessage = (message: MessageToDisplay) => {
        this.directMessageRegistry.set(message.messageId, message);
    }

    setDirectMessageHistory = (messageHistory: MessageHistoryToDisplay) => {
        this.directMessageHistoryRegistry.set(messageHistory.receiverId, messageHistory);
    }
    setSelectedDirectMessageHistoryItem = (val: MessageHistoryToDisplay | undefined) => {
        this.directMessageRegistry.clear();
        this.selectedDirectMessageHistoryItem = val;
    }

    resetFeedState = () => {
        this.predicate.clear();
    }

    setCurrentProfileToMessage = (val: ProfileUser | undefined) => {
        this.currentProfileToMessage = val;
    }
    get axiosParams() {
        const params = new URLSearchParams();
        params.append("currentPage", this.pagingParams.currentPage.toString());
        params.append("itemsPerPage", this.pagingParams.itemsPerPage.toString());
        this.predicate.forEach((value, key) => params.append(key, value));

        return params;
    }

    loadDirectMessages = async (senderId: string, receiverId: string) => {
        this.setLoadingInitial(true);
        this.directMessageRegistry.clear();
        try {
            this.predicate.set('senderId', senderId);
            this.predicate.set('receiverId', receiverId);

            const { items, pagination } = await agent.messageApiClient.loadDirectMessages(this.axiosParams);

            runInAction(() => {
                items.map((messageItem: MessageToDisplay) => this.setDirectMessage(messageItem));
            })

            this.setPagination(pagination);
        } finally {
            this.setLoadingInitial(false);
        }

    }

    loadDirectMessageHistory = async () => {

        this.setLoadingHistory(true);
    
        this.directMessageHistoryRegistry.clear();
        try {

            const { items, pagination } = await agent.messageApiClient.loadDirectMessageThreads(this.axiosParams);

            runInAction(() => {
                items.map((messageItem: MessageHistoryToDisplay) => this.setDirectMessageHistory(messageItem));
            })

            this.setPagination(pagination);
        } finally {
            this.setLoadingHistory(false);
        }

    }

    sendDirectMessage = async (messageForm: MessageFormDto) => {
        this.setLoadingUpsert(true);
        try {
            await agent.messageApiClient.sendDirectMessage(messageForm);

        } finally {
            this.setLoadingUpsert(false);
        }
    }

    get directMessages() {
        return Array.from(this.directMessageRegistry.values());
    }

    get directMessageHistory() {
        return Array.from(this.directMessageHistoryRegistry.values());
    }
}
```
6) Code to Reference on where routes are defined.
```typescript
import 'react';
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
import BariqAI from '@features/BariqAI';

export const routes: RouteObject[] = [
  {
    element: <App />,
    children: [
      { index: true, element: <HomePage /> },
      { path: "bariq", element: <BariqAI /> },
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
```
7) Code to reference for Danger Alert, and New Warning Alert for less than 10 requests left for daily usage
```typescript
import { useState } from "react";

type DangerAlertProps = {
  title?: string;
  message: string;
  onClose?: () => void;
  actions?: React.ReactNode;
  className?: string;
};

export function DangerAlert({
  title = "Error",
  message,
  onClose,
  actions,
  className = ""
}: DangerAlertProps) {
  const [open, setOpen] = useState(true);
  if (!open) return null;

  const handleClose = () => {
    setOpen(false);
    onClose?.();
  };

  return (
    <div
      role="alert"
      aria-live="assertive"
      className={`relative w-full rounded-lg border border-red-200 bg-red-50 text-red-900 shadow-sm ${className}`}
    >
      <div className="flex items-start gap-3 p-4">
        {/* Icon */}
        <div className="mt-0.5">
          <svg
            className="h-5 w-5 text-red-600"
            viewBox="0 0 20 20"
            fill="currentColor"
            aria-hidden="true"
          >
            <path
              fillRule="evenodd"
              d="M10 2a1 1 0 0 1 .894.553l7 14A1 1 0 0 1 17 18H3a1 1 0 0 1-.894-1.447l7-14A1 1 0 0 1 10 2Zm0 5a1 1 0 0 0-1 1v4a1 1 0 1 0 2 0V8a1 1 0 0 0-1-1Zm0 8a1 1 0 1 0 0-2 1 1 0 0 0 0 2Z"
              clipRule="evenodd"
            />
          </svg>
        </div>

        {/* Content */}
        <div className="flex-1">
          {title && <h3 className="text-sm font-semibold">{title}</h3>}
          <p className="mt-1 text-sm">{message}</p>

          {actions && (
            <div className="mt-3 flex flex-wrap gap-2">
              {actions}
            </div>
          )}
        </div>

        {/* Close button */}
        <button
          type="button"
          onClick={handleClose}
          className="rounded-md p-1 text-red-700 hover:bg-red-100 focus:outline-none focus:ring-2 focus:ring-red-500"
          aria-label="Dismiss alert"
        >
          <svg className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
            <path
              fillRule="evenodd"
              d="M4.293 4.293a1 1 0 0 1 1.414 0L10 8.586l4.293-4.293a1 1 0 1 1 1.414 1.414L11.414 10l4.293 4.293a1 1 0 0 1-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 0 1-1.414-1.414L8.586 10 4.293 5.707a1 1 0 0 1 0-1.414Z"
              clipRule="evenodd"
            />
          </svg>
        </button>
      </div>
    </div>
  );
}
```
8) Sidebar to reference for adding a new link for YumnaAI, and Usage to Account Settings
```typescript
import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  DotsCircleHorizontalIcon,
  LoginIcon,
  LogoutIcon
} from "@heroicons/react/outline";
import { useStore } from "@stores/index";
import { useLocation, useNavigate } from 'react-router-dom';

import { observer } from "mobx-react-lite";
import { LoginModal } from "@common/AuthModals";

import { inTestMode, ROUTE_TO_SHOW_SETTINGS_SIDEBAR, ROUTES_USER_CANT_ACCESS } from "@utils/constants";
import { SettingsTabs, SidebarTabs } from "@models/enums";
import SidebarRow from "./SidebarRow";
import DarkSwitch from "./DarkSwitch";
import { UserProfileLink } from "@common/Links";
import { SkeletonLoader } from "@common/CustomLoader";

type SideBarProps = {};

const SideBar = ({ }: SideBarProps) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { authStore, commonStore, modalStore, settingsStore } = useStore();
  const {
    auth,
    processingUserCheck,
    currentSessionUser,
    resetAuthState
  } = authStore;
  const { currentTab, setCurrentTab } = commonStore;
  const { closeModal, showModal } = modalStore;
  const { currentTabIdx, setCurrentTabIdx } = settingsStore;

  const [mounted, setMounted] = useState<boolean>(false);
  const [isDropdownOpen, setIsDropdownOpen] = React.useState<boolean>(false);

  const hideSidebar = useMemo(() => ROUTE_TO_SHOW_SETTINGS_SIDEBAR === location.pathname, [location.pathname]);
  const registrationNotCompleted = useMemo(() => !(currentSessionUser?.isCompleted ?? false), [mounted, currentSessionUser])

  const openModal = () => showModal(<LoginModal />)
  const handleDropdownEnter = useCallback(
    () => setIsDropdownOpen(!isDropdownOpen),
    [isDropdownOpen]
  );

  const checkIfNotLoggedIn = () => {
    const notLoggedIn = mounted && !currentSessionUser; 
    const showLoginModal = ROUTES_USER_CANT_ACCESS.some(r => location.pathname.includes(r));

      if (notLoggedIn && showLoginModal) {
        showModal(<LoginModal />);
        return true;
      }

      if (!registrationNotCompleted && currentSessionUser)
        closeModal();

      return false;
  }

  useEffect(() => {
    setMounted(true);

    return () => {
      setMounted(false);
    }
  }, []);

  const profileInfo = useMemo(() => {
    if (inTestMode() && auth?.isLoggedIn())
      return auth.getUser();
    else if (!inTestMode() && auth?.isTestUser())
      resetAuthState();
    else if (currentSessionUser && currentSessionUser.id)
      return currentSessionUser;

    return null;
  }, [auth, currentSessionUser]);

  return (
    <>
      <div className={`
          ${hideSidebar ? 'col-span-2' : 'col-span-2 md:col-span-2'}
          flex flex-col item-start md:item-center mt-2 md:mt-0 px-1 md:px-4 md:items-start
        `}
        onClick={() => setIsDropdownOpen(false)}
      >
        <div className="flex justify-start">
          <img
            data-testid="navlogo"
            className={`
              m-0 h-full w-full lg:w-[90%] transition-all duration-200
              sidebarLogo
              cursor-pointer
          `}
            alt=""
            style={{ maxWidth: "unset" }}
            onClick={() => {
              setCurrentTab(undefined);
              navigate("/")
            }}
          />
        </div>
        <>
          {hideSidebar
            ? (
              <>
                <SidebarRow active={currentTabIdx === SettingsTabs.PersonalInfo} isShow={true} title="Personal Info" onClick={() => setCurrentTabIdx(SettingsTabs.PersonalInfo)} />
                <SidebarRow active={currentTabIdx === SettingsTabs.PersonalizeAccount} isShow={true} title="Peronalize Account" onClick={() => setCurrentTabIdx(SettingsTabs.PersonalizeAccount)} />
                <SidebarRow active={currentTabIdx === SettingsTabs.DeleteYourAccount} isShow={true} title="Delete Your Account" onClick={() => setCurrentTabIdx(SettingsTabs.DeleteYourAccount)} />
              </>
            )
            : (
              <>
                <SidebarRow
                  IconImage={
                    <>
                      <img
                        src="/icons/explore.svg"
                        alt="Explore Icon"
                        className="h-4 w-4 md:h-6 md:w-6 flex-shrink-0 mr-2 p-0"
                      />
                    </>
                  }
                  title="Explore"
                  href="/explore"
                  onClick={() => {
                    setCurrentTab(SidebarTabs.Explore);
                    navigate("/explore");
                  }}
                  active={currentTab === SidebarTabs.Explore}
                />
                <SidebarRow
                  IconImage={
                    <>
                      <img
                        src="/icons/notifications.svg"
                        alt="Notifications Icon"
                        className="h-4 w-4 md:h-6 md:w-6 flex-shrink-0 mr-2 p-0"
                      />
                    </>
                  }
                  title="Notifications"
                  href="/notifications"
                  onClick={() => {
                    setCurrentTab(SidebarTabs.Notifications);
                    const notLoggedIn = checkIfNotLoggedIn();
                    if(notLoggedIn)
                      return;

                    navigate("/notifications");
                  }}
                  active={currentTab === SidebarTabs.Notifications}
                />
                <SidebarRow
                  IconImage={
                    <>
                      <img
                        src="/icons/messages.svg"
                        alt="Messages Icon"
                        className="h-4 w-4 md:h-6 md:w-6 flex-shrink-0 mr-2 p-0"
                      />
                    </>
                  }
                  title="Messages"
                  href="/messages"
                  onClick={() => {
                    setCurrentTab(SidebarTabs.Messages);
                    const notLoggedIn = checkIfNotLoggedIn();
                    if(notLoggedIn)
                      return;

                    navigate("/messages");
                  }}
                  active={currentTab === SidebarTabs.Messages}
                />
                <SidebarRow
                  IconImage={
                    <>
                      <img
                        src="/icons/bookmarks.svg"
                        alt="Bookmarks Icon"
                        className="h-4 w-4 md:h-6 md:w-6 flex-shrink-0 mr-2 p-0"
                      />
                    </>
                  }
                  title="Bookmarks"
                  href="/bookmarks"
                  onClick={() => {
                    setCurrentTab(SidebarTabs.Bookmarks);
                    const notLoggedIn = checkIfNotLoggedIn();
                    if(notLoggedIn)
                      return;
                    
                    navigate("/bookmarks");
                  }}
                  active={currentTab === SidebarTabs.Bookmarks}
                />
                <SidebarRow
                  IconImage={
                    <>
                      <img
                        src="/icons/lists.svg"
                        alt="Lists Icon"
                        className="h-4 w-4 md:h-6 md:w-6 flex-shrink-0 mr-2 p-0"
                      />
                    </>
                  }
                  title="Lists"
                  href="/lists"
                  onClick={() => {
                    setCurrentTab(SidebarTabs.Lists);
                    const notLoggedIn = checkIfNotLoggedIn();
                    if(notLoggedIn)
                      return;
                    
                    navigate("/lists");
                  }}
                  active={currentTab === SidebarTabs.Lists}
                />
                <SidebarRow
                  IconImage={
                    <>
                      <img
                        src="/icons/community.svg"
                        alt="Community Icon"
                        className="h-4 w-4 md:h-6 md:w-6 flex-shrink-0 mr-2 p-0"
                      />
                    </>
                  }
                  title="Communities"
                  href="/communities"
                  onClick={() => {
                    setCurrentTab(SidebarTabs.Communities);
                    const notLoggedIn = checkIfNotLoggedIn();
                    if(notLoggedIn)
                      return;
                    
                    navigate("/communities");
                  }}
                  active={currentTab === SidebarTabs.Communities}
                />
                <SidebarRow
                  IconImage={
                    <>
                      <img
                        src="/icons/zook.svg"
                        alt="Zook Icon"
                        className="h-4 w-4 md:h-6 md:w-6 flex-shrink-0 mr-2 p-0"
                      />
                    </>
                  }
                  title="Marketplace"
                  onClick={() => {
                    setCurrentTab(SidebarTabs.Zook);
                    window.location.href = `${import.meta.env.VITE_PUBLIC_ZOOK_URL}`;
                  }}
                  active={currentTab === SidebarTabs.Zook}
                />
                <SidebarRow
                  IconImage={
                    <>
                      <img
                        src="/icons/meetup.svg"
                        alt="Meetup Icon"
                        className="h-4 w-4 md:h-6 md:w-6 flex-shrink-0 mr-2 p-0"
                      />
                    </>
                  }
                  title="Meetups"
                  onClick={() => {
                    setCurrentTab(SidebarTabs.Meetup);
                    window.location.href = `${import.meta.env.VITE_PUBLIC_MEETUP_URL}`;
                  }}
                  active={currentTab === SidebarTabs.Meetup}
                />
                <div className="relative more-container">
                  <SidebarRow
                    Icon={DotsCircleHorizontalIcon}
                    title="More"
                    onClick={handleDropdownEnter}
                  />
                  {isDropdownOpen && (
                    <div className="absolute left-0 mt-2 w-48 rounded-md shadow-lg ring-1 bg-white dark:bg-[#000000] ring-black ring-opacity-5 z-[950]">
                      <div
                        className="py-1"
                        role="menu"
                        aria-orientation="vertical"
                        aria-labelledby="options-menu"
                      >
                        {currentSessionUser ? (
                          <>
                            <SidebarRow
                              IconImage={
                                <>
                                  <img
                                    src="/icons/settings.svg"
                                    alt="Settings Icon"
                                    className="h-4 w-4 md:h-6 md:w-6 flex-shrink-0 mr-2 p-0"
                                  />
                                </>
                              }
                              title="Settings"
                              isShow={true}
                              href="/settings"
                              onClick={() => {
                                const notLoggedIn = checkIfNotLoggedIn();
                                if(notLoggedIn)
                                  return;

                                navigate("/settings");
                              }}
                            />
                            <SidebarRow Icon={LogoutIcon} title="Sign Out" />
                          </>
                        ) : (
                          <SidebarRow
                            Icon={LoginIcon}
                            title="Sign In"
                            onClick={openModal}
                          />
                        )}
                      </div>
                    </div>
                  )}
                </div>
                <DarkSwitch />
                {processingUserCheck
                  ? <SkeletonLoader className='col-span-2' />
                  : profileInfo ? (
                    <UserProfileLink profileInfo={profileInfo} />
                  ) : null}
              </>
            )}
        </>
      </div>
    </>
  );
};
export default observer(SideBar);
```
10) Code to Reference for Settings
```typescript
import { MultiSelect } from "@common/MultiSelect";
import { RadioCard } from "@common/RadioBoxes";
import { Select } from "@common/Select";
import { useStore } from "@stores/index";
import { FAVORITE_QURAN_RECITER_OPTIONS, FREQUENT_MASJID_OPTIONS, HOBBIES_OPTIONS, ISLAMIC_SCHOLARS_OPTIONS, ISLAMIC_STUDY_TOPICS_OPTIONS, MARITAL_STATUS_OPTIONS, PREFERRED_MADHAB_OPTIONS, RELIGION_OPTIONS } from "@utils/constants";
import { Formik, FormikErrors } from "formik";
import { observer } from "mobx-react-lite";
import { PersonalizeAccountForm } from "@models/settings";
import { UpdateUserForm } from "@models/users";
import toast from "react-hot-toast";
import { PageTitle } from "@common/Titles";


const PersonalizeAccount = observer(() => {
    const { authStore, settingsStore } = useStore();
    const { currentSessionUser, navigateBackToHome } = authStore;
    const { 
        loadingUpsert,
        updateYourAccount,
    } = settingsStore;

    const upsert = async (values: any) => {
        let infoToUpsert: UpdateUserForm  = {
            ...currentSessionUser,
            ...values
        };
        
        if(currentSessionUser) {
            await updateYourAccount(infoToUpsert);

            toast("Updated your account", {
                icon: "🚀",
            });
        }
        else {
            toast("Need to be logged in to update your account");
            navigateBackToHome();
        }
    };

    return (
        <div className='mb-[10rem]'>
            <PageTitle>Personalize Your Account</PageTitle>
            <div className={`
                relative flex flex-1 flex-col border-y border-gray-100 p-5 
                hover:shadow-lg dark:text-gray-50
            `}>
                <Formik
                    initialValues={{
                        maritalStatus: currentSessionUser?.maritalStatus ?? "single",
                        religion: currentSessionUser?.religion ?? "Prefer Not To Disclose",
                        hobbies: currentSessionUser?.hobbies ?? [],
                        preferredMadhab: currentSessionUser?.preferredMadhab ??  "Prefer Not To Disclose",
                        frequentMasjid: currentSessionUser?.frequentMasjid ?? false,
                        favoriteQuranReciters: currentSessionUser?.favoriteQuranReciters ?? [],
                        favoriteIslamicScholars: currentSessionUser?.favoriteIslamicScholars ?? [],
                        islamicStudyTopics: currentSessionUser?.islamicStudyTopics ?? []
                    } as PersonalizeAccountForm}
                    validate={values => {
                        const errors: FormikErrors<any> = {};
                        if (!values.religion) {
                            errors.religion = 'Religion is required';
                        } else if (!values.hobbies) {
                            errors.hobbies = 'Hobbies is required';
                        } else if (!values.preferredMadhab) {
                            values.preferredMadhab = 'Prefer Not To Disclose';
                        }

                        return errors;
                    }}
                    onSubmit={async (values) => {
                        await upsert(values);
                    }}
                
                >
                    {({
                        values,
                        errors,
                        handleSubmit,
                    }) => (
                        <form onSubmit={handleSubmit} className="flex flex-1 flex-col">
  
                            <Select
                                name="religion"
                                label="Religion"
                                placeholder="Select a Religion"
                                options={RELIGION_OPTIONS}
                                className="mb-1 h-8 text-md"
                            />

                            <MultiSelect 
                                name="hobbies"
                                label={"Hobbies"}
                                placeholder="Select Hobbies"
                                options={HOBBIES_OPTIONS}
                            />

                            <div>
                                <label htmlFor="maritalStatus" className="block text-md font-medium text-gray-700 dark:text-gray-200">
                                    Marital Status:
                                </label>

                                <div className="grid grid-cols-2 grid-rows-2 md:grid-cols-4 md:grid-rows-1 gap-4 py-2">
                                    {MARITAL_STATUS_OPTIONS.map((option) => (
                                        <RadioCard
                                            key={option.value}
                                            name="maritalStatus"
                                            value={option.value}
                                            label={option.label}
                                            description={option.description}
                                        />
                                    ))}
                                </div>
                            </div>

                            {values.religion === "Muslim" && (
                                <>        
                                    <Select
                                        name="preferredMadhab"
                                        label="Preferred Madhab"
                                        placeholder="Select your preferred madhab"
                                        options={PREFERRED_MADHAB_OPTIONS}
                                        className="mb-1 h-8 text-md"
                                    />
                              
                                    <Select
                                        name="frequentMasjid"
                                        label="How often you go the masjid or mosque?"
                                        placeholder="Select how often you go"
                                        options={FREQUENT_MASJID_OPTIONS}
                                        className="mb-1 h-8 text-md"
                                    />
                              

                                    <MultiSelect 
                                        name="favoriteQuranReciters"
                                        label={"Favorite Quran Reciters"}
                                        placeholder="Select Favorite Quran Reciters"
                                        options={FAVORITE_QURAN_RECITER_OPTIONS}
                                    />

                                    <MultiSelect 
                                        name="favoriteIslamicScholars"
                                        label={"Favorite Islamic Scholars"}
                                        placeholder="Select Favorite Islamic Scholars"
                                        options={ISLAMIC_SCHOLARS_OPTIONS}
                                    />     

                                    <MultiSelect 
                                        name="islamicStudyTopics"
                                        label={"Favorite Islamic Study Topics"}
                                        placeholder="Select Favorite Islamic Study Topics"
                                        options={ISLAMIC_STUDY_TOPICS_OPTIONS}
                                    />        
                                </>
                            )}
                            <button
                                type='submit'
                                disabled={Object.values(errors).some(v => !!v) || loadingUpsert}
                                className={`rounded-full bg-[#55a8c2] px-5 py-2 font-bold text-white disabled:opacity-40`}
                            >
                                {loadingUpsert ? (
                                    <svg
                                        aria-hidden="true"
                                        className="inline w-6 h-6 text-gray-200 animate-spin dark:text-gray-600 fill-[#55a8c2]"
                                        viewBox="0 0 100 101"
                                        fill="none"
                                        xmlns="http://www.w3.org/2000/svg"
                                    >
                                        <path
                                            d="M100 50.5908C100 78.2051 77.6142 100.591 50 100.591C22.3858 100.591 0 78.2051 0 50.5908C0 22.9766 22.3858 0.59082 50 0.59082C77.6142 0.59082 100 22.9766 100 50.5908ZM9.08144 50.5908C9.08144 73.1895 27.4013 91.5094 50 91.5094C72.5987 91.5094 90.9186 73.1895 90.9186 50.5908C90.9186 27.9921 72.5987 9.67226 50 9.67226C27.4013 9.67226 9.08144 27.9921 9.08144 50.5908Z"
                                            fill="currentColor"
                                        />
                                        <path
                                            d="M93.9676 39.0409C96.393 38.4038 97.8624 35.9116 97.0079 33.5539C95.2932 28.8227 92.871 24.3692 89.8167 20.348C85.8452 15.1192 80.8826 10.7238 75.2124 7.41289C69.5422 4.10194 63.2754 1.94025 56.7698 1.05124C51.7666 0.367541 46.6976 0.446843 41.7345 1.27873C39.2613 1.69328 37.813 4.19778 38.4501 6.62326C39.0873 9.04874 41.5694 10.4717 44.0505 10.1071C47.8511 9.54855 51.7191 9.52689 55.5402 10.0491C60.8642 10.7766 65.9928 12.5457 70.6331 15.2552C75.2735 17.9648 79.3347 21.5619 82.5849 25.841C84.9175 28.9121 86.7997 32.2913 88.1811 35.8758C89.083 38.2158 91.5421 39.6781 93.9676 39.0409Z"
                                            fill="currentFill"
                                        />
                                    </svg>
                                ) : (
                                    'Submit'
                                )}
                            </button>
                        </form>
                    )}
                </Formik>

            </div>

        </div>
    );
});

export default PersonalizeAccount;
```