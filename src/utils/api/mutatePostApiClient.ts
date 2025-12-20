import { axiosRequests } from "./agent";
import { BookmarkParams, LikedPostParams, RePostParams } from "@models/posts";

export const mutatePostApiClient = {
    bookmarkPost: (values: BookmarkParams) => 
                            axiosRequests.patch<void>(
                                `/api/posts/${values.statusId}/bookmark`, 
                                {values}
                            ),
    likePost: (values: LikedPostParams) =>
                            axiosRequests.patch<void>(
                                `/api/posts/${values.statusId}/liked`,
                                {values}
                            ),
    rePost: (values: RePostParams) =>
                            axiosRequests.patch<void>(
                                `/api/posts/${values.statusId}/repost`,
                                {values}
                            ),
     deleteYourPost: (postId: string) =>
                            axiosRequests.del<void>(`/api/posts/${postId}`)
}