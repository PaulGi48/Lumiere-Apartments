import { Layout } from "@/components/layout";
import { useApartments } from "@/hooks/use-apartments";
import { ApartmentCard } from "@/components/apartment-card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, Loader2, ChevronLeft, ChevronRight, Clock } from "lucide-react";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { useCurrency, formatPrice } from "@/hooks/use-currency";

export default function HomePage() {
  const [minPrice, setMinPrice] = useState<string>("");
  const [maxPrice, setMaxPrice] = useState<string>("");
  const [activeIndex, setActiveIndex] = useState(0);
  const { currency, rate } = useCurrency();
  
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

  return (
    <Layout>
      {/* Hero Section */}
      <section className="relative h-[600px] flex items-center justify-center overflow-hidden">
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
          
          {/* Search Bar */}
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4, ease: "easeOut" }}
            className="bg-white p-4 rounded-xl shadow-2xl max-w-3xl mx-auto flex flex-col md:flex-row gap-4 mt-8"
          >
            <div className="flex-1">
              <label className="text-xs font-semibold text-muted-foreground uppercase mb-1 block text-left pl-1">Min Price ({currency})</label>
              <Input 
                type="number" 
                placeholder={formatPrice(10000, currency, rate)} 
                className="border-0 bg-secondary/30 h-10"
                value={minPrice}
                onChange={(e) => setMinPrice(e.target.value)}
              />
            </div>
            <div className="flex-1">
              <label className="text-xs font-semibold text-muted-foreground uppercase mb-1 block text-left pl-1">Max Price ({currency})</label>
              <Input 
                type="number" 
                placeholder={formatPrice(500000, currency, rate)} 
                className="border-0 bg-secondary/30 h-10"
                value={maxPrice}
                onChange={(e) => setMaxPrice(e.target.value)}
              />
            </div>
            <div className="flex items-end">
              <Button size="lg" className="w-full md:w-auto px-8 h-10 font-bold">
                <Search className="w-4 h-4 mr-2" />
                Search
              </Button>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Apartment Clock Tool (Carousel) */}
      <section className="py-20 bg-muted/20 overflow-hidden">
        <div className="container mx-auto px-4">
          <div className="flex items-center gap-3 mb-12">
            <div className="p-2 bg-primary/10 rounded-full text-primary">
              <Clock className="w-6 h-6 animate-pulse" />
            </div>
            <div>
              <h2 className="text-3xl md:text-4xl font-display font-bold text-foreground">Apartment Showcase</h2>
              <p className="text-muted-foreground">Dynamic rotation of our premium listings</p>
            </div>
          </div>

          {isLoading ? (
            <div className="flex justify-center py-20">
              <Loader2 className="w-10 h-10 animate-spin text-primary" />
            </div>
          ) : apartments && apartments.length > 0 ? (
            <div className="relative max-w-5xl mx-auto h-[500px] flex items-center justify-center">
              <AnimatePresence mode="wait">
                <motion.div
                  key={apartments[activeIndex].id}
                  initial={{ opacity: 0, scale: 0.9, x: 100 }}
                  animate={{ opacity: 1, scale: 1, x: 0 }}
                  exit={{ opacity: 0, scale: 0.9, x: -100 }}
                  transition={{ duration: 0.5, ease: "circOut" }}
                  className="w-full max-w-2xl"
                >
                  <ApartmentCard apartment={apartments[activeIndex]} />
                </motion.div>
              </AnimatePresence>
              
              <div className="absolute left-0 right-0 flex justify-between px-4">
                <Button 
                  variant="outline" 
                  size="icon" 
                  className="rounded-full shadow-lg"
                  onClick={() => setActiveIndex((prev) => (prev - 1 + apartments.length) % apartments.length)}
                >
                  <ChevronLeft />
                </Button>
                <Button 
                  variant="outline" 
                  size="icon" 
                  className="rounded-full shadow-lg"
                  onClick={() => setActiveIndex((prev) => (prev + 1) % apartments.length)}
                >
                  <ChevronRight />
                </Button>
              </div>

              {/* Clock indicators */}
              <div className="absolute -bottom-10 left-1/2 -translate-x-1/2 flex gap-2">
                {apartments.map((_, i) => (
                  <button
                    key={i}
                    onClick={() => setActiveIndex(i)}
                    className={cn(
                      "w-2 h-2 rounded-full transition-all duration-300",
                      i === activeIndex ? "w-8 bg-primary" : "bg-primary/20 hover:bg-primary/40"
                    )}
                  />
                ))}
              </div>
            </div>
          ) : (
            <div className="text-center py-20 text-muted-foreground italic">
              No premium apartments to display at the moment.
            </div>
          )}
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
