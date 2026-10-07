export async function api<T>(path: string, method = "GET", data?: unknown): Promise<T> {
  const response = await fetch(path, { method, credentials: "same-origin", cache: "no-store", ...(data !== undefined ? { headers: { "Content-Type": "application/json" }, body: JSON.stringify(data) } : {}) });
  const result = await response.json();
  if (!response.ok) throw new Error(result.error || "요청을 처리하지 못했습니다.");
  return result as T;
}
