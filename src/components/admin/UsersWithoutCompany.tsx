import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { supabase } from '@/integrations/supabase/client';
import { useCompanies } from '@/hooks/useCompanies';
import { toast } from 'sonner';
import { UserPlus, Mail, Calendar, Building2 } from 'lucide-react';

interface UserWithoutCompany {
  user_id: string;
  email: string;
  full_name: string;
  created_at: string;
}

export const UsersWithoutCompany = () => {
  const [users, setUsers] = useState<UserWithoutCompany[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedUser, setSelectedUser] = useState<UserWithoutCompany | null>(null);
  const [selectedCompany, setSelectedCompany] = useState('');
  const [selectedPermission, setSelectedPermission] = useState<'read' | 'write' | 'admin'>('read');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [processing, setProcessing] = useState(false);
  const { companies } = useCompanies();

  const fetchUsersWithoutCompany = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase.rpc('list_users_without_company');
      
      if (error) throw error;
      setUsers(data || []);
    } catch (error) {
      console.error('Erro ao buscar usuários sem empresa:', error);
      toast.error('Erro ao carregar usuários sem empresa');
    } finally {
      setLoading(false);
    }
  };

  const handleAddUserToCompany = async () => {
    if (!selectedUser || !selectedCompany) {
      toast.error('Selecione um usuário e uma empresa');
      return;
    }

    try {
      setProcessing(true);
      const { data, error } = await supabase.rpc('add_user_to_company', {
        p_user_email: selectedUser.email,
        p_company_id: selectedCompany,
        p_permission_type: selectedPermission
      });

      if (error) throw error;

      const result = data as { success: boolean; message?: string; error?: string };
      
      if (result.success) {
        toast.success(result.message || 'Usuário adicionado com sucesso!');
        setIsDialogOpen(false);
        setSelectedUser(null);
        setSelectedCompany('');
        setSelectedPermission('read');
        await fetchUsersWithoutCompany();
      } else {
        toast.error(result.error || 'Erro ao adicionar usuário');
      }
    } catch (error) {
      console.error('Erro ao adicionar usuário à empresa:', error);
      toast.error('Erro ao adicionar usuário à empresa');
    } finally {
      setProcessing(false);
    }
  };

  const openAddDialog = (user: UserWithoutCompany) => {
    setSelectedUser(user);
    setIsDialogOpen(true);
  };

  useEffect(() => {
    fetchUsersWithoutCompany();
  }, []);

  if (loading) {
    return <div className="flex justify-center p-8">Carregando usuários...</div>;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <UserPlus className="h-5 w-5" />
          <span>Usuários Sem Empresa</span>
        </CardTitle>
        <CardDescription>
          Usuários que se cadastraram mas ainda não têm acesso a nenhuma empresa
        </CardDescription>
      </CardHeader>
      <CardContent>
        {users.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <UserPlus className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>Todos os usuários já estão vinculados a empresas</p>
          </div>
        ) : (
          <div className="space-y-4">
            {users.map((user) => (
              <div key={user.user_id} className="flex items-center justify-between p-4 border rounded-lg">
                <div className="space-y-1">
                  <div className="flex items-center space-x-2">
                    <Mail className="h-4 w-4 text-muted-foreground" />
                    <span className="font-medium">{user.email}</span>
                  </div>
                  {user.full_name && user.full_name !== user.email && (
                    <div className="text-sm text-muted-foreground">
                      {user.full_name}
                    </div>
                  )}
                  <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                    <Calendar className="h-3 w-3" />
                    <span>Cadastrado em {new Date(user.created_at).toLocaleDateString('pt-BR')}</span>
                  </div>
                </div>
                <Button onClick={() => openAddDialog(user)}>
                  <Building2 className="h-4 w-4 mr-2" />
                  Adicionar à Empresa
                </Button>
              </div>
            ))}
          </div>
        )}

        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Adicionar Usuário à Empresa</DialogTitle>
              <DialogDescription>
                Vincule o usuário {selectedUser?.email} a uma empresa
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
                <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                  Cancelar
                </Button>
                <Button onClick={handleAddUserToCompany} disabled={processing}>
                  {processing ? 'Adicionando...' : 'Adicionar'}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </CardContent>
    </Card>
  );
};