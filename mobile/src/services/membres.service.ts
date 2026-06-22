    import { api } from "./api";
    import { requeteAvecCache } from "./offline.service";

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

    const cle = `membres_${params.toString() || "tous"}`;
    const { donnees } = await requeteAvecCache(
        cle,
        () => api.get(`/membres/?${params.toString()}`).then(r => r.data),
    );
    return donnees;
    }

    export async function getMembreById(id: number) {
    const { donnees } = await requeteAvecCache(
        `membre_${id}`,
        () => api.get(`/membres/${id}/`).then(r => r.data),
    );
    return donnees;
    }

    export async function getHistoriquePresences(membreId: number) {
    const response = await api.get(`/membres/${membreId}/presences/`);
    return response.data;
    }

    export async function getAnniversaires(periode: "aujourd_hui" | "demain" | "semaine") {
    const { donnees } = await requeteAvecCache(
        `anniversaires_${periode}`,
        () => api.get(`/membres/anniversaires/?periode=${periode}`).then(r => r.data),
    );
    return donnees;
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