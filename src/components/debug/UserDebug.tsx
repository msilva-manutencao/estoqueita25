import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/hooks/useAuth';
import { useCompanies } from '@/hooks/useCompanies';
import { useCurrentCompany } from '@/hooks/useCurrentCompany';
import { useSuperAdmin } from '@/hooks/useSuperAdmin';
import { User, Building2, Shield, Crown } from 'lucide-react';

export const UserDebug = () => {
  const { user } = useAuth();
  const { companies } = useCompanies();
  const { currentCompany, userPermission } = useCurrentCompany();
  const { isSuperAdmin } = useSuperAdmin();

  if (!user) return null;

  return (
    <Card className="mb-4">
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <User className="h-5 w-5" />
          <span>Debug do Usuário</span>
        </CardTitle>
        <CardDescription>Informações do usuário atual</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <strong>Email:</strong> {user.email}
        </div>
        <div>
          <strong>ID:</strong> {user.id}
        </div>
        <div className="flex items-center space-x-2">
          <strong>Super Admin:</strong>
          <Badge variant={isSuperAdmin ? "default" : "outline"}>
            {isSuperAdmin ? (
              <>
                <Crown className="h-3 w-3 mr-1" />
                Sim
              </>
            ) : (
              'Não'
            )}
          </Badge>
        </div>
        <div>
          <strong>Empresas com acesso:</strong> {companies.length}
        </div>
        {currentCompany && (
          <div className="flex items-center space-x-2">
            <strong>Empresa atual:</strong>
            <Badge variant="secondary">
              <Building2 className="h-3 w-3 mr-1" />
              {currentCompany.name}
            </Badge>
            {userPermission && (
              <Badge variant="outline">
                <Shield className="h-3 w-3 mr-1" />
                {userPermission}
              </Badge>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
};