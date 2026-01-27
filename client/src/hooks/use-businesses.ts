import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api, buildUrl, type UpdateBusinessRequest } from "@shared/routes";
import { useToast } from "@/hooks/use-toast";

export function useBusiness(id: number) {
  return useQuery({
    queryKey: [api.businesses.get.path, id],
    queryFn: async () => {
      const url = buildUrl(api.businesses.get.path, { id });
      const res = await fetch(url, { credentials: "include" });
      if (res.status === 404) return null;
      if (!res.ok) throw new Error("Failed to fetch business profile");
      return api.businesses.get.responses[200].parse(await res.json());
    },
    enabled: !!id,
  });
}

export function useBusinessStats(id: number) {
  return useQuery({
    queryKey: [api.businesses.dashboardStats.path, id],
    queryFn: async () => {
      const url = buildUrl(api.businesses.dashboardStats.path, { id });
      const res = await fetch(url, { credentials: "include" });
      if (!res.ok) throw new Error("Failed to fetch dashboard stats");
      return api.businesses.dashboardStats.responses[200].parse(await res.json());
    },
    enabled: !!id,
  });
}

export function useUpdateBusiness() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({ id, ...updates }: { id: number } & UpdateBusinessRequest) => {
      const url = buildUrl(api.businesses.update.path, { id });
      const res = await fetch(url, {
        method: api.businesses.update.method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updates),
        credentials: "include",
      });

      if (!res.ok) throw new Error("Failed to update business");
      return api.businesses.update.responses[200].parse(await res.json());
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: [api.businesses.get.path, data.id] });
      toast({ title: "Profile Updated", description: "Business settings saved successfully." });
    },
    onError: () => {
      toast({ title: "Error", description: "Failed to update profile.", variant: "destructive" });
    },
  });
}
