
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Plus, Edit, Trash2, Download, Eye } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { mockStandardLists, StandardList } from "@/data/mockData";
import { StandardListViewModal } from "@/components/modals/StandardListViewModal";

interface StandardListsViewProps {
  onCreateNew: () => void;
  onEdit: (listId: string) => void;
}

export function StandardListsView({ onCreateNew, onEdit }: StandardListsViewProps) {
  const { toast } = useToast();
  const [standardLists] = useState(mockStandardLists);
  const [viewModalOpen, setViewModalOpen] = useState(false);
  const [selectedList, setSelectedList] = useState<StandardList | null>(null);

  const handleDelete = (listId: string, listName: string) => {
    // Aqui será implementada a integração com Supabase
    toast({
      title: "Lista removida!",
      description: `A lista "${listName}" foi removida com sucesso.`,
    });
  };

  const handleView = (list: StandardList) => {
    setSelectedList(list);
    setViewModalOpen(true);
  };

  const handleBulkWithdraw = (list: StandardList) => {
    // Aqui será implementada a lógica de baixa em lote
    toast({
      title: "Baixa em lote realizada!",
      description: `Todos os itens da lista "${list.name}" foram baixados do estoque.`,
    });
  };

  const totalItems = (items: StandardList['items']) => {
    return items.reduce((total, item) => total + item.quantity, 0);
  };

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
                      {list.items.map((item, index) => (
                        <div key={index} className="flex justify-between text-xs">
                          <span className="truncate flex-1">{item.itemName}</span>
                          <span className="text-muted-foreground ml-2">
                            {item.quantity} {item.unit}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="flex justify-between text-sm text-muted-foreground">
                    <span>Total de unidades: {totalItems(list.items)}</span>
                    <span>Criada em: {new Date(list.createdAt).toLocaleDateString('pt-BR')}</span>
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
                      className="flex items-center space-x-1"
                    >
                      <Download className="h-3 w-3" />
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
