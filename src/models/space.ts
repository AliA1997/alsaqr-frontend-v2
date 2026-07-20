// Ephemeral audio discussions ("spaces") for communities and community
// discussions. Presence lives in Supabase realtime; media flows through the
// Cloudflare SFU behind the .NET proxy. Nothing here is ever recorded.

export type SpaceKind = 'community' | 'community-discussion';

export type SpaceRole = 'host' | 'speaker' | 'listener';

export type SpaceConnectionState = 'idle' | 'connecting' | 'live' | 'reconnecting';

export interface SpaceToDisplay {
  spaceId: string;
  kind: SpaceKind;
  communityId: string;
  communityDiscussionId?: string;
  title: string;
  hostId: string;
  hostUsername?: string;
  hostAvatar?: string;
  startedAt: string;
  endedAt?: string;
  participantCount: number;
  isLive: boolean;
}

// A live space plus the page-local context needed to label it. The backend's
// SpaceToDisplay carries ids, not the parent discussion's name, so the title is
// resolved against the community's discussion list on the client.
export interface SpaceListItem {
  space: SpaceToDisplay;
  discussionTitle?: string;
}

export interface SpaceParticipant {
  userId: string;
  username: string;
  avatar?: string;
  role: SpaceRole;
  muted: boolean;
  handRaised: boolean;
  // SFU coordinates for pulling this participant's audio (speakers only).
  sfuSessionId?: string;
  trackName?: string;
}

// ---- DTOs (client -> .NET proxy -> Cloudflare SFU) ----

export interface StartSpaceDto {
  title: string;
}

export interface JoinSpaceResultDto {
  space: SpaceToDisplay;
  role: SpaceRole;
  participants: SpaceParticipant[];
  // Speakers currently publishing, so a joiner can pull each track.
  speakers: SpaceParticipant[];
}

// Publish: client OFFERS, SFU ANSWERS.
export interface PublishSpaceAudioDto {
  sdp: string;
  mid: string | null;
}

export interface PublishSpaceAudioResultDto {
  sessionId: string;
  trackName: string;
  answer: RTCSessionDescriptionInit;
}

// Subscribe: SFU OFFERS, client ANSWERS (the reverse of publishing).
export interface SubscribeSpaceAudioDto {
  pubSessionId: string;
  trackName: string;
}

export interface SubscribeSpaceAudioResultDto {
  sessionId: string;
  offer: RTCSessionDescriptionInit;
}

export interface RenegotiateSpaceAudioDto {
  sessionId: string;
  sdp: string;
}

// ---- Supabase realtime broadcast payloads (presence channel `space:{spaceId}`) ----

export interface SpaceTrackAddedPayload {
  userId: string;
  sfuSessionId: string;
  trackName: string;
}

export interface SpaceTrackClosedPayload {
  userId: string;
}

export interface SpaceRoleChangedPayload {
  userId: string;
  role: SpaceRole;
}

export interface SpaceMuteChangedPayload {
  userId: string;
  muted: boolean;
}

export interface SpaceHandRaisedPayload {
  userId: string;
  raised: boolean;
}

export interface SpaceEndedPayload {
  spaceId: string;
  endedAt: string;
}
