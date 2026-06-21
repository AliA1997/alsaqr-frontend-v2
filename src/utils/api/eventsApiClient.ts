import axios from "axios";
import { axiosResponseBody } from "./agent";

// Ported from alsaqr-meetup (https://github.com/AliA1997/alsaqr-meetup)
export const eventsApiClient = {
    getMyEvents: (params: URLSearchParams | undefined) =>
        axios.get(`/api/Events/my`, { params }).then(axiosResponseBody),
};
