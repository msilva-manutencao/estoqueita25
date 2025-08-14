import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Building2, Plus } from 'lucide-react';
import { useCompanies } from '@/hooks/useCompanies';
import { NoCompanyAccess } from './NoCompanyAccess';

interface NoCompanySelectedProps {
  onNavigateToCompanies: () => void;
}

export const NoCompanySelected = ({ onNavigateToCompanies }: NoCompanySelectedProps) => {
  const { companies, loading } = useCompanies();

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <div className="text-lg">Carregando...</div>
      </div>
    );
  }

  // Se não há empresas, mostrar tela de acesso pendente
  if (companies.length === 0) {
    return <NoCompanyAccess />;
  }

  // Se há empresas mas nenhuma selecionada
  return (
    <Card className="max-w-md mx-auto mt-8">
      <CardHeader className="text-center">
        <div className="mx-auto mb-4 p-3 bg-muted rounded-full w-fit">
          <Building2 className="h-8 w-8 text-muted-foreground" />
        </div>
        <CardTitle>Nenhuma Empresa Selecionada</CardTitle>
        <CardDescription>
          Selecione uma empresa para acessar o estoque
        </CardDescription>
      </CardHeader>
      <CardContent className="text-center space-y-4">
        <div className="space-y-2">
          <p className="text-sm text-muted-foreground">
            Use o seletor de empresa no menu lateral para escolher uma empresa
          </p>
          <Button variant="outline" onClick={onNavigateToCompanies} className="w-full">
            <Building2 className="h-4 w-4 mr-2" />
            Gerenciar Empresas
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};