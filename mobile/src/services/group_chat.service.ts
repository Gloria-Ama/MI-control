    import { api } from "./api";

    export async function getMessagesGroupe(communaute_culte?: number) {
    const params = communaute_culte ? `?communaute_culte=${communaute_culte}` : "";
    const response = await api.get(`/messages-groupe/${params}`);
    return response.data;
    }

    export async function envoyerMessageGroupe(data: {
    contenu: string;
    communaute_culte?: number;
    tous_les_cultes?: boolean;
    }) {
    const response = await api.post("/messages-groupe/", {
        ...data,
        type: "texte",
    });
    return response.data;
    }

    export async function envoyerImageGroupe(
    imageUri: string,
    communaute_culte?: number
    ) {
    const formData = new FormData();
    const filename = imageUri.split("/").pop() ?? "image.jpg";
    const ext = filename.split(".").pop()?.toLowerCase() ?? "jpg";
    const mimeType = ext === "png" ? "image/png" : "image/jpeg";

    formData.append("fichier", {
        uri: imageUri,
        name: filename,
        type: mimeType,
    } as any);
    formData.append("type", "image");
    if (communaute_culte) formData.append("communaute_culte", String(communaute_culte));

    const response = await api.post("/messages-groupe/", formData, {
        headers: { "Content-Type": "multipart/form-data" },
    });
    return response.data;
    }

    export async function envoyerFichierGroupe(
    fileUri: string,
    fileName: string,
    mimeType: string,
    communaute_culte?: number
    ) {
    const formData = new FormData();
    formData.append("fichier", {
        uri: fileUri,
        name: fileName,
        type: mimeType,
    } as any);
    formData.append("type", "fichier");
    if (communaute_culte) formData.append("communaute_culte", String(communaute_culte));

    const response = await api.post("/messages-groupe/", formData, {
        headers: { "Content-Type": "multipart/form-data" },
    });
    return response.data;
    }

    export async function creerSondage(data: {
    question: string;
    options: string[];
    communaute_culte?: number;
    }) {
    const formData = new FormData();
    formData.append("type", "sondage");
    formData.append("question", data.question);
    data.options.forEach(opt => formData.append("options", opt));
    if (data.communaute_culte) formData.append("communaute_culte", String(data.communaute_culte));

    const response = await api.post("/messages-groupe/", formData, {
        headers: { "Content-Type": "multipart/form-data" },
    });
    return response.data;
    }

    export async function voterSondage(optionId: number) {
    const response = await api.post("/messages-groupe/voter/", { option_id: optionId });
    return response.data;
    }

    // ── Messages privés avec photo/fichier ────────────────────────────────────────

    export async function envoyerImagePrivee(
    destinataireId: number,
    imageUri: string
    ) {
    const formData = new FormData();
    const filename = imageUri.split("/").pop() ?? "image.jpg";
    const ext = filename.split(".").pop()?.toLowerCase() ?? "jpg";
    formData.append("fichier", {
        uri: imageUri,
        name: filename,
        type: ext === "png" ? "image/png" : "image/jpeg",
    } as any);
    formData.append("destinataire", String(destinataireId));
    formData.append("type", "image");

    const response = await api.post("/messages/", formData, {
        headers: { "Content-Type": "multipart/form-data" },
    });
    return response.data;
    }