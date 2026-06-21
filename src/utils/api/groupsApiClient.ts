import axios from "axios";
import { axiosResponseBody } from "./agent";

// Ported from alsaqr-meetup (https://github.com/AliA1997/alsaqr-meetup)
export const groupsApiClient = {
    getMyGroups: (params: URLSearchParams | undefined) =>
        axios.get(`/api/Groups/my`, { params }).then(axiosResponseBody),
};
