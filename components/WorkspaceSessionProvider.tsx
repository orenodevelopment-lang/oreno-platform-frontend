"use client";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { authApi, type AuthContextResponse } from "@/lib/api/auth";
import { ApiClientError } from "@/lib/api/client";
import { disconnectMessagingSocket } from "@/lib/api/socket";
import { invalidateLive } from "@/lib/api/live-store";
type SessionState = {
  session?: AuthContextResponse;
  error?: Error;
  loading: boolean;
};
const Context = createContext<SessionState & { refresh: () => Promise<void> }>({
  loading: true,
  refresh: async () => {},
});
export function WorkspaceSessionProvider({
  children,
}: {
  children: ReactNode;
}) {
  const [state, setState] = useState<SessionState>({ loading: true });
  const pending = useRef<Promise<void> | undefined>(undefined);
  const generation = useRef(0);
  const lastChecked = useRef(0);
  const refresh = useCallback(() => {
    if (pending.current) return pending.current;
    if (Date.now() - lastChecked.current < 30_000) return Promise.resolve();
    const version = generation.current;
    pending.current = authApi
      .current()
      .then((session) => {
        if (version !== generation.current) return;
        lastChecked.current = Date.now();
        setState({ session, loading: false });
      })
      .catch((cause: unknown) => {
        if (version !== generation.current) return;
        const error =
          cause instanceof Error
            ? cause
            : new Error("Your session could not be checked.");
        setState((previous) => ({
          session:
            cause instanceof ApiClientError && cause.status === 401
              ? undefined
              : previous.session,
          error,
          loading: false,
        }));
      })
      .finally(() => {
        if (version === generation.current) pending.current = undefined;
      });
    return pending.current;
  }, []);
  useEffect(() => {
    const clear = () => {
      disconnectMessagingSocket();
      generation.current += 1;
      pending.current = undefined;
      lastChecked.current = 0;
      invalidateLive();
      setState({
        loading: false,
        error: new ApiClientError({
          status: 401,
          code: "SESSION_EXPIRED",
          message: "Please sign in again.",
        }),
      });
    };
    const changed = () => {
      generation.current += 1;
      pending.current = undefined;
      lastChecked.current = 0;
      invalidateLive();
      setState({ loading: true });
      void refresh();
    };
    window.addEventListener("oreno:session-expired", clear);
    window.addEventListener("oreno:auth-changed", changed);
    return () => {
      window.removeEventListener("oreno:session-expired", clear);
      window.removeEventListener("oreno:auth-changed", changed);
    };
  }, [refresh]);
  return (
    <Context.Provider value={{ ...state, refresh }}>
      {children}
    </Context.Provider>
  );
}
export const useWorkspaceSession = () => useContext(Context);
