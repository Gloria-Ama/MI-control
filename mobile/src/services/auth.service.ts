    import AsyncStorage from "@react-native-async-storage/async-storage";
    import { api } from "./api";

    export async function getProfilConnecte() {
    const token = await AsyncStorage.getItem("accessToken");

    if (!token) {
        throw new Error("Aucun token trouvé. Reconnexion nécessaire.");
    }

    const response = await api.get("/me/", {
        headers: {
        Authorization: `Bearer ${token}`,
        },
    });

    return response.data;
    }