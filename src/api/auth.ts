import { apiFetch } from "./client";

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
