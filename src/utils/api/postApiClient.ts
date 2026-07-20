import axios from "axios";
import { axiosRequests, axiosResponseBody } from "./agent";
import { CreatePostForm } from "typings";

export const postApiClient = {
    addPost: (values: CreatePostForm) =>
        axiosRequests.post(`/api/posts`, { values }),
    getPosts: (params: URLSearchParams | undefined) =>
        axios.get(`/api/posts`, { params }).then(axiosResponseBody),
    getPostsToAdd: (params: URLSearchParams) =>
        axios.get(`/api/users/postsToAdd`, { params }).then(axiosResponseBody),
    getBookmarkedPosts: (params: URLSearchParams | undefined, userId: string, webWorkerAccessToken?: string) =>
        !!webWorkerAccessToken 
        ? axios.get(`/api/bookmarks/${userId}`, { params, headers: { Authorization: `Bearer ${webWorkerAccessToken}`} }).then(axiosResponseBody) 
        : axios.get(`/api/bookmarks/${userId}`, { params }).then(axiosResponseBody),
    getPost: (statusId: string) =>
        axios.get(`/api/posts/${statusId}`, {}).then(axiosResponseBody),
}