    import { api } from "./api";

    export async function getSuivisPastoraux(filtres?: {
    membre?: number;
    statut?: string;
    categorie?: string;
    }) {
    const params = new URLSearchParams();
    if (filtres?.membre) params.append("membre", String(filtres.membre));
    if (filtres?.statut) params.append("statut", filtres.statut);
    if (filtres?.categorie) params.append("categorie", filtres.categorie);
    const response = await api.get(`/suivis-pastoraux/?${params.toString()}`);
    return response.data;
    }

    export async function createSuivi(data: {
    membre: number;
    categorie: string;
    titre: string;
    notes: string;
    statut?: string;
    confidentiel?: boolean;
    date_suivi_prochain?: string;
    }) {
    const response = await api.post("/suivis-pastoraux/", data);
    return response.data;
    }

    export async function updateSuivi(id: number, data: any) {
    const response = await api.put(`/suivis-pastoraux/${id}/`, data);
    return response.data;
    }

    export async function changerStatut(id: number, statut: string) {
    const response = await api.post(`/suivis-pastoraux/${id}/changer-statut/`, { statut });
    return response.data;
    }

    export async function deleteSuivi(id: number) {
    await api.delete(`/suivis-pastoraux/${id}/`);
    }