import axios from "axios";
import { YumnaPromptFormDto } from "@models/yumna";
import { axiosResponseBody } from "./agent";

// The backend owns the Google Gemini integration; the client only sends the prompt.
export const yumnaApiClient = {
    promptYumna: (values: YumnaPromptFormDto) =>
        axios.post(`/api/Yumna/prompt`, { values }).then(axiosResponseBody),
};
