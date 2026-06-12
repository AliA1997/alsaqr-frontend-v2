export enum CommonUpsertBoxTypes {
  Post = "Post",
  List = "List",
  Community = "Community",
  UpdateCommunity = "Update-Community",
  CommunityDiscussion = "CommunityDiscussion",
  UpdateCommunityDiscussion = "Update-Community-Discussion",
  Register = "Register"
}

export enum SidebarTabs {
  Explore = 0,
  Notifications = 1,
  Messages = 2,
  Bookmarks = 3,
  Lists = 4,
  Communities = 5,
  Zook = 6,
  Meetup = 7
}

export enum SettingsTabs {
  PersonalInfo = 0,
  PersonalizeAccount = 1,
  DeleteYourAccount = 2
}

export enum  RelationshipType {
  Member = 'member',
  Invited = 'invited',
  Moderator = 'moderator',
  Founder = 'founder',
  Requested = 'requested',
  InviteRequestedForCommunityDiscussion = 'INVITE_REQUESTED_FOR_DISCUSSION',
  None = 'none'
};

export enum ExploreTabs {
  Popular = 'popular',
  AlJazeeraEnglish = 'al-jazeera-english',
  Argaam = 'argaam',
  BleacherReport = 'bleacher-report',
  CryptoCoinsNews = 'crypto-coins-news',
  HackerNews = 'hacker-news',
  SABQ = 'sabq',
}


export enum NotificationTabs {
  All = "All",
  Verified = "Verified",
  Mentions = "Mentions",
}

// Mobx Store Enum
export enum FilterKeys {
  Search = 'search',
  SearchUsers = 'search-users',
  SearchPosts = 'search-posts',
  MyBookmarks = "my-bookmarks",
  Explore = 'explore',
  Normal = 'normal',
  Lists = "lists",
  Community = "community",
  CommunityDiscussion = "community-discussion",
  Register = "register"
}
/////////////////////////////////////