import { useAuth } from "@clerk/clerk-react";
import { useCallback } from "react";

export function useApi() {
  const { getToken } = useAuth();

  const fetchWithToken = useCallback(
    async (endpoint: string, options: RequestInit = {}) => {
      try {
        const token = await getToken();
        
        const headers: Record<string, string> = {
          "Content-Type": "application/json",
          ...(options.headers as Record<string, string>),
        };

        if (token) {
          headers.Authorization = `Bearer ${token}`;
        }

        const response = await fetch(`/api${endpoint}`, {
          ...options,
          headers,
        });

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
        }

        return await response.json();
      } catch (error) {
        console.error("API call failed:", error);
        throw error;
      }
    },
    [getToken]
  );

  return { fetchWithToken };
}
