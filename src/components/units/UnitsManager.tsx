import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { supabase } from "@/integrations/supabase/client";
import { UnitForm } from "@/components/units/UnitForm";
import { Ruler, Search, Edit, Trash2, Plus, RefreshCw } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export function UnitsManager() {
  const [units, setUnits] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [editingUnit, setEditingUnit] = useState<any | null>(null);
  const [showAddDialog, setShowAddDialog] = useState(false);
  const { toast } = useToast();

  const fetchUnits = async () => {
    try {
      setLoading(true);
      console.log("Carregando unidades...");

      const { data, error } = await supabase
        .from('units')
        .select('*')
        .order('name');

      if (error) {
        console.error("Erro ao buscar unidades:", error);
        toast({
          title: "Erro",
          description: "Não foi possível carregar as unidades",
          variant: "destructive",
        });
      } else {
        console.log("Unidades carregadas:", data);
        setUnits(data || []);
      }
    } catch (error) {
      console.error("Erro geral:", error);
      toast({
        title: "Erro de Conexão",
        description: "Verifique sua conexão com a internet",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const deleteUnit = async (unitId: string, unitName: string) => {
    if (!window.confirm(`Tem certeza que deseja excluir a unidade "${unitName}"?`)) {
      return;
    }

    try {
      const { error } = await supabase
        .from('units')
        .delete()
        .eq('id', unitId);

      if (error) {
        console.error("Erro ao excluir unidade:", error);
        toast({
          title: "Erro",
          description: "Não foi possível excluir a unidade",
          variant: "destructive",
        });
        return;
      }

      toast({
        title: "Sucesso",
        description: "Unidade excluída com sucesso",
      });

      await fetchUnits();
    } catch (error) {
      console.error("Erro na conexão:", error);
      toast({
        title: "Erro de Conexão",
        description: "Verifique sua conexão com a internet",
        variant: "destructive",
      });
    }
  };

  useEffect(() => {
    fetchUnits();
  }, []);

  const filteredUnits = units.filter(unit =>
    unit.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    unit.abbreviation.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="flex items-center space-x-2">
          <RefreshCw className="h-5 w-5 animate-spin" />
          <span className="text-lg">Carregando unidades...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Ruler className="h-5 w-5" />
            <span>Gerenciar Unidades</span>
          </CardTitle>
          <CardDescription>
            Visualize, edite e gerencie todas as unidades de medida
          </CardDescription>
          <div className="flex justify-between items-center">
            <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Nova Unidade
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-md">
                <DialogHeader>
                  <DialogTitle>Adicionar Nova Unidade</DialogTitle>
                  <DialogDescription>
                    Crie uma nova unidade de medida para seus itens
                  </DialogDescription>
                </DialogHeader>
                <UnitForm
                  onSuccess={() => {
                    setShowAddDialog(false);
                    fetchUnits();
                  }}
                  onCancel={() => setShowAddDialog(false)}
                />
              </DialogContent>
            </Dialog>
            <Button variant="outline" size="sm" onClick={fetchUnits}>
              <RefreshCw className="h-4 w-4 mr-2" />
              Atualizar
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Filtro de busca */}
          <div className="flex-1">
            <Label htmlFor="search">Buscar unidade</Label>
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                id="search"
                placeholder="Digite o nome ou abreviação..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>

          {/* Estatísticas */}
          <Card>
            <CardContent className="p-4">
              <div className="text-2xl font-bold">{filteredUnits.length}</div>
              <p className="text-sm text-muted-foreground">
                {filteredUnits.length === units.length ? "Unidades cadastradas" : "Unidades encontradas"}
              </p>
            </CardContent>
          </Card>

          {/* Tabela de unidades */}
          <div className="border rounded-lg">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nome</TableHead>
                  <TableHead>Abreviação</TableHead>
                  <TableHead>Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredUnits.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={3} className="text-center py-8">
                      <div className="flex flex-col items-center space-y-2">
                        <Ruler className="h-8 w-8 text-muted-foreground" />
                        <p className="text-muted-foreground">
                          {searchTerm 
                            ? "Nenhuma unidade encontrada com os filtros aplicados" 
                            : "Nenhuma unidade cadastrada"}
                        </p>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredUnits.map((unit) => (
                    <TableRow key={unit.id}>
                      <TableCell className="font-medium">{unit.name}</TableCell>
                      <TableCell>{unit.abbreviation}</TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-2">
                          <Dialog>
                            <DialogTrigger asChild>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => setEditingUnit(unit)}
                              >
                                <Edit className="h-4 w-4" />
                              </Button>
                            </DialogTrigger>
                            <DialogContent className="max-w-md">
                              <DialogHeader>
                                <DialogTitle>Editar Unidade</DialogTitle>
                                <DialogDescription>
                                  Edite as informações da unidade "{unit.name}"
                                </DialogDescription>
                              </DialogHeader>
                              <UnitForm
                                unit={unit}
                                onSuccess={() => {
                                  setEditingUnit(null);
                                  fetchUnits();
                                }}
                                onCancel={() => setEditingUnit(null)}
                              />
                            </DialogContent>
                          </Dialog>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => deleteUnit(unit.id, unit.name)}
                            className="text-destructive hover:text-destructive"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}