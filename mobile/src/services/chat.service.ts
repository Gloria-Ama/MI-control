    import { api } from "./api";

    export async function getConversations() {
    const response = await api.get("/messages/conversations/");
    return response.data;
    }

    export async function getMessages(avecUserId: number) {
    const response = await api.get(`/messages/?avec=${avecUserId}`);
    return response.data;
    }

    export async function envoyerMessage(destinataire: number, contenu: string) {
    const response = await api.post("/messages/", { destinataire, contenu });
    return response.data;
    }

    export async function envoyerMessageGroupe(contenu: string) {
    const response = await api.post("/messages/groupe/", { contenu });
    return response.data;
    }

    export async function marquerLus(expediteurId: number) {
    const response = await api.post("/messages/marquer-lus/", { expediteur_id: expediteurId });
    return response.data;
    }

    export async function getChatNonLus() {
    const response = await api.get("/messages/non-lus/");
    return response.data;
    }