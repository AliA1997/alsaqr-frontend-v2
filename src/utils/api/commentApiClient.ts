import axios from "axios";
import { axiosRequests, axiosResponseBody } from "./agent";
import { CommentForm } from "typings";
import { LikedCommentParams, RePostCommentParams } from "@models/posts";

export const commentApiClient = {
    addComment: (values: CommentForm) =>
        axiosRequests.post(`/api/Comments`, { values }).then(axiosResponseBody),
    getCommentsForPost: (params: URLSearchParams | undefined, postId: string) =>
        axios.get(`/api/Posts/${postId}/comments`, { params }).then(axiosResponseBody),
    getCommentsById: (commentId: string) =>
        axios.get(`/api/Comments/${commentId}`).then(axiosResponseBody),
    likedComment: (commentId: string, values: LikedCommentParams) =>
        axiosRequests.patch(`/api/Comments/${commentId}/liked`, { values }).then(axiosResponseBody),
    rePostComment: (commentId: string, values: RePostCommentParams) =>
        axiosRequests.patch(`/api/Comments/${commentId}/repost`, { values }).then(axiosResponseBody),
    deleteComment: (commentId: string) =>
        axiosRequests.del(`/api/Comments/${commentId}`).then(axiosResponseBody),
};