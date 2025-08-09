
import { useState } from "react";
import { StandardListsView } from "./StandardListsView";
import { StandardListForm } from "./StandardListForm";

type ViewMode = "list" | "create" | "edit";

export function StandardListsManager() {
  const [viewMode, setViewMode] = useState<ViewMode>("list");
  const [editingListId, setEditingListId] = useState<string | undefined>();

  const handleCreateNew = () => {
    setEditingListId(undefined);
    setViewMode("create");
  };

  const handleEdit = (listId: string) => {
    setEditingListId(listId);
    setViewMode("edit");
  };

  const handleBack = () => {
    setEditingListId(undefined);
    setViewMode("list");
  };

  switch (viewMode) {
    case "create":
    case "edit":
      return (
        <StandardListForm 
          listId={editingListId} 
          onBack={handleBack} 
        />
      );
    default:
      return (
        <StandardListsView 
          onCreateNew={handleCreateNew}
          onEdit={handleEdit}
        />
      );
  }
}
