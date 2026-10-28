import { apiRequest } from "./client";
import { invalidateLive } from "./live-store";

export interface AuthContextResponse {
  user: {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
    displayName: string | null;
    status: "PENDING_VERIFICATION" | "ACTIVE" | "SUSPENDED" | "DEACTIVATED";
    registrationIntent: "TALENT" | "COMPANY_OWNER" | null;
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

export interface CompanyRegistrationInput {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  organisationName: string;
  acceptTerms: true;
}

export const authApi = {
  registerCompany: (input: CompanyRegistrationInput) => apiRequest<{
    userId: string;
    accountType: "COMPANY_OWNER";
    organisationId: string;
    nextStep: "VERIFY_EMAIL";
  }>("/api/v1/auth/register", {
    method: "POST",
    idempotent: true,
    body: { accountType: "COMPANY_OWNER", ...input },
  }),
  login: (input: LoginInput) => apiRequest<{ user: AuthContextResponse["user"]; session: { expiresAt: string } }>("/api/v1/auth/login", { method: "POST", body: input }),
  current: () => apiRequest<AuthContextResponse>("/api/v1/auth/me"),
  completeTwoFactor: (code: string) => apiRequest<{ authenticated: true }>("/api/v1/auth/2fa/challenge", { method: "POST", body: { code } }),
  startTwoFactorSetup: () => apiRequest<{ secret: string; otpauthUrl: string; setupToken: string }>("/api/v1/auth/2fa/setup", { method: "POST" }),
  confirmTwoFactorSetup: (code: string, setupToken: string) => apiRequest<{ enabled: true; recoveryCodes: string[] }>("/api/v1/auth/2fa/confirm", { method: "POST", body: { code, setupToken } }),
  disableTwoFactor: (password: string, code: string) => apiRequest<{ enabled: false }>("/api/v1/auth/2fa/disable", { method: "POST", body: { password, code } }),
  forgotPassword: (email: string) => apiRequest<{ accepted: true }>("/api/v1/auth/password/forgot", { method: "POST", body: { email } }),
  resendVerification: (email: string) => apiRequest<{ accepted: true }>("/api/v1/auth/email/resend", { method: "POST", body: { email } }),
  resetPassword: (token: string, password: string) => apiRequest<{ reset: true }>("/api/v1/auth/password/reset", { method: "POST", body: { token, password } }),
  changePassword: (currentPassword: string, newPassword: string) => apiRequest<{ changed: true }>("/api/v1/auth/password/change", { method: "POST", body: { currentPassword, newPassword } }),
  sessions: () => apiRequest<{ sessions: Array<{ id: string; current: boolean; deviceLabel: string | null; lastSeenAt: string; expiresAt: string }> }>("/api/v1/auth/sessions"),
  revokeSession: (sessionId: string) => apiRequest<void>(`/api/v1/auth/sessions/${sessionId}`, { method: "DELETE" }),
  logout: async () => {
    await apiRequest<void>("/api/v1/auth/logout", { method: "POST" });
    invalidateLive();
  },
  oauthStart: async (
    provider: "google" | "linkedin",
    options: { mode: "login" | "talent_signup"; acceptTerms?: boolean; next?: string },
  ) => {
    const redirectTo = new URL("/auth/oauth-callback", window.location.origin).toString();
    window.sessionStorage.setItem("oreno:oauth-next", options.next || "/talent");
    const result = await apiRequest<{ authorizationUrl: string }>(`/api/v1/auth/oauth/${provider}/start`, {
      query: {
        redirectTo,
        mode: options.mode,
        acceptTerms: options.acceptTerms ? "true" : "false",
      },
    });
    window.location.assign(result.authorizationUrl);
  },
};
