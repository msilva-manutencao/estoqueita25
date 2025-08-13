import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useCompanyUsers } from '@/hooks/useCompanyUsers';
import { useCompanies } from '@/hooks/useCompanies';
import { useAuth } from '@/hooks/useAuth';
import { Plus, UserPlus, Shield, Eye, Edit, Trash2, Mail } from 'lucide-react';
import { toast } from 'sonner';

interface CompanyUsersManagerProps {
  companyId: string;
}

export const CompanyUsersManager = ({ companyId }: CompanyUsersManagerProps) => {
  const { companyUsers, loading, addUserToCompany, updateUserPermission, removeUserFromCompany } = useCompanyUsers(companyId);
  const { companies } = useCompanies();
  const { user } = useAuth();
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    permission: 'read' as 'read' | 'write' | 'admin',
  });

  const company = companies.find(c => c.id === companyId);
  const isOwner = company?.owner_id === user?.id;

  const handleAddUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.email.trim()) {
      toast.error('Email é obrigatório');
      return;
    }

    const result = await addUserToCompany(formData.email, formData.permission);
    if (result) {
      setFormData({ email: '', permission: 'read' });
      setIsAddDialogOpen(false);
    }
  };

  const getPermissionBadge = (permission: string) => {
    const variants = {
      read: { variant: 'secondary' as const, icon: Eye, label: 'Visualizar' },
      write: { variant: 'default' as const, icon: Edit, label: 'Editar' },
      admin: { variant: 'destructive' as const, icon: Shield, label: 'Admin' },
    };

    const config = variants[permission as keyof typeof variants];
    if (!config) return null;

    const Icon = config.icon;
    return (
      <Badge variant={config.variant}>
        <Icon className="h-3 w-3 mr-1" />
        {config.label}
      </Badge>
    );
  };

  const handlePermissionChange = async (companyUserId: string, newPermission: string) => {
    await updateUserPermission(companyUserId, newPermission as 'read' | 'write' | 'admin');
  };

  const handleRemoveUser = async (companyUserId: string, userEmail: string) => {
    if (window.confirm(`Tem certeza que deseja remover ${userEmail} da empresa?`)) {
      await removeUserFromCompany(companyUserId);
    }
  };

  if (loading) {
    return <div className="flex justify-center p-8">Carregando usuários...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Usuários da Empresa</h2>
          <p className="text-muted-foreground">
            {company?.name} - Gerencie usuários e suas permissões
          </p>
        </div>
        
        {isOwner && (
          <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <UserPlus className="h-4 w-4 mr-2" />
                Adicionar Usuário
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Adicionar Usuário à Empresa</DialogTitle>
                <DialogDescription>
                  Adicione um usuário e defina suas permissões
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={handleAddUser} className="space-y-4">
                <div>
                  <Label htmlFor="email">Email do Usuário *</Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="usuario@exemplo.com"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="permission">Permissão</Label>
                  <Select
                    value={formData.permission}
                    onValueChange={(value) => setFormData({ ...formData, permission: value as any })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="read">
                        <div className="flex items-center">
                          <Eye className="h-4 w-4 mr-2" />
                          Visualizar - Apenas leitura
                        </div>
                      </SelectItem>
                      <SelectItem value="write">
                        <div className="flex items-center">
                          <Edit className="h-4 w-4 mr-2" />
                          Editar - Pode modificar dados
                        </div>
                      </SelectItem>
                      <SelectItem value="admin">
                        <div className="flex items-center">
                          <Shield className="h-4 w-4 mr-2" />
                          Admin - Controle total
                        </div>
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex justify-end space-x-2">
                  <Button type="button" variant="outline" onClick={() => setIsAddDialogOpen(false)}>
                    Cancelar
                  </Button>
                  <Button type="submit">Adicionar Usuário</Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        )}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Lista de Usuários</CardTitle>
          <CardDescription>
            {companyUsers.length} usuário(s) com acesso à empresa
          </CardDescription>
        </CardHeader>
        <CardContent>
          {companyUsers.length === 0 ? (
            <div className="text-center py-8">
              <UserPlus className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">Nenhum usuário encontrado</h3>
              <p className="text-muted-foreground mb-4">
                Adicione usuários para compartilhar o acesso à empresa
              </p>
              {isOwner && (
                <Button onClick={() => setIsAddDialogOpen(true)}>
                  <UserPlus className="h-4 w-4 mr-2" />
                  Adicionar Primeiro Usuário
                </Button>
              )}
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Usuário</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Permissão</TableHead>
                  <TableHead>Adicionado em</TableHead>
                  {isOwner && <TableHead>Ações</TableHead>}
                </TableRow>
              </TableHeader>
              <TableBody>
                {companyUsers.map((companyUser) => (
                  <TableRow key={companyUser.id}>
                    <TableCell>
                      <div className="font-medium">
                        {companyUser.user?.profiles?.full_name || 'Nome não informado'}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center">
                        <Mail className="h-4 w-4 mr-2 text-muted-foreground" />
                        {companyUser.user?.email}
                      </div>
                    </TableCell>
                    <TableCell>
                      {getPermissionBadge(companyUser.permission_type)}
                    </TableCell>
                    <TableCell>
                      {new Date(companyUser.created_at).toLocaleDateString('pt-BR')}
                    </TableCell>
                    {isOwner && (
                      <TableCell>
                        <div className="flex space-x-2">
                          <Select
                            value={companyUser.permission_type}
                            onValueChange={(value) => handlePermissionChange(companyUser.id, value)}
                          >
                            <SelectTrigger className="w-32">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="read">Visualizar</SelectItem>
                              <SelectItem value="write">Editar</SelectItem>
                              <SelectItem value="admin">Admin</SelectItem>
                            </SelectContent>
                          </Select>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleRemoveUser(companyUser.id, companyUser.user?.email || '')}
                            className="text-destructive hover:text-destructive"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    )}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
};