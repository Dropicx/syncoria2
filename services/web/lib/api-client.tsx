import axios from "axios";
import { useAuth } from "@clerk/nextjs";

// Create a function to get the API client with auth token
export const createApiClient = () => {
  const { getToken } = useAuth();
  
  const apiClient = axios.create({
    baseURL: `${process.env.NEXT_PUBLIC_BACKEND_URL}/api`,
    headers: {},
    withCredentials: true,
  });

  // Add request interceptor to include auth token
  apiClient.interceptors.request.use(async (config) => {
    const token = await getToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  });

  return apiClient;
};

// For backward compatibility, create a default client
export const apiClient = axios.create({
  baseURL: `${process.env.NEXT_PUBLIC_BACKEND_URL}/api`,
  headers: {},
  withCredentials: true,
});
