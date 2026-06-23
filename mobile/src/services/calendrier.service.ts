    import { api } from "./api";

    export async function getEvenements(filtres?: {
    communaute_culte?: number;
    mois?: number;
    annee?: number;
    a_venir?: boolean;
    }) {
    const params = new URLSearchParams();
    if (filtres?.communaute_culte) params.append("communaute_culte", String(filtres.communaute_culte));
    if (filtres?.mois) params.append("mois", String(filtres.mois));
    if (filtres?.annee) params.append("annee", String(filtres.annee));
    if (filtres?.a_venir) params.append("a_venir", "true");
    const response = await api.get(`/evenements/?${params.toString()}`);
    return response.data;
    }

    export async function createEvenement(data: any) {
    const response = await api.post("/evenements/", data);
    return response.data;
    }

    export async function updateEvenement(id: number, data: any) {
    const response = await api.put(`/evenements/${id}/`, data);
    return response.data;
    }

    export async function deleteEvenement(id: number) {
    await api.delete(`/evenements/${id}/`);
    }