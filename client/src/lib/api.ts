const API_URL =
  process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:5000";

type ApiOptions = {
  method?: "GET" | "POST" | "DELETE" | "PATCH";
  body?: unknown;
};

export async function apiRequest<T>(
  path: string,
  options: ApiOptions = {}
): Promise<T> {
  const response = await fetch(`${API_URL}${path}`, {
    method: options.method ?? "GET",
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    ...(options.body !== undefined
      ? { body: JSON.stringify(options.body) }
      : {}),
  });

  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(data.message ?? `Request failed (${response.status})`);
  }
  return data as T;
}