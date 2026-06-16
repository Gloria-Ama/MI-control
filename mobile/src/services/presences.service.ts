import { api } from "./api";

export async function getPresences() {
    const response = await api.get("/presences/");
    return response.data;
}

export async function createPresence(data: any) {
    const response = await api.post("/presences/", data);
    return response.data;
}

export async function updatePresence(id: number, data: any) {
    const response = await api.put(`/presences/${id}/`, data);
    return response.data;
}