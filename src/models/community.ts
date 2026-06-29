

export interface CommunityDiscussion {
    id: string;
    userId: string;
    communityId: string;
    name: string;
    createdAt: string;
    lastMessagedAt: string;
    _type: "community_discussion";
    tags: string[];
    isPrivate: boolean;
}


export interface CommunityDiscussionAdminInfo {
  discussionId: string;
  communityId: string;
  title: string;
  content: string;
  tags: string[];
  createdAt: Date;
  isFounder: boolean;
  founder: { 
    userId: string;
    username: string;
    avatar: string;
  };
  invitedCount: number;
  joinedCount: number;
  moderatorCount: number;
  requestedCount: number;
  inviteRequestedUsers: {
    id: string;
    userId: string;
    username: string;
    avatar: string;
  }[];
  isPrivate?: boolean;
}

export interface CommunityDiscussionToDisplay {
  communityDiscussionId: string;
  communityId: string;
  communityDiscussionTitle: string;
  communityDiscussionContent: string;
  communityDiscussionCreatedAt: Date;
  communityDiscussionUpdatedAt?: Date;
  creatorId: string;
  creatorUsername: string;
  creatorAvatar: string;
  userId: string;
  userRole: string;
  userJoinedAt?: Date;
  relationshipType: string;
  joinedUsers: {
    userId?: string;
    username?: string;
    avatar?: string;
  }[];
  moderatorUsers: {
    userId?: string;
    username?: string;
    avatar?: string;
  }[];
  invitedUsers: {
    userId?: string;
    username?: string;
    avatar?: string;
  }[];
  requestedUsers: {
    userId?: string;
    username?: string;
    avatar?: string;
  }[];
  memberCount: number;
  moderatorCount: number;
  invitedCount: number;
  requestedCount: number;
  totalMemberCount: number;
  lastMessageId?: string;
  lastMessageCreatorId?: string;
  lastMessageContent?: string;
  lastMessageAt?: Date;
  isPrivate?: boolean;
}


export interface CommunityDiscussionMessage {
    id: string;
    userId: string;
    communityDiscussionId: string;
    communityId: string;
    messageText: string;
    image: string;
    createdAt: string;
}

export interface CommunityDiscussionMessageDto {
    creatorId: string;
    content: string;
    media: string;
}

export interface CommunityDiscussionMessageToDisplay extends CommunityDiscussionMessage {
  userId: string;
  communityDiscussionId: string;
  messageText: string;
  image: string;
  createdAt: string;
}

export interface UpdateCommunityForm {
  id: string;
  name: string;
  avatar: string;
  isPrivate: any;
  tags: string[];
}

export interface UpdateCommunityFormDto extends UpdateCommunityForm {}

export interface UpdateCommunityDiscussionForm {
  name: string;
  description: string;
  isPrivate: any;
  tags: string[];
}

export interface UpdateCommunityDiscussionFormDto extends UpdateCommunityDiscussionForm {}

export interface CommunityInviteConfirmation {
  _id?: string; 
  communityId: string;
  userId: string;
  username: string;
  email: string;
  confirmedAt: Date;
  accepted?: boolean;
  denied?: boolean;
  expiresAt: Date;
}

export interface CommunityDiscussionInviteConfirmation extends CommunityInviteConfirmation {
  communityDiscussionId: string;
}

export interface CommunityInviteConfirmationDto {
  username: string;
  email: string;
}

export interface AcceptOrDenyCommunityInviteConfirmationDto {
  invitedUserId?: string;
  accept?: boolean;
  deny?: boolean;
}
