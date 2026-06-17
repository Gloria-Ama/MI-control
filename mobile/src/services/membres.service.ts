    import { api } from "./api";

    export async function getMembres(filtres?: {
    search?: string;
    departement?: number;
    sexe?: string;
    statut?: string;
    communaute_culte?: number;
    }) {
    const params = new URLSearchParams();
    if (filtres?.search) params.append("search", filtres.search);
    if (filtres?.departement) params.append("departement", String(filtres.departement));
    if (filtres?.sexe) params.append("sexe", filtres.sexe);
    if (filtres?.statut) params.append("statut", filtres.statut);
    if (filtres?.communaute_culte) params.append("communaute_culte", String(filtres.communaute_culte));

    const response = await api.get(`/membres/?${params.toString()}`);
    return response.data;
    }

    export async function getMembreById(id: number) {
    const response = await api.get(`/membres/${id}/`);
    return response.data;
    }

    export async function getHistoriquePresences(membreId: number) {
    const response = await api.get(`/membres/${membreId}/presences/`);
    return response.data;
    }

    export async function getAnniversaires(periode: "aujourd_hui" | "demain" | "semaine") {
    const response = await api.get(`/membres/anniversaires/?periode=${periode}`);
    return response.data;
    }

    export async function getMembresAbsents(semaines = 3) {
    const response = await api.get(`/membres/absents/?semaines=${semaines}`);
    return response.data;
    }

    export async function createMembre(data: any) {
    const response = await api.post("/membres/", data);
    return response.data;
    }

    export async function updateMembre(id: number, data: any) {
    const response = await api.put(`/membres/${id}/`, data);
    return response.data;
    }

    export async function deleteMembre(id: number) {
    await api.delete(`/membres/${id}/`);
    }