import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api, buildUrl } from "@shared/routes";
import { z } from "zod";

type InsertMaintenance = z.infer<typeof api.maintenance.create.input>;

export function useMaintenanceRequests() {
  return useQuery({
    queryKey: [api.maintenance.list.path],
    queryFn: async () => {
      const res = await fetch(api.maintenance.list.path, { credentials: "include" });
      if (!res.ok) throw new Error("Failed to fetch maintenance requests");
      return api.maintenance.list.responses[200].parse(await res.json());
    },
  });
}

export function useCreateMaintenance() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: InsertMaintenance) => {
      const res = await fetch(api.maintenance.create.path, {
        method: api.maintenance.create.method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
        credentials: "include",
      });
      if (!res.ok) throw new Error("Failed to create request");
      return api.maintenance.create.responses[201].parse(await res.json());
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [api.maintenance.list.path] });
    },
  });
}

export function useUpdateMaintenanceStatus() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, status }: { id: number, status: "open" | "in_progress" | "resolved" }) => {
      const url = buildUrl(api.maintenance.updateStatus.path, { id });
      const res = await fetch(url, {
        method: api.maintenance.updateStatus.method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
        credentials: "include",
      });
      if (!res.ok) throw new Error("Failed to update status");
      return api.maintenance.updateStatus.responses[200].parse(await res.json());
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [api.maintenance.list.path] });
    },
  });
}
