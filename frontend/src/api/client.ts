import axios from "axios";
import { API_BASE_URL, attachCsrfInterceptor } from "@/lib/http";

const api = axios.create({
    baseURL: API_BASE_URL,
    withCredentials: true,
    headers: {
        "Content-Type": "application/json",
    },
});

attachCsrfInterceptor(api);

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
    getMyRequests: async (params?: Record<string, any>) => {
        const response = await api.get("/mentorship/my", { params });
        return response.data;
    },

  getPopularMentors: async () => {
    const response = await api.get("/mentorship/popular-mentors");
    return response.data;
  },

    getIncomingRequests: async (params?: Record<string, any>) => {
        const response = await api.get("/mentorship/requests", { params });
        return response.data;
    },

    accept: async (id: string) => {
        const response = await api.patch(`/mentorship/${id}/accept`);
        return response.data;
    },

    reject: async (id: string) => {
        const response = await api.patch(`/mentorship/${id}/reject`);
        return response.data;
    },

    complete: async (id: string) => {
        const response = await api.patch(`/mentorship/${id}/complete`);
        return response.data;
    },

    schedule: async (id: string, data: { scheduledAt: string; meetingLink: string; meetingNotes?: string }) => {
        const response = await api.patch(`/mentorship/${id}/schedule`, data);
        return response.data;
    },

    confirm: async (id: string) => {
        const response = await api.patch(`/mentorship/${id}/confirm`);
        return response.data;
    },

    submitFeedback: async (id: string, data: { rating: number; comment?: string }) => {
        const response = await api.post(`/mentorship/${id}/feedback`, data);
        return response.data;
    },

    cancelRequest: async (id: string) => {
        const response = await api.patch(`/mentorship/${id}/cancel`);
        return response.data;
    },
};

export const usersAPI = {
    list: async (params?: Record<string, any>) => {
        const response = await api.get("/users", { params });
        return response.data;
    },

    update: async (id: string, data: any) => {
        const response = await api.patch(`/users/${id}`, data);
        return response.data;
    },
};

export const auditLogsAPI = {
    list: async (params?: Record<string, any>) => {
        const response = await api.get("/audit-logs", { params });
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

export const remindersAPI = {
    getMyReminders: async () => {
        const response = await api.get("/reminders/me");
        return response.data;
    },
};

export const eventsAPI = {
    list: async (params?: Record<string, any>) => {
        const response = await api.get("/events", { params });
        return response.data;
    },

    create: async (data: any) => {
        const response = await api.post("/events", data);
        return response.data;
    },

    update: async (id: string, data: any) => {
        const response = await api.patch(`/events/${id}`, data);
        return response.data;
    },

    remove: async (id: string) => {
        const response = await api.delete(`/events/${id}`);
        return response.data;
    },

    register: async (id: string) => {
        const response = await api.post(`/events/${id}/register`);
        return response.data;
    },

    cancelRegistration: async (id: string) => {
        const response = await api.patch(`/events/${id}/register/cancel`);
        return response.data;
    },
};

export const announcementsAPI = {
    list: async (params?: Record<string, any>) => {
        const response = await api.get("/announcements", { params });
        return response.data;
    },

    create: async (data: any) => {
        const response = await api.post("/announcements", data);
        return response.data;
    },

    update: async (id: string, data: any) => {
        const response = await api.put(`/announcements/${id}`, data);
        return response.data;
    },

    remove: async (id: string) => {
        const response = await api.delete(`/announcements/${id}`);
        return response.data;
    },
};

export default api;