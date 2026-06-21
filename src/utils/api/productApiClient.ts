import axios from "axios";
import { axiosResponseBody } from "./agent";

// Ported from alsaqr-zook (https://github.com/AliA1997/alsaqr-zook)
export const productApiClient = {
    getSellingProducts: (params: URLSearchParams | undefined) =>
        axios.get(`/api/UserProducts/selling`, { params }).then(axiosResponseBody),
    getBuyingProducts: (params: URLSearchParams | undefined) =>
        axios.get(`/api/UserProducts/buying`, { params }).then(axiosResponseBody),
};
