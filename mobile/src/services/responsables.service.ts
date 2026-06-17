import { api } from "./api";

export async function getResponsables() {
    const response = await api.get("/responsables/");
    return response.data;
}

export async function createResponsable(data: any) {
    const response = await api.post("/responsables/", data);
    return response.data;
}