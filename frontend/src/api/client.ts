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
        const response = await api.get("/directory");
        return response.data;
    },

    getById: async (id: string) => {
        const response = await api.get(`/profiles/${id}`);
        return response.data;
    },

    getMe: async () => {
        const response = await api.get("/auth/me");
        return response.data;
    },

    updateMe: async (data: any) => {
        const response = await api.put("/alumni/me", data);
        return response.data;
    },

    create: async (data: any) => {
        const response = await api.post("/alumni", data);
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

    cancelRequest: async (id: string) => {
        const response = await api.patch(`/mentorship/${id}/cancel`);
        return response.data;
    },
};

export const usersAPI = {
    list: async () => {
        const response = await api.get("/users");
        return response.data;
    },

    update: async (id: string, data: any) => {
        const response = await api.patch(`/users/${id}`, data);
        return response.data;
    },
};

export const invitesAPI = {
    list: async (params?: Record<string, any>) => {
        const response = await api.get("/invites", { params });
        return response.data;
    },

    create: async (data: { profileId: string; type: "alumni" | "student" }) => {
        const response = await api.post("/invites", data);
        return response.data;
    },

    reissue: async (data: { profileId: string; type: "alumni" | "student" }) => {
        const response = await api.post("/invites/reissue", data);
        return response.data;
    },
};

export default api;