import { auth } from "@clerk/nextjs/server";

export async function createAuthenticatedFetch() {
  const { getToken } = auth();
  
  return async (url: string, options: RequestInit = {}) => {
    const token = await getToken();
    
    const headers = {
      ...options.headers,
      ...(token && { Authorization: `Bearer ${token}` }),
    };

    return fetch(url, {
      ...options,
      headers,
      credentials: "include",
    });
  };
}
