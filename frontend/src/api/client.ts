import axios from "axios";

const api = axios.create({
    baseURL: import.meta.env.VITE_API_URL || "http://localhost:5000",
    withCredentials: true,
    headers: {
        "Content-Type": "application/json",
    },
});

export const authAPI = {
    login: async (email: string, password: string) => {
        const response = await api.post("/auth/login", { email, password });
        return response.data;
    },

    me: async () => {
        const response = await api.get("/auth/me");
        return response.data;
    },

    logout: async () => {
        const response = await api.post("/auth/logout");
        return response.data;
    },
};

export const profilesAPI = {
    getAll: async () => {
        const response = await api.get("/profiles");
        return response.data;
    },

    getById: async (id: string) => {
        const response = await api.get(`/profiles/${id}`);
        return response.data;
    },

    getMe: async () => {
        const response = await api.get("/profiles/me");
        return response.data;
    },

    updateMe: async (data: any) => {
        const response = await api.patch("/profiles/me", data);
        return response.data;
    },

    create: async (data: any) => {
        const response = await api.post("/profiles", data);
        return response.data;
    },
};

export const analyticsAPI = {
    getDashboard: async () => {
        const response = await api.get("/analytics/dashboard");
        return response.data;
    },
};

export const mentorshipAPI = {
    getMyRequests: async () => {
        const response = await api.get("/mentorship/my");
        return response.data;
    },

    getIncomingRequests: async () => {
        const response = await api.get("/mentorship/requests");
        return response.data;
    },
};

export default api;