    import { api } from "./api";

    export async function getBudgets(communaute_culte?: number, annee?: number) {
    const params = new URLSearchParams();
    if (communaute_culte) params.append("communaute_culte", String(communaute_culte));
    if (annee) params.append("annee", String(annee));
    const response = await api.get(`/budgets/?${params.toString()}`);
    return response.data;
    }

    export async function createBudget(data: {
    communaute_culte: number;
    annee: number;
    montant_total: number;
    notes?: string;
    }) {
    const response = await api.post("/budgets/", data);
    return response.data;
    }

    export async function updateBudget(id: number, data: any) {
    const response = await api.put(`/budgets/${id}/`, data);
    return response.data;
    }

    export async function getLignes(budget_id: number) {
    const response = await api.get(`/lignes-budget/?budget=${budget_id}`);
    return response.data;
    }

    export async function createLigne(data: {
    budget: number;
    categorie: string;
    description: string;
    montant_prevu: number;
    montant_realise?: number;
    departement?: number | null;
    notes?: string;
    }) {
    const response = await api.post("/lignes-budget/", data);
    return response.data;
    }

    export async function updateLigne(id: number, data: any) {
    const response = await api.put(`/lignes-budget/${id}/`, data);
    return response.data;
    }

    export async function deleteLigne(id: number) {
    await api.delete(`/lignes-budget/${id}/`);
    }