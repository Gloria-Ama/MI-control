    import { api } from "./api";

    // ─── Demandes ─────────────────────────────────────────────────────────────────

    export async function getDemandes(filtres?: {
    statut?: string;
    type?: string;
    communaute_culte?: number;
    }) {
    const params = new URLSearchParams();
    if (filtres?.statut) params.append("statut", filtres.statut);
    if (filtres?.type) params.append("type", filtres.type);
    if (filtres?.communaute_culte) params.append("communaute_culte", String(filtres.communaute_culte));
    const response = await api.get(`/finances/?${params.toString()}`);
    return response.data;
    }

    export async function createDemande(data: any) {
    const response = await api.post("/finances/", data);
    return response.data;
    }

    export async function approuverDemande(id: number, notes?: string) {
    const response = await api.post(`/finances/${id}/approuver/`, { notes: notes ?? "" });
    return response.data;
    }

    export async function refuserDemande(id: number, notes?: string) {
    const response = await api.post(`/finances/${id}/refuser/`, { notes: notes ?? "" });
    return response.data;
    }

    export async function rembourserDemande(id: number) {
    const response = await api.post(`/finances/${id}/rembourser/`);
    return response.data;
    }

    export async function deleteDemande(id: number) {
    await api.delete(`/finances/${id}/`);
    }

    // ─── Transactions (comptabilité) ──────────────────────────────────────────────

    export async function getTransactions(filtres?: {
    communaute_culte?: number;
    type?: string;
    date_debut?: string;
    date_fin?: string;
    }) {
    const params = new URLSearchParams();
    if (filtres?.communaute_culte) params.append("communaute_culte", String(filtres.communaute_culte));
    if (filtres?.type) params.append("type", filtres.type);
    if (filtres?.date_debut) params.append("date_debut", filtres.date_debut);
    if (filtres?.date_fin) params.append("date_fin", filtres.date_fin);
    const response = await api.get(`/transactions/?${params.toString()}`);
    return response.data;
    }

    export async function createTransaction(data: any) {
    const response = await api.post("/transactions/", data);
    return response.data;
    }

    export async function deleteTransaction(id: number) {
    await api.delete(`/transactions/${id}/`);
    }

    export async function getResume(communaute_culte?: number) {
    const params = communaute_culte ? `?communaute_culte=${communaute_culte}` : "";
    const response = await api.get(`/transactions/resume/${params}`);
    return response.data;
    }