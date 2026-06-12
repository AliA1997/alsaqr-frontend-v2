
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
  following: {
    avatar?: string;
    bio?: string;
    username?: string;
    userId?: string;
  }[];
  followingCount: number;
  followers: {
    avatar?: string;
    bio?: string;
    username?: string;
    userId?: string;
  }[];
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

export interface CommentForm {
  text: string;
  postId: string;
  userId: string;
  image?: string;
};

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
export interface NotificationRecord extends CommonRecordBody {
  notificationId: string;
  userId: string;
  notificationMessage: string;
  notificationType: string;
  isRead: boolean;
  link?: string;
  relatedUserId?: string;
  postId?: string;
  communityId?: string;
  communityDiscussionId?: string;
  communityDiscussionMessageId?: string;
  listId?: string;
  listItemId?: string;
  notificationCreatedAt: string;
  notificationUpdatedAt: string;
}


export interface NotificationToDisplay extends NotificationRecord {}

export interface ServerError {
  statusCode: number;
  message: string;
  details: string;
}



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
