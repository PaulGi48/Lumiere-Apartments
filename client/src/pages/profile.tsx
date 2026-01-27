import { Layout } from "@/components/layout";
import { useAuth } from "@/hooks/use-auth";
import { useBookings } from "@/hooks/use-bookings";
import { useLocation } from "wouter";
import { Loader2, Calendar as CalIcon, CreditCard, Clock } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { format } from "date-fns";

import { useCurrency, formatPrice } from "@/hooks/use-currency";

export default function ProfilePage() {
  const { user, isLoading: authLoading } = useAuth();
  const [, setLocation] = useLocation();
  const { data: bookings, isLoading: bookingsLoading } = useBookings();
  const { currency, rate } = useCurrency();

  if (authLoading || bookingsLoading) {
    return (
      <Layout>
        <div className="h-[80vh] flex items-center justify-center">
          <Loader2 className="w-10 h-10 animate-spin text-primary" />
        </div>
      </Layout>
    );
  }

  if (!user) {
    setLocation("/auth");
    return null;
  }

  const myBookings = bookings?.filter(b => b.userId === user.id) || [];

  return (
    <Layout>
      <div className="container mx-auto px-4 py-12">
        <div className="flex flex-col md:flex-row gap-8 items-start">
          
          {/* Sidebar */}
          <Card className="w-full md:w-80 shadow-lg">
            <CardHeader className="text-center">
              <div className="w-24 h-24 bg-primary/10 rounded-full mx-auto flex items-center justify-center text-3xl font-display font-bold text-primary mb-4">
                {user.name.charAt(0)}
              </div>
              <CardTitle>{user.name}</CardTitle>
              <CardDescription>{user.email}</CardDescription>
              <Badge variant="outline" className="mx-auto mt-2 w-fit capitalize">{user.role}</Badge>
            </CardHeader>
            <CardContent className="space-y-2">
              <Button variant="outline" className="w-full justify-start" disabled>Edit Profile</Button>
              <Button variant="outline" className="w-full justify-start" disabled>Payment Methods</Button>
              <Button variant="outline" className="w-full justify-start" disabled>Notifications</Button>
            </CardContent>
          </Card>

          {/* Main Content */}
          <div className="flex-1 w-full">
            <Tabs defaultValue="bookings">
              <TabsList className="w-full md:w-auto grid grid-cols-2 md:inline-flex mb-8">
                <TabsTrigger value="bookings">My Bookings</TabsTrigger>
                <TabsTrigger value="payments">Payment History</TabsTrigger>
              </TabsList>

              <TabsContent value="bookings" className="space-y-6">
                <h2 className="text-2xl font-display font-bold mb-4">Upcoming Stays</h2>
                {myBookings.length === 0 ? (
                  <div className="text-center py-20 border rounded-xl bg-muted/20">
                    <p className="text-muted-foreground mb-4">You don't have any bookings yet.</p>
                    <Button onClick={() => setLocation("/")}>Browse Apartments</Button>
                  </div>
                ) : (
                  myBookings.map((booking) => (
                    <Card key={booking.id} className="overflow-hidden hover:shadow-md transition-shadow">
                      <div className="flex flex-col md:flex-row">
                        <div className="w-full md:w-48 bg-muted/50 flex items-center justify-center p-4">
                           <CalIcon className="w-12 h-12 text-muted-foreground/50" />
                        </div>
                        <div className="flex-1 p-6">
                          <div className="flex justify-between items-start mb-4">
                            <div>
                              <h3 className="font-bold text-lg">Booking #{booking.id}</h3>
                              <p className="text-sm text-muted-foreground">
                                {format(new Date(booking.startDate), "MMM dd, yyyy")} - {format(new Date(booking.endDate), "MMM dd, yyyy")}
                              </p>
                            </div>
                            <div className="flex flex-col gap-2 items-end">
                               <Badge variant={booking.status === 'confirmed' ? 'default' : 'secondary'}>
                                 {booking.status.toUpperCase()}
                               </Badge>
                               <span className="font-bold">{formatPrice(booking.totalPrice, currency, rate)}</span>
                            </div>
                          </div>
                          
                          <div className="flex gap-3 mt-4">
                             {booking.status === 'pending' && (
                               <Button size="sm">Pay Now</Button>
                             )}
                             <Button size="sm" variant="outline">View Receipt</Button>
                          </div>
                        </div>
                      </div>
                    </Card>
                  ))
                )}
              </TabsContent>

              <TabsContent value="payments">
                <Card>
                  <CardHeader>
                    <CardTitle>Transaction History</CardTitle>
                    <CardDescription>View all your past payments.</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="text-center py-10 text-muted-foreground">
                      No transactions recorded.
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>
    </Layout>
  );
}
