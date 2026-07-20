import axios from "axios";
import { axiosResponseBody } from "./agent";
import {
    PublishSpaceAudioDto,
    RenegotiateSpaceAudioDto,
    StartSpaceDto,
    SubscribeSpaceAudioDto,
} from "@models/space";

// Every SFU interaction goes through the .NET proxy — the client never talks
// to Cloudflare directly and never sees the app secret. The backend is
// authoritative for roles/permissions; these calls only reflect its decisions.
export const spaceApiClient = {
    // "Live now" lookups for the entity pages.
    getLiveCommunitySpace: (communityId: string) =>
        axios.get(`/api/Spaces/community/${communityId}/live`).then(axiosResponseBody),
    getLiveCommunityDiscussionSpace: (communityId: string, communityDiscussionId: string) =>
        axios.get(`/api/Spaces/community/${communityId}/discussion/${communityDiscussionId}/live`).then(axiosResponseBody),

    // Lifecycle. Only community members / discussion members may start or join;
    // the backend enforces this and returns 403 otherwise.
    startCommunitySpace: (values: StartSpaceDto, communityId: string) =>
        axios.post(`/api/Spaces/community/${communityId}`, { values }).then(axiosResponseBody),
    startCommunityDiscussionSpace: (values: StartSpaceDto, communityId: string, communityDiscussionId: string) =>
        axios.post(`/api/Spaces/community/${communityId}/discussion/${communityDiscussionId}`, { values }).then(axiosResponseBody),
    joinSpace: (spaceId: string) =>
        axios.post(`/api/Spaces/${spaceId}/join`, {}).then(axiosResponseBody),
    leaveSpace: (spaceId: string) =>
        axios.post(`/api/Spaces/${spaceId}/leave`, {}).then(axiosResponseBody),
    endSpace: (spaceId: string) =>
        axios.post(`/api/Spaces/${spaceId}/end`, {}).then(axiosResponseBody),

    // Media negotiation. Publish: client offers, SFU answers.
    publish: (values: PublishSpaceAudioDto, spaceId: string) =>
        axios.post(`/api/Spaces/${spaceId}/publish`, { values }).then(axiosResponseBody),
    // Subscribe: SFU offers, client answers via renegotiate.
    subscribe: (values: SubscribeSpaceAudioDto, spaceId: string) =>
        axios.post(`/api/Spaces/${spaceId}/subscribe`, { values }).then(axiosResponseBody),
    renegotiate: (values: RenegotiateSpaceAudioDto, spaceId: string) =>
        axios.post(`/api/Spaces/${spaceId}/renegotiate`, { values }).then(axiosResponseBody),

    // Roles. Raising a hand queues the request; the host approves/demotes and
    // the backend broadcasts the role change.
    raiseHand: (spaceId: string, raised: boolean) =>
        axios.post(`/api/Spaces/${spaceId}/raise-hand`, { values: { raised } }).then(axiosResponseBody),
    approveSpeaker: (spaceId: string, userId: string) =>
        axios.post(`/api/Spaces/${spaceId}/speakers/${userId}/approve`, {}).then(axiosResponseBody),
    demoteSpeaker: (spaceId: string, userId: string) =>
        axios.post(`/api/Spaces/${spaceId}/speakers/${userId}/demote`, {}).then(axiosResponseBody),
};
