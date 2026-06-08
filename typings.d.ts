
interface CommonReduxTweetsState {
  searchQry: string;
  page: number;
  limit: number;
}

export enum TypeOfFeed {
  Feed = "feed",
  Explore = "explore",
  Search = "search"
}

export enum NotificationType {
  Normal = "normal",
  Mentioned = "mentioned",
  Verified = "verified",
  YourAccount = "your_account",
  FollowUser = "follow_user",
  BookmarkedPost = 'bookmarked_post',
  LikedPost = 'liked_post',
  RePostedPost = 'reposted_post',
  CommentedPost = 'commented_post',
  NewList = "new_list",
  NewCommunity = "new_community",
  UnjoinedCommunity = "user_unjoined",
  JoinedCommunity = "user_joined",
  RequestJoinCommunity = "user_request_join",
  UnjoinedCommunityDiscussion = "user_unjoined_discussion",
  JoinedCommunityDiscussion = "user_joined_discussion",
  RequestJoinCommunityDiscussion = "user_request_join_discussion",
  NewPost = "new_post",
}

export enum MessageType {
  All = "All",
  Sent = "Sent",
  Direct = "Direct"
}

export enum CommonUpsertBoxTypes {
  Post = "Post",
  List = "List",
  Community = "Community",
  UpdateCommunity = "Update-Community",
  CommunityDiscussion = "CommunityDiscussion",
  Register = "Register"
}


export type CommonRecordBody = {
  text: string;
  image?: string;
};


//  Relationships for User
// user -[:FOLLOW_USER] -> followedUser
// followedUser - [:FOLLOWED] -> user
// on unfollow -> delete FOLLOW_USER and FOLLOWED relationship
export interface ProfileUser {
  userId: string;
  username: string;
  firstName: string;
  lastName?: string;
  avatar?: string;
  bgThumbnail?: string;
  bannerImage?: string;
  bio?: string;
  dateOfBirth?: Date;
  createdAt: Date;
  updatedAt?: Date;
  bookmarks: string[];
  bookmarkCount: number;
  following?: object[];
  followingCount: number;
  followers?: object[];
  followerCount: number;
}


export interface UserItemToDisplay {
  id: string;
  username: string;
  avatar?: string;
  bgThumbnail?: string;
  bio?: string;
  firstName?: string;
  lastName?: string;
  bannerImage?: string;
  countryOfOrigin?: string;
  preferredMadhab?: string;
  hobbies: string[];
  favoriteQuranReciters: string[];
  favoriteIslamicScholars: string[];
  islamicStudyTopics: string[];
  followingCount: number;
  followerCount: number;
  totalItems: number;
}

export interface UserRegisterFormDto extends UserRegisterForm {
  followingUsers: string[];
}

export interface UserRegisterForm extends UserInfo {
  firstName: string;
  lastName: string;
  dateOfBirth?: Date;
  maritalStatus?: 'single' | 'married' | 'divorced' | 'widowed';
  hobbies?: string[];
  religion?: string;
  countryOfOrigin?: string;
  followingUsers: UserItemToDisplay[];
}

export interface User extends UserInfo {
  id: string;
  createdAt: Date;
  updatedAt: Date;
  firstName?: string;
  lastName?: string;
  dateOfBirth?: Date;
  geoId?: string;
  maritalStatus?: 'single' | 'married' | 'divorced' | 'widowed';
  hobbies?: string[];
  religion?: string;
  preferredMadhab?: string;
  frequentMasjid?: string;
  favoriteQuranReciters?: string[];
  favoriteIslamicScholars?: string[];
  islamicStudyTopics?: string[];
  following: Record<string, unknown>[];
  followingCount: number;
  followers: Record<string, unknown>[];
  followerCount: number;
  bookmarks: string[];
  reposts: string[];
  likedPosts: string[];
  isCompleted: boolean;
  verified: boolean;
}

export type UserInfo = {
  username: string;
  bio?: string;
  countryOfOrigin: string;
  avatar: string;
  bgThumbnail: string;
  email: string;
  phone?: string;
  personalInfo?: PersonalInfo;
  personalInterests?: PersonalInterests;
};

export interface UserProfileDashboardPosts {
  userPosts: DashboardPostToDisplay[];
  bookmarkedPosts: DashboardPostToDisplay[];
  likedPosts: DashboardPostToDisplay[];
  repostedPosts: DashboardPostToDisplay[];
  repliedPosts: DashboardPostToDisplay[];
}

export interface DashboardPostToDisplay extends PostToDisplay {
  type: string;
}

export interface PostToDisplay extends PostRecord {
  comments: PostCommentDto[];
  commenters: PostUserInfoDto[];

  reposters: PostUserInfoDto[];
  repostCount: number;

  likers: PostUserInfoDto[];
  likeCount: number;

  bookmarkers: PostUserInfoDto[];
  bookmarkCount: number;
}

export interface SavedPostItem {
  post: PostRecord,
  username: string;
  profileImg: string;
}

export interface PostRecord extends CommonRecordBody {
  postId: string;
  content: string;
  postTags: string[];
  postCreatedAt: string;
  postUpdatedAt: string;
  userId?: string;
  username: string;
  profileImg?: string;
  authorBio?: string;
  postType?: string;
  relatedPostId?: string | null;
  postAvatar?: string | null;
  postBannerImage?: string | null;
}

export interface CreatePostForm {
  text: string;
  image?: string;
  tags: string[];
}

export interface CommentForm extends Comment {
  commentToCommentOnId?: string;
};

export interface Comment extends CommonRecordBody {
  id: string;
  postId: string;
  userId: string;
  image: string;
  text: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface PostCommentDto {
  id: string;
  postId: string;
  userId: string;
  content: string;
  username?: string;
  profileImg?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface PostUserInfoDto {
  id: string;
  username: string;
  profileImg?: string;
}

export interface CommentToDisplay extends Comment {
  username: string;
  profileImg: string;
  comments: Comment[],
  commenters: User[],
  reposters: User[],
  likers: User[]
}

export interface CreateListOrCommunityFormDto extends CreateListOrCommunityForm {
  usersAdded: string[];
  postsAdded: string[];
}

export interface CreateListOrCommunityForm {
  name: string;
  description?: string;
  avatarOrBannerImage: string;
  isPrivate: "private" | "public";
  tags: string[];
  usersAdded: UserItemToDisplay[];
  postsAdded: PostToDisplay[];
}

export interface ListRecord {
  id: string;
  userId: string;
  name: string;
  avatar?: string;
  bannerImage?: string;
  createdAt: string;
  updatedAt: string;
  _rev: string;
  _type: "list";
}

// export interface ListRecordToDisplay extends ListRecord {
//   listCreator: string;
//   listCreatorProfileImg: string;
// }

export interface ListToDisplay {
  listId: string;
  listName: string;
  listDescription?: string;
  listAvatar?: string;
  listBannerImage?: string;
  listTags?: string[];
  listCreatedAt: Date;
  listUpdatedAt?: Date;
  owner: {
    userId: string;
    ownerUsername: string;
    ownerAvatar: string;
  };
  itemCounts: {
    totalItems: number;
    userItems: number;
    postItems: number;
    communityItems: number;
    discussionItems: number;
    messageItems: number;
  };
  lastSavedItems: {
    lastItemId: string;
    lastItemType: string;
    lastSavedAt: Date;
  };
}

export interface CommunityRecord {
  id: string;
  userId: string
  name: string;
  avatar: string;
  createdAt: string;
  updatedAt: string;
  _rev: string;
  _type: "community";
  isPrivate: boolean;
  tags: string[];
  joinedUsersToDisplay: User[];
}

export interface CommunityRecordToDisplay extends CommunityRecord {
  founder: string;
  founderProfileImg: string;
}

export enum  RelationshipType {
  	// founder, moderator, member, requested, invited
  Member = 'member',
  Invited = 'invited',
  Moderator = 'moderator',
  Founder = 'founder',
  Requested = 'requested',
  InviteRequestedForCommunityDiscussion = 'INVITE_REQUESTED_FOR_DISCUSSION',
  None = 'none'
};

export interface CommunityToDisplay {
  communityId: string;
  communityName: string;
  communityDescription?: string;
  communityAvatar?: string;
  communityBannerImage?: string;
  communityCreatedAt: Date;
  communityUpdatedAt?: Date;
  communityTags?: string[];
  founderId: string;
  founderUsername: string;
  founderAvatar: string;
  userId: string;
  userRole?: string;
  userJoinedAt?: Date;
  relationshipType?: string;
  totalMembers: number;
  isPrivate?: boolean;
}

export interface CommunityAdminInfo  extends CommunityToDisplay {
  inviteRequestedUsers: User[]; 
  invitedCount: number;
  joinedCount: number;
  moderatorCount: number;
}
// CALL apoc.trigger.add('create_list_notification', 
// 'UNWIND $createdNodes AS node
//  WHERE labels(node)[0] = "List"
//  MATCH (owner:User)-[:OWNS]->(node)
//  CREATE (n:Notification {
//    id: apoc.text.format("notification_%s", [randomUUID()]),
//    message: "New list created by " + owner.username,
//    read: false,
//    relatedEntityId: node.id,
//     link: null,
//    createdAt: datetime(),
//    updatedAt: null,
//    _rev: null,
//    _type: "notification",
//    notificationType: "new_list"
//  })
//  CREATE (n)-[:NOTIFIES]->(owner)
//  RETURN count(*)', 
// {phase: 'after'})
export interface NotificationRecord extends CommonRecordBody {
  notificationId: string;
  userId: string;
  notificationMessage: string;
  isRead: boolean;
  relatedEntityId?: string;
  link?: string;
  notificationCreatedAt: string;
  notificationUpdatedAt: string;
  relatedUserId?: string;
  postId?: string;
  communityId?: string;
  communityDiscussionId?: string;
  communityDiscussionMessageId?: string;
  listId?: string;
  listItemId?: string;
}


export interface NotificationToDisplay extends NotificationRecord {}

export interface ServerError {
  statusCode: number;
  message: string;
  details: string;
}

// Direct Message Relationships
// Sender -> SEND_MESSAGE -> Recipient
// Recipient -> RECEIVED_MESSAGE -> Sender
export interface MessageFormDto {
  senderId: string;
  senderProfileImg?: string;
  senderUsername?: string;
  recipientId?: string;
  recipientProfileImg?: string;
  recipientUsername?: string;
  text: string;
  image?: string;
}

export interface MessageRecord extends CommonRecordBody {
  messageId: string;
  senderId?: string;
  senderUsername?: string;
  senderAvatar?: string;
  recipientId?: string;
  recipientAvatar?: string;
  recipientUsername?: string;
  messageContent?: string;
  messageMedia?; string;
  isRead?: boolean;

  messageCreatedAt: Date;
  messageUpdatedAt: Date;
}

export interface MessageToDisplay extends MessageRecord {}

export interface MessageHistoryToDisplay {
  id: string;
  receiverId: string;
  receiverProfileImage: string
  receiverUsername: string;
  messageCount: any;
  lastMessageDate: any;
}

export interface ExploreToDisplay {
  title: string;
  url: string;
  urlToImage: string;
}

export interface ExploreNewsSourceToDisplay {
  id: string;
  name: string;
  category: string;
  description: string;
  url: string;
}

export enum ExploreTabs {
  Popular = 'popular',
  AlJazeeraEnglish = 'al-jazeera-english',
  Argaam = 'argaam',
  BleacherReport = 'bleacher-report',
  CryptoCoinsNews = 'crypto-coins-news',
  HackerNews = 'hacker-news',
  SABQ = 'sabq',

}

// New types based on the code snippets
export interface PersonalInfo {
  dateOfBirth?: string;
  maritalStatus?: 'single' | 'married' | 'divorced' | 'widowed';
}

export interface PersonalInterests {
  hobbies?: string[];
  preferredMadhab?: 'Hanafi' | "Shafi'i" | 'Maliki' | 'Hanbali' | "Salafi";
  frequentMasjid?: string;
  favoriteQuranReciters?: string[];
  favoriteIslamicScholars?: string[];
  islamicStudyTopics?: string[];
}

// Relationship types
export interface PostedRelationship {
  timestamp: string;
}

export interface CommentedRelationship {
  timestamp: string;
}

