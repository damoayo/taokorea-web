"use client";

import { useState } from "react";

export default function BulkProductSync() {
  const [itemIds, setItemIds] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<{ synced: number; failed: number } | null>(null);
  const [errorMsg, setErrorMsg] = useState("");

  const handleSync = async () => {
    // 1. 입력된 텍스트에서 엔터나 쉼표를 기준으로 ID를 분리하고 빈 값 제거
    const idArray = itemIds
      .split(/[\n,]+/)
      .map((id) => id.trim())
      .filter((id) => id !== "");

    if (idArray.length === 0) {
      alert("수집할 타오바오 상품 ID를 입력해 주세요!");
      return;
    }

    setIsLoading(true);
    setResult(null);
    setErrorMsg("");

    try {
      // 2. 우리가 만든 스프링 부트 서버의 대량 수집 API 호출
      const response = await fetch("http://localhost:8080/api/sync/bulk-ids", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(idArray),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        setResult(data.data); // { synced: 2, failed: 0, pagesProcessed: 1 }
        setItemIds(""); // 성공 시 입력창 초기화
      } else {
        setErrorMsg(data.message || "수집 중 서버 에러가 발생했습니다.");
      }
    } catch (error) {
      console.error(error);
      setErrorMsg("서버와 연결할 수 없습니다. 스프링 부트 서버가 켜져 있는지 확인하세요.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-6 bg-white rounded-xl shadow-md mt-10">
      <h2 className="text-2xl font-bold mb-4 text-gray-800">🚀 타오바오 상품 대량 수집</h2>
      <p className="text-sm text-gray-600 mb-4">
        수집할 타오바오 상품 ID를 엔터(줄바꿈) 또는 쉼표로 구분하여 입력하세요.
      </p>

      <textarea
        className="w-full h-40 p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 resize-none"
        placeholder="예시:&#10;956045748745&#10;957477674630"
        value={itemIds}
        onChange={(e) => setItemIds(e.target.value)}
        disabled={isLoading}
      />

      <button
        onClick={handleSync}
        disabled={isLoading}
        className={`w-full mt-4 p-3 text-white font-bold rounded-lg transition-colors ${
          isLoading ? "bg-gray-400 cursor-not-allowed" : "bg-orange-500 hover:bg-orange-600"
        }`}
      >
        {isLoading ? "⏳ 수집 중... (잠시만 기다려주세요)" : "상품 대량 수집 시작"}
      </button>

      {/* 결과 메시지 출력 영역 */}
      {result && (
        <div className="mt-6 p-4 bg-green-50 border border-green-200 rounded-lg text-green-800">
          <h3 className="font-bold mb-1">✅ 수집 완료!</h3>
          <p>정상 수집: <strong>{result.synced}</strong>건</p>
          <p>수집 실패: <strong>{result.failed}</strong>건</p>
        </div>
      )}

      {errorMsg && (
        <div className="mt-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-800">
          <p>❌ {errorMsg}</p>
        </div>
      )}
    </div>
  );
}
