    import axios from "axios";
    import AsyncStorage from "@react-native-async-storage/async-storage";

    export const api = axios.create({
    baseURL: "http://127.0.0.1:8000/api",
    });

    // Intercepteur : ajoute automatiquement le token JWT à chaque requête
    api.interceptors.request.use(async (config) => {
    const token = await AsyncStorage.getItem("accessToken");
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
    });

    // Intercepteur : gère l'expiration du token (401)
    api.interceptors.response.use(
    (response) => response,
    async (error) => {
        if (error.response?.status === 401) {
        await AsyncStorage.removeItem("accessToken");
        await AsyncStorage.removeItem("refreshToken");
        }
        return Promise.reject(error);
    }
    );