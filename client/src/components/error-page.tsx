import { useEffect } from "react";
import { Link } from "wouter";
import { ArrowLeft, Home } from "lucide-react";
import { Button } from "@/components/ui/button";

type ErrorPageProps = {
  status?: number;
  title?: string;
  message?: string;
};

export function ErrorPage({ status = 500, title, message }: ErrorPageProps) {
  const isUnauthorized = status === 401;
  const heading = title ?? (isUnauthorized ? "Please sign in again" : "We hit a small pause");
  const description = message ?? (
    isUnauthorized
      ? "Your session is no longer available. Returning you to Lumiere."
      : "This page could not be loaded. Returning you to Lumiere."
  );

  useEffect(() => {
    if (window.location.pathname === "/") return;
    const timer = window.setTimeout(() => window.location.replace("/"), 2200);
    return () => window.clearTimeout(timer);
  }, []);

  return (
    <main className="min-h-screen bg-[#f8f5ef] px-6 py-12 text-[#202a3a]">
      <div className="mx-auto flex min-h-[70vh] max-w-xl items-center justify-center">
        <section className="w-full border border-[#cdbb9b] bg-[#fffdf8] px-8 py-12 text-center shadow-[0_18px_50px_rgba(32,42,58,0.08)]">
          <p className="mb-5 text-xs uppercase tracking-[0.35em] text-[#9a7950]">Lumiere Apartments</p>
          <p className="font-display text-5xl text-[#9a7950]">{status}</p>
          <h1 className="mt-4 text-3xl font-display font-semibold">{heading}</h1>
          <p className="mx-auto mt-4 max-w-sm text-sm leading-6 text-[#667085]">{description}</p>
          <p className="mt-5 text-xs text-[#9a7950]">Returning home shortly</p>
          <Button asChild className="mt-7 gap-2 rounded-none bg-[#202a3a] px-5 hover:bg-[#303d52]">
            <Link href="/">
              <Home className="h-4 w-4" />
              Return home
            </Link>
          </Button>
          <div className="mt-6 flex items-center justify-center gap-2 text-xs text-[#9a7950]">
            <ArrowLeft className="h-3 w-3" />
            <span>Your stay begins with a fresh start.</span>
          </div>
        </section>
      </div>
    </main>
  );
}
