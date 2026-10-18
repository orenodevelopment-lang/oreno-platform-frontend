import { apiRequest } from "./client";
import { invalidateLive } from "./live-store";

export interface AuthContextResponse {
  user: {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
    displayName: string | null;
    twoFactorEnabled: boolean;
  };
  context: {
    organisationId: string | null;
    organisationRole: string | null;
    isPlatformAdmin: boolean;
    platformRoles: string[];
    permissions: string[];
    mfaSatisfied: boolean;
    sessionExpiresAt: string | null;
  };
}

export interface LoginInput {
  email: string;
  password: string;
  twoFactorCode?: string;
  deviceLabel?: string;
}

export const authApi = {
  login: (input: LoginInput) => apiRequest<{ user: AuthContextResponse["user"]; session: { expiresAt: string } }>("/api/v1/auth/login", { method: "POST", body: input }),
  current: () => apiRequest<AuthContextResponse>("/api/v1/auth/me"),
  completeTwoFactor: (code: string) => apiRequest<{ authenticated: true }>("/api/v1/auth/2fa/challenge", { method: "POST", body: { code } }),
  forgotPassword: (email: string) => apiRequest<{ accepted: true }>("/api/v1/auth/password/forgot", { method: "POST", body: { email } }),
  resetPassword: (token: string, password: string) => apiRequest<{ reset: true }>("/api/v1/auth/password/reset", { method: "POST", body: { token, password } }),
  logout: async () => {
    await apiRequest<void>("/api/v1/auth/logout", { method: "POST" });
    invalidateLive();
  },
  oauthStart: async (provider: "google" | "linkedin", redirectTo = "/") => {
    const result = await apiRequest<{ authorizationUrl: string }>(`/api/v1/auth/oauth/${provider}/start`, { query: { redirectTo } });
    window.location.assign(result.authorizationUrl);
  },
};
