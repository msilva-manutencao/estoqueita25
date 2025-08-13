
import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Users, Shield, Database, AlertCircle } from 'lucide-react';
import { useUserRoles } from '@/hooks/useUserRoles';
import { useAuth } from '@/hooks/useAuth';

export function UserManagement() {
  const { userRoles, userProfiles, loading, operationLoading, fetchUserRoles, assignExistingDataToAdmin } = useUserRoles();
  const { user } = useAuth();
  const [currentUserRole, setCurrentUserRole] = useState<string | null>(null);

  useEffect(() => {
    const checkRole = async () => {
      if (user) {
        const role = userRoles.find(ur => ur.user_id === user.id)?.role || null;
        setCurrentUserRole(role);
      }
    };
    checkRole();
  }, [user, userRoles]);

  const handleAssignData = async () => {
    const success = await assignExistingDataToAdmin();
    if (success) {
      await fetchUserRoles();
    }
  };

  const getRoleBadge = (role: string) => {
    return role === 'admin' ? (
      <Badge variant="destructive" className="flex items-center space-x-1">
        <Shield className="h-3 w-3" />
        <span>Admin</span>
      </Badge>
    ) : (
      <Badge variant="secondary">Usuário</Badge>
    );
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="text-center py-8">
          <div className="text-lg">Carregando usuários...</div>
        </div>
      </div>
    );
  }

  if (currentUserRole !== 'admin') {
    return (
      <Alert>
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          Você não tem permissão para acessar esta área. Apenas administradores podem gerenciar usuários.
        </AlertDescription>
      </Alert>
    );
  }

  const adminUsers = userRoles.filter(ur => ur.role === 'admin');
  const hasAdminUsers = adminUsers.length > 0;

  return (
    <div className="space-y-6 pt-16 md:pt-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold">Gerenciar Usuários</h1>
          <p className="text-muted-foreground text-sm md:text-base">
            Visualize e gerencie usuários do sistema
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Users className="h-6 w-6 md:h-8 md:w-8 text-primary" />
          <span className="text-xl md:text-2xl font-bold">{userProfiles.length}</span>
          <span className="text-muted-foreground text-sm md:text-base">usuários</span>
        </div>
      </div>

      {/* Admin Status Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Shield className="h-5 w-5" />
            <span>Status do Sistema</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Administradores cadastrados:</span>
              <Badge variant={hasAdminUsers ? "default" : "destructive"}>
                {adminUsers.length} admin{adminUsers.length !== 1 ? 's' : ''}
              </Badge>
            </div>
            
            {hasAdminUsers && (
              <div className="space-y-2">
                <Button 
                  onClick={handleAssignData}
                  disabled={operationLoading}
                  className="w-full"
                >
                  <Database className="h-4 w-4 mr-2" />
                  {operationLoading ? 'Vinculando...' : 'Vincular Dados Existentes ao Admin'}
                </Button>
                <p className="text-xs text-muted-foreground">
                  Esta ação vincula todos os dados existentes no sistema ao primeiro administrador.
                </p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Users Table */}
      <Card>
        <CardHeader>
          <CardTitle>Lista de Usuários</CardTitle>
        </CardHeader>
        <CardContent>
          {userProfiles.length > 0 ? (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Email</TableHead>
                    <TableHead>Nome</TableHead>
                    <TableHead>Role</TableHead>
                    <TableHead>Data de Cadastro</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {userProfiles.map((profile) => {
                    const userRole = userRoles.find(ur => ur.user_id === profile.id);
                    return (
                      <TableRow key={profile.id}>
                        <TableCell className="font-medium">{profile.email}</TableCell>
                        <TableCell>{profile.full_name || 'Não informado'}</TableCell>
                        <TableCell>
                          {userRole ? getRoleBadge(userRole.role) : (
                            <Badge variant="outline">Sem role</Badge>
                          )}
                        </TableCell>
                        <TableCell>
                          {new Date(profile.created_at).toLocaleDateString('pt-BR')}
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          ) : (
            <div className="text-center py-8">
              <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">
                Nenhum usuário cadastrado ainda.
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {!hasAdminUsers && (
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            <strong>Atenção:</strong> Para criar o primeiro administrador, faça o cadastro com o email: moisestj86@gmail.com
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
}
