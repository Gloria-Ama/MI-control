import { api } from "./api";

export async function getProfilConnecte() {
    const response = await api.get("/me/");
    return response.data;
}