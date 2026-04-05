"use client";

import DataGrid, {
  Column,
  Editing,
  Button as GridButton,
  Paging,
  SearchPanel
} from "devextreme-react/data-grid";
import { useEffect, useState } from "react";

interface Keyword {
  id: number;
  keyword: string;
  reason: string;
  createdAt: string;
}

export default function KeywordManagerPage() {
  const [keywords, setKeywords] = useState<Keyword[]>([]);
  const [newKeyword, setNewKeyword] = useState("");
  const [newReason, setNewReason] = useState("");

  const fetchKeywords = async () => {
    try {
      const res = await fetch("http://localhost:8080/api/keywords", {
        cache: "no-store", 
      });
      const json = await res.json();
      if (json.success) {
        setKeywords(json.data);
      }
    } catch (error) {
      console.error("키워드 로드 실패:", error);
    }
  };

  useEffect(() => {
    fetchKeywords();
  }, []);

  const handleAdd = async () => {
    if (!newKeyword.trim()) return;

    try {
      const res = await fetch("http://localhost:8080/api/keywords", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ keyword: newKeyword, reason: newReason }),
      });
      if (res.ok) {
        setNewKeyword("");
        setNewReason("");
        fetchKeywords();
      } else {
        alert("키워드 추가에 실패했습니다.");
      }
    } catch (error) {
      console.error("추가 실패:", error);
    }
  };

  const handleUpdate = async (e: any) => {
    const { id, keyword, reason } = e.data;
    try {
      await fetch(`http://localhost:8080/api/keywords/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ keyword, reason }),
      });
      fetchKeywords();
    } catch (error) {
      console.error("수정 실패:", error);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("정말 삭제하시겠습니까?")) return;

    setKeywords((prev) => prev.filter((k) => k.id !== id));

    try {
      const res = await fetch(`http://localhost:8080/api/keywords/${id}`, {
        method: "DELETE",
      });
      if (!res.ok) throw new Error("서버 삭제 실패");
    } catch (error) {
      console.error("삭제 실패:", error);
      alert("삭제 중 오류가 발생했습니다. 데이터를 다시 불러옵니다.");
      fetchKeywords(); 
    }
  };

  // 🚨 전체 삭제 기능 추가
  const handleDeleteAll = async () => {
    if (!confirm("정말 모든 키워드를 삭제하시겠습니까?\n이 작업은 되돌릴 수 없습니다!")) return;

    // 화면에서 즉시 0초만에 표를 비워버립니다.
    setKeywords([]);

    try {
      const res = await fetch("http://localhost:8080/api/keywords/all", {
        method: "DELETE",
      });
      if (!res.ok) throw new Error("전체 삭제 실패");
      
      alert("모든 키워드가 성공적으로 삭제되었습니다.");
    } catch (error) {
      console.error("전체 삭제 실패:", error);
      alert("전체 삭제 중 오류가 발생했습니다.");
      fetchKeywords(); // 에러 시 원래 데이터 복구
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-8 mt-10 bg-white shadow-md rounded-xl">
      
      {/* 타이틀과 전체 삭제 버튼을 나란히 배치했습니다 */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800">🚫 수집 금지 키워드 관리</h1>
        <button
          onClick={handleDeleteAll}
          className="px-4 py-2 bg-red-50 text-red-600 border border-red-200 rounded-lg hover:bg-red-100 hover:text-red-700 font-bold transition-colors text-sm"
        >
          전체 삭제
        </button>
      </div>
      
      <div className="flex gap-2 mb-8">
        <input
          type="text"
          value={newKeyword}
          onChange={(e) => setNewKeyword(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleAdd()}
          placeholder="키워드 입력 (쉼표로 여러 개 가능)"
          className="flex-2 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-gray-800"
        />
        <input
          type="text"
          value={newReason}
          onChange={(e) => setNewReason(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleAdd()}
          placeholder="이유 (선택)"
          className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-gray-800"
        />
        <button
          onClick={handleAdd}
          className="px-6 py-2 bg-indigo-600 text-white font-semibold rounded-lg hover:bg-indigo-700 transition flex-shrink-0"
        >
          추가
        </button>
      </div>

      <DataGrid
        dataSource={keywords}
        keyExpr="id"
        showBorders={true}
        showRowLines={true}
        rowAlternationEnabled={true}
        noDataText="등록된 금지 키워드가 없습니다."
        onRowUpdated={handleUpdate}
      >
        <SearchPanel visible={true} placeholder="키워드 검색..." width={250} />
        <Editing mode="cell" allowUpdating={true} />
        <Paging defaultPageSize={10} />

        <Column dataField="id" caption="번호" width={80} alignment="center" allowEditing={false} />
        <Column dataField="keyword" caption="키워드(이름)" allowEditing={true} />
        <Column dataField="reason" caption="이유" width={300} allowEditing={true} />
        <Column dataField="createdAt" caption="등록일" dataType="datetime" format="yyyy-MM-dd HH:mm" width={160} allowEditing={false} />
        <Column type="buttons" caption="관리" width={80}>
          <GridButton icon="trash" hint="삭제" onClick={(e: any) => handleDelete(e.row.data.id)} />
        </Column>
      </DataGrid>
    </div>
  );
}
