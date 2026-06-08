import axios from "axios";
import { axiosRequests, axiosResponseBody } from "./agent";
import { CreateListOrCommunityFormDto } from "typings";
import { AcceptOrDenyCommunityInviteConfirmationDto, CommunityDiscussionMessageDto, CommunityInviteConfirmationDto, UpdateCommunityFormDto } from "@models/community";

export const communityApiClient = {
    updateCommunity: (values: UpdateCommunityFormDto, userId: string, communityId: string) =>
        axiosRequests.put(`/api/Communities/${userId}/${communityId}`, { values }).then(axiosResponseBody),
    
    requestToJoinCommunity: (values: CommunityInviteConfirmationDto, userId: string, communityId: string) =>
        axiosRequests.post(`/api/Communities/${userId}/${communityId}/request-join`, { values }).then(axiosResponseBody),
    acceptOrDenyToJoinRequestToCommunity: (values: AcceptOrDenyCommunityInviteConfirmationDto, userId: string, communityId: string) =>
        axiosRequests.patch(`/api/Communities/${userId}/${communityId}/request-join`, { values }).then(axiosResponseBody),
    joinCommunity: (values: CommunityInviteConfirmationDto, userId: string, communityId: string) =>
        axiosRequests.patch(`/api/Communities/${userId}/${communityId}/join`, { values }).then(axiosResponseBody),
    unjoinCommunity: (values: any, userId: string, communityId: string) =>
        axiosRequests.patch(`/api/Communities/${userId}/${communityId}/unjoin`, { values }).then(axiosResponseBody),
    
    getAdminCommunityInfo: (params: URLSearchParams | undefined, userId: string, communityId: string) =>
        axios.get(`/api/Communities/${userId}/${communityId}/admin`, { params }).then(axiosResponseBody),
    getCommunityInfo: (params: URLSearchParams | undefined, userId: string, communityId: string) =>
        axios.get(`/api/Communities/${userId}/${communityId}`, { params }).then(axiosResponseBody),
    
    addCommunity: (values: CreateListOrCommunityFormDto, userId: string) =>
        axiosRequests.post(`/api/Communities/${userId}`, { values }).then(axiosResponseBody),
    getCommunities: (params: URLSearchParams | undefined, userId: string) =>
        axios.get(`/api/Communities/${userId}`, { params }).then(axiosResponseBody),
    
    getAdminCommunityDiscussionInfo: (communityId: string, communityDiscussionId: string) =>
        axios.get(`/api/CommunityDiscussion/${communityId}/${communityDiscussionId}/admin`, {  }).then(axiosResponseBody),
    addCommunityDiscussion: (values: CreateListOrCommunityFormDto, communityId: string) =>
        axios.post(`/api/CommunityDiscussion/${communityId}`, { values }).then(axiosResponseBody),
    getCommunityDiscussions: (params: URLSearchParams | undefined, communityId: string) =>
        axios.get(`/api/CommunityDiscussion/${communityId}`, { params }).then(axiosResponseBody),
    
    requestToJoinCommunityDiscussion: (values: CommunityInviteConfirmationDto, communityId: string, communityDiscussionId: string) =>
        axiosRequests.post(`/api/CommunityDiscussion/${communityId}/${communityDiscussionId}/request-join`, { values }).then(axiosResponseBody),
    acceptOrDenyToJoinRequestToCommunityDiscussion: (values: AcceptOrDenyCommunityInviteConfirmationDto, communityId: string, communityDiscussionId: string) =>
        axiosRequests.patch(`/api/CommunityDiscussion/${communityId}/${communityDiscussionId}/request-join`, { values }).then(axiosResponseBody),
    joinCommunityDiscussion: (values: CommunityInviteConfirmationDto, communityId: string, communityDiscussionId: string) =>
        axiosRequests.patch(`/api/CommunityDiscussion/${communityId}/${communityDiscussionId}/join`, { values }).then(axiosResponseBody),
    unjoinCommunityDiscussion: (values: any, communityId: string, communityDiscussionId: string) =>
        axiosRequests.patch(`/api/CommunityDiscussion/${communityId}/${communityDiscussionId}/unjoin`, { values }).then(axiosResponseBody),
    

    addCommunityDiscussionMessage: (
        values: CommunityDiscussionMessageDto, 
        communityId: string,
        communityDiscussionId: string
    ) =>
        axios.post(`/api/CommunityDiscussion/${communityId}/${communityDiscussionId}/messages`, { values }).then(axiosResponseBody),
    getCommunityDiscussionForMessageRoom: (
        communityId: string,
        communityDiscussionId: string
    ) =>
        axios.get(`/api/CommunityDiscussion/${communityId}/${communityDiscussionId}`, {  }).then(axiosResponseBody),
    getCommunityDiscussionMessages: (
        params: URLSearchParams | undefined, 
        communityId: string,
        communityDiscussionId: string
    ) =>
        axios.get(`/api/CommunityDiscussion/${communityId}/${communityDiscussionId}/messages`, { params }).then(axiosResponseBody)
}