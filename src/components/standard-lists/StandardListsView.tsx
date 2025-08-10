
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Plus, Edit, Trash2, Download, Eye, Loader2 } from "lucide-react";
import { useSupabaseStandardLists } from "@/hooks/useSupabaseStandardLists";
import { StandardListViewModal } from "@/components/modals/StandardListViewModal";

interface StandardListsViewProps {
  onCreateNew: () => void;
  onEdit: (listId: string) => void;
}

export function StandardListsView({ onCreateNew, onEdit }: StandardListsViewProps) {
  const { standardLists, loading, deleteStandardList, executeBulkWithdraw } = useSupabaseStandardLists();
  const [viewModalOpen, setViewModalOpen] = useState(false);
  const [selectedList, setSelectedList] = useState<any>(null);
  const [processingListId, setProcessingListId] = useState<string | null>(null);

  const handleDelete = async (listId: string, listName: string) => {
    if (window.confirm(`Tem certeza que deseja remover a lista "${listName}"?`)) {
      await deleteStandardList(listId);
    }
  };

  const handleView = (list: any) => {
    // Convert to format expected by modal
    const formattedList = {
      ...list,
      items: list.items.map((item: any) => ({
        itemId: item.item_id,
        itemName: item.items?.name || 'Item não encontrado',
        quantity: item.quantity,
        unit: item.items?.units?.abbreviation || item.items?.units?.name || 'un'
      }))
    };
    setSelectedList(formattedList);
    setViewModalOpen(true);
  };

  const handleBulkWithdraw = async (list: any) => {
    if (window.confirm(`Confirma a baixa em lote da lista "${list.name}"? Esta ação não pode ser desfeita.`)) {
      setProcessingListId(list.id);
      await executeBulkWithdraw(list.id);
      setProcessingListId(null);
    }
  };

  const totalItems = (items: any[]) => {
    return items.reduce((total, item) => total + item.quantity, 0);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="flex items-center space-x-2">
          <Loader2 className="h-6 w-6 animate-spin text-primary" />
          <span>Carregando listas padrão...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-semibold">Fichas de Baixa Padrão</h2>
          <p className="text-muted-foreground">
            Gerencie suas listas predefinidas de materiais para baixas em lote
          </p>
        </div>
        <Button onClick={onCreateNew} className="flex items-center space-x-2">
          <Plus className="h-4 w-4" />
          <span>Nova Lista</span>
        </Button>
      </div>

      {standardLists.length === 0 ? (
        <Card>
          <CardContent className="pt-6 text-center">
            <p className="text-muted-foreground">
              Nenhuma ficha padrão cadastrada. Crie sua primeira lista!
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {standardLists.map((list) => (
            <Card key={list.id} className="hover:shadow-md transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <CardTitle className="text-lg">{list.name}</CardTitle>
                    {list.description && (
                      <p className="text-sm text-muted-foreground mt-1">
                        {list.description}
                      </p>
                    )}
                  </div>
                  <Badge variant="secondary" className="ml-2">
                    {list.items.length} itens
                  </Badge>
                </div>
              </CardHeader>

              <CardContent className="pt-0">
                <div className="space-y-3">
                  <div className="bg-muted/30 p-3 rounded-lg">
                    <h4 className="text-sm font-medium mb-2">Itens da Lista:</h4>
                    <div className="space-y-1 max-h-24 overflow-y-auto">
                      {list.items.map((item: any, index: number) => (
                        <div key={index} className="flex justify-between text-xs">
                          <span className="truncate flex-1">
                            {item.items?.name || 'Item não encontrado'}
                          </span>
                          <span className="text-muted-foreground ml-2">
                            {item.quantity} {item.items?.units?.abbreviation || item.items?.units?.name || 'un'}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="flex justify-between text-sm text-muted-foreground">
                    <span>Total: {totalItems(list.items)} unidades</span>
                    <span>Criada em: {new Date(list.created_at).toLocaleDateString('pt-BR')}</span>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleView(list)}
                      className="flex items-center space-x-1"
                    >
                      <Eye className="h-3 w-3" />
                      <span>Ver</span>
                    </Button>
                    
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => onEdit(list.id)}
                      className="flex items-center space-x-1"
                    >
                      <Edit className="h-3 w-3" />
                      <span>Editar</span>
                    </Button>
                    
                    <Button
                      size="sm"
                      onClick={() => handleBulkWithdraw(list)}
                      disabled={processingListId === list.id}
                      className="flex items-center space-x-1"
                    >
                      {processingListId === list.id ? (
                        <Loader2 className="h-3 w-3 animate-spin" />
                      ) : (
                        <Download className="h-3 w-3" />
                      )}
                      <span>Baixar</span>
                    </Button>
                    
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => handleDelete(list.id, list.name)}
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <StandardListViewModal
        list={selectedList}
        open={viewModalOpen}
        onOpenChange={setViewModalOpen}
      />
    </div>
  );
}
