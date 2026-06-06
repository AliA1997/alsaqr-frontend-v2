import type { CommunityRecord, User, UserInfo } from "@typings";

// communityDiscussion - [:POSTED_DISCUSSION_ON] -> community
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

export interface CommunityDiscussionRecord extends CommunityDiscussion {}


export interface CommunityDiscussionAdminInfo {
  communityDiscussion: CommunityDiscussionRecord;
  isFounder: boolean;
  founder: UserInfo;
  inviteRequestedUsers: User[]; 
  invitedCount: number;
  joinedCount: number;
}

export interface CommunityDiscussionInfoForMessageRoom {
  communityDiscussion: CommunityDiscussionRecord;
  community: CommunityRecord;
  invitedUsers: User[];
  joinedUsers: User[];
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
  joinedUsers: object[];
  moderatorUsers: object[];
  invitedUsers: object[];
  requestedUsers: object[];
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

// Relationship when posting is 
// user - [:POST_DISCUSSION_MESSAGE]-> CommunityDiscussionMessage
// communityDiscussion - [:DISCUSSION_MESSAGE_POSTED] -> CommunityDiscussionMessage
// communtyDiscussionMessage - [:DISCUSSION_MESSAGED_ON] -> CommunityDiscussion
export interface CommunityDiscussionMessage {
    id: string;
    userId: string;
    communityDiscussionId: string;
    communityId: string;
    messageText: string;
    image: string;
    createdAt: string;
    _type: "community_discussion_message";
    tags: string[];
}

export interface CommunityDiscussionMessageDto {
  userId: string;
  communityDiscussionId: string;
  communityId: string;
  messageText: string;
  image: string;
  _type: "community_discussion_message";
  tags: string[];
}

export interface CommunityDiscussionMessageRecord extends CommunityDiscussionMessage {}

export interface CommunityDiscussionMessageToDisplay {
  username: string;
  profileImg: string;
  communityDiscussionMessage: CommunityDiscussionMessageRecord;
}

export interface UpdateCommunityForm {
  id: string;
  name: string;
  avatar: string;
  isPrivate: any;
  tags: string[];
}

export interface UpdateCommunityFormDto extends UpdateCommunityForm {}

// InviteConfirmation
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
  accept?: boolean;
  deny?: boolean;
}
