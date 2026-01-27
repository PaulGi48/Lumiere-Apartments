import { Layout } from "@/components/layout";
import { useAuth } from "@/hooks/use-auth";
import { useMaintenanceRequests, useUpdateMaintenanceStatus } from "@/hooks/use-maintenance";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { Loader2 } from "lucide-react";

export default function SupportDashboard() {
  const { user } = useAuth();
  const { data: requests, isLoading } = useMaintenanceRequests();
  const updateStatus = useUpdateMaintenanceStatus();

  if (!user || (user.role !== 'support' && user.role !== 'admin')) {
     return <div className="p-8">Unauthorized Access</div>;
  }

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-display font-bold mb-8">Support & Maintenance</h1>
        
        {isLoading ? (
          <div className="flex justify-center p-12"><Loader2 className="animate-spin" /></div>
        ) : (
          <div className="grid grid-cols-1 gap-4">
            {requests?.map((request) => (
              <Card key={request.id}>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <div className="flex items-center gap-4">
                    <CardTitle className="text-base font-medium">Request #{request.id}</CardTitle>
                    <Badge variant={
                      request.priority === 'high' ? 'destructive' : 
                      request.priority === 'medium' ? 'default' : 'secondary'
                    }>
                      {request.priority.toUpperCase()}
                    </Badge>
                  </div>
                  <Select 
                    defaultValue={request.status} 
                    onValueChange={(val) => updateStatus.mutate({ 
                      id: request.id, 
                      status: val as "open" | "in_progress" | "resolved" 
                    })}
                  >
                    <SelectTrigger className="w-[180px]">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="open">Open</SelectItem>
                      <SelectItem value="in_progress">In Progress</SelectItem>
                      <SelectItem value="resolved">Resolved</SelectItem>
                    </SelectContent>
                  </Select>
                </CardHeader>
                <CardContent>
                  <p className="mt-2 text-sm">{request.description}</p>
                  <div className="mt-4 text-xs text-muted-foreground flex justify-between">
                     <span>Apartment #{request.apartmentId}</span>
                     <span>Reported on {format(new Date(request.createdAt || new Date()), "MMM dd, yyyy")}</span>
                  </div>
                </CardContent>
              </Card>
            ))}
            {requests?.length === 0 && <p className="text-muted-foreground">No open maintenance tickets.</p>}
          </div>
        )}
      </div>
    </Layout>
  );
}
