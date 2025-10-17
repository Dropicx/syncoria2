import { useAuth } from "@clerk/nextjs";
import { useMemo } from "react";
import axios from "axios";

export const useApiClient = () => {
  const { getToken } = useAuth();

  const apiClient = useMemo(() => {
    const client = axios.create({
      baseURL: `${process.env.NEXT_PUBLIC_BACKEND_URL}/api`,
      headers: {},
      withCredentials: true,
    });

    // Add request interceptor to include auth token
    client.interceptors.request.use(async (config) => {
      const token = await getToken();
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      return config;
    });

    return client;
  }, [getToken]);

  return apiClient;
};
