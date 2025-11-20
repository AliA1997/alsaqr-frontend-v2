import axios from "axios";
import { axiosRequests, axiosResponseBody } from "./common";
import { UserRegisterFormDto } from "typings";
import { FollowUserFormDto, UnFollowUserFormDto, UpdateUserFormDto } from "@models/users";

export const userApiClient = {
    sessionSignin: (email: string) => 
        axiosRequests.post(`/api/Session/signin`, { values: { email } }).then(axiosResponseBody),
    sessionCheck: (email: string) => 
        axios.post(`/api/Session/check `, { values: { email } }, { headers: {
            "Content-Type": "application/json"
        }}).then(axiosResponseBody),
    
    
    getUserProfile: (username: string) => 
        axios.get(`/api/Profile/${username}`).then(axiosResponseBody),

    getUsersToAdd: (userId: string, params: URLSearchParams) =>
        axios.get(`/api/Users/${userId}/usersToAdd`, { params }).then(axiosResponseBody),
    getUserProfilePosts: (username: string, params: URLSearchParams) =>
        axios.get(`/api/Profile/${username}/posts`, { params }).then(axiosResponseBody),
    
    completeRegistration: (userId: string, values: UserRegisterFormDto) =>
        axios.post(`/api/Users/${userId}/completeRegistration`, { values }).then(axiosResponseBody),
    
    followUser: (userId: string, values: FollowUserFormDto) =>
        axios.patch(`/api/Users/${userId}/follow`, { values }).then(axiosResponseBody),
    unFollowUser: (userId: string, values: UnFollowUserFormDto) =>
        axios.patch(`/api/Users/${userId}/unfollow`, { values }).then(axiosResponseBody),

    updateUser: (userId: string, values: UpdateUserFormDto) => 
        axios.put(`/api/Users/${userId}`, { values }).then(axiosResponseBody),
    deleteUser: (userId: string) => 
        axios.delete(`/api/Users/${userId}`).then(axiosResponseBody)
} 