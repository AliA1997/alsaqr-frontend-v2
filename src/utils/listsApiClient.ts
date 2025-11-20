import axios from "axios";
import { axiosRequests, axiosResponseBody } from "./common";
import { CreateListOrCommunityFormDto } from "typings";

export const listApiClient = {
    addList: (values: CreateListOrCommunityFormDto, userId: string) =>
        axiosRequests.post(`/api/Lists/${userId}`, { values }).then(axiosResponseBody),
    deleteList: (userId: string, listId: string) =>
        axiosRequests.del(`/api/Lists/${userId}/${listId}`).then(axiosResponseBody),
    saveItemToList: (relatedEntityId: string, type: string, userId: string, listId: string) => 
        axiosRequests.patch(`/api/Lists/${userId}/${listId}`, { values: { relatedEntityId, type } }).then(axiosResponseBody),
    getLists: (params: URLSearchParams | undefined, userId: string) =>
        axios.get(`/api/Lists/${userId}`, { params }).then(axiosResponseBody),
    getSavedListItems: (params: URLSearchParams | undefined, userId: string, listId: string) =>
        axios.get(`/api/Lists/${userId}/${listId}`, { params }).then(axiosResponseBody),
    deleteSavedListItem: (userId: string, listId: string, listItemId: string) =>
        axiosRequests.del(`/api/Lists/${userId}/${listId}/${listItemId}`).then(axiosResponseBody),
}