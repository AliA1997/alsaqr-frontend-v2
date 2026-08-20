import { useContext, createContext } from 'react';
import { reaction } from 'mobx';
import CommonStore from './commonStore';
import ModalStore from './modalStore';
import AuthStore from './authStore';
import ExploreStore from './exploreStore';
import FeedStore from './feedStore';
import ListFeedStore from './listFeedStore';
import CommunityFeedStore from './communityFeedStore';
import NotificationStore from './notificationStore';
import UserStore from './userStore';
import BookmarkFeedStore from './bookmarkFeedStore';
import SearchStore from './searchStore';
import CommunityDiscussionFeedStore from './communityDiscussionFeedStore';
import MessageStore from './messageStore';
import SettingsStore from './settingsStore';
import CommentFeedStore from './commentFeedStore';
import YumnaFeedStore from './yumnaFeedStore';
import SpaceStore from './spaceStore';
import FeedState from './base/feedState';

interface Store {
    authStore: AuthStore;
    bookmarkFeedStore: BookmarkFeedStore;
    commentFeedStore: CommentFeedStore;
    commonStore: CommonStore;
    modalStore: ModalStore;
    exploreStore: ExploreStore;
    feedStore: FeedStore;
    listFeedStore: ListFeedStore;
    communityDiscussionFeedStore: CommunityDiscussionFeedStore;
    communityFeedStore: CommunityFeedStore;
    messageStore: MessageStore;
    notificationStore: NotificationStore;
    searchStore: SearchStore;
    settingsStore: SettingsStore;
    spaceStore: SpaceStore;
    userStore: UserStore;
    yumnaFeedStore: YumnaFeedStore;
}


export const store: Store = {
    authStore: new AuthStore(),
    bookmarkFeedStore: new BookmarkFeedStore(),
    commonStore: new CommonStore(),
    commentFeedStore: new CommentFeedStore(),
    modalStore: new ModalStore(),
    exploreStore: new ExploreStore(),
    feedStore: new FeedStore(),
    listFeedStore: new ListFeedStore(),
    communityDiscussionFeedStore: new CommunityDiscussionFeedStore(),
    communityFeedStore: new CommunityFeedStore(),
    messageStore: new MessageStore(),
    notificationStore: new NotificationStore(),
    searchStore: new SearchStore(),
    settingsStore: new SettingsStore(),
    spaceStore: new SpaceStore(),
    userStore: new UserStore(),
    yumnaFeedStore: new YumnaFeedStore()
};

export const StoreContext = createContext(store);

export function useStore() {
    return useContext(StoreContext);
}

// Test bridge. Playwright drives FeedState directly through this rather than
// inferring its behaviour from rendered feeds, so the store-layer specs need
// neither a logged-in session nor a live backend.
//
// Gated on import.meta.env.DEV (a real boolean Vite replaces at build time), not
// on inTestMode() -- that helper compares an env string to the boolean `true`,
// which is never equal, so it always returns false.
//
// The window guard also keeps this out of worker contexts, which have `self`
// but no `window`.
if (import.meta.env.DEV && typeof window !== 'undefined') {
    // `reaction` rides along because a bare `import('mobx')` from the page
    // context does not resolve against Vite's pre-bundled deps.
    (window as any).__alsaqrTest = { store, FeedState, reaction };
}