import axios from "axios";
import { axiosResponseBody } from "./agent";
import { UserRegisterFormDto } from "typings";
import { FollowUserFormDto, UnFollowUserFormDto, UpdateUserFormDto } from "@models/users";

export const userApiClient = {
    sessionSignin: (oauthData: any) =>
        axios.post(`/api/auth/signin`, { values: oauthData }, { headers: {
            "Content-Type": "application/json"
        }}).then(axiosResponseBody),
    sessionCheck: (email: string, web3_address?: string) =>
        axios.post(`/api/Session/check `, { values: { email, web3_address } }, { headers: {
            "Content-Type": "application/json"
        }}).then(axiosResponseBody),

    // Web3 wallet auth mirrors the oauth flow: signin upserts the wallet user,
    // check returns the session user keyed by wallet address instead of email.
    web3SessionSignin: (web3Address: string) =>
        axios.post(`/api/auth/signin`, { values: { web3_address: web3Address, provider: "web3" } }, { headers: {
            "Content-Type": "application/json"
        }}).then(axiosResponseBody),
    web3SessionCheck: (web3Address: string) =>
        axios.post(`/api/Session/check `, { values: { web3_address: web3Address, email: "" } }, { headers: {
            "Content-Type": "application/json"
        }}).then(axiosResponseBody),
    
    
    getUserProfile: (username: string) => 
        axios.get(`/api/Profile/${username}`).then(axiosResponseBody),

    getUsersToAdd: (params: URLSearchParams) =>
        axios.get(`/api/Users/usersToAdd`, { params }).then(axiosResponseBody),
    getUserProfilePosts: (username: string, params: URLSearchParams) =>
        axios.get(`/api/Profile/${username}/posts`, { params }).then(axiosResponseBody),
    getUserProfileMediaPosts: (username: string, params: URLSearchParams) =>
        axios.get(`/api/Profile/${username}/media-posts`, { params }).then(axiosResponseBody),
    getUserProfileCommunities: (username: string, params: URLSearchParams) =>
        axios.get(`/api/Profile/${username}/communities`, { params }).then(axiosResponseBody),
    getUserProfileCommunityDiscussions: (username: string, params: URLSearchParams) =>
        axios.get(`/api/Profile/${username}/communityDiscussions`, { params }).then(axiosResponseBody),
    getUserProfileGroups: (username: string, params: URLSearchParams) =>
        axios.get(`/api/Profile/${username}/groups`, { params }).then(axiosResponseBody),
    getUserProfileEvents: (username: string, params: URLSearchParams) =>
        axios.get(`/api/Profile/${username}/events`, { params }).then(axiosResponseBody),
    getUserProfileProducts: (username: string, params: URLSearchParams) =>
        axios.get(`/api/Profile/${username}/products`, { params }).then(axiosResponseBody),
    
    completeRegistration: (userId: string, values: UserRegisterFormDto) =>
        axios.post(`/api/Users/${userId}`, { values }).then(axiosResponseBody),
    
    followUser: (values: FollowUserFormDto) =>
        axios.patch(`/api/Users/follow`, { values }).then(axiosResponseBody),
    unFollowUser: (values: UnFollowUserFormDto) =>
        axios.patch(`/api/Users/unfollow`, { values }).then(axiosResponseBody),

    updateUser: (values: UpdateUserFormDto) => 
        axios.put(`/api/Users`, { values }).then(axiosResponseBody),
    deleteUser: () => 
        axios.delete(`/api/Users`).then(axiosResponseBody)
} 