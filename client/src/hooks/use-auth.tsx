import { createContext, ReactNode, useContext, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { type PublicUser } from "@shared/schema";
import { api } from "@shared/routes";
import { useToast } from "@/hooks/use-toast";
import { supabase, supabaseConfigured } from "@/lib/supabase";
import { useLocation } from "wouter";

type RegisterInput = {
  username: string;
  email: string;
  password: string;
  name: string;
};

type AuthMutationResult = {
  user: PublicUser | null;
  needsEmailConfirmation: boolean;
};

type LogoutInput = {
  reason?: "expired";
};

type AuthContextType = {
  user: PublicUser | null;
  isLoading: boolean;
  error: Error | null;
  loginMutation: ReturnType<typeof useLoginMutation>;
  logoutMutation: ReturnType<typeof useLogoutMutation>;
  registerMutation: ReturnType<typeof useRegisterMutation>;
};

const AuthContext = createContext<AuthContextType | null>(null);
const authQueryKey = [api.auth.me.path];
const SESSION_TIMEOUT_MS = 15 * 60 * 1000;
const SESSION_WARNING_MS = 2 * 60 * 1000;
const SESSION_STARTED_AT_KEY = "lumiere.session.startedAt";

async function readErrorMessage(response: Response, fallback: string) {
  const payload = await response.json().catch(() => null) as { message?: unknown } | null;
  return typeof payload?.message === "string" ? payload.message : fallback;
}

async function createAppSession(accessToken: string): Promise<PublicUser> {
  const response = await fetch(api.auth.session.path, {
    method: api.auth.session.method,
    headers: { Authorization: `Bearer ${accessToken}` },
  });
  if (!response.ok) {
    throw new Error(await readErrorMessage(response, "Could not load your account profile."));
  }
  return response.json();
}

function useLoginMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (credentials: { email: string; password: string }): Promise<AuthMutationResult> => {
      if (!supabase) throw new Error("Supabase Auth is not configured. Add the project URL and publishable key to .env, then restart the dev server.");
      const { data, error } = await supabase.auth.signInWithPassword(credentials);
      if (error) throw new Error(error.message);
      if (!data.session) throw new Error("Sign-in did not return a session. Confirm your email, then try again.");
      return { user: await createAppSession(data.session.access_token), needsEmailConfirmation: false };
    },
    onSuccess: ({ user }) => {
      sessionStorage.setItem(SESSION_STARTED_AT_KEY, String(Date.now()));
      queryClient.setQueryData(authQueryKey, user);
    },
  });
}

function useRegisterMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (form: RegisterInput): Promise<AuthMutationResult> => {
      if (!supabase) throw new Error("Supabase Auth is not configured. Add the project URL and publishable key to .env, then restart the dev server.");
      const { data, error } = await supabase.auth.signUp({
        email: form.email,
        password: form.password,
        options: {
          emailRedirectTo: `${window.location.origin}/auth`,
          data: { username: form.username, name: form.name },
        },
      });
      if (error) throw new Error(error.message);
      if (!data.session) return { user: null, needsEmailConfirmation: true };
      // Keep registration separate from login even if Supabase has Confirm
      // email disabled. This makes the post-registration flow predictable.
      await supabase.auth.signOut();
      return { user: null, needsEmailConfirmation: false };
    },
    onSuccess: ({ user }) => queryClient.setQueryData(authQueryKey, user),
  });
}

function useLogoutMutation() {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const [, setLocation] = useLocation();
  return useMutation({
    mutationFn: async (_input?: LogoutInput) => {
      const { error } = supabase ? await supabase.auth.signOut() : { error: null };
      await fetch(api.auth.logout.path, { method: api.auth.logout.method });
      if (error) throw new Error(error.message);
    },
    onSuccess: (_data, variables) => {
      sessionStorage.removeItem(SESSION_STARTED_AT_KEY);
      queryClient.setQueryData(authQueryKey, null);
      setLocation("/");
      toast({
        title: variables?.reason === "expired" ? "Session expired" : "Logged out successfully",
        description: variables?.reason === "expired"
          ? "For your security, your 15-minute session has ended. Sign in again to continue."
          : undefined,
      });
    },
    onError: () => toast({ title: "Logout failed", variant: "destructive" }),
  });
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const { toast } = useToast();
  const { data: user, error, isLoading } = useQuery<PublicUser | null>({
    queryKey: authQueryKey,
    queryFn: async () => {
      if (supabase) {
        const { data, error: sessionError } = await supabase.auth.getSession();
        if (sessionError) throw new Error(sessionError.message);
        if (data.session) return createAppSession(data.session.access_token);
      } else if (!supabaseConfigured) {
        return null;
      }

      const response = await fetch(api.auth.me.path);
      if (response.status === 401) return null;
      if (!response.ok) throw new Error("Failed to fetch user");
      return response.json();
    },
  });

  const loginMutation = useLoginMutation();
  const registerMutation = useRegisterMutation();
  const logoutMutation = useLogoutMutation();

  useEffect(() => {
    if (!user) {
      sessionStorage.removeItem(SESSION_STARTED_AT_KEY);
      return;
    }

    const storedStart = Number(sessionStorage.getItem(SESSION_STARTED_AT_KEY));
    const startedAt = Number.isFinite(storedStart) && storedStart > 0 ? storedStart : Date.now();
    sessionStorage.setItem(SESSION_STARTED_AT_KEY, String(startedAt));

    const remainingMs = Math.max(0, SESSION_TIMEOUT_MS - (Date.now() - startedAt));
    const warningTimer = window.setTimeout(() => {
      toast({
        title: "Session ending soon",
        description: "You will be logged out in 2 minutes. Please finish or submit your booking.",
        variant: "destructive",
      });
    }, Math.max(0, remainingMs - SESSION_WARNING_MS));
    const logoutTimer = window.setTimeout(() => logoutMutation.mutate({ reason: "expired" }), remainingMs);

    return () => {
      window.clearTimeout(warningTimer);
      window.clearTimeout(logoutTimer);
    };
  }, [user, logoutMutation, toast]);

  return (
    <AuthContext.Provider value={{
      user: user ?? null,
      isLoading,
      error: error instanceof Error ? error : null,
      loginMutation,
      logoutMutation,
      registerMutation,
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within an AuthProvider");
  return context;
}
