import { api } from "./api";

export async function getVisiteurs() {
    const response = await api.get("/visiteurs/");
    return response.data;
}

export async function createVisiteur(data: any) {
        const response = await api.post("/visiteurs/", data);
        return response.data;
}


export async function deleteVisiteur(id: number) {
    await api.delete(`/visiteurs/${id}/`);
}