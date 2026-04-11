import { apiFetch, clearToken } from "./client";

export interface User {
  id: number;
  email: string;
  name: string;
}

export interface CoupleInfo {
  id: number;
  status: "pending" | "active";
  inviteCode: string | null;
  partnerName: string | null;
}

export interface MeResponse {
  user: User;
  couple: CoupleInfo | null;
}

export async function apiSignup(email: string, password: string, name: string) {
  return apiFetch<{ user: User }>("/api/auth/signup", {
    method: "POST",
    body: JSON.stringify({ email, password, name }),
  });
}

export async function apiLogin(email: string, password: string) {
  return apiFetch<{ user: User }>("/api/auth/login", {
    method: "POST",
    body: JSON.stringify({ email, password }),
  });
}

export async function apiLogout() {
  await apiFetch("/api/auth/logout", { method: "POST" });
  await clearToken();
}

export async function apiGetMe() {
  return apiFetch<MeResponse>("/api/auth/me");
}

export async function apiCreateInvite() {
  return apiFetch<{ inviteCode: string }>("/api/couples/invite", {
    method: "POST",
  });
}

export async function apiJoinCouple(code: string) {
  return apiFetch<{ ok: boolean; coupleId: number }>("/api/couples/join", {
    method: "POST",
    body: JSON.stringify({ code }),
  });
}
