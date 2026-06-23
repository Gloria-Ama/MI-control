import { api } from "./api";

export async function getStatsCroissance(communaute_culte?: number) {
    const params = communaute_culte ? `?communaute_culte=${communaute_culte}` : "";
    const response = await api.get(`/stats/croissance/${params}`);
    return response.data;
}