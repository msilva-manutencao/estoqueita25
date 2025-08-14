import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useCompanies } from '@/hooks/useCompanies';
import { useSuperAdmin } from '@/hooks/useSuperAdmin';
import { Crown, Building2, Users, Settings, Eye, Shield } from 'lucide-react';
import { CompaniesManager } from '@/components/companies/CompaniesManager';
import { UsersWithoutCompany } from './UsersWithoutCompany';

export const SuperAdminPanel = () => {
  const { isSuperAdmin, loading: superAdminLoading } = useSuperAdmin();
  const { companies, loading: companiesLoading } = useCompanies();
  const [activeTab, setActiveTab] = useState('overview');

  if (superAdminLoading) {
    return <div className="flex justify-center p-8">Verificando permissões...</div>;
  }

  if (!isSuperAdmin) {
    return (
      <Card>
        <CardContent className="text-center py-8">
          <Shield className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
          <h3 className="text-lg font-semibold mb-2">Acesso Negado</h3>
          <p className="text-muted-foreground">
            Você não tem permissão para acessar o painel administrativo.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-2">
        <Crown className="h-6 w-6 text-yellow-500" />
        <h2 className="text-2xl font-bold">Painel Super Admin</h2>
        <Badge variant="destructive">
          <Crown className="h-3 w-3 mr-1" />
          Super Admin
        </Badge>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="overview">Visão Geral</TabsTrigger>
          <TabsTrigger value="companies">Empresas</TabsTrigger>
          <TabsTrigger value="users">Usuários</TabsTrigger>
          <TabsTrigger value="settings">Configurações</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total de Empresas</CardTitle>
                <Building2 className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {companiesLoading ? '...' : companies.length}
                </div>
                <p className="text-xs text-muted-foreground">
                  Empresas ativas no sistema
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Usuários Ativos</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">-</div>
                <p className="text-xs text-muted-foreground">
                  Total de usuários cadastrados
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Sistema</CardTitle>
                <Settings className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">Online</div>
                <p className="text-xs text-muted-foreground">
                  Status do sistema
                </p>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Empresas Recentes</CardTitle>
              <CardDescription>
                Últimas empresas criadas no sistema
              </CardDescription>
            </CardHeader>
            <CardContent>
              {companiesLoading ? (
                <div className="text-center py-4">Carregando...</div>
              ) : companies.length === 0 ? (
                <div className="text-center py-4 text-muted-foreground">
                  Nenhuma empresa encontrada
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Nome</TableHead>
                      <TableHead>Proprietário</TableHead>
                      <TableHead>Criada em</TableHead>
                      <TableHead>Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {companies.slice(0, 5).map((company) => (
                      <TableRow key={company.id}>
                        <TableCell className="font-medium">{company.name}</TableCell>
                        <TableCell>ID: {company.owner_id.slice(0, 8)}...</TableCell>
                        <TableCell>
                          {new Date(company.created_at).toLocaleDateString('pt-BR')}
                        </TableCell>
                        <TableCell>
                          <Badge variant={company.is_active ? 'default' : 'secondary'}>
                            {company.is_active ? 'Ativa' : 'Inativa'}
                          </Badge>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="companies">
          <CompaniesManager />
        </TabsContent>

        <TabsContent value="users" className="space-y-6">
          <UsersWithoutCompany />
          
          <Card>
            <CardHeader>
              <CardTitle>Todos os Usuários</CardTitle>
              <CardDescription>
                Visualize e gerencie todos os usuários do sistema
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8 text-muted-foreground">
                Funcionalidade em desenvolvimento
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="settings">
          <Card>
            <CardHeader>
              <CardTitle>Configurações do Sistema</CardTitle>
              <CardDescription>
                Configure parâmetros globais do sistema
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8 text-muted-foreground">
                Funcionalidade em desenvolvimento
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};