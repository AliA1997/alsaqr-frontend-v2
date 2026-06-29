import axios from "axios";
import { axiosRequests, axiosResponseBody } from "./agent";
import { CreateListOrCommunityFormDto } from "typings";

export const listApiClient = {
    addList: (values: CreateListOrCommunityFormDto) =>
        axiosRequests.post(`/api/Lists`, { values }).then(axiosResponseBody),
    deleteList: (listId: string) =>
        axiosRequests.del(`/api/Lists/${listId}`).then(axiosResponseBody),
    saveItemToList: (relatedEntityId: string, type: string, listId: string) => 
        axiosRequests.patch(`/api/Lists/${listId}`, { values: { relatedEntityId, type } }).then(axiosResponseBody),
    getLists: (params: URLSearchParams | undefined) =>
        axios.get(`/api/Lists`, { params }).then(axiosResponseBody),
    getListDetails: (listId: string) =>
        axios.get(`/api/Lists/${listId}/details`).then(axiosResponseBody),
    
    getSavedListItems: (params: URLSearchParams | undefined, listId: string) =>
        axios.get(`/api/Lists/${listId}`, { params }).then(axiosResponseBody),
    deleteSavedListItem: (listId: string, listItemId: string) =>
        axiosRequests.del(`/api/Lists/${listId}/${listItemId}`).then(axiosResponseBody),
}