    import { api } from "./api";

    export async function getPresences(date?: string) {
    const params = new URLSearchParams();
    if (date) params.append("date", date);
    const response = await api.get(`/presences/?${params.toString()}`);
    return response.data;
    }

    export async function createPresence(data: any) {
    const response = await api.post("/presences/", data);
    return response.data;
    }

    export async function updatePresence(id: number, data: any) {
    const response = await api.put(`/presences/${id}/`, data);
    return response.data;
    }

    export async function enregistrerPresencesBulk(presences: {
    membre: number;
    date: string;
    present: boolean;
    communaute_culte: number;
    }[]) {
    const response = await api.post("/presences/bulk/", { presences });
    return response.data;
    }