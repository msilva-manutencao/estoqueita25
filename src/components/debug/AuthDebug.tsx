import { useAuth } from "@/hooks/useAuth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useState } from "react";

export function AuthDebug() {
  const { user, session, loading } = useAuth();
  const [testResult, setTestResult] = useState<any>(null);

  const testConnection = async () => {
    try {
      const { data, error } = await supabase
        .from('items')
        .select('count(*)')
        .limit(1);
      
      setTestResult({ data, error, success: !error });
    } catch (err) {
      setTestResult({ error: err, success: false });
    }
  };

  return (
    <Card className="mb-4">
      <CardHeader>
        <CardTitle>Debug - Status da Autenticação</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <h3 className="font-semibold">Status da Autenticação:</h3>
          <p>Loading: {loading ? "Sim" : "Não"}</p>
          <p>Usuário logado: {user ? "Sim" : "Não"}</p>
          {user && (
            <div className="text-xs bg-gray-100 p-2 rounded">
              <p>ID: {user.id}</p>
              <p>Email: {user.email}</p>
            </div>
          )}
        </div>
        
        <div>
          <h3 className="font-semibold">Sessão:</h3>
          <p>Sessão ativa: {session ? "Sim" : "Não"}</p>
          {session && (
            <div className="text-xs bg-gray-100 p-2 rounded">
              <p>Access Token: {session.access_token ? "Presente" : "Ausente"}</p>
              <p>Expires: {new Date(session.expires_at! * 1000).toLocaleString()}</p>
            </div>
          )}
        </div>

        <div>
          <Button onClick={testConnection} variant="outline" size="sm">
            Testar Conexão com DB
          </Button>
          {testResult && (
            <div className="mt-2 text-xs bg-gray-100 p-2 rounded">
              <p>Sucesso: {testResult.success ? "Sim" : "Não"}</p>
              {testResult.error && <p>Erro: {JSON.stringify(testResult.error)}</p>}
              {testResult.data && <p>Dados: {JSON.stringify(testResult.data)}</p>}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}