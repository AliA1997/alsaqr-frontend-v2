import axios from "axios";
import { axiosRequests, axiosResponseBody } from "./agent";
import { CreateListOrCommunityFormDto } from "typings";
import { AcceptOrDenyCommunityInviteConfirmationDto, CommunityDiscussionMessageDto, CommunityInviteConfirmationDto, UpdateCommunityDiscussionFormDto, UpdateCommunityFormDto } from "@models/community";

export const communityApiClient = {
    updateCommunity: (values: UpdateCommunityFormDto,communityId: string) =>
        axiosRequests.put(`/api/Communities/${communityId}`, { values }),
    deleteCommunity: (communityId: string) =>
        axiosRequests.del(`/api/Communities/${communityId}`),
    
    requestToJoinCommunity: (values: CommunityInviteConfirmationDto, communityId: string) =>
        axiosRequests.post(`/api/Communities/${communityId}/request-join`, { values }),
    acceptOrDenyToJoinRequestToCommunity: (values: AcceptOrDenyCommunityInviteConfirmationDto, communityId: string) =>
        axiosRequests.patch(`/api/Communities/${communityId}/request-join`, { values }),
    joinCommunity: (values: CommunityInviteConfirmationDto, communityId: string) =>
        axiosRequests.patch(`/api/Communities/${communityId}/join`, { values }),
    unjoinCommunity: (values: any, communityId: string) =>
        axiosRequests.patch(`/api/Communities/${communityId}/unjoin`, { values }),
    
    getAdminCommunityInfo: (params: URLSearchParams | undefined, communityId: string) =>
        axios.get(`/api/Communities/${communityId}/admin`, { params }).then(axiosResponseBody),
    getCommunityInfo: (params: URLSearchParams | undefined, communityId: string) =>
        axios.get(`/api/Communities/${communityId}`, { params }).then(axiosResponseBody),
    
    addCommunity: (values: CreateListOrCommunityFormDto) =>
        axiosRequests.post(`/api/Communities`, { values }),
    getCommunities: (params: URLSearchParams | undefined, webWorkerAccessToken?: string) =>
        webWorkerAccessToken
        ? axios.get(`/api/Communities`, { params, headers: { Authorization: `Bearer ${webWorkerAccessToken}` } }).then(axiosResponseBody)
        : axios.get(`/api/Communities`, { params }).then(axiosResponseBody),
    
    getAdminCommunityDiscussionInfo: (communityId: string, communityDiscussionId: string) =>
        axios.get(`/api/CommunityDiscussion/${communityId}/${communityDiscussionId}/admin`, {  }).then(axiosResponseBody),
    addCommunityDiscussion: (values: CreateListOrCommunityFormDto, communityId: string) =>
        axios.post(`/api/CommunityDiscussion/${communityId}`, { values }).then(axiosResponseBody),
    updateCommunityDiscussion: (values: UpdateCommunityDiscussionFormDto, communityId: string, communityDiscussionId: string) =>
        axiosRequests.put(`/api/CommunityDiscussion/${communityId}/${communityDiscussionId}`, { values }),
    deleteCommunityDiscussion: (communityId: string, communityDiscussionId: string) =>
        axiosRequests.del(`/api/CommunityDiscussion/${communityId}/${communityDiscussionId}`),
    getCommunityDiscussions: (params: URLSearchParams | undefined, communityId: string) =>
        axios.get(`/api/CommunityDiscussion/${communityId}`, { params }).then(axiosResponseBody),
    
    requestToJoinCommunityDiscussion: (values: CommunityInviteConfirmationDto, communityId: string, communityDiscussionId: string) =>
        axiosRequests.post(`/api/CommunityDiscussion/${communityId}/${communityDiscussionId}/request-join`, { values }),
    acceptOrDenyToJoinRequestToCommunityDiscussion: (values: AcceptOrDenyCommunityInviteConfirmationDto, communityId: string, communityDiscussionId: string) =>
        axiosRequests.patch(`/api/CommunityDiscussion/${communityId}/${communityDiscussionId}/request-join`, { values }),
    joinCommunityDiscussion: (values: CommunityInviteConfirmationDto, communityId: string, communityDiscussionId: string) =>
        axiosRequests.patch(`/api/CommunityDiscussion/${communityId}/${communityDiscussionId}/join`, { values }),
    unjoinCommunityDiscussion: (values: any, communityId: string, communityDiscussionId: string) =>
        axiosRequests.patch(`/api/CommunityDiscussion/${communityId}/${communityDiscussionId}/unjoin`, { values }),
    

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