import { Layout } from "@/components/layout";
import { useApartments } from "@/hooks/use-apartments";
import { ApartmentCard } from "@/components/apartment-card";
import { Button } from "@/components/ui/button";
import { Loader2, ChevronLeft, ChevronRight } from "lucide-react";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { useCurrency } from "@/hooks/use-currency";
import { useLocation } from "wouter";

export default function HomePage() {
  const [activeIndex, setActiveIndex] = useState(0);
  const [location] = useLocation();
  const { rate } = useCurrency();
  const searchParams = new URLSearchParams(location.split("?")[1] ?? "");
  const minPrice = searchParams.get("minPrice") ?? "";
  const maxPrice = searchParams.get("maxPrice") ?? "";

  const { data: apartments, isLoading } = useApartments({
    minPrice: minPrice ? Math.round(Number(minPrice) * 100 / rate) : undefined,
    maxPrice: maxPrice ? Math.round(Number(maxPrice) * 100 / rate) : undefined,
  });

  // Auto-rotate the "clock"
  useEffect(() => {
    if (!apartments || apartments.length === 0) return;
    const interval = setInterval(() => {
      setActiveIndex((prev) => (prev + 1) % apartments.length);
    }, 5000);
    return () => clearInterval(interval);
  }, [apartments]);

  useEffect(() => {
    setActiveIndex(0);
  }, [minPrice, maxPrice]);

  const safeActiveIndex = apartments?.length
    ? Math.min(activeIndex, apartments.length - 1)
    : 0;

  const moveGallery = (direction: -1 | 1) => {
    if (!apartments?.length) return;
    setActiveIndex((prev) => (prev + direction + apartments.length) % apartments.length);
  };

  return (
    <Layout>
      {/* Hero Section */}
      <section className="relative min-h-[650px] flex items-center justify-center overflow-hidden md:h-[700px]">
        {/* Unsplash luxury interior */}
        <div className="absolute inset-0 z-0">
          <div className="absolute inset-0 bg-black/40 z-10" />
          <img 
            src="https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?q=80&w=2070&auto=format&fit=crop" 
            alt="Luxury Interior" 
            className="w-full h-full object-cover"
          />
        </div>

        <div className="relative z-20 text-center container px-4 space-y-6">
          <motion.h1 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="text-4xl md:text-6xl lg:text-7xl font-display font-bold text-white max-w-4xl mx-auto leading-tight"
          >
            Find Your Perfect Sanctuary
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2, ease: "easeOut" }}
            className="text-lg md:text-xl text-white/90 max-w-2xl mx-auto"
          >
            Discover hand-picked luxury apartments in the world's most desirable locations.
          </motion.p>
          
          {/* Apartment gallery replaces the former hero search bar. */}
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4, ease: "easeOut" }}
            className="relative mx-auto mt-8 w-full max-w-3xl px-7 sm:px-10"
          >
            {isLoading ? (
              <div className="flex justify-center rounded-2xl bg-white/95 py-20 shadow-2xl">
                <Loader2 className="h-10 w-10 animate-spin text-primary" />
              </div>
            ) : apartments && apartments.length > 0 ? (
              <>
                <AnimatePresence mode="wait">
                  <motion.div
                    key={apartments[safeActiveIndex]?.id}
                    drag="x"
                    dragConstraints={{ left: 0, right: 0 }}
                    onDragEnd={(_, info) => {
                      if (info.offset.x < -50) moveGallery(1);
                      if (info.offset.x > 50) moveGallery(-1);
                    }}
                    initial={{ opacity: 0, scale: 0.96, x: 80 }}
                    animate={{ opacity: 1, scale: 1, x: 0 }}
                    exit={{ opacity: 0, scale: 0.96, x: -80 }}
                    transition={{ duration: 0.4, ease: "circOut" }}
                    className="cursor-grab active:cursor-grabbing"
                  >
                    <ApartmentCard apartment={apartments[safeActiveIndex]} variant="gallery" />
                  </motion.div>
                </AnimatePresence>
                <div className="pointer-events-none absolute inset-y-1/2 left-0 right-0 flex -translate-y-1/2 justify-between">
                  <Button type="button" variant="outline" size="icon" className="pointer-events-auto rounded-full bg-white/95 shadow-lg" onClick={() => moveGallery(-1)} aria-label="Previous apartment">
                    <ChevronLeft />
                  </Button>
                  <Button type="button" variant="outline" size="icon" className="pointer-events-auto rounded-full bg-white/95 shadow-lg" onClick={() => moveGallery(1)} aria-label="Next apartment">
                    <ChevronRight />
                  </Button>
                </div>
                <div className="mt-4 flex justify-center gap-2">
                  {apartments.map((apartment, index) => (
                    <button key={apartment.id} type="button" onClick={() => setActiveIndex(index)} aria-label={`Show ${apartment.title}`} className={cn("h-2 rounded-full transition-all", index === safeActiveIndex ? "w-8 bg-white" : "w-2 bg-white/50")} />
                  ))}
                </div>
              </>
            ) : (
              <div className="rounded-2xl bg-white/95 px-6 py-16 text-center text-muted-foreground shadow-2xl">
                No premium apartments match your search.
              </div>
            )}
          </motion.div>
        </div>
      </section>

      {/* Featured Grid (Traditional View) */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <h2 className="text-2xl font-display font-bold mb-8">All Properties</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {apartments?.map((apartment) => (
              <ApartmentCard key={apartment.id} apartment={apartment} />
            ))}
          </div>
        </div>
      </section>

      {/* Value Prop */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4 grid grid-cols-1 md:grid-cols-2 gap-16 items-center">
          <div className="space-y-6">
            <h2 className="text-3xl md:text-4xl font-display font-bold text-foreground">
              Experience the Art of Living
            </h2>
            <p className="text-muted-foreground text-lg leading-relaxed">
              Lumiere isn't just about finding a place to stay—it's about finding a space that inspires you. 
              Every apartment in our portfolio meets rigorous standards for design, comfort, and location.
            </p>
            <div className="space-y-4">
              <div className="flex gap-4">
                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold font-display text-xl">1</div>
                <div>
                  <h4 className="font-bold text-lg">Curated Quality</h4>
                  <p className="text-muted-foreground">Every home is personally verified for quality and comfort.</p>
                </div>
              </div>
              <div className="flex gap-4">
                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold font-display text-xl">2</div>
                <div>
                  <h4 className="font-bold text-lg">Premium Service</h4>
                  <p className="text-muted-foreground">24/7 concierge and maintenance support for all residents.</p>
                </div>
              </div>
            </div>
          </div>
          <div className="relative">
            <div className="absolute -top-4 -left-4 w-24 h-24 bg-accent/20 rounded-full blur-2xl" />
            <img 
              src="https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?q=80&w=2053&auto=format&fit=crop" 
              alt="Luxury Living Room" 
              className="rounded-2xl shadow-2xl relative z-10"
            />
          </div>
        </div>
      </section>
    </Layout>
  );
}
