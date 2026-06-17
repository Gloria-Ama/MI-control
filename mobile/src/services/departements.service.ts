    import { api } from "./api";

    export async function getDepartements(communauteId?: number) {
    const params = communauteId ? `?communaute_culte=${communauteId}` : "";
    const response = await api.get(`/departements/${params}`);
    return response.data;
    }

    export async function createDepartement(data: any) {
    const response = await api.post("/departements/", data);
    return response.data;
    }

    export async function updateDepartement(id: number, data: any) {
    const response = await api.put(`/departements/${id}/`, data);
    return response.data;
    }

    export async function deleteDepartement(id: number) {
    await api.delete(`/departements/${id}/`);
    }