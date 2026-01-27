import { useQuery, useMutation } from "@tanstack/react-query";
import { api, buildUrl } from "@shared/routes";

export function useSplashData(businessId: number) {
  return useQuery({
    queryKey: [api.splash.get.path, businessId],
    queryFn: async () => {
      const url = buildUrl(api.splash.get.path, { businessId });
      const res = await fetch(url, { credentials: "include" });
      if (res.status === 404) throw new Error("Business not found");
      if (!res.ok) throw new Error("Failed to load splash page");
      return api.splash.get.responses[200].parse(await res.json());
    },
    // Don't retry if business is not found, it's likely a bad URL
    retry: (failureCount, error) => {
      if (error.message === "Business not found") return false;
      return failureCount < 2;
    }
  });
}

export function useConnectWifi() {
  return useMutation({
    mutationFn: async ({ businessId, ...data }: { businessId: number; userId?: number; deviceType?: string }) => {
      // Simulate network delay for realistic "connecting" feel
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      const url = buildUrl(api.splash.connect.path, { businessId });
      const res = await fetch(url, {
        method: api.splash.connect.method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
        credentials: "include",
      });

      if (!res.ok) throw new Error("Failed to connect");
      return api.splash.connect.responses[200].parse(await res.json());
    }
  });
}
