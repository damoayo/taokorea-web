"use client";

import { useRef, useState, useCallback } from "react";
import NextImage from "next/image";
import { Star, Trash2, Upload } from "lucide-react";
import { uploadProductImage, deleteProductImage } from "@/lib/api";
import type { ProductImage } from "@/lib/api";
import { passthroughImageLoader } from "@/lib/image";

// ── 제한 상수 ───────────────────────────────────────────
const MAX_SIZE_MB    = 2;
const MAX_SIZE_BYTES = MAX_SIZE_MB * 1024 * 1024;
const ALLOWED_TYPES  = ["image/jpeg", "image/jpg", "image/png", "image/webp"];
const MIN_DIM        = 50;
const MAX_DIM        = 4000;
const MAX_COUNT      = 10;

// ── 타입 ────────────────────────────────────────────────
interface UploadingItem {
  tempId: string;
  preview: string;
  progress: number;
}

interface Props {
  productId: number;
  images: ProductImage[];
  mainImageUrl: string;
  onImagesChange: (images: ProductImage[]) => void;
  onMainImageChange: (url: string) => void;
  onToast: (msg: string, type: "success" | "error") => void;
}

// ── 유틸 ────────────────────────────────────────────────
function checkDimensions(file: File): Promise<{ w: number; h: number }> {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload  = () => { URL.revokeObjectURL(url); resolve({ w: img.naturalWidth, h: img.naturalHeight }); };
    img.onerror = () => { URL.revokeObjectURL(url); reject(); };
    img.src = url;
  });
}

function quickValidate(file: File): string | null {
  if (!ALLOWED_TYPES.includes(file.type)) {
    return "2MB 이하의 JPG, PNG, WEBP 파일만 업로드 가능합니다.";
  }
  if (file.size > MAX_SIZE_BYTES) {
    return `파일 크기는 ${MAX_SIZE_MB}MB 이하여야 합니다. (현재: ${(file.size / 1024 / 1024).toFixed(1)}MB)`;
  }
  return null;
}

// ── 컴포넌트 ────────────────────────────────────────────
export default function ProductImageGallery({
  productId,
  images,
  mainImageUrl,
  onImagesChange,
  onMainImageChange,
  onToast,
}: Props) {
  const inputRef               = useRef<HTMLInputElement>(null);
  const [dragOver, setDragOver]  = useState(false);
  const [uploading, setUploading] = useState<UploadingItem[]>([]);
  const [dragIndex, setDragIndex] = useState<number | null>(null);

  // ── 파일 처리 ──────────────────────────────────────────
  const processFiles = useCallback(
    async (fileList: FileList | File[]) => {
      const remaining = MAX_COUNT - images.length;
      const files     = Array.from(fileList).slice(0, remaining);

      if (files.length === 0) {
        onToast(`이미지는 최대 ${MAX_COUNT}장까지 등록 가능합니다.`, "error");
        return;
      }

      for (const file of files) {
        // 빠른 검증 (타입·용량)
        const quickErr = quickValidate(file);
        if (quickErr) { onToast(quickErr, "error"); continue; }

        // 해상도 검증
        try {
          const { w, h } = await checkDimensions(file);
          if (w < MIN_DIM || h < MIN_DIM) {
            onToast(`이미지 크기는 ${MIN_DIM}×${MIN_DIM} 이상이어야 합니다. (현재: ${w}×${h})`, "error");
            continue;
          }
          if (w > MAX_DIM || h > MAX_DIM) {
            onToast(`이미지 크기는 ${MAX_DIM}×${MAX_DIM} 이하여야 합니다. (현재: ${w}×${h})`, "error");
            continue;
          }
        } catch {
          onToast("이미지를 읽을 수 없습니다.", "error");
          continue;
        }

        // 업로드
        const tempId  = Math.random().toString(36).slice(2);
        const preview = URL.createObjectURL(file);
        setUploading((prev) => [...prev, { tempId, preview, progress: 0 }]);

        try {
          const uploaded = await uploadProductImage(productId, file, (pct) => {
            setUploading((prev) =>
              prev.map((u) => (u.tempId === tempId ? { ...u, progress: pct } : u))
            );
          });

          // images 상태는 외부(부모)에서 관리 — ref로 최신값을 가져옴
          onImagesChange([
            ...images,
            { id: uploaded.id, imageUrl: uploaded.imageUrl, sortOrder: images.length },
          ]);
          if (!mainImageUrl) onMainImageChange(uploaded.imageUrl);
          onToast("이미지가 업로드되었습니다.", "success");
        } catch (e) {
          onToast(e instanceof Error ? e.message : "업로드 실패", "error");
        } finally {
          setUploading((prev) => prev.filter((u) => u.tempId !== tempId));
          URL.revokeObjectURL(preview);
        }
      }
    },
    [images, mainImageUrl, productId, onImagesChange, onMainImageChange, onToast]
  );

  // ── 삭제 ──────────────────────────────────────────────
  async function handleDelete(imageId: number, imageUrl: string) {
    try {
      await deleteProductImage(productId, imageId);
      const next = images.filter((i) => i.id !== imageId);
      onImagesChange(next);
      if (mainImageUrl === imageUrl) onMainImageChange(next[0]?.imageUrl ?? "");
      onToast("이미지가 삭제되었습니다.", "success");
    } catch {
      onToast("이미지 삭제에 실패했습니다.", "error");
    }
  }

  // ── 드래그 정렬 ────────────────────────────────────────
  function handleDragStart(i: number) { setDragIndex(i); }
  function handleDragEnd()            { setDragIndex(null); }
  function handleDropOnItem(dropIdx: number) {
    if (dragIndex === null || dragIndex === dropIdx) return;
    const reordered = [...images];
    const [moved]   = reordered.splice(dragIndex, 1);
    reordered.splice(dropIdx, 0, moved);
    onImagesChange(reordered.map((img, i) => ({ ...img, sortOrder: i })));
    setDragIndex(null);
  }

  // ── 렌더 ──────────────────────────────────────────────
  return (
    <div className="space-y-4">
      {/* 대표 이미지 미리보기 */}
      <div className="aspect-square w-full max-w-xs mx-auto rounded-xl overflow-hidden border bg-gray-50 dark:bg-gray-800">
        {mainImageUrl ? (
          <NextImage
            loader={passthroughImageLoader}
            unoptimized
            src={mainImageUrl}
            alt=""
            width={512}
            height={512}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center text-gray-300 gap-2">
            <span className="text-5xl">📦</span>
            <span className="text-xs">이미지 없음</span>
          </div>
        )}
      </div>

      {/* 업로드 드롭 존 */}
      {images.length < MAX_COUNT && (
        <div
          onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
          onDragLeave={() => setDragOver(false)}
          onDrop={(e) => { e.preventDefault(); setDragOver(false); processFiles(e.dataTransfer.files); }}
          onClick={() => inputRef.current?.click()}
          className={`border-2 border-dashed rounded-xl p-4 text-center cursor-pointer transition select-none ${
            dragOver
              ? "border-indigo-500 bg-indigo-50 dark:bg-indigo-950"
              : "border-gray-300 hover:border-indigo-400 dark:border-gray-600"
          }`}
        >
          <Upload size={18} className="mx-auto text-gray-400 mb-1" />
          <p className="text-xs text-gray-500">
            클릭 또는 드래그하여 업로드 ({images.length + uploading.length}/{MAX_COUNT}장)
          </p>
          <p className="text-xs text-gray-400 mt-0.5">JPG·PNG·WEBP · 최대 2MB · 500×500 이상</p>
          <input
            ref={inputRef}
            type="file"
            accept=".jpg,.jpeg,.png,.webp"
            multiple
            className="hidden"
            onChange={(e) => { if (e.target.files) processFiles(e.target.files); e.target.value = ""; }}
          />
        </div>
      )}

      {/* 이미지 그리드 */}
      {(images.length > 0 || uploading.length > 0) && (
        <div className="grid grid-cols-3 gap-2">
          {images.map((img, i) => (
            <div
              key={img.id}
              draggable
              onDragStart={() => handleDragStart(i)}
              onDragEnd={handleDragEnd}
              onDragOver={(e) => e.preventDefault()}
              onDrop={() => handleDropOnItem(i)}
              className={`relative group rounded-lg overflow-hidden border-2 cursor-grab active:cursor-grabbing transition ${
                mainImageUrl === img.imageUrl
                  ? "border-indigo-500 shadow-sm"
                  : dragIndex === i
                  ? "border-blue-300 opacity-50"
                  : "border-gray-200 dark:border-gray-700 hover:border-gray-400"
              }`}
            >
              <div className="aspect-square bg-gray-100 dark:bg-gray-800">
                <NextImage
                  loader={passthroughImageLoader}
                  unoptimized
                  src={img.imageUrl}
                  alt=""
                  width={256}
                  height={256}
                  className="w-full h-full object-cover"
                />
              </div>

              {/* 대표 이미지 별 버튼 */}
              <button
                onClick={() => onMainImageChange(img.imageUrl)}
                title="대표 이미지로 설정"
                className={`absolute top-1 left-1 p-0.5 rounded-full transition ${
                  mainImageUrl === img.imageUrl
                    ? "text-yellow-400 bg-black/20"
                    : "text-white opacity-0 group-hover:opacity-100 bg-black/30 hover:text-yellow-400"
                }`}
              >
                <Star size={13} fill={mainImageUrl === img.imageUrl ? "currentColor" : "none"} />
              </button>

              {/* 삭제 버튼 */}
              <button
                onClick={() => handleDelete(img.id, img.imageUrl)}
                title="이미지 삭제"
                className="absolute top-1 right-1 p-0.5 rounded-full bg-black/30 text-white opacity-0 group-hover:opacity-100 hover:text-red-400 transition"
              >
                <Trash2 size={13} />
              </button>

              {/* 번호 배지 */}
              <span className="absolute bottom-1 left-1 text-[10px] bg-black/40 text-white rounded px-1">
                {i + 1}
              </span>
            </div>
          ))}

          {/* 업로드 중인 항목 */}
          {uploading.map((u) => (
            <div key={u.tempId} className="relative rounded-lg overflow-hidden border-2 border-indigo-300">
              <div className="aspect-square bg-gray-100 dark:bg-gray-800">
                <NextImage
                  loader={passthroughImageLoader}
                  unoptimized
                  src={u.preview}
                  alt=""
                  width={256}
                  height={256}
                  className="w-full h-full object-cover opacity-40"
                />
              </div>
              <div className="absolute inset-0 flex flex-col items-center justify-end pb-2 px-2">
                <div className="w-full bg-gray-300/70 rounded-full h-1.5">
                  <div
                    className="bg-indigo-500 h-1.5 rounded-full transition-all duration-200"
                    style={{ width: `${u.progress}%` }}
                  />
                </div>
                <span className="text-white text-[10px] mt-0.5">{u.progress}%</span>
              </div>
            </div>
          ))}
        </div>
      )}

      <p className="text-xs text-gray-400">
        ★ 별 클릭: 대표 이미지 설정 · 드래그: 순서 변경 · 휴지통: 삭제
      </p>
    </div>
  );
}
