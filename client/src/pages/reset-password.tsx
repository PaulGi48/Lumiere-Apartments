import { useEffect, useState } from "react";
import { Link, useLocation } from "wouter";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Loader2 } from "lucide-react";
import { Layout } from "@/components/layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { supabase } from "@/lib/supabase";

const passwordSchema = z.object({
  password: z.string().min(12, "Use at least 12 characters"),
  confirmPassword: z.string(),
}).refine((values) => values.password === values.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

export default function ResetPasswordPage() {
  const [, setLocation] = useLocation();
  const [checkingSession, setCheckingSession] = useState(true);
  const [hasRecoverySession, setHasRecoverySession] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);

  const form = useForm<z.infer<typeof passwordSchema>>({
    resolver: zodResolver(passwordSchema),
    defaultValues: { password: "", confirmPassword: "" },
  });

  useEffect(() => {
    let active = true;

    if (!supabase) {
      setErrorMessage("Password recovery is not configured. Please contact support.");
      setCheckingSession(false);
      return;
    }

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (active && event === "PASSWORD_RECOVERY" && session) {
        setHasRecoverySession(true);
        setCheckingSession(false);
      }
    });

    void supabase.auth.getSession().then(({ data, error }) => {
      if (!active) return;
      if (error) setErrorMessage(error.message);
      setHasRecoverySession(Boolean(data.session));
      setCheckingSession(false);
    }).catch((error: unknown) => {
      if (!active) return;
      setErrorMessage(error instanceof Error ? error.message : "Could not validate the reset link.");
      setCheckingSession(false);
    });

    return () => {
      active = false;
      subscription.unsubscribe();
    };
  }, []);

  const onSubmit = async (values: z.infer<typeof passwordSchema>) => {
    if (!supabase) return;
    setIsSaving(true);
    setErrorMessage(null);
    try {
      const { error } = await supabase.auth.updateUser({ password: values.password });
      if (error) {
        setErrorMessage(error.message);
        return;
      }

      setSaved(true);
      form.reset();
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : "Could not update the password. Please try again.");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Layout>
      <main className="flex min-h-[calc(100vh-4rem)] items-center justify-center bg-muted/30 p-4">
        <Card className="w-full max-w-md border-none shadow-2xl">
          <CardHeader className="text-center">
            <CardTitle className="font-display text-2xl">
              {saved ? "Password updated" : "Choose a new password"}
            </CardTitle>
            <CardDescription>
              {saved
                ? "Your password has been changed. You can now sign in with it."
                : "Enter a new password for your Lumiere account."}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {checkingSession ? (
              <div role="status" className="flex justify-center py-6">
                <Loader2 className="h-6 w-6 animate-spin text-primary" />
              </div>
            ) : saved ? (
              <Button asChild className="w-full">
                <Link href="/auth">Return to sign in</Link>
              </Button>
            ) : hasRecoverySession ? (
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                  {errorMessage ? <p role="alert" className="rounded-md bg-destructive/10 px-3 py-2 text-sm text-destructive">{errorMessage}</p> : null}
                  <FormField
                    control={form.control}
                    name="password"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>New password</FormLabel>
                        <FormControl><Input type="password" autoComplete="new-password" {...field} /></FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="confirmPassword"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Confirm new password</FormLabel>
                        <FormControl><Input type="password" autoComplete="new-password" {...field} /></FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <Button type="submit" className="w-full" disabled={isSaving}>
                    {isSaving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                    Update password
                  </Button>
                </form>
              </Form>
            ) : (
              <div className="space-y-4 text-center">
                <p role="alert" className="text-sm text-muted-foreground">
                  {errorMessage ?? "This password reset link is invalid or has expired. Request a new one to continue."}
                </p>
                <Button asChild className="w-full"><Link href="/auth">Request another reset link</Link></Button>
              </div>
            )}
          </CardContent>
        </Card>
      </main>
    </Layout>
  );
}
