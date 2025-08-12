
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Plus, Edit, Trash2, Package } from "lucide-react";
import { useSupabaseUnitsCRUD } from "@/hooks/useSupabaseUnitsCRUD";
import { UnitForm } from "@/components/units/UnitForm";
import { SupabaseUnit } from "@/hooks/useSupabaseUnits";

export default function UnitsPage() {
  const { units, loading, deleteUnit, operationLoading } = useSupabaseUnitsCRUD();
  
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingUnit, setEditingUnit] = useState<SupabaseUnit | undefined>();
  const [deletingUnit, setDeletingUnit] = useState<SupabaseUnit | undefined>();

  const handleEdit = (unit: SupabaseUnit) => {
    setEditingUnit(unit);
    setIsFormOpen(true);
  };

  const handleDelete = async () => {
    if (deletingUnit) {
      const success = await deleteUnit(deletingUnit.id);
      if (success) {
        setDeletingUnit(undefined);
      }
    }
  };

  const handleFormSuccess = () => {
    setIsFormOpen(false);
    setEditingUnit(undefined);
  };

  const handleFormCancel = () => {
    setIsFormOpen(false);
    setEditingUnit(undefined);
  };

  if (loading) {
    return (
      <div className="space-y-6 pt-16 md:pt-6">
        <div className="text-center py-8">
          <div className="text-lg">Carregando unidades...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 pt-16 md:pt-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold">Unidades</h1>
          <p className="text-muted-foreground text-sm md:text-base">
            Gerencie as unidades de medida dos seus itens
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Package className="h-6 w-6 md:h-8 md:w-8 text-primary" />
          <span className="text-xl md:text-2xl font-bold">{units.length}</span>
          <span className="text-muted-foreground text-sm md:text-base">unidades</span>
        </div>
      </div>

      {/* Add Button */}
      <div className="flex justify-end">
        <Button onClick={() => setIsFormOpen(true)} size="sm" className="md:text-base">
          <Plus className="h-4 w-4 mr-2" />
          Nova Unidade
        </Button>
      </div>

      {/* Units - Mobile Cards / Desktop Table */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg md:text-xl">Lista de Unidades</CardTitle>
        </CardHeader>
        <CardContent>
          {/* Mobile Card Layout */}
          <div className="md:hidden space-y-3">
            {units.map((unit) => (
              <Card key={unit.id} className="border border-muted">
                <CardContent className="pt-4">
                  <div className="space-y-2">
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="font-semibold text-base">{unit.name}</h3>
                        <p className="text-sm text-muted-foreground">
                          Abreviação: <span className="font-medium">{unit.abbreviation}</span>
                        </p>
                      </div>
                      <div className="flex space-x-1">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleEdit(unit)}
                        >
                          <Edit className="h-3 w-3" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setDeletingUnit(unit)}
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Desktop Table Layout */}
          <div className="hidden md:block rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nome</TableHead>
                  <TableHead>Abreviação</TableHead>
                  <TableHead className="text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {units.map((unit) => (
                  <TableRow key={unit.id}>
                    <TableCell className="font-medium">{unit.name}</TableCell>
                    <TableCell className="font-mono bg-muted/50 rounded px-2 py-1 text-sm w-fit">
                      {unit.abbreviation}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end space-x-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleEdit(unit)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setDeletingUnit(unit)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
          
          {units.length === 0 && (
            <div className="text-center py-8">
              <Package className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">
                Nenhuma unidade cadastrada. Clique em "Nova Unidade" para começar.
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Form Dialog */}
      <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
        <DialogContent className="mx-2 max-w-[calc(100vw-1rem)] md:mx-auto md:max-w-md">
          <DialogHeader>
            <DialogTitle>
              {editingUnit ? 'Editar Unidade' : 'Nova Unidade'}
            </DialogTitle>
          </DialogHeader>
          <UnitForm
            unit={editingUnit}
            onSuccess={handleFormSuccess}
            onCancel={handleFormCancel}
          />
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <AlertDialog open={!!deletingUnit} onOpenChange={() => setDeletingUnit(undefined)}>
        <AlertDialogContent className="mx-2 max-w-[calc(100vw-1rem)] md:mx-auto md:max-w-md">
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmar Exclusão</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja excluir a unidade "{deletingUnit?.name}"?
              Esta ação não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleDelete}
              disabled={operationLoading}
            >
              {operationLoading ? "Excluindo..." : "Excluir"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
