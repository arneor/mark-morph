import { useQuery, useMutation } from "@tanstack/react-query";
import { api, buildUrl } from "@shared/routes";
import { demoStore } from "@/lib/demoStore";

function isJsonResponse(res: Response) {
  const ct = res.headers.get("content-type") || "";
  return ct.includes("application/json");
}

export function useSplashData(businessId: number) {
  return useQuery({
    queryKey: [api.splash.get.path, businessId],
    queryFn: async () => {
      const url = buildUrl(api.splash.get.path, { businessId });

      try {
        const res = await fetch(url, { credentials: "include" });
        if (res.status === 404) throw new Error("Business not found");

        // On static hosting (e.g. Vercel frontend-only), /api/* often rewrites to index.html
        // (text/html). Treat that as "API unavailable".
        if (!res.ok || !isJsonResponse(res)) {
          throw new Error("API_UNAVAILABLE");
        }

        return api.splash.get.responses[200].parse(await res.json());
      } catch (err: any) {
        if (err?.message === "Business not found") throw err;
        return demoStore.splashGet(businessId);
      }
    },
    // Don't retry if business is not found, it's likely a bad URL
    retry: (failureCount, error) => {
      if (error.message === "Business not found") return false;
      return failureCount < 2;
    },
  });
}

export function useConnectWifi() {
  return useMutation({
    mutationFn: async ({
      businessId,
      ...data
    }: {
      businessId: number;
      userId?: number;
      deviceType?: string;
      email?: string;
    }) => {
      // Simulate network delay for realistic "connecting" feel
      await new Promise((resolve) => setTimeout(resolve, 2000));

      const url = buildUrl(api.splash.connect.path, { businessId });

      try {
        const res = await fetch(url, {
          method: api.splash.connect.method,
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(data),
          credentials: "include",
        });

        if (!res.ok || !isJsonResponse(res)) {
          throw new Error("API_UNAVAILABLE");
        }

        return api.splash.connect.responses[200].parse(await res.json());
      } catch {
        // Static-deploy fallback (no backend)
        return { success: true, redirectUrl: "https://google.com" };
      }
    },
  });
}
