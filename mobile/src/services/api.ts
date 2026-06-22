    import axios from "axios";
    import AsyncStorage from "@react-native-async-storage/async-storage";

    const api = axios.create({
    baseURL: "http://192.168.2.14:8000/api",
    });

    // Intercepteur : ajoute automatiquement le token JWT à chaque requête
    api.interceptors.request.use(async (config) => {
    const token = await AsyncStorage.getItem("access_token");
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
    });

    export { api };