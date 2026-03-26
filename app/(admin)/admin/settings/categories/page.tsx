"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import DataGrid, { Column, Editing } from "devextreme-react/data-grid";
import type { RowUpdatingEvent } from "devextreme/ui/data_grid";
import Toast from "devextreme-react/toast";
import { getCategories, updateCategory, Category } from "@/lib/api";

export default function CategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState<{ visible: boolean; message: string; type: "success" | "error" | "info" }>(
    { visible: false, message: "", type: "success" }
  );

  useEffect(() => {
    getCategories()
      .then(setCategories)
      .catch(() => showToast("카테고리 불러오기 실패", "error"))
      .finally(() => setLoading(false));
  }, []);

  function showToast(message: string, type: "success" | "error") {
    setToast({ visible: true, message, type });
  }

  async function handleRowUpdating(e: RowUpdatingEvent<Category>) {
    const id = (e.oldData as Category).id;
    const nameKo = (e.newData.nameKo as string | undefined) ?? (e.oldData as Category).nameKo;
    const icon   = (e.newData.icon   as string | undefined) ?? (e.oldData as Category).icon;
    try {
      const updated = await updateCategory(id, { nameKo, icon });
      setCategories((prev) => prev.map((c) => (c.id === id ? { ...c, ...updated } : c)));
      showToast("저장되었습니다.", "success");
    } catch {
      showToast("저장 실패", "error");
      (e as { cancel: boolean }).cancel = true;
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">카테고리 관리</h2>
        <p className="text-sm text-gray-500 mt-1">한국어 이름과 아이콘을 수정할 수 있습니다. 더블클릭으로 편집.</p>
      </div>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base">카테고리 목록 ({categories.length}개)</CardTitle>
        </CardHeader>
        <CardContent>
          <DataGrid
            dataSource={categories}
            showBorders={false}
            rowAlternationEnabled
            columnAutoWidth
            loadPanel={{ enabled: loading }}
            noDataText="카테고리 없음"
            onRowUpdating={handleRowUpdating}
          >
            <Editing mode="cell" allowUpdating />
            <Column dataField="id"           caption="ID"          width={60}  allowEditing={false} />
            <Column dataField="taobaoCid"    caption="타오바오 CID" width={120} allowEditing={false} />
            <Column dataField="nameOriginal" caption="원본명"       minWidth={150} allowEditing={false} />
            <Column dataField="nameKo"       caption="한국어 이름"  minWidth={150} />
            <Column dataField="icon"         caption="아이콘"       width={80} />
            <Column dataField="sortOrder"    caption="정렬"         width={70}  allowEditing={false} />
          </DataGrid>
        </CardContent>
      </Card>

      <Toast
        visible={toast.visible}
        message={toast.message}
        type={toast.type}
        displayTime={2500}
        onHiding={() => setToast((t) => ({ ...t, visible: false }))}
        position="bottom center"
      />
    </div>
  );
}
