import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api, buildUrl } from "@shared/routes";
import type { CreateCampaignRequest } from "@shared/schema";
import { useToast } from "@/hooks/use-toast";
import { demoStore } from "@/lib/demoStore";

function isJsonResponse(res: Response) {
  const ct = res.headers.get("content-type") || "";
  return ct.includes("application/json");
}

export function useCampaigns(businessId: number) {
  return useQuery({
    queryKey: [api.campaigns.list.path, businessId],
    queryFn: async () => {
      const url = buildUrl(api.campaigns.list.path, { businessId });

      try {
        const res = await fetch(url, { credentials: "include" });
        if (!res.ok || !isJsonResponse(res)) throw new Error("API_UNAVAILABLE");
        return api.campaigns.list.responses[200].parse(await res.json());
      } catch {
        return demoStore.listCampaignsByBusiness(businessId);
      }
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

      try {
        const res = await fetch(api.campaigns.create.path, {
          method: api.campaigns.create.method,
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(validated),
          credentials: "include",
        });

        if (!res.ok || !isJsonResponse(res)) throw new Error("API_UNAVAILABLE");

        if (res.status === 400) {
          const error = await res.json();
          throw new Error(error.message || "Validation failed");
        }

        return api.campaigns.create.responses[201].parse(await res.json());
      } catch {
        return demoStore.createCampaign(validated as any);
      }
    },
    onSuccess: (data) => {
      // Always invalidate global list (admin view)
      queryClient.invalidateQueries({ queryKey: [api.campaigns.listAll.path] });

      // Invalidate the specific business's campaign list
      if (data.businessId) {
        const listUrl = buildUrl(api.campaigns.list.path, {
          businessId: data.businessId,
        });
        queryClient.invalidateQueries({ queryKey: [listUrl] });
        // Also simpler key invalidation strategy if URL matching is tricky
        queryClient.invalidateQueries({
          queryKey: [api.campaigns.list.path, data.businessId],
        });
      }
      toast({ title: "Campaign Created", description: "Your ad is now live." });
    },
    onError: (err) => {
      toast({
        title: "Error",
        description: err.message,
        variant: "destructive",
      });
    },
  });
}

export function useDeleteCampaign() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({
      id,
      businessId,
    }: {
      id: number;
      businessId: number;
    }) => {
      const url = buildUrl(api.campaigns.delete.path, { id });

      try {
        const res = await fetch(url, {
          method: api.campaigns.delete.method,
          credentials: "include",
        });
        if (!res.ok || !isJsonResponse(res)) throw new Error("API_UNAVAILABLE");
      } catch {
        demoStore.deleteCampaign(id);
      }
      return businessId;
    },
    onSuccess: (businessId) => {
      queryClient.invalidateQueries({
        queryKey: [api.campaigns.list.path, businessId],
      });
      toast({
        title: "Deleted",
        description: "Campaign removed successfully.",
      });
    },
  });
}
