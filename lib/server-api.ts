import "server-only";

import { BASE_URL, type ApiResponse, type Product, type StatusCount } from "@/lib/api";
import { cookies } from "next/headers";

function buildCookieHeader(items: { name: string; value: string }[]) {
  return items.map(({ name, value }) => `${name}=${value}`).join("; ");
}

async function serverApiFetch<T>(path: string): Promise<T> {
  const cookieStore = await cookies();
  const response = await fetch(`${BASE_URL}${path}`, {
    headers: {
      cookie: buildCookieHeader(cookieStore.getAll()),
    },
    cache: "no-store",
  });

  if (!response.ok) {
    throw new Error(`API ${response.status}: ${path}`);
  }

  const payload = (await response.json()) as ApiResponse<T>;
  return payload.data;
}

export function getServerStats() {
  return serverApiFetch<StatusCount>("/api/products/stats");
}

export function getServerProduct(id: number) {
  return serverApiFetch<Product>(`/api/products/${id}`);
}
