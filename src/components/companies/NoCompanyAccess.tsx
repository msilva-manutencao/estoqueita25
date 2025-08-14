import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Building2, Mail, AlertCircle } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';

export const NoCompanyAccess = () => {
  const { signOut, user } = useAuth();
  const adminEmail = "moisestj86@gmail.com";

  const handleContactAdmin = () => {
    const subject = encodeURIComponent("Solicitação de Acesso à Empresa");
    const body = encodeURIComponent(
      `Olá,\n\nGostaria de solicitar acesso a uma empresa na plataforma de estoque.\n\nMeu email de cadastro: ${user?.email}\n\nAguardo retorno.\n\nObrigado!`
    );
    window.open(`mailto:${adminEmail}?subject=${subject}&body=${body}`);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <Card className="max-w-md w-full">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 p-3 bg-orange-100 rounded-full w-fit">
            <AlertCircle className="h-8 w-8 text-orange-600" />
          </div>
          <CardTitle className="text-xl">Acesso Pendente</CardTitle>
          <CardDescription>
            Sua conta foi criada com sucesso, mas você ainda não tem acesso a nenhuma empresa.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="bg-muted p-4 rounded-lg">
            <h4 className="font-medium mb-2 flex items-center">
              <Building2 className="h-4 w-4 mr-2" />
              Como obter acesso?
            </h4>
            <p className="text-sm text-muted-foreground mb-3">
              Para começar a usar o aplicativo, você precisa solicitar ao administrador 
              que crie uma empresa e vincule seu email a ela.
            </p>
            <div className="flex items-center space-x-2 text-sm">
              <Mail className="h-4 w-4 text-primary" />
              <span className="font-medium">Administrador:</span>
              <span className="text-primary">{adminEmail}</span>
            </div>
          </div>

          <div className="space-y-2">
            <Button onClick={handleContactAdmin} className="w-full">
              <Mail className="h-4 w-4 mr-2" />
              Entrar em Contato
            </Button>
            <Button variant="outline" onClick={signOut} className="w-full">
              Sair da Conta
            </Button>
          </div>

          <div className="text-center">
            <p className="text-xs text-muted-foreground">
              Após o administrador vincular seu email a uma empresa, 
              faça login novamente para acessar o sistema.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};