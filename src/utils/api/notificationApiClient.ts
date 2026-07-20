import axios from "axios";
import { axiosResponseBody } from "./agent";

export const notificationApiClient = {
    getNotifications: (userId: string, params: URLSearchParams | undefined, webWorkerAccessToken?: string) =>
        !!webWorkerAccessToken
            ? axios.get(`/api/notifications/${userId}`, {
                params,
                headers: {
                    Authorization: `Bearer ${webWorkerAccessToken}`
                }
            }).then(axiosResponseBody)
            : axios.get(`/api/notifications/${userId}`, {
                params
            }).then(axiosResponseBody),
}