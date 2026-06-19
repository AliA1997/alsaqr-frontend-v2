import axios from "axios";
import { axiosRequests, axiosResponseBody } from "./agent";
import { UserRegisterFormDto } from "typings";
import { FollowUserFormDto, UnFollowUserFormDto, UpdateUserFormDto } from "@models/users";

export const userApiClient = {
    sessionSignin: (oauthData: any) => 
        axiosRequests.post(`/api/Session/signin`, { values: oauthData }).then(axiosResponseBody),
    sessionCheck: (email: string) => 
        axios.post(`/api/Session/check `, { values: { email } }, { headers: {
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