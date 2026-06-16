import { api } from "./api";

export async function getDepartements() {
    const response = await api.get("/departements/");
    return response.data;
}