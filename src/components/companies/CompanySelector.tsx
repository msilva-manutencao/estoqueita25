import { useState, useEffect } from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useCompanies } from '@/hooks/useCompanies';
import { useCurrentCompany } from '@/hooks/useCurrentCompany';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Building2, Crown, Shield, Edit, Eye } from 'lucide-react';
import { toast } from 'sonner';

export const CompanySelector = () => {
  const { companies, loading } = useCompanies();
  const { currentCompany, setCurrentCompany, userPermission, setUserPermission } = useCurrentCompany();
  const { user } = useAuth();
  const [loadingPermission, setLoadingPermission] = useState(false);

  const getUserPermissionForCompany = async (companyId: string) => {
    if (!user) return null;

    try {
      setLoadingPermission(true);
      
      // Verificar se é o proprietário
      const company = companies.find(c => c.id === companyId);
      if (company?.owner_id === user.id) {
        return 'owner';
      }

      // Verificar permissão como membro
      const { data, error } = await supabase
        .from('company_users')
        .select('permission_type')
        .eq('company_id', companyId)
        .eq('user_id', user.id)
        .eq('is_active', true)
        .single();

      if (error) {
        console.error('Erro ao buscar permissão:', error);
        return null;
      }

      return data?.permission_type || null;
    } catch (error) {
      console.error('Erro ao verificar permissão:', error);
      return null;
    } finally {
      setLoadingPermission(false);
    }
  };

  const handleCompanyChange = async (companyId: string) => {
    const company = companies.find(c => c.id === companyId);
    if (!company) return;

    const permission = await getUserPermissionForCompany(companyId);
    if (!permission) {
      toast.error('Você não tem permissão para acessar esta empresa');
      return;
    }

    setCurrentCompany(company);
    setUserPermission(permission);
    toast.success(`Empresa alterada para: ${company.name}`);
  };

  const getPermissionIcon = (permission: string | null) => {
    switch (permission) {
      case 'owner':
        return <Crown className="h-4 w-4" />;
      case 'admin':
        return <Shield className="h-4 w-4" />;
      case 'write':
        return <Edit className="h-4 w-4" />;
      case 'read':
        return <Eye className="h-4 w-4" />;
      default:
        return null;
    }
  };

  const getPermissionLabel = (permission: string | null) => {
    switch (permission) {
      case 'owner':
        return 'Proprietário';
      case 'admin':
        return 'Admin';
      case 'write':
        return 'Editor';
      case 'read':
        return 'Visualizador';
      default:
        return '';
    }
  };

  const getPermissionVariant = (permission: string | null) => {
    switch (permission) {
      case 'owner':
        return 'default';
      case 'admin':
        return 'destructive';
      case 'write':
        return 'secondary';
      case 'read':
        return 'outline';
      default:
        return 'outline';
    }
  };

  // Selecionar primeira empresa automaticamente se não houver empresa selecionada
  useEffect(() => {
    if (!currentCompany && companies.length > 0 && !loading) {
      handleCompanyChange(companies[0].id);
    }
  }, [companies, currentCompany, loading]);

  if (loading || loadingPermission) {
    return (
      <div className="flex items-center space-x-2">
        <Building2 className="h-4 w-4" />
        <span className="text-sm">Carregando...</span>
      </div>
    );
  }

  if (companies.length === 0) {
    return (
      <div className="flex items-center space-x-2 text-muted-foreground">
        <Building2 className="h-4 w-4" />
        <span className="text-sm">Nenhuma empresa</span>
      </div>
    );
  }

  return (
    <div className="flex items-center space-x-3">
      <div className="flex items-center space-x-2">
        <Building2 className="h-4 w-4" />
        <Select
          value={currentCompany?.id || ''}
          onValueChange={handleCompanyChange}
        >
          <SelectTrigger className="w-48">
            <SelectValue placeholder="Selecionar empresa" />
          </SelectTrigger>
          <SelectContent>
            {companies.map((company) => (
              <SelectItem key={company.id} value={company.id}>
                <div className="flex items-center justify-between w-full">
                  <span>{company.name}</span>
                  {company.owner_id === user?.id && (
                    <Crown className="h-3 w-3 ml-2 text-yellow-500" />
                  )}
                </div>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>


    </div>
  );
};