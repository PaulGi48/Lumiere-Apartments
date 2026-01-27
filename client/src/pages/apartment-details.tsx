import { Layout } from "@/components/layout";
import { useApartment } from "@/hooks/use-apartments";
import { useCreateBooking } from "@/hooks/use-bookings";
import { useAuth } from "@/hooks/use-auth";
import { useParams, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Calendar } from "@/components/ui/calendar";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import { Loader2, MapPin, BedDouble, Bath, Wifi, Car, Utensils, Tv, CheckCircle2 } from "lucide-react";
import { useState } from "react";
import { addDays, differenceInDays, format } from "date-fns";

import { useCurrency, formatPrice } from "@/hooks/use-currency";

export default function ApartmentDetails() {
  const { id } = useParams();
  const apartmentId = Number(id);
  const { data: apartment, isLoading } = useApartment(apartmentId);
  const { user } = useAuth();
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const { currency, rate } = useCurrency();
  
  // Booking State
  const [dateRange, setDateRange] = useState<{ from: Date; to?: Date } | undefined>();
  const [isBookingOpen, setIsBookingOpen] = useState(false);
  const createBooking = useCreateBooking();

  if (isLoading || !apartment) {
    return (
      <Layout>
        <div className="h-[80vh] flex items-center justify-center">
          <Loader2 className="w-10 h-10 animate-spin text-primary" />
        </div>
      </Layout>
    );
  }

  // Calculate costs
  const nights = dateRange?.from && dateRange?.to 
    ? differenceInDays(dateRange.to, dateRange.from) 
    : 0;
  
  const totalPrice = nights * apartment.price;

  const handleBook = () => {
    if (!user) {
      toast({ title: "Please login to book", variant: "destructive" });
      setLocation("/auth");
      return;
    }

    if (!dateRange?.from || !dateRange?.to) return;

    createBooking.mutate({
      apartmentId,
      userId: user.id,
      startDate: dateRange.from.toISOString(),
      endDate: dateRange.to.toISOString(),
      totalPrice,
    }, {
      onSuccess: () => {
        setIsBookingOpen(false);
        toast({ title: "Booking request sent!", description: "View your bookings in your profile." });
        setLocation("/profile");
      }
    });
  };

  const amenities = [
    { icon: Wifi, label: "Fast WiFi" },
    { icon: Car, label: "Parking" },
    { icon: Utensils, label: "Kitchen" },
    { icon: Tv, label: "Smart TV" },
  ];

  return (
    <Layout>
      {/* Image Gallery Hero */}
      <div className="h-[500px] grid grid-cols-4 grid-rows-2 gap-2 container mx-auto px-4 pt-6">
        <div className="col-span-2 row-span-2 relative rounded-xl overflow-hidden group">
          <img 
            src={apartment.images?.[0] || "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?q=80&w=2070"} 
            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
            alt="Main view" 
          />
        </div>
        <div className="col-span-1 row-span-1 relative rounded-xl overflow-hidden">
           <img src="https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?q=80&w=1980" className="w-full h-full object-cover" alt="Detail 1" />
        </div>
        <div className="col-span-1 row-span-1 relative rounded-xl overflow-hidden">
           <img src="https://images.unsplash.com/photo-1556912172-45b7abe8b7e1?q=80&w=1980" className="w-full h-full object-cover" alt="Detail 2" />
        </div>
        <div className="col-span-2 row-span-1 relative rounded-xl overflow-hidden">
           <img src="https://pixabay.com/get/g296848470b8766af74a076cf9236a73680f2aadae7d78da56566f2ef5b26b500dd4ba42d89a7cecbeda1c8c900ec31e5d978170c1b63ce1b9150c580e4094440_1280.jpg" className="w-full h-full object-cover" alt="Detail 3" />
        </div>
      </div>

      <div className="container mx-auto px-4 py-12 grid grid-cols-1 lg:grid-cols-3 gap-12">
        {/* Left Column: Details */}
        <div className="lg:col-span-2 space-y-8">
          <div>
            <div className="flex justify-between items-start">
              <h1 className="text-4xl font-display font-bold text-foreground mb-2">{apartment.title}</h1>
              <Badge variant="outline" className="text-primary border-primary px-3 py-1">
                {apartment.status === 'available' ? 'Available' : 'Booked'}
              </Badge>
            </div>
            <p className="text-muted-foreground flex items-center gap-2 text-lg">
              <MapPin className="w-5 h-5 text-primary" /> {apartment.location}
            </p>
          </div>

          <div className="flex gap-8 py-6 border-y border-border/50">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-secondary/50 rounded-full">
                <BedDouble className="w-6 h-6 text-primary" />
              </div>
              <div>
                <p className="font-bold text-foreground">{apartment.bedrooms} Bedrooms</p>
                <p className="text-sm text-muted-foreground">King sized beds</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="p-3 bg-secondary/50 rounded-full">
                <Bath className="w-6 h-6 text-primary" />
              </div>
              <div>
                <p className="font-bold text-foreground">{apartment.bathrooms} Bathrooms</p>
                <p className="text-sm text-muted-foreground">Luxury fittings</p>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="font-display text-2xl font-bold">About this place</h3>
            <p className="text-muted-foreground leading-relaxed text-lg">
              {apartment.description}
            </p>
          </div>

          <div className="space-y-4">
            <h3 className="font-display text-2xl font-bold">Amenities</h3>
            <div className="grid grid-cols-2 gap-4">
              {amenities.map((item, i) => (
                <div key={i} className="flex items-center gap-3 p-4 border rounded-xl hover:border-primary/50 transition-colors bg-card">
                  <item.icon className="w-5 h-5 text-primary" />
                  <span className="font-medium">{item.label}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column: Booking Card */}
        <div className="relative">
          <div className="sticky top-24 bg-card border rounded-2xl shadow-xl p-6 space-y-6">
            <div className="flex justify-between items-baseline">
              <span className="text-3xl font-display font-bold text-primary">
                {formatPrice(apartment.price, currency, rate)}
              </span>
              <span className="text-muted-foreground">/ night</span>
            </div>

            <Separator />

            <div className="space-y-2">
              <span className="font-semibold text-sm">Select Dates</span>
              <div className="border rounded-lg p-2 bg-background flex justify-center">
                <Calendar
                  mode="range"
                  selected={dateRange}
                  onSelect={setDateRange}
                  disabled={(date) => date < new Date()}
                  initialFocus
                  className="rounded-md border-0"
                />
              </div>
            </div>

            {dateRange?.from && dateRange?.to && (
              <div className="bg-secondary/30 p-4 rounded-lg space-y-3">
                <div className="flex justify-between text-sm">
                  <span>{formatPrice(apartment.price, currency, rate)} x {nights} nights</span>
                  <span>{formatPrice(totalPrice, currency, rate)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Cleaning Fee</span>
                  <span>{formatPrice(5000, currency, rate)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Service Fee</span>
                  <span>{formatPrice(3000, currency, rate)}</span>
                </div>
                <Separator />
                <div className="flex justify-between font-bold text-lg">
                  <span>Total</span>
                  <span>{formatPrice(totalPrice + 8000, currency, rate)}</span>
                </div>
              </div>
            )}

            <Dialog open={isBookingOpen} onOpenChange={setIsBookingOpen}>
              <DialogTrigger asChild>
                <Button 
                  size="lg" 
                  className="w-full text-lg font-bold shadow-lg shadow-primary/20"
                  disabled={!dateRange?.from || !dateRange?.to || apartment.status !== 'available'}
                >
                  {apartment.status === 'available' ? 'Reserve Now' : 'Currently Unavailable'}
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Confirm Booking</DialogTitle>
                </DialogHeader>
                <div className="py-4 space-y-4">
                  <div className="flex gap-4">
                    <img src={apartment.images?.[0]} className="w-20 h-20 object-cover rounded-md" alt="thumb" />
                    <div>
                      <h4 className="font-bold">{apartment.title}</h4>
                      <p className="text-sm text-muted-foreground">{apartment.location}</p>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4 text-sm border p-3 rounded-lg bg-muted/20">
                    <div>
                      <span className="text-muted-foreground block">Check-in</span>
                      <span className="font-medium">{dateRange?.from ? format(dateRange.from, "MMM dd, yyyy") : "-"}</span>
                    </div>
                    <div>
                      <span className="text-muted-foreground block">Check-out</span>
                      <span className="font-medium">{dateRange?.to ? format(dateRange.to, "MMM dd, yyyy") : "-"}</span>
                    </div>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    By confirming, you agree to our terms of service. Payment will be processed on the next step.
                  </p>
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setIsBookingOpen(false)}>Cancel</Button>
                  <Button onClick={handleBook} disabled={createBooking.isPending}>
                    {createBooking.isPending ? <Loader2 className="animate-spin mr-2" /> : null}
                    Confirm & Pay
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        </div>
      </div>
    </Layout>
  );
}
