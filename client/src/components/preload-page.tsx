import { Loader2 } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";

export function PreloadPage({ children }: { children: React.ReactNode }) {
  const { isLoading } = useAuth();

  if (isLoading) {
    return (
      <main
        className="flex min-h-screen flex-col items-center justify-center gap-4 bg-[#f8f5ef] text-[#202a3a]"
        aria-live="polite"
        aria-busy="true"
      >
        <img
          src="/media/LUMIERE%20LOGO.png"
          alt="Lumiere Apartments"
          className="h-16 w-auto object-contain"
        />
        <Loader2 className="h-6 w-6 animate-spin text-[#9a7950]" aria-hidden="true" />
        <p className="text-sm tracking-wide text-[#667085]">Preparing your stay…</p>
      </main>
    );
  }

  return children;
}
