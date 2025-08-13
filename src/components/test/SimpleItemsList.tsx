import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export function SimpleItemsList() {
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchItems = async () => {
      try {
        console.log("Iniciando busca de itens...");
        setLoading(true);
        setError(null);

        const { data, error } = await supabase
          .from('items')
          .select(`
            *,
            categories (name),
            units (name, abbreviation)
          `);

        console.log("Resposta do Supabase:", { data, error });

        if (error) {
          console.error("Erro do Supabase:", error);
          setError(error.message);
          return;
        }

        console.log("Itens carregados:", data);
        setItems(data || []);
      } catch (err) {
        console.error("Erro na requisição:", err);
        setError("Erro na conexão");
      } finally {
        setLoading(false);
      }
    };

    fetchItems();
  }, []);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Lista Simples de Itens</CardTitle>
      </CardHeader>
      <CardContent>
        {loading && <p>Carregando...</p>}
        {error && <p className="text-red-500">Erro: {error}</p>}
        {!loading && !error && (
          <div>
            <p>Total de itens: {items.length}</p>
            <div className="space-y-2 mt-4">
              {items.slice(0, 10).map((item) => (
                <div key={item.id} className="p-2 border rounded">
                  <strong>{item.name}</strong>
                  <br />
                  <small>
                    Categoria: {item.categories?.name || "N/A"} | 
                    Estoque: {item.current_stock} {item.units?.abbreviation || ""}
                  </small>
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}