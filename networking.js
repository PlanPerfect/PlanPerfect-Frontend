import axios from "axios";

const instance = axios.create({
    baseURL: import.meta.env.VITE_BACKEND_URL,
})

instance.interceptors.request.use((config) => {
    if (!(config.data instanceof FormData)) {
        config.headers["Content-Type"] = "application/json";
    }
    config.headers["API_KEY"] = import.meta.env.VITE_API_KEY;
    return config;
}, (err) => {
    return Promise.reject(err);
})

export default instance;