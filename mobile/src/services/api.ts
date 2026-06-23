    import axios from "axios";
    import AsyncStorage from "@react-native-async-storage/async-storage";

export const api = axios.create({
    baseURL: "https://mi-control.onrender.com/api",
});
    const api = axios.create({
    baseURL: "https://undamaged-tabloid-tweezers.ngrok-free.dev/api",
    });

    api.interceptors.request.use(async (config) => {
    const token = await AsyncStorage.getItem("accessToken");
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
    });

    export { api };