import { Apartment } from "@shared/schema";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { BedDouble, Bath, MapPin, ArrowRight } from "lucide-react";
import { Link } from "wouter";
import { motion } from "framer-motion";
import { useCurrency, formatPrice } from "@/hooks/use-currency";
import { cn } from "@/lib/utils";

export function ApartmentCard({ apartment, variant = "default" }: { apartment: Apartment; variant?: "default" | "gallery" }) {
  const { currency, rate } = useCurrency();
  const isGallery = variant === "gallery";
  // Use first image or fallback
  const imageUrl = apartment.images?.[0] || "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?q=80&w=2070&auto=format&fit=crop";

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -5 }}
      transition={{ duration: 0.3 }}
    >
      <Card className={cn(
        "overflow-hidden h-full flex flex-col border border-border/50 shadow-sm hover:shadow-xl transition-all duration-300 group",
        isGallery && "rounded-2xl border-white/20 shadow-2xl"
      )}>
        <div className={cn("relative overflow-hidden", isGallery ? "aspect-[16/9]" : "aspect-[4/3]")}>
          {/* Descriptive comment for dynamic image */}
          {/* Dynamic apartment image from DB */}
          <img 
            src={imageUrl} 
            alt={apartment.title}
            className="object-cover w-full h-full transition-transform duration-700 group-hover:scale-110"
          />
          <div className="absolute top-4 right-4">
            <Badge variant={apartment.status === 'available' ? 'default' : 'secondary'} className="shadow-md">
              {apartment.status === 'available' ? 'Available' : 'Booked'}
            </Badge>
          </div>
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end p-6">
            <p className="text-white font-medium flex items-center gap-2">
              View Details <ArrowRight className="w-4 h-4" />
            </p>
          </div>
        </div>

        {isGallery ? (
          <CardFooter className="flex items-center justify-between gap-4 bg-white p-4 text-left sm:p-5">
            <div className="min-w-0">
              <h3 className="truncate font-display text-lg font-bold text-foreground sm:text-xl">{apartment.title}</h3>
              <p className="flex items-center gap-1 truncate text-xs text-muted-foreground sm:text-sm">
                <MapPin className="h-3.5 w-3.5 shrink-0" /> {apartment.location}
              </p>
            </div>
            <Link href={`/apartments/${apartment.id}`} className="shrink-0">
              <Button size="sm" className="shadow-sm">View Details</Button>
            </Link>
          </CardFooter>
        ) : <>
        <CardHeader className="p-5 pb-2">
          <div className="flex justify-between items-start gap-4">
            <h3 className="font-display text-xl font-bold line-clamp-1 group-hover:text-primary transition-colors">
              {apartment.title}
            </h3>
          </div>
          <p className="text-muted-foreground text-sm flex items-center gap-1">
            <MapPin className="w-3.5 h-3.5" /> {apartment.location}
          </p>
        </CardHeader>

        <CardContent className="p-5 py-2 flex-1">
          <div className="flex gap-4 text-sm text-muted-foreground my-3">
            <div className="flex items-center gap-1.5 bg-secondary/50 px-2 py-1 rounded">
              <BedDouble className="w-4 h-4 text-primary" />
              <span>{apartment.bedrooms} Beds</span>
            </div>
            <div className="flex items-center gap-1.5 bg-secondary/50 px-2 py-1 rounded">
              <Bath className="w-4 h-4 text-primary" />
              <span>{apartment.bathrooms} Baths</span>
            </div>
          </div>
          <p className="text-sm text-muted-foreground line-clamp-2 mt-2">
            {apartment.description}
          </p>
        </CardContent>

        <CardFooter className="p-5 pt-2 border-t mt-auto flex items-center justify-between">
          <div className="flex flex-col">
            <span className="text-xs text-muted-foreground uppercase tracking-wide">Price per night</span>
            <span className="font-display text-xl font-bold text-primary">
              {formatPrice(apartment.price, currency, rate)}
            </span>
          </div>
          <Link href={`/apartments/${apartment.id}`}>
            <Button size="sm" className="shadow-sm">View Details</Button>
          </Link>
        </CardFooter>
        </>}
      </Card>
    </motion.div>
  );
}
