    import { api } from "./api";

    export async function getNotifications() {
    const response = await api.get("/notifications/");
    return response.data;
    }

    export async function getNonLues() {
    const response = await api.get("/notifications/non-lues/");
    return response.data;
    }

    export async function lireNotification(id: number) {
    const response = await api.post(`/notifications/${id}/lire/`);
    return response.data;
    }

    export async function marquerToutesLues() {
    const response = await api.post("/notifications/marquer-toutes-lues/");
    return response.data;
    }

    export async function genererNotifications() {
    const response = await api.post("/notifications/generer/");
    return response.data;
    }

    export async function deleteNotification(id: number) {
    await api.delete(`/notifications/${id}/`);
    }