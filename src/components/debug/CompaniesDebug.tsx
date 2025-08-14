import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useAuth } from '@/hooks/useAuth';

export const CompaniesDebug = () => {
  const [companies, setCompanies] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [companyName, setCompanyName] = useState('');
  const { user } = useAuth();

  const fetchCompanies = async () => {
    setLoading(true);
    setError(null);
    try {
      console.log('Fetching companies...');
      const { data, error } = await supabase
        .from('companies')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching companies:', error);
        setError(error.message);
      } else {
        console.log('Companies fetched:', data);
        setCompanies(data || []);
      }
    } catch (err: any) {
      console.error('Unexpected error:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const createCompany = async () => {
    if (!companyName.trim() || !user) return;

    setLoading(true);
    setError(null);
    try {
      console.log('Creating company:', { name: companyName, owner_id: user.id });
      const { data, error } = await supabase
        .from('companies')
        .insert({
          name: companyName,
          owner_id: user.id,
        })
        .select()
        .single();

      if (error) {
        console.error('Error creating company:', error);
        setError(error.message);
      } else {
        console.log('Company created:', data);
        setCompanyName('');
        await fetchCompanies();
      }
    } catch (err: any) {
      console.error('Unexpected error:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      fetchCompanies();
    }
  }, [user]);

  return (
    <Card className="max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle>Debug - Empresas</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <p><strong>Usuário:</strong> {user?.email || 'Não logado'}</p>
          <p><strong>User ID:</strong> {user?.id || 'N/A'}</p>
        </div>

        <div className="flex space-x-2">
          <Input
            value={companyName}
            onChange={(e) => setCompanyName(e.target.value)}
            placeholder="Nome da empresa"
          />
          <Button onClick={createCompany} disabled={loading || !companyName.trim()}>
            {loading ? 'Criando...' : 'Criar'}
          </Button>
        </div>

        <Button onClick={fetchCompanies} disabled={loading}>
          {loading ? 'Carregando...' : 'Recarregar'}
        </Button>

        {error && (
          <div className="p-3 bg-red-100 border border-red-300 rounded text-red-700">
            <strong>Erro:</strong> {error}
          </div>
        )}

        <div>
          <h3 className="font-semibold mb-2">Empresas ({companies.length}):</h3>
          {companies.length === 0 ? (
            <p className="text-muted-foreground">Nenhuma empresa encontrada</p>
          ) : (
            <div className="space-y-2">
              {companies.map((company) => (
                <div key={company.id} className="p-2 border rounded">
                  <p><strong>Nome:</strong> {company.name}</p>
                  <p><strong>ID:</strong> {company.id}</p>
                  <p><strong>Owner ID:</strong> {company.owner_id}</p>
                  <p><strong>Criado em:</strong> {new Date(company.created_at).toLocaleString()}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};