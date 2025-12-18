interface FetchOptions extends RequestInit {
  skipRefresh?: boolean;
}

export async function fetchExtended(
  url: string,
  options: FetchOptions = {}
): Promise<Response> {
  const isServer = typeof window === "undefined";
  const baseURL = process.env.NEXT_PUBLIC_JCHAT_API_URL;

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };

  if (options.headers) {
    const existingHeaders = new Headers(options.headers);
    existingHeaders.forEach((value, key) => {
      headers[key] = value;
    });
  }

  if (isServer) {
    try {
      const { cookies } = await import("next/headers");
      const cookieStore = await cookies();
      const accessToken = cookieStore.get("accessToken")?.value;
      const refreshToken = cookieStore.get("refreshToken")?.value;

      const cookieHeader = [];
      if (accessToken) cookieHeader.push(`accessToken=${accessToken}`);
      if (refreshToken) cookieHeader.push(`refreshToken=${refreshToken}`);

      if (cookieHeader.length > 0) {
        headers["Cookie"] = cookieHeader.join("; ");
      }
    } catch (error) {
      console.warn("Cannot access cookies");
    }
  }

  // skipRefresh 제거한 options 생성
  const { skipRefresh, ...fetchOptions } = options;

  const response = await fetch(url, {
    ...fetchOptions,
    headers,
    credentials: isServer ? "omit" : "include",
  });

  // 클라이언트에서만 자동 갱신
  if (!isServer && response.status === 401 && !skipRefresh) {
    console.log("Token expired, attempting refresh...");

    const refreshResponse = await fetch(`${baseURL}/auth/refreshToken`, {
      method: "POST",
      credentials: "include",
    });

    if (refreshResponse.ok) {
      console.log("Token refreshed, retrying original request...");

      // 재귀 호출 시 skipRefresh: true 전달
      return fetchExtended(url, {
        ...options,
        skipRefresh: true, // 무한 루프 방지
      });
    } else {
      console.error("Refresh token expired, redirecting to login...");
      window.location.href = "/mem/login";
      throw new Error("Authentication required");
    }
  }

  return response;
}

// 편의 메서드
export const api = {
  get: (url: string, options?: FetchOptions) =>
    fetchExtended(url, { ...options, method: "GET" }),

  post: (url: string, body?: any, options?: FetchOptions) =>
    fetchExtended(url, {
      ...options,
      method: "POST",
      body: JSON.stringify(body),
    }),

  put: (url: string, body?: any, options?: FetchOptions) =>
    fetchExtended(url, {
      ...options,
      method: "PUT",
      body: JSON.stringify(body),
    }),

  delete: (url: string, options?: FetchOptions) =>
    fetchExtended(url, { ...options, method: "DELETE" }),
};
