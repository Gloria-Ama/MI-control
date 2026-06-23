    import { api } from "./api";

    export async function getProfilConnecte() {
    const response = await api.get("/me/");
    return response.data;
    }

    export async function changerMotDePasse(ancien: string, nouveau: string) {
    const response = await api.post("/me/changer-mot-de-passe/", {
        ancien_mot_de_passe: ancien,
        nouveau_mot_de_passe: nouveau,
    });
    return response.data;
    }

    export async function updateProfil(data: {
    email?: string;
    first_name?: string;
    last_name?: string;
    }) {
    const response = await api.patch("/me/update/", data);
    return response.data;
    }