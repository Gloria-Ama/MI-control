import { api } from "./api";

export async function getMembres() {
    const response = await api.get("/membres/");
    return response.data;
}

export async function createMembre(data: any) {
    const response = await api.post("/membres/", data);
    return response.data;
}

export async function deleteMembre(id: number) {
    await api.delete(`/membres/${id}/`);
}

export async function updateMembre(id: number, data: any) {
    const response = await api.put(`/membres/${id}/`, data);
    return response.data;
}

