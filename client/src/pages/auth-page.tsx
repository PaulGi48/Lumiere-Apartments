import { useAuth } from "@/hooks/use-auth";
import { useLocation } from "wouter";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Layout } from "@/components/layout";
import { Loader2 } from "lucide-react";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

const loginSchema = z.object({
  identifier: z.string().trim().min(1, "Enter your email or username"),
  password: z.string().min(1, "Password is required"),
});

const registerSchema = z.object({
  username: z.string().trim().min(3, "Username must be at least 3 characters").max(32).regex(/^[a-zA-Z0-9_.-]+$/, "Use letters, numbers, dots, dashes, or underscores"),
  name: z.string().trim().min(1, "Full name is required").max(100),
  email: z.string().email("Enter a valid email address"),
  password: z.string().min(12, "Use at least 12 characters"),
  confirmPassword: z.string(),
}).refine(data => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

export default function AuthPage() {
  const { user, loginMutation, registerMutation } = useAuth();
  const [, setLocation] = useLocation();
  const [registrationNotice, setRegistrationNotice] = useState<"confirmation" | "created" | null>(null);
  const [authTab, setAuthTab] = useState<"login" | "register">("login");
  const [forgotPassword, setForgotPassword] = useState(false);
  const [resetRequestSent, setResetRequestSent] = useState(false);
  const [resetRequestError, setResetRequestError] = useState<string | null>(null);
  const [sendingReset, setSendingReset] = useState(false);
  const [resetEmail, setResetEmail] = useState("");
  const [googleLoading, setGoogleLoading] = useState(false);
  const [googleError, setGoogleError] = useState<string | null>(null);

  useEffect(() => {
    if (user) {
      if (user.role === "admin" || user.role === "manager") {
        setLocation("/admin");
      } else if (user.role === "support") {
        setLocation("/support");
      } else {
        setLocation("/profile");
      }
    }
  }, [user, setLocation]);

  const loginForm = useForm<z.infer<typeof loginSchema>>({
    resolver: zodResolver(loginSchema),
    defaultValues: { identifier: "", password: "" }
  });

  const registerForm = useForm<z.infer<typeof registerSchema>>({
    resolver: zodResolver(registerSchema),
    defaultValues: { username: "", password: "", confirmPassword: "", name: "", email: "" }
  });

  const requestPasswordReset = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setResetRequestError(null);
    setResetRequestSent(false);
    const email = resetEmail.trim();
    const parsedEmail = z.string().email("Enter a valid email address").safeParse(email);
    if (!parsedEmail.success) {
      setResetRequestError(parsedEmail.error.issues[0]?.message ?? "Enter a valid email address");
      return;
    }
    if (!supabase) {
      setResetRequestError("Password recovery is not configured. Please contact support.");
      return;
    }

    setSendingReset(true);
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`,
      });
      if (error) {
        setResetRequestError(error.message);
        return;
      }
      // Supabase intentionally returns the same result whether or not an account exists.
      setResetRequestSent(true);
    } catch (error) {
      setResetRequestError(error instanceof Error ? error.message : "Could not send a reset link. Please try again.");
    } finally {
      setSendingReset(false);
    }
  };

  const continueWithGoogle = async () => {
    setGoogleError(null);
    if (!supabase) {
      setGoogleError("Google sign-in is not configured. Check the Supabase project URL and publishable key.");
      return;
    }
    setGoogleLoading(true);
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: { redirectTo: `${window.location.origin}/auth` },
      });
      if (error) {
        setGoogleError(error.message);
        setGoogleLoading(false);
      }
    } catch (error) {
      setGoogleError(error instanceof Error ? error.message : "Google sign-in could not be started. Please try again.");
      setGoogleLoading(false);
    }
  };

  return (
    <Layout>
      <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center p-4 bg-muted/30">
        <div className="w-full max-w-5xl grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
          
          <div className="space-y-6 md:p-8">
            <h1 className="font-display text-4xl md:text-5xl font-bold text-primary leading-tight">
              Welcome to <span className="text-accent">Lumiere</span> Living.
            </h1>
            <p className="text-lg text-muted-foreground leading-relaxed">
              Discover a curated collection of premium apartments designed for comfort, style, and luxury living. Join our community today.
            </p>
            <div className="grid grid-cols-2 gap-4 mt-8">
              <div className="bg-background p-4 rounded-lg shadow-sm border">
                <div className="font-bold text-2xl text-primary mb-1">50+</div>
                <div className="text-sm text-muted-foreground">Premium Properties</div>
              </div>
              <div className="bg-background p-4 rounded-lg shadow-sm border">
                <div className="font-bold text-2xl text-primary mb-1">24/7</div>
                <div className="text-sm text-muted-foreground">Concierge Support</div>
              </div>
            </div>
          </div>

          <Card className="shadow-2xl border-none">
            <CardHeader className="text-center pb-2">
              <CardTitle className="font-display text-2xl">Sign in to Lumiere</CardTitle>
              <CardDescription>Sign in to manage your bookings or create a customer account.</CardDescription>
            </CardHeader>
            <CardContent>
              <Button type="button" variant="outline" className="w-full h-11 text-base mb-4" onClick={continueWithGoogle} disabled={googleLoading}>
                {googleLoading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : (
                  <svg className="w-5 h-5 mr-2" viewBox="0 0 48 48" aria-hidden="true">
                    <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.04 13.22l7.98 6.19C11.91 13.72 17.47 9.5 24 9.5Z" />
                    <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.76 7.18l7.73 6C44.42 37.98 46.98 31.9 46.98 24.55Z" />
                    <path fill="#FBBC05" d="M10.02 28.59A14.4 14.4 0 0 1 9.25 24c0-1.59.27-3.13.77-4.59l-7.98-6.19A23.9 23.9 0 0 0 0 24c0 3.87.93 7.53 2.57 10.78l7.45-5.81Z" />
                    <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.91-5.8l-7.73-6c-2.14 1.44-4.88 2.3-8.18 2.3-6.53 0-12.09-4.22-14.08-10.09l-7.45 5.81C6.93 42.62 14.62 48 24 48Z" />
                  </svg>
                )}
                Continue with Google
              </Button>
              <p className="text-center text-xs text-muted-foreground mb-4">Google shares your name and email with Lumiere. No extra profile form.</p>
              {googleError ? <p role="alert" className="rounded-md bg-destructive/10 px-3 py-2 text-sm text-destructive mb-4">{googleError}</p> : null}
              <div className="flex items-center gap-3 mb-5" aria-hidden="true">
                <div className="h-px flex-1 bg-border" />
                <span className="text-xs text-muted-foreground">or use email</span>
                <div className="h-px flex-1 bg-border" />
              </div>
              <Tabs value={authTab} onValueChange={(value) => setAuthTab(value as "login" | "register")} className="w-full">
                <TabsList className="grid w-full grid-cols-2 mb-6">
                  <TabsTrigger value="login">Login</TabsTrigger>
                  <TabsTrigger value="register">Register</TabsTrigger>
                </TabsList>
                
                <TabsContent value="login">
                  {forgotPassword ? (
                    <form onSubmit={requestPasswordReset} className="space-y-4">
                        <div className="space-y-1 text-center">
                          <h2 className="font-semibold">Reset your password</h2>
                          <p className="text-sm text-muted-foreground">Enter your account email and we’ll send a reset link if an account exists.</p>
                        </div>
                        {resetRequestSent ? (
                          <p role="status" className="rounded-md bg-primary/10 px-3 py-2 text-sm text-primary">
                            If an account exists for that email, a password reset link is on its way. Check your inbox.
                          </p>
                        ) : null}
                        {resetRequestError ? (
                          <p role="alert" className="rounded-md bg-destructive/10 px-3 py-2 text-sm text-destructive">{resetRequestError}</p>
                        ) : null}
                        <div className="space-y-2">
                          <label htmlFor="reset-email" className="text-sm font-medium leading-none">Email</label>
                          <Input
                            id="reset-email"
                            type="email"
                            autoComplete="email"
                            placeholder="you@example.com"
                            value={resetEmail}
                            onChange={(event) => {
                              setResetEmail(event.target.value);
                              setResetRequestError(null);
                              setResetRequestSent(false);
                            }}
                          />
                        </div>
                        <Button type="submit" className="w-full h-11 text-base" disabled={sendingReset}>
                          {sendingReset ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                          Send reset link
                        </Button>
                        <Button type="button" variant="ghost" className="w-full" onClick={() => setForgotPassword(false)}>
                          Back to sign in
                        </Button>
                    </form>
                  ) : <Form {...loginForm}>
                    <form onSubmit={loginForm.handleSubmit((data) => loginMutation.mutate(data))} className="space-y-4">
                      {registrationNotice ? (
                        <p role="status" className="rounded-md bg-primary/10 px-3 py-2 text-sm text-primary">
                          {registrationNotice === "confirmation"
                            ? "Account created. Open the confirmation link in your email; Lumiere will verify your address and sign you in automatically."
                            : "Account created. Sign in below to continue to the booking dashboard."}
                        </p>
                      ) : null}
                      {loginMutation.isError && (
                        <p role="alert" className="rounded-md bg-destructive/10 px-3 py-2 text-sm text-destructive">
                          {loginMutation.error instanceof Error ? loginMutation.error.message : "Sign-in failed. Please try again."}
                        </p>
                      )}
                      <FormField
                        control={loginForm.control}
                        name="identifier"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Email or username</FormLabel>
                            <FormControl>
                              <Input type="text" autoComplete="username" placeholder="you@example.com or username" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={loginForm.control}
                        name="password"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Password</FormLabel>
                            <FormControl>
                              <Input type="password" placeholder="••••••••" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <div className="-mt-2 text-right">
                        <Button type="button" variant="ghost" className="h-auto p-0 text-sm text-primary hover:bg-transparent hover:underline" onClick={() => {
                          setResetRequestSent(false);
                          setResetRequestError(null);
                          const identifier = loginForm.getValues("identifier");
                          setResetEmail(identifier.includes("@") ? identifier : "");
                          setForgotPassword(true);
                        }}>
                          Forgot password?
                        </Button>
                      </div>
                      <Button type="submit" className="w-full h-11 text-base" disabled={loginMutation.isPending}>
                        {loginMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                        Sign In
                      </Button>
                    </form>
                  </Form>}
                </TabsContent>

                <TabsContent value="register">
                  <Form {...registerForm}>
                    <form onSubmit={registerForm.handleSubmit((data) => {
                      setRegistrationNotice(null);
                      registerMutation.mutate(data, {
                        onSuccess: (result) => {
                          setRegistrationNotice(result.needsEmailConfirmation ? "confirmation" : "created");
                          loginForm.setValue("identifier", data.email);
                          registerForm.reset();
                          setAuthTab("login");
                        },
                      });
                    })} className="space-y-4">
                      {registerMutation.isError && (
                        <p role="alert" className="rounded-md bg-destructive/10 px-3 py-2 text-sm text-destructive">
                          {registerMutation.error instanceof Error
                            ? registerMutation.error.message
                            : "We couldn’t create your account. Check your details and try again."}
                        </p>
                      )}
                      <FormField
                        control={registerForm.control}
                        name="name"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Full Name</FormLabel>
                            <FormControl>
                              <Input autoComplete="name" placeholder="John Doe" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={registerForm.control}
                        name="email"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Email</FormLabel>
                            <FormControl>
                              <Input type="email" autoComplete="email" placeholder="john@example.com" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={registerForm.control}
                        name="username"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Username</FormLabel>
                            <FormControl>
                              <Input autoComplete="username" placeholder="Choose a username" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <div className="grid grid-cols-2 gap-4">
                        <FormField
                          control={registerForm.control}
                          name="password"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Password</FormLabel>
                              <FormControl>
                                <Input type="password" autoComplete="new-password" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={registerForm.control}
                          name="confirmPassword"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Confirm</FormLabel>
                              <FormControl>
                                <Input type="password" autoComplete="new-password" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                      
                      <Button type="submit" className="w-full h-11 text-base" disabled={registerMutation.isPending}>
                        {registerMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                        Create Account
                      </Button>
                    </form>
                  </Form>
                </TabsContent>
              </Tabs>
              <p className="mt-5 text-center text-xs text-muted-foreground">
                Public sign-up creates a customer account. Admin and staff access must be assigned by the site owner.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </Layout>
  );
}
