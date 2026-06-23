    import { api } from "./api";

    export async function getResponsables() {
    const response = await api.get("/responsables/");
    return response.data;
    }

    export async function createResponsable(data: {
    username: string;
    password: string;
    email?: string;
    role: string;
    communaute_culte?: number;
    departement?: number | null;
    actif?: boolean;
    }) {
    const response = await api.post("/responsables/", data);
    return response.data;
    }

    export async function updateResponsable(id: number, data: {
    email?: string;
    role?: string;
    communaute_culte?: number;
    departement?: number | null;
    actif?: boolean;
    }) {
    const response = await api.put(`/responsables/${id}/`, data);
    return response.data;
    }

    export async function reinitialiserMotDePasse(id: number, mot_de_passe: string) {
    const response = await api.post(`/responsables/${id}/reinitialiser-mot-de-passe/`, { mot_de_passe });
    return response.data;
    }

    export async function toggleActif(id: number) {
    const response = await api.post(`/responsables/${id}/toggle-actif/`);
    return response.data;
    }

    export async function deleteResponsable(id: number) {
    await api.delete(`/responsables/${id}/`);
    }