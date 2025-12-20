import axios from "axios";
import { axiosRequests, axiosResponseBody } from "./agent";
import { PostRecord } from "typings";

export const postApiClient = {
    addPost: (values: PostRecord) =>
        axiosRequests.post(`/api/posts`, { values }).then(axiosResponseBody),       
    getPosts: (params: URLSearchParams | undefined) =>
        axios.get(`/api/posts`, { params }).then(axiosResponseBody),
    getPostsToAdd: (userId: string, params: URLSearchParams) =>
        axios.get(`/api/users/${userId}/postsToAdd`, { params }).then(axiosResponseBody),
    getBookmarkedPosts: (params: URLSearchParams | undefined, userId: string) =>
        axios.get(`/api/bookmarks/${userId}`, { params }).then(axiosResponseBody),
    getPost: (statusId: string) =>
        axios.get(`/api/posts/${statusId}`, {}).then(axiosResponseBody),
}