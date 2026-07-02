import axios from "axios";
import { axiosResponseBody } from "./agent";

export const subscriptionApiClient = {
    getSubscriptionDailyUse: (params: URLSearchParams | undefined) =>
        axios.get(`/api/Yumna/dailyUse`, { params }).then(axiosResponseBody),
};
