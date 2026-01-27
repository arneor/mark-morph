import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api, buildUrl, type CreateCampaignRequest } from "@shared/routes";
import { useToast } from "@/hooks/use-toast";

export function useCampaigns(businessId: number) {
  return useQuery({
    queryKey: [api.campaigns.list.path, businessId],
    queryFn: async () => {
      const url = buildUrl(api.campaigns.list.path, { businessId });
      const res = await fetch(url, { credentials: "include" });
      if (!res.ok) throw new Error("Failed to fetch campaigns");
      return api.campaigns.list.responses[200].parse(await res.json());
    },
    enabled: !!businessId,
  });
}

export function useCreateCampaign() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (data: CreateCampaignRequest) => {
      const validated = api.campaigns.create.input.parse(data);
      const res = await fetch(api.campaigns.create.path, {
        method: api.campaigns.create.method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(validated),
        credentials: "include",
      });

      if (!res.ok) {
        if (res.status === 400) {
          const error = await res.json();
          throw new Error(error.message || "Validation failed");
        }
        throw new Error("Failed to create campaign");
      }
      return api.campaigns.create.responses[201].parse(await res.json());
    },
    onSuccess: (data) => {
      // Invalidate the specific business's campaign list
      if (data.businessId) {
        const listUrl = buildUrl(api.campaigns.list.path, { businessId: data.businessId });
        queryClient.invalidateQueries({ queryKey: [listUrl] });
        // Also simpler key invalidation strategy if URL matching is tricky
        queryClient.invalidateQueries({ queryKey: [api.campaigns.list.path, data.businessId] });
      }
      toast({ title: "Campaign Created", description: "Your ad is now live." });
    },
    onError: (err) => {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    },
  });
}

export function useDeleteCampaign() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({ id, businessId }: { id: number; businessId: number }) => {
      const url = buildUrl(api.campaigns.delete.path, { id });
      const res = await fetch(url, { method: api.campaigns.delete.method, credentials: "include" });
      if (!res.ok) throw new Error("Failed to delete campaign");
      return businessId;
    },
    onSuccess: (businessId) => {
      queryClient.invalidateQueries({ queryKey: [api.campaigns.list.path, businessId] });
      toast({ title: "Deleted", description: "Campaign removed successfully." });
    },
  });
}
