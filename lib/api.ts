export const BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8080";

// ── 카테고리 ──────────────────────────────────────────
export interface Category {
  id: number;
  taobaoCid?: string;
  nameOriginal?: string;
  nameKo: string;
  sortOrder?: number;
  icon?: string;
  parent?: { id: number; nameKo: string };
}

// ── 필터 설정 ─────────────────────────────────────────
export interface FilterSettings {
  id?: number;
  minMarginRate: number;
  minSalesVolume: number;
  minSellingPriceKrw: number;
  maxOriginalPriceCny: number;
  updatedAt?: string;
}

// ── 필터 적용 결과 ─────────────────────────────────────
export interface ApplyFilterResult {
  approved: number;
  rejected: number;
  skipped: number;
  errors: number;
}

async function apiFetch<T>(path: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${BASE_URL}${path}`, {
    headers: { "Content-Type": "application/json" },
    ...options,
  });
  if (!res.ok) throw new Error(`API ${res.status}: ${path}`);
  return res.json();
}

// ── 공통 래퍼 ─────────────────────────────────────────
export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
}

// ── 타입 ──────────────────────────────────────────────
export interface StatusCount {
  imported: number;
  approved: number;
  listed: number;
  suspended: number;
  soldOut: number;
  hidden: number;
  rejected: number;
}

export interface ProductVariant {
  id: number;
  skuId: string;
  optionName?: string;
  priceCny?: number;
  stock?: number;
  imageUrl?: string;
}

export interface ProductImage {
  id: number;
  imageUrl: string;
  sortOrder?: number;
}

export interface Product {
  id: number;
  taobaoItemId: string;
  /** 목록 API (ListItem): 한국어 제목 우선 병합된 단일 필드 */
  title?: string;
  /** 상세 API (Detail): 원제목(중국어) */
  titleOriginal?: string;
  /** 상세 API (Detail): 한국어 번역 제목 */
  titleKo?: string;
  description?: string;
  descriptionKo?: string;
  originalPriceCny: number;
  sellingPriceKrw: number;
  status: string;
  stockQuantity: number;
  salesVolume: number;
  mainImageUrl?: string;
  sellerNick?: string;
  syncedAt: string;
  createdAt?: string;
  categoryName?: string;
  variants?: ProductVariant[];
  images?: ProductImage[];
}

export interface ProductPage {
  content: Product[];
  totalElements: number;
  totalPages: number;
  number: number;
  size: number;
}

// ── API 함수 ──────────────────────────────────────────

export async function getStats(): Promise<StatusCount> {
  const res = await apiFetch<ApiResponse<StatusCount>>("/api/products/stats");
  return res.data;
}

export async function getProducts(params?: {
  page?: number;
  size?: number;
  keyword?: string;
  status?: string;
}): Promise<ProductPage> {
  const q = new URLSearchParams();
  if (params?.page !== undefined) q.set("page", String(params.page));
  if (params?.size !== undefined) q.set("size", String(params.size));
  if (params?.keyword) q.set("keyword", params.keyword);
  if (params?.status) q.set("status", params.status);
  const res = await apiFetch<ApiResponse<ProductPage>>(`/api/products?${q}`);
  return res.data;
}

export async function getProduct(id: number): Promise<Product> {
  const res = await apiFetch<ApiResponse<Product>>(`/api/products/${id}`);
  return res.data;
}

export async function syncProducts(): Promise<{ synced: number; failed: number }> {
  const res = await apiFetch<ApiResponse<{ synced: number; failed: number }>>(
    "/api/sync/all",
    { method: "POST" }
  );
  return res.data;
}

export async function updateProductStatus(
  id: number,
  status: string
): Promise<void> {
  await apiFetch(`/api/products/${id}/status`, {
    method: "PATCH",
    body: JSON.stringify({ status }),
  });
}

export interface UploadedImage {
  id: number;
  imageUrl: string;
  sortOrder: number;
}

/**
 * 이미지 업로드 (XMLHttpRequest — 진행률 콜백 지원)
 * 서버 검증 실패 시 에러 메시지 throw
 */
export function uploadProductImage(
  productId: number,
  file: File,
  onProgress?: (pct: number) => void
): Promise<UploadedImage> {
  return new Promise((resolve, reject) => {
    const formData = new FormData();
    formData.append("file", file);

    const xhr = new XMLHttpRequest();
    xhr.open("POST", `${BASE_URL}/api/products/${productId}/images`);

    xhr.upload.onprogress = (e) => {
      if (e.lengthComputable && onProgress) {
        onProgress(Math.round((e.loaded / e.total) * 100));
      }
    };

    xhr.onload = () => {
      try {
        const res = JSON.parse(xhr.responseText) as ApiResponse<UploadedImage>;
        if (xhr.status === 200 && res.success) {
          resolve(res.data);
        } else {
          reject(new Error(res.message ?? "업로드 실패"));
        }
      } catch {
        reject(new Error("서버 응답 파싱 실패"));
      }
    };

    xhr.onerror = () => reject(new Error("네트워크 오류"));
    xhr.send(formData);
  });
}

export async function deleteProductImage(
  productId: number,
  imageId: number
): Promise<void> {
  await apiFetch(`/api/products/${productId}/images/${imageId}`, { method: "DELETE" });
}

// ── 카테고리 API ─────────────────────────────────────
export async function getCategories(): Promise<Category[]> {
  const res = await apiFetch<ApiResponse<Category[]>>("/api/categories");
  return res.data;
}

export async function updateCategory(id: number, data: { nameKo: string; icon?: string }): Promise<Category> {
  const res = await apiFetch<ApiResponse<Category>>(`/api/categories/${id}`, {
    method: "PUT",
    body: JSON.stringify(data),
  });
  return res.data;
}

// ── 필터 설정 API ─────────────────────────────────────
export async function getFilterSettings(): Promise<FilterSettings> {
  const res = await apiFetch<ApiResponse<FilterSettings>>("/api/settings/filter");
  return res.data;
}

export async function updateFilterSettings(data: FilterSettings): Promise<FilterSettings> {
  const res = await apiFetch<ApiResponse<FilterSettings>>("/api/settings/filter", {
    method: "PUT",
    body: JSON.stringify(data),
  });
  return res.data;
}

export async function applyProfitFilter(): Promise<ApplyFilterResult> {
  const res = await apiFetch<ApiResponse<ApplyFilterResult>>("/api/products/apply-filter", {
    method: "POST",
  });
  return res.data;
}

export async function updateProduct(
  id: number,
  data: {
    titleKo?: string;
    sellingPriceKrw?: number;
    status?: string;
    mainImageUrl?: string;
    descriptionKo?: string;
  }
): Promise<Product> {
  const res = await apiFetch<ApiResponse<Product>>(`/api/products/${id}`, {
    method: "PUT",
    body: JSON.stringify(data),
  });
  return res.data;
}

// ── 쇼핑몰 등록 타입 ──────────────────────────────────

export const PLATFORM_META: Record<string, { label: string; cls: string }> = {
  SMARTSTORE: { label: "스마트스토어", cls: "bg-blue-100 text-blue-700 border-blue-300" },
  COUPANG:    { label: "쿠팡",         cls: "bg-red-100 text-red-700 border-red-300" },
  ELEVEN_ST:  { label: "11번가",       cls: "bg-amber-100 text-amber-700 border-amber-300" },
  GMARKET:    { label: "G마켓",        cls: "bg-green-100 text-green-700 border-green-300" },
};

export const LISTING_STATUS_META: Record<string, { label: string; cls: string }> = {
  ACTIVE:  { label: "판매중",   cls: "bg-green-100 text-green-700 border-green-300" },
  PAUSED:  { label: "일시중지", cls: "bg-amber-100 text-amber-700 border-amber-300" },
  REMOVED: { label: "삭제됨",   cls: "bg-gray-100 text-gray-500 border-gray-300" },
};

export interface ShopListing {
  id: number;
  productId: number;
  productTitle: string;
  productMainImage?: string;
  platform: string;
  platformDisplayName: string;
  externalProductId?: string;
  listedPriceKrw: number;
  status: string;
  listedAt: string;
  pausedAt?: string;
  removedAt?: string;
  createdAt: string;
}

export interface PlatformStats {
  platform: string;
  displayName: string;
  total: number;
  active: number;
  paused: number;
  removed: number;
}

// ── 쇼핑몰 등록 API ───────────────────────────────────

export async function getShopListings(params?: {
  platform?: string;
  status?: string;
}): Promise<ShopListing[]> {
  const q = new URLSearchParams();
  if (params?.platform) q.set("platform", params.platform);
  if (params?.status)   q.set("status",   params.status);
  const qs = q.toString();
  const res = await apiFetch<ApiResponse<ShopListing[]>>(
    `/api/shop-listings${qs ? `?${qs}` : ""}`
  );
  return res.data;
}

export async function createShopListing(data: {
  productId: number;
  platform: string;
  listedPriceKrw: number;
}): Promise<ShopListing> {
  const res = await fetch(`${BASE_URL}/api/shop-listings`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  const json = await res.json() as ApiResponse<ShopListing> & { error?: { message?: string } };
  if (!json.success) throw new Error(json.error?.message ?? "등록 실패");
  return json.data;
}

export async function pauseShopListing(id: number): Promise<ShopListing> {
  const res = await apiFetch<ApiResponse<ShopListing>>(`/api/shop-listings/${id}/pause`, {
    method: "PATCH",
  });
  return res.data;
}

export async function resumeShopListing(id: number): Promise<ShopListing> {
  const res = await apiFetch<ApiResponse<ShopListing>>(`/api/shop-listings/${id}/resume`, {
    method: "PATCH",
  });
  return res.data;
}

export async function removeShopListing(id: number): Promise<ShopListing> {
  const res = await apiFetch<ApiResponse<ShopListing>>(`/api/shop-listings/${id}/remove`, {
    method: "PATCH",
  });
  return res.data;
}

export async function getShopListingStats(): Promise<PlatformStats[]> {
  const res = await apiFetch<ApiResponse<PlatformStats[]>>("/api/shop-listings/stats");
  return res.data;
}
