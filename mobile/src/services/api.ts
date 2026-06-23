import axios from "axios";

export const api = axios.create({
    baseURL: "https://mi-control.onrender.com/api",
});