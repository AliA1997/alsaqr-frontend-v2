import axios from "axios";
import { axiosRequests, axiosResponseBody } from "./agent";
import { CommentForm } from "typings";

export const commentApiClient = {
    addComment: (values: CommentForm) =>
        axiosRequests.post(`/api/Comments`, { values }).then(axiosResponseBody),
    getCommentsForPost: (params: URLSearchParams | undefined, postId: string) =>
        axios.get(`/api/Posts/${postId}/comments`, { params }).then(axiosResponseBody),
};