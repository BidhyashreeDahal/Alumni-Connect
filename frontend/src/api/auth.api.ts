import api from "./client";

export async function claimAccount(
    token: string,
    password: string,
    acceptTerms: boolean,
    consentVersion = "v1"
) {
    const res = await api.post(`/auth/claim`, { token, password, acceptTerms, consentVersion });
    return res.data as {
        message: string;
        user: { id: string; email: string; role: "admin" | "faculty" | "alumni" | "student" };
    };
}