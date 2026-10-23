import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api, buildUrl } from "@shared/routes";
import type { InsertApartment, Apartment } from "@shared/schema";
import { supabase } from "@/lib/supabase";

const apartmentImageBucket = "property-images";

export async function uploadApartmentImage(file: File): Promise<string> {
  if (!supabase) throw new Error("Supabase is not configured.");
  if (!file.type.startsWith("image/")) throw new Error("Choose an image file.");
  if (file.size > 6 * 1024 * 1024) throw new Error("Images must be 6 MB or smaller.");

  const extension = file.name.split(".").pop()?.toLowerCase() || "jpg";
  const path = `apartments/${crypto.randomUUID()}.${extension}`;
  const { error } = await supabase.storage.from(apartmentImageBucket).upload(path, file, {
    contentType: file.type,
    cacheControl: "31536000",
    upsert: false,
  });
  if (error) throw new Error(error.message);

  return supabase.storage.from(apartmentImageBucket).getPublicUrl(path).data.publicUrl;
}

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
      if (!res.ok) throw new Error(`${res.status}: Failed to fetch apartments`);
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
      if (!res.ok) throw new Error(`${res.status}: Failed to fetch apartment`);
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
