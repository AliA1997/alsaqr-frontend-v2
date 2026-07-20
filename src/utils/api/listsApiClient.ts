import axios from "axios";
import { axiosRequests, axiosResponseBody } from "./agent";
import { CreateListOrCommunityFormDto } from "typings";

export const listApiClient = {
    addList: (values: CreateListOrCommunityFormDto) =>
        axiosRequests.post(`/api/Lists`, { values }),
    deleteList: (listId: string) =>
        axiosRequests.del(`/api/Lists/${listId}`),
    saveItemToList: (relatedEntityId: string, type: string, listId: string) => 
        axiosRequests.patch(`/api/Lists/${listId}`, { values: { relatedEntityId, type } }),
    getLists: (params: URLSearchParams | undefined, webWorkerAccessToken?: string) =>
        !!webWorkerAccessToken 
        ? axios.get(`/api/Lists`, { params, headers: { Authorization: `Bearer ${webWorkerAccessToken}` } }).then(axiosResponseBody) 
        : axios.get(`/api/Lists`, { params }).then(axiosResponseBody),
    getListDetails: (listId: string) =>
        axios.get(`/api/Lists/${listId}/details`).then(axiosResponseBody),
    
    getSavedListItems: (params: URLSearchParams | undefined, listId: string) =>
        axios.get(`/api/Lists/${listId}`, { params }).then(axiosResponseBody),
    deleteSavedListItem: (listId: string, listItemId: string) =>
        axiosRequests.del(`/api/Lists/${listId}/${listItemId}`),
}