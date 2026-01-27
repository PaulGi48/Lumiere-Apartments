import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api, buildUrl } from "@shared/routes";
import type { InsertApartment, Apartment } from "@shared/schema";

export function useApartments(filters?: { minPrice?: number; maxPrice?: number; bedrooms?: number }) {
  const queryKey = [api.apartments.list.path, filters];
  return useQuery({
    queryKey,
    queryFn: async () => {
      const url = new URL(api.apartments.list.path, window.location.origin);
      if (filters) {
        Object.entries(filters).forEach(([key, val]) => {
          if (val !== undefined) url.searchParams.append(key, String(val));
        });
      }
      const res = await fetch(url.toString(), { credentials: "include" });
      if (!res.ok) throw new Error("Failed to fetch apartments");
      return api.apartments.list.responses[200].parse(await res.json());
    },
  });
}

export function useApartment(id: number) {
  return useQuery({
    queryKey: [api.apartments.get.path, id],
    queryFn: async () => {
      const url = buildUrl(api.apartments.get.path, { id });
      const res = await fetch(url, { credentials: "include" });
      if (!res.ok) throw new Error("Failed to fetch apartment");
      return api.apartments.get.responses[200].parse(await res.json());
    },
    enabled: !!id,
  });
}

export function useCreateApartment() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: InsertApartment) => {
      const res = await fetch(api.apartments.create.path, {
        method: api.apartments.create.method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
        credentials: "include",
      });
      if (!res.ok) throw new Error("Failed to create apartment");
      return api.apartments.create.responses[201].parse(await res.json());
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [api.apartments.list.path] });
    },
  });
}

export function useUpdateApartment() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, ...data }: { id: number } & Partial<InsertApartment>) => {
      const url = buildUrl(api.apartments.update.path, { id });
      const res = await fetch(url, {
        method: api.apartments.update.method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
        credentials: "include",
      });
      if (!res.ok) throw new Error("Failed to update apartment");
      return api.apartments.update.responses[200].parse(await res.json());
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [api.apartments.list.path] });
    },
  });
}
