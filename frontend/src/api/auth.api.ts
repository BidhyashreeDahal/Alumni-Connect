import api from "./client";

export async function claimAccount(token: string, password: string) {
    const res = await api.post(`/auth/claim`, { token, password });
    return res.data as {
        message: string;
        user: { id: string; email: string; role: "admin" | "faculty" | "alumni" };
    };
}