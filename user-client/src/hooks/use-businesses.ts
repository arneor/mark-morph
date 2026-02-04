import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { businessApi, type Business, type DashboardStats } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";

export function useBusiness(id: string) {
  return useQuery({
    queryKey: ["business", id],
    queryFn: async () => {
      // If we don't have an ID (e.g. during initial load/redirect), return null
      // or if ID is "new", we might handle it differently.
      if (!id || id === "new") return null;
      try {
        return await businessApi.getById(id);
      } catch (error: unknown) {
        const err = error as { statusCode?: number };
        if (err.statusCode === 404) return null;
        throw error;
      }
    },
    enabled: !!id && id !== "new",
  });
}

// Hook to get the current user's business
export function useMyBusiness() {
  return useQuery({
    queryKey: ["my-business"],
    queryFn: async () => {
      return await businessApi.getMyBusiness();
    },
  });
}

export function useBusinessStats(id: string) {
  return useQuery({
    queryKey: ["business-stats", id],
    queryFn: async () => {
      try {
        return await businessApi.getDashboardStats(id);
      } catch {
        // Return structured fallback data on error
        return {
          totalConnections: 0,
          activeUsers: 0,
          totalAdsServed: 0,
          totalViews: 0,
          totalClicks: 0,
          ctr: 0,
          revenue: 0,
          connectionsHistory: [],
        } as DashboardStats;
      }
    },
    enabled: !!id,
  });
}

export function useUpdateBusiness() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({
      id,
      ...updates
    }: { id: string } & Partial<Business>) => {
      return await businessApi.update(id, updates);
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({
        queryKey: ["business", data.id],
      });
      queryClient.invalidateQueries({
        queryKey: ["my-business"],
      });
      toast({
        title: "Profile Updated",
        description: "Business settings saved successfully.",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to update profile.",
        variant: "destructive",
      });
    },
  });
}

export function useRegisterBusiness() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (data: {
      businessName: string;
      location?: string;
      category?: string;
      contactEmail?: string;
      contactPhone?: string;
    }) => {
      return await businessApi.register(data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["my-business"],
      });
      toast({
        title: "Business Registered",
        description: "Your business has been successfully created.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Registration Failed",
        description: error.message || "Failed to register business.",
        variant: "destructive",
      });
    },
  });
}
