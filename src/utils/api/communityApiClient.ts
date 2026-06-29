import axios from "axios";
import { axiosRequests, axiosResponseBody } from "./agent";
import { CreateListOrCommunityFormDto } from "typings";
import { AcceptOrDenyCommunityInviteConfirmationDto, CommunityDiscussionMessageDto, CommunityInviteConfirmationDto, UpdateCommunityDiscussionFormDto, UpdateCommunityFormDto } from "@models/community";

export const communityApiClient = {
    updateCommunity: (values: UpdateCommunityFormDto,communityId: string) =>
        axiosRequests.put(`/api/Communities/${communityId}`, { values }).then(axiosResponseBody),
    deleteCommunity: (communityId: string) =>
        axiosRequests.del(`/api/Communities/${communityId}`).then(axiosResponseBody),
    
    requestToJoinCommunity: (values: CommunityInviteConfirmationDto, communityId: string) =>
        axiosRequests.post(`/api/Communities/${communityId}/request-join`, { values }).then(axiosResponseBody),
    acceptOrDenyToJoinRequestToCommunity: (values: AcceptOrDenyCommunityInviteConfirmationDto, communityId: string) =>
        axiosRequests.patch(`/api/Communities/${communityId}/request-join`, { values }).then(axiosResponseBody),
    joinCommunity: (values: CommunityInviteConfirmationDto, communityId: string) =>
        axiosRequests.patch(`/api/Communities/${communityId}/join`, { values }).then(axiosResponseBody),
    unjoinCommunity: (values: any, communityId: string) =>
        axiosRequests.patch(`/api/Communities/${communityId}/unjoin`, { values }).then(axiosResponseBody),
    
    getAdminCommunityInfo: (params: URLSearchParams | undefined, communityId: string) =>
        axios.get(`/api/Communities/${communityId}/admin`, { params }).then(axiosResponseBody),
    getCommunityInfo: (params: URLSearchParams | undefined, communityId: string) =>
        axios.get(`/api/Communities/${communityId}`, { params }).then(axiosResponseBody),
    
    addCommunity: (values: CreateListOrCommunityFormDto) =>
        axiosRequests.post(`/api/Communities`, { values }).then(axiosResponseBody),
    getCommunities: (params: URLSearchParams | undefined) =>
        axios.get(`/api/Communities`, { params }).then(axiosResponseBody),
    
    getAdminCommunityDiscussionInfo: (communityId: string, communityDiscussionId: string) =>
        axios.get(`/api/CommunityDiscussion/${communityId}/${communityDiscussionId}/admin`, {  }).then(axiosResponseBody),
    addCommunityDiscussion: (values: CreateListOrCommunityFormDto, communityId: string) =>
        axios.post(`/api/CommunityDiscussion/${communityId}`, { values }).then(axiosResponseBody),
    updateCommunityDiscussion: (values: UpdateCommunityDiscussionFormDto, communityId: string, communityDiscussionId: string) =>
        axiosRequests.put(`/api/CommunityDiscussion/${communityId}/${communityDiscussionId}`, { values }).then(axiosResponseBody),
    deleteCommunityDiscussion: (communityId: string, communityDiscussionId: string) =>
        axiosRequests.del(`/api/CommunityDiscussion/${communityId}/${communityDiscussionId}`).then(axiosResponseBody),
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