import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";

const API_URL = process.env.EXPO_PUBLIC_API_URL || "https://mi-control.onrender.com/api";

export const api = axios.create({
    baseURL: API_URL,
});

// ✅ Utilise "accessToken" comme dans LoginScreen
api.interceptors.request.use(async (config) => {
    const token = await AsyncStorage.getItem("accessToken");
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

// ✅ Rafraîchir le token si expiré
api.interceptors.response.use(
    (response) => response,
    async (error) => {
        const original = error.config;
        if (error.response?.status === 401 && !original._retry) {
            original._retry = true;
            try {
                const refresh = await AsyncStorage.getItem("refreshToken");
                if (refresh) {
                    const res = await axios.post(`${API_URL}/token/refresh/`, { refresh });
                    const newToken = res.data.access;
                    await AsyncStorage.setItem("accessToken", newToken);
                    original.headers.Authorization = `Bearer ${newToken}`;
                    return api(original);
                }
            } catch {
                await AsyncStorage.removeItem("accessToken");
                await AsyncStorage.removeItem("refreshToken");
            }
        }
        return Promise.reject(error);
    }
);