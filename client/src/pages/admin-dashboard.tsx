import { Layout } from "@/components/layout";
import { useAuth } from "@/hooks/use-auth";
import { useBookings, useUpdateBookingStatus } from "@/hooks/use-bookings";
import { useApartments, useCreateApartment } from "@/hooks/use-apartments";
import { useLocation } from "wouter";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { insertApartmentSchema, type InsertApartment } from "@shared/schema";
import { Loader2, Plus, Check, X } from "lucide-react";

import { useCurrency, formatPrice } from "@/hooks/use-currency";

export default function AdminDashboard() {
  const { user } = useAuth();
  const [, setLocation] = useLocation();
  const { data: bookings, isLoading: bookingsLoading, isError: bookingsError } = useBookings();
  const { data: apartments, isLoading: apartmentsLoading, isError: apartmentsError } = useApartments();
  const updateBooking = useUpdateBookingStatus();
  const createApartment = useCreateApartment();
  const { currency, rate } = useCurrency();

  const apartmentForm = useForm<InsertApartment>({
    resolver: zodResolver(insertApartmentSchema),
    defaultValues: {
      title: "",
      description: "",
      price: 10000,
      location: "",
      bedrooms: 1,
      bathrooms: 1,
      status: "available",
      amenities: ["Wifi", "Parking"],
      images: ["https://images.unsplash.com/photo-1522708323590-d24dbb6b0267"]
    }
  });

  if (!user || (user.role !== 'admin' && user.role !== 'manager')) {
    // Ideally use a redirect or dedicated protected route wrapper
    return <div className="p-8">Unauthorized Access</div>;
  }

  const bookingList = bookings ?? [];
  const apartmentList = apartments ?? [];
  const activeBookingCount = bookingList.filter((booking) =>
    ["pending", "confirmed", "checked_in"].includes(booking.status),
  ).length;
  const confirmedBookingValue = bookingList
    .filter((booking) => ["confirmed", "checked_in", "checked_out"].includes(booking.status))
    .reduce((total, booking) => total + booking.totalPrice, 0);
  const availableApartmentCount = apartmentList.filter((apartment) => apartment.status === "available").length;
  const currentMonth = new Date();
  const bookingActivity = Array.from({ length: 6 }, (_, index) => {
    const month = new Date(currentMonth.getFullYear(), currentMonth.getMonth() - (5 - index), 1);
    return {
      name: month.toLocaleDateString(undefined, { month: "short" }),
      monthKey: `${month.getFullYear()}-${month.getMonth()}`,
      count: 0,
    };
  });
  for (const booking of bookingList) {
    const createdAt = new Date(booking.createdAt ?? booking.startDate);
    if (Number.isNaN(createdAt.getTime())) continue;
    const monthKey = `${createdAt.getFullYear()}-${createdAt.getMonth()}`;
    const month = bookingActivity.find((entry) => entry.monthKey === monthKey);
    if (month) month.count += 1;
  }

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-display font-bold mb-8">Admin Dashboard</h1>
        
        <Tabs defaultValue="overview">
          <TabsList className="mb-8">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="apartments">Apartments</TabsTrigger>
            <TabsTrigger value="bookings">Bookings</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-8">
             <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium text-muted-foreground">Confirmed booking value</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{bookingsLoading ? "—" : formatPrice(confirmedBookingValue, currency, rate)}</div>
                    <p className="text-xs text-muted-foreground">Confirmed and completed bookings</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium text-muted-foreground">Active Bookings</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{bookingsLoading ? "—" : activeBookingCount}</div>
                    <p className="text-xs text-muted-foreground">Pending, confirmed, or checked in</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium text-muted-foreground">Properties</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{apartmentsLoading ? "—" : apartmentList.length}</div>
                    <p className="text-xs text-muted-foreground">{apartmentsLoading ? "Loading availability" : `${availableApartmentCount} available`}</p>
                  </CardContent>
                </Card>
             </div>

             <Card>
               <CardHeader>
                 <CardTitle>Booking activity</CardTitle>
                 <CardDescription>Bookings created over the last six months</CardDescription>
               </CardHeader>
               <CardContent className="h-[300px]">
                 {bookingsLoading ? (
                   <div className="flex h-full items-center justify-center text-sm text-muted-foreground">Loading booking activity…</div>
                 ) : bookingsError ? (
                   <div className="flex h-full items-center justify-center text-sm text-destructive">Could not load booking activity.</div>
                 ) : (
                   <ResponsiveContainer width="100%" height="100%">
                     <BarChart data={bookingActivity}>
                       <CartesianGrid strokeDasharray="3 3" />
                       <XAxis dataKey="name" />
                       <YAxis allowDecimals={false} />
                       <Tooltip formatter={(value) => [value, "Bookings"]} />
                       <Bar dataKey="count" name="Bookings" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                     </BarChart>
                   </ResponsiveContainer>
                 )}
               </CardContent>
             </Card>
          </TabsContent>

          <TabsContent value="apartments">
            <div className="flex justify-end mb-4">
              <Dialog>
                <DialogTrigger asChild>
                  <Button><Plus className="w-4 h-4 mr-2" /> Add Apartment</Button>
                </DialogTrigger>
                <DialogContent className="max-w-2xl">
                  <DialogHeader>
                    <DialogTitle>Add New Apartment</DialogTitle>
                  </DialogHeader>
                  <Form {...apartmentForm}>
                    <form onSubmit={apartmentForm.handleSubmit((data) => createApartment.mutate(data))} className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <FormField
                          control={apartmentForm.control}
                          name="title"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Title</FormLabel>
                              <FormControl><Input {...field} /></FormControl>
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={apartmentForm.control}
                          name="location"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Location</FormLabel>
                              <FormControl><Input {...field} /></FormControl>
                            </FormItem>
                          )}
                        />
                      </div>
                      <FormField
                        control={apartmentForm.control}
                        name="description"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Description</FormLabel>
                            <FormControl><Textarea {...field} /></FormControl>
                          </FormItem>
                        )}
                      />
                      <div className="grid grid-cols-3 gap-4">
                         <FormField
                          control={apartmentForm.control}
                          name="price"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Price (cents)</FormLabel>
                              <FormControl><Input type="number" {...field} onChange={e => field.onChange(parseInt(e.target.value))} /></FormControl>
                            </FormItem>
                          )}
                        />
                         <FormField
                          control={apartmentForm.control}
                          name="bedrooms"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Bedrooms</FormLabel>
                              <FormControl><Input type="number" {...field} onChange={e => field.onChange(parseInt(e.target.value))} /></FormControl>
                            </FormItem>
                          )}
                        />
                         <FormField
                          control={apartmentForm.control}
                          name="bathrooms"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Bathrooms</FormLabel>
                              <FormControl><Input type="number" {...field} onChange={e => field.onChange(parseInt(e.target.value))} /></FormControl>
                            </FormItem>
                          )}
                        />
                      </div>
                      <Button type="submit" className="w-full" disabled={createApartment.isPending}>
                        {createApartment.isPending ? <Loader2 className="animate-spin" /> : "Create Apartment"}
                      </Button>
                    </form>
                  </Form>
                </DialogContent>
              </Dialog>
            </div>
            
            <Card>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Title</TableHead>
                    <TableHead>Location</TableHead>
                    <TableHead>Price</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {apartments?.map((apt) => (
                    <TableRow key={apt.id}>
                      <TableCell className="font-medium">{apt.title}</TableCell>
                      <TableCell>{apt.location}</TableCell>
                      <TableCell>{formatPrice(apt.price, currency, rate)}</TableCell>
                      <TableCell>
                        <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                          apt.status === 'available' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                        }`}>
                          {apt.status}
                        </span>
                      </TableCell>
                      <TableCell>
                        <span className="text-xs text-muted-foreground">—</span>
                      </TableCell>
                    </TableRow>
                  ))}
                  {apartmentsError && <TableRow><TableCell colSpan={5} className="py-8 text-center text-destructive">Could not load apartments.</TableCell></TableRow>}
                  {!apartmentsLoading && !apartmentsError && apartmentList.length === 0 && <TableRow><TableCell colSpan={5} className="py-8 text-center text-muted-foreground">No apartments have been added yet.</TableCell></TableRow>}
                </TableBody>
              </Table>
            </Card>
          </TabsContent>

          <TabsContent value="bookings">
             <Card>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>ID</TableHead>
                    <TableHead>Guest</TableHead>
                    <TableHead>Dates</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {bookings?.map((booking) => (
                    <TableRow key={booking.id}>
                      <TableCell>#{booking.id}</TableCell>
                      <TableCell>User #{booking.userId}</TableCell>
                      <TableCell>
                        {new Date(booking.startDate).toLocaleDateString()} - {new Date(booking.endDate).toLocaleDateString()}
                      </TableCell>
                      <TableCell>
                        <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                          booking.status === 'confirmed' ? 'bg-green-100 text-green-800' : 
                          booking.status === 'pending' ? 'bg-yellow-100 text-yellow-800' : 'bg-gray-100 text-gray-800'
                        }`}>
                          {booking.status}
                        </span>
                      </TableCell>
                      <TableCell className="flex gap-2">
                        {booking.status === 'pending' && (
                          <>
                            <Button size="icon" variant="ghost" className="text-green-600 hover:text-green-700 hover:bg-green-50"
                              aria-label={`Confirm booking ${booking.id}`}
                              onClick={() => updateBooking.mutate({ id: booking.id, status: 'confirmed' })}>
                              <Check className="w-4 h-4" />
                            </Button>
                            <Button size="icon" variant="ghost" className="text-red-600 hover:text-red-700 hover:bg-red-50"
                              aria-label={`Cancel booking ${booking.id}`}
                              onClick={() => updateBooking.mutate({ id: booking.id, status: 'cancelled' })}>
                              <X className="w-4 h-4" />
                            </Button>
                          </>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                  {bookingsError && <TableRow><TableCell colSpan={5} className="py-8 text-center text-destructive">Could not load bookings.</TableCell></TableRow>}
                  {!bookingsLoading && !bookingsError && bookingList.length === 0 && <TableRow><TableCell colSpan={5} className="py-8 text-center text-muted-foreground">No bookings yet.</TableCell></TableRow>}
                </TableBody>
              </Table>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </Layout>
  );
}
