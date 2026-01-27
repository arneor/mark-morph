import { useMutation } from "@tanstack/react-query";
import { api, type LoginRequest, type AuthResponse } from "@shared/routes";
import { useToast } from "@/hooks/use-toast";

export function useLogin() {
  const { toast } = useToast();
  
  return useMutation({
    mutationFn: async (credentials: LoginRequest) => {
      const res = await fetch(api.auth.login.path, {
        method: api.auth.login.method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(credentials),
        credentials: "include",
      });
      
      if (!res.ok) {
        if (res.status === 401) throw new Error("Invalid username");
        throw new Error("Login failed");
      }
      
      return api.auth.login.responses[200].parse(await res.json());
    },
    onError: (error) => {
      toast({
        title: "Login Failed",
        description: error.message,
        variant: "destructive",
      });
    },
    onSuccess: (data) => {
      toast({
        title: `Welcome back, ${data.username}!`,
        description: "You have successfully logged in.",
      });
    },
  });
}
