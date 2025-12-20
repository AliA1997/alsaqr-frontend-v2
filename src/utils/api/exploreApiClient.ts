import axios from "axios";
import { axiosResponseBody } from "./agent";
import { ExploreTabs } from "typings";

export const exploreApiClient = {
    getExplore: (params: URLSearchParams) =>
        axios.get(`/api/explore`, { params }).then(axiosResponseBody),

    getExploreFromSource: (source: ExploreTabs, params: URLSearchParams) =>
        axios.get(`/api/explore/source/${source}`, { params }).then(axiosResponseBody)
};