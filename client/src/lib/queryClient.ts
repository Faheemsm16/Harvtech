import { QueryClient, QueryFunction } from "@tanstack/react-query";

async function throwIfResNotOk(res: Response) {
  if (!res.ok) {
    const text = (await res.text()) || res.statusText;
    throw new Error(`${res.status}: ${text}`);
  }
}

export async function apiRequest(
  method: string,
  url: string,
  data?: unknown | undefined,
): Promise<Response> {
  // Get user ID from localStorage for authentication
  let headers: Record<string, string> = {};
  
  if (data) {
    headers["Content-Type"] = "application/json";
  }
  
  const storedUser = localStorage.getItem('harvtech_user');
  if (storedUser) {
    try {
      const user = JSON.parse(storedUser);
      if (user.id) {
        headers["Authorization"] = `Bearer ${user.id}`;
      }
    } catch (error) {
      console.error('Error parsing stored user for auth:', error);
    }
  }

  const res = await fetch(url, {
    method,
    headers,
    body: data ? JSON.stringify(data) : undefined,
    credentials: "include",
  });

  await throwIfResNotOk(res);
  return res;
}

type UnauthorizedBehavior = "returnNull" | "throw";
export const getQueryFn: <T>(options: {
  on401: UnauthorizedBehavior;
}) => QueryFunction<T> =
  ({ on401: unauthorizedBehavior }) =>
  async ({ queryKey }) => {
    // Get user ID from localStorage for authentication
    let headers: Record<string, string> = {};
    
    const storedUser = localStorage.getItem('harvtech_user');
    if (storedUser) {
      try {
        const user = JSON.parse(storedUser);
        if (user.id) {
          headers["Authorization"] = `Bearer ${user.id}`;
        }
      } catch (error) {
        console.error('Error parsing stored user for auth:', error);
      }
    }

    const res = await fetch(queryKey.join("/") as string, {
      headers,
      credentials: "include",
    });

    if (unauthorizedBehavior === "returnNull" && res.status === 401) {
      return null;
    }

    await throwIfResNotOk(res);
    return await res.json();
  };

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      queryFn: getQueryFn({ on401: "throw" }),
      refetchInterval: false,
      refetchOnWindowFocus: false,
      staleTime: Infinity,
      retry: false,
    },
    mutations: {
      retry: false,
    },
  },
});
