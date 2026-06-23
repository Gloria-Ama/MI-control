    import { api } from "./api";

    // ── Canaux ────────────────────────────────────────────────────────────────────

    export async function getCanaux() {
    const response = await api.get("/canaux/");
    return response.data;
    }

    export async function getCanal(id: number) {
    const response = await api.get(`/canaux/${id}/`);
    return response.data;
    }

    export async function creerGroupe(data: {
    nom: string;
    description?: string;
    membres: number[];
    communaute_culte?: number;
    }) {
    const response = await api.post("/canaux/", { ...data, type: "restreint" });
    return response.data;
    }

    export async function ouvrirConversationPrivee(userId: number) {
    const response = await api.post("/canaux/", {
        type: "prive",
        membres: [userId],
    });
    return response.data;
    }

    export async function initialiserCanalPrincipal(communaute_culte: number) {
    const response = await api.post("/canaux/initialiser-principal/", { communaute_culte });
    return response.data;
    }

    export async function ajouterMembre(canalId: number, userId: number) {
    const response = await api.post(`/canaux/${canalId}/ajouter-membre/`, { user_id: userId });
    return response.data;
    }

    export async function quitterCanal(canalId: number) {
    const response = await api.post(`/canaux/${canalId}/quitter/`);
    return response.data;
    }

    // ── Messages ──────────────────────────────────────────────────────────────────

    export async function getMessages(canalId: number) {
    const response = await api.get(`/messages-canal/?canal=${canalId}`);
    return response.data;
    }

    export async function envoyerMessage(canalId: number, contenu: string) {
    const response = await api.post("/messages-canal/", {
        canal: canalId,
        contenu,
        type: "texte",
    });
    return response.data;
    }

    export async function envoyerImage(canalId: number, imageUri: string) {
    const formData = new FormData();
    const filename = imageUri.split("/").pop() ?? "image.jpg";
    const ext = filename.split(".").pop()?.toLowerCase() ?? "jpg";
    formData.append("fichier", { uri: imageUri, name: filename, type: ext === "png" ? "image/png" : "image/jpeg" } as any);
    formData.append("canal", String(canalId));
    formData.append("type", "image");
    const response = await api.post("/messages-canal/", formData, {
        headers: { "Content-Type": "multipart/form-data" },
    });
    return response.data;
    }

    export async function envoyerFichier(canalId: number, fileUri: string, fileName: string, mimeType: string) {
    const formData = new FormData();
    formData.append("fichier", { uri: fileUri, name: fileName, type: mimeType } as any);
    formData.append("canal", String(canalId));
    formData.append("type", "fichier");
    const response = await api.post("/messages-canal/", formData, {
        headers: { "Content-Type": "multipart/form-data" },
    });
    return response.data;
    }

    export async function creerSondage(canalId: number, question: string, options: string[]) {
    const formData = new FormData();
    formData.append("canal", String(canalId));
    formData.append("type", "sondage");
    formData.append("question", question);
    options.forEach(opt => formData.append("options", opt));
    const response = await api.post("/messages-canal/", formData, {
        headers: { "Content-Type": "multipart/form-data" },
    });
    return response.data;
    }

    export async function marquerLus(canalId: number) {
    await api.post("/messages-canal/marquer-lus/", { canal_id: canalId });
    }

    export async function voter(optionId: number) {
    const response = await api.post("/messages-canal/voter/", { option_id: optionId });
    return response.data;
    }

    export async function getTotalNonLus() {
    const canaux = await getCanaux();
    return (canaux as any[]).reduce((acc: number, c: any) => acc + (c.non_lus ?? 0), 0);
    }