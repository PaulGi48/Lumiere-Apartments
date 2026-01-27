import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Loader2 } from "lucide-react";

export function PreloadPage({ children }: { children: React.ReactNode }) {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simulate initial load
    const timer = setTimeout(() => {
      setLoading(false);
    }, 2500);
    return () => clearTimeout(timer);
  }, []);

  return (
    <>
      <AnimatePresence>
        {loading && (
          <motion.div
            key="preload"
            initial={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5 }}
            className="fixed inset-0 z-[10000] flex flex-col items-center justify-center bg-background"
          >
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.5 }}
              className="flex flex-col items-center gap-6"
            >
              <div className="relative">
                <div className="absolute inset-0 bg-primary/20 rounded-full blur-2xl animate-pulse" />
                <h1 className="text-6xl md:text-8xl font-display font-bold text-primary relative z-10 tracking-tighter">
                  LUMIERE
                </h1>
              </div>
              <div className="flex items-center gap-3 text-muted-foreground font-medium tracking-widest uppercase text-sm">
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Excellence in Living</span>
              </div>
            </motion.div>
            <motion.div 
              initial={{ width: 0 }}
              animate={{ width: "200px" }}
              transition={{ duration: 2, ease: "easeInOut" }}
              className="h-[2px] bg-primary mt-12"
            />
          </motion.div>
        )}
      </AnimatePresence>
      {!loading && children}
    </>
  );
}
