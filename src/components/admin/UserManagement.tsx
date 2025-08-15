
import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Users, Shield, Database, AlertCircle, Edit, Trash2, Building2, UserPlus } from 'lucide-react';
import { useUserRoles } from '@/hooks/useUserRoles';
import { useAuth } from '@/hooks/useAuth';
import { useSuperAdmin } from '@/hooks/useSuperAdmin';
import { useCompanies } from '@/hooks/useCompanies';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export function UserManagement() {
  const { userRoles, userProfiles, loading, operationLoading, fetchUserRoles, assignExistingDataToAdmin } = useUserRoles();
  const { user } = useAuth();
  const { isSuperAdmin, loading: superAdminLoading } = useSuperAdmin();
  const { companies } = useCompanies();
  
  const [editingUser, setEditingUser] = useState<any>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isCompanyDialogOpen, setIsCompanyDialogOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [selectedCompany, setSelectedCompany] = useState('');
  const [selectedPermission, setSelectedPermission] = useState<'read' | 'write' | 'admin'>('read');
  const [editFormData, setEditFormData] = useState({
    full_name: '',
    role: 'user' as 'admin' | 'user'
  });

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

  const handleEditUser = (profile: any) => {
    setEditingUser(profile);
    setEditFormData({
      full_name: profile.full_name || '',
      role: userRoles.find(ur => ur.user_id === profile.id)?.role || 'user'
    });
    setIsEditDialogOpen(true);
  };

  const handleSaveUser = async () => {
    if (!editingUser) return;

    try {
      // Atualizar perfil
      const { error: profileError } = await supabase
        .from('profiles')
        .update({ full_name: editFormData.full_name })
        .eq('id', editingUser.id);

      if (profileError) throw profileError;

      // Atualizar ou criar role
      const existingRole = userRoles.find(ur => ur.user_id === editingUser.id);
      
      if (existingRole) {
        const { error: roleError } = await supabase
          .from('user_roles')
          .update({ role: editFormData.role })
          .eq('user_id', editingUser.id);
        
        if (roleError) throw roleError;
      } else {
        const { error: roleError } = await supabase
          .from('user_roles')
          .insert({
            user_id: editingUser.id,
            role: editFormData.role
          });
        
        if (roleError) throw roleError;
      }

      toast.success('Usuário atualizado com sucesso!');
      setIsEditDialogOpen(false);
      setEditingUser(null);
      await fetchUserRoles();
    } catch (error) {
      console.error('Erro ao atualizar usuário:', error);
      toast.error('Erro ao atualizar usuário');
    }
  };

  const handleDeleteUser = async (profile: any) => {
    if (profile.email === 'moisestj86@gmail.com') {
      toast.error('Não é possível excluir o super admin');
      return;
    }

    if (window.confirm(`Tem certeza que deseja excluir o usuário ${profile.email}?`)) {
      try {
        // Remover das empresas
        const { error: companyError } = await supabase
          .from('company_users')
          .delete()
          .eq('user_id', profile.id);

        if (companyError) throw companyError;

        // Remover role
        const { error: roleError } = await supabase
          .from('user_roles')
          .delete()
          .eq('user_id', profile.id);

        if (roleError) throw roleError;

        // Remover perfil
        const { error: profileError } = await supabase
          .from('profiles')
          .delete()
          .eq('id', profile.id);

        if (profileError) throw profileError;

        toast.success('Usuário excluído com sucesso!');
        await fetchUserRoles();
      } catch (error) {
        console.error('Erro ao excluir usuário:', error);
        toast.error('Erro ao excluir usuário');
      }
    }
  };

  const handleAddToCompany = (profile: any) => {
    setSelectedUser(profile);
    setIsCompanyDialogOpen(true);
  };

  const handleSaveToCompany = async () => {
    if (!selectedUser || !selectedCompany) {
      toast.error('Selecione uma empresa');
      return;
    }

    try {
      const { error } = await supabase
        .from('company_users')
        .insert({
          user_id: selectedUser.id,
          company_id: selectedCompany,
          permission_type: selectedPermission,
          created_by: user?.id
        });

      if (error) throw error;

      toast.success('Usuário adicionado à empresa com sucesso!');
      setIsCompanyDialogOpen(false);
      setSelectedUser(null);
      setSelectedCompany('');
      setSelectedPermission('read');
    } catch (error) {
      console.error('Erro ao adicionar usuário à empresa:', error);
      toast.error('Erro ao adicionar usuário à empresa');
    }
  };

  if (loading || superAdminLoading) {
    return (
      <div className="space-y-6">
        <div className="text-center py-8">
          <div className="text-lg">Carregando usuários...</div>
        </div>
      </div>
    );
  }

  if (!isSuperAdmin) {
    return (
      <Alert>
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          Você não tem permissão para acessar esta área. Apenas o Super Admin pode gerenciar usuários.
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
                    <TableHead>Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {userProfiles.map((profile) => {
                    const userRole = userRoles.find(ur => ur.user_id === profile.id);
                    const isSuperAdminUser = profile.email === 'moisestj86@gmail.com';
                    
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
                        <TableCell>
                          <div className="flex items-center space-x-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleEditUser(profile)}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleAddToCompany(profile)}
                            >
                              <Building2 className="h-4 w-4" />
                            </Button>
                            {!isSuperAdminUser && (
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleDeleteUser(profile)}
                                className="text-destructive hover:text-destructive"
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            )}
                          </div>
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

      {/* Dialog para Editar Usuário */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Editar Usuário</DialogTitle>
            <DialogDescription>
              Edite as informações do usuário {editingUser?.email}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="fullName">Nome Completo</Label>
              <Input
                id="fullName"
                value={editFormData.full_name}
                onChange={(e) => setEditFormData({...editFormData, full_name: e.target.value})}
                placeholder="Digite o nome completo"
              />
            </div>
            <div>
              <Label htmlFor="role">Role</Label>
              <Select value={editFormData.role} onValueChange={(value: any) => setEditFormData({...editFormData, role: value})}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="user">Usuário</SelectItem>
                  <SelectItem value="admin">Administrador</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex justify-end space-x-2">
              <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
                Cancelar
              </Button>
              <Button onClick={handleSaveUser}>
                Salvar
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Dialog para Vincular Usuário à Empresa */}
      <Dialog open={isCompanyDialogOpen} onOpenChange={setIsCompanyDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Vincular Usuário à Empresa</DialogTitle>
            <DialogDescription>
              Adicione o usuário {selectedUser?.email} a uma empresa
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="company">Empresa</Label>
              <Select value={selectedCompany} onValueChange={setSelectedCompany}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione uma empresa" />
                </SelectTrigger>
                <SelectContent>
                  {companies.map((company) => (
                    <SelectItem key={company.id} value={company.id}>
                      {company.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="permission">Permissão</Label>
              <Select value={selectedPermission} onValueChange={(value: any) => setSelectedPermission(value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="read">Visualizador</SelectItem>
                  <SelectItem value="write">Editor</SelectItem>
                  <SelectItem value="admin">Administrador</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex justify-end space-x-2">
              <Button variant="outline" onClick={() => setIsCompanyDialogOpen(false)}>
                Cancelar
              </Button>
              <Button onClick={handleSaveToCompany}>
                Adicionar
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
