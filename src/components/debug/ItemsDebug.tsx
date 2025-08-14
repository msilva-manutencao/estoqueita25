import { useSupabaseItems } from "@/hooks/useSupabaseItems";
import { useSupabaseCategories } from "@/hooks/useSupabaseCategories";
import { useSupabaseUnits } from "@/hooks/useSupabaseUnits";
import { useCurrentCompany } from "@/hooks/useCurrentCompany";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export function ItemsDebug() {
  const { items, loading: itemsLoading } = useSupabaseItems();
  const { categories, loading: categoriesLoading } = useSupabaseCategories();
  const { units, loading: unitsLoading } = useSupabaseUnits();
  const { currentCompany } = useCurrentCompany();

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>Debug - Status dos Dados</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <h3 className="font-semibold">Empresa Atual:</h3>
            <p>Nome: {currentCompany?.name || "Nenhuma"}</p>
            <p>ID: {currentCompany?.id || "N/A"}</p>
            <p>Timestamp: {Date.now()}</p>
          </div>
          
          <div>
            <h3 className="font-semibold">Itens:</h3>
            <p>Loading: {itemsLoading ? "Sim" : "Não"}</p>
            <p>Quantidade: {items.length}</p>
            <p>Primeiros 3 itens:</p>
            <pre className="text-xs bg-gray-100 p-2 rounded">
              {JSON.stringify(items.slice(0, 3), null, 2)}
            </pre>
          </div>
          
          <div>
            <h3 className="font-semibold">Categorias:</h3>
            <p>Loading: {categoriesLoading ? "Sim" : "Não"}</p>
            <p>Quantidade: {categories.length}</p>
            <pre className="text-xs bg-gray-100 p-2 rounded">
              {JSON.stringify(categories, null, 2)}
            </pre>
          </div>
          
          <div>
            <h3 className="font-semibold">Unidades:</h3>
            <p>Loading: {unitsLoading ? "Sim" : "Não"}</p>
            <p>Quantidade: {units.length}</p>
            <pre className="text-xs bg-gray-100 p-2 rounded">
              {JSON.stringify(units, null, 2)}
            </pre>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}