"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import DataGrid, { Column, Editing } from "devextreme-react/data-grid";
import type { RowUpdatingEvent } from "devextreme/ui/data_grid";
import Toast from "devextreme-react/toast";
import { getCategories, updateCategory, type Category } from "@/lib/api";

export default function CategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState<{
    visible: boolean;
    message: string;
    type: "success" | "error" | "info";
  }>({ visible: false, message: "", type: "success" });

  function showToast(message: string, type: "success" | "error") {
    setToast({ visible: true, message, type });
  }

  useEffect(() => {
    getCategories()
      .then(setCategories)
      .catch(() => showToast("Failed to load categories.", "error"))
      .finally(() => setLoading(false));
  }, []);

  async function handleRowUpdating(event: RowUpdatingEvent<Category>) {
    const oldData = event.oldData as Category;
    const newData = event.newData as Partial<Category>;
    const id = oldData.id;
    const nameKo = newData.nameKo ?? oldData.nameKo;
    const icon = newData.icon ?? oldData.icon;

    try {
      const updated = await updateCategory(id, { nameKo, icon });
      setCategories((prev) => prev.map((category) => (category.id === id ? { ...category, ...updated } : category)));
      showToast("Category updated.", "success");
    } catch {
      showToast("Update failed.", "error");
      (event as { cancel: boolean }).cancel = true;
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Category Settings</h2>
        <p className="mt-1 text-sm text-gray-500">Edit Korean names and icons inline.</p>
      </div>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base">Categories ({categories.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <DataGrid
            dataSource={categories}
            showBorders={false}
            rowAlternationEnabled
            columnAutoWidth
            loadPanel={{ enabled: loading }}
            noDataText="No categories"
            onRowUpdating={handleRowUpdating}
          >
            <Editing mode="cell" allowUpdating />
            <Column dataField="id" caption="ID" width={60} allowEditing={false} />
            <Column dataField="taobaoCid" caption="Taobao CID" width={120} allowEditing={false} />
            <Column dataField="nameOriginal" caption="Original Name" minWidth={150} allowEditing={false} />
            <Column dataField="nameKo" caption="Korean Name" minWidth={150} />
            <Column dataField="icon" caption="Icon" width={80} />
            <Column dataField="sortOrder" caption="Sort" width={70} allowEditing={false} />
          </DataGrid>
        </CardContent>
      </Card>

      <Toast
        visible={toast.visible}
        message={toast.message}
        type={toast.type}
        displayTime={2500}
        onHiding={() => setToast((current) => ({ ...current, visible: false }))}
        position="bottom center"
      />
    </div>
  );
}
