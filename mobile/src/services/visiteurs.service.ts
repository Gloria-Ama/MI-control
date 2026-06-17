    import { api } from "./api";

    export async function getVisiteurs(filtres?: {
    search?: string;
    statut?: string;
    }) {
    const params = new URLSearchParams();
    if (filtres?.search) params.append("search", filtres.search);
    if (filtres?.statut) params.append("statut", filtres.statut);
    const response = await api.get(`/visiteurs/?${params.toString()}`);
    return response.data;
    }

    export async function createVisiteur(data: any) {
    const response = await api.post("/visiteurs/", data);
    return response.data;
    }

    export async function updateVisiteur(id: number, data: any) {
    const response = await api.put(`/visiteurs/${id}/`, data);
    return response.data;
    }

    export async function deleteVisiteur(id: number) {
    await api.delete(`/visiteurs/${id}/`);
    }

    // Convertir un visiteur en membre
    export async function convertirEnMembre(visiteur: any) {
    const response = await api.post("/membres/", {
        nom: visiteur.nom,
        telephone: visiteur.telephone,
        email: visiteur.email,
        sexe: visiteur.sexe,
        statut: "actif",
        notes: `Ancien visiteur. Première visite : ${visiteur.date_premiere_visite}`,
        communaute_culte: visiteur.communaute_culte,
    });
    // Supprimer le visiteur après conversion
    await api.delete(`/visiteurs/${visiteur.id}/`);
    return response.data;
    }