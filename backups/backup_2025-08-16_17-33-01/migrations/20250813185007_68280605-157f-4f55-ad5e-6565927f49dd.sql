
-- Criar tabela de perfis de usuários
CREATE TABLE public.profiles (
  id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  full_name TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  PRIMARY KEY (id)
);

-- Habilitar RLS na tabela de perfis
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Política para usuários verem apenas seu próprio perfil
CREATE POLICY "Users can view own profile" 
  ON public.profiles 
  FOR SELECT 
  USING (auth.uid() = id);

-- Política para usuários atualizarem apenas seu próprio perfil
CREATE POLICY "Users can update own profile" 
  ON public.profiles 
  FOR UPDATE 
  USING (auth.uid() = id);

-- Criar enum para roles
CREATE TYPE public.app_role AS ENUM ('admin', 'user');

-- Criar tabela de roles de usuários
CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role app_role NOT NULL DEFAULT 'user',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE (user_id, role)
);

-- Habilitar RLS na tabela de roles
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- Função para verificar se o usuário tem determinado role
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN
LANGUAGE SQL
STABLE
SECURITY DEFINER
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role = _role
  )
$$;

-- Políticas para roles (apenas admins podem ver/gerenciar roles)
CREATE POLICY "Admins can view all roles" 
  ON public.user_roles 
  FOR SELECT 
  USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can manage roles" 
  ON public.user_roles 
  FOR ALL 
  USING (public.has_role(auth.uid(), 'admin'));

-- Adicionar coluna user_id nas tabelas existentes para vincular dados aos usuários
ALTER TABLE public.categories ADD COLUMN user_id UUID REFERENCES auth.users(id);
ALTER TABLE public.units ADD COLUMN user_id UUID REFERENCES auth.users(id);
ALTER TABLE public.items ADD COLUMN user_id UUID REFERENCES auth.users(id);
ALTER TABLE public.stock_movements ADD COLUMN user_id UUID REFERENCES auth.users(id);
ALTER TABLE public.standard_lists ADD COLUMN user_id UUID REFERENCES auth.users(id);

-- Função para criar perfil automaticamente quando usuário se cadastra
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE PLPGSQL
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name)
  VALUES (
    NEW.id, 
    NEW.email, 
    COALESCE(NEW.raw_user_meta_data ->> 'full_name', NEW.email)
  );
  
  -- Se for o primeiro usuário ou o email específico, torná-lo admin
  IF NEW.email = 'moisestj86@gmail.com' OR NOT EXISTS (SELECT 1 FROM public.user_roles WHERE role = 'admin') THEN
    INSERT INTO public.user_roles (user_id, role)
    VALUES (NEW.id, 'admin');
  ELSE
    INSERT INTO public.user_roles (user_id, role)
    VALUES (NEW.id, 'user');
  END IF;
  
  RETURN NEW;
END;
$$;

-- Trigger para executar a função quando um novo usuário é criado
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Função para vincular dados existentes ao primeiro admin (será executada após criar o usuário)
CREATE OR REPLACE FUNCTION public.assign_existing_data_to_admin()
RETURNS VOID
LANGUAGE PLPGSQL
SECURITY DEFINER
AS $$
DECLARE
  admin_user_id UUID;
BEGIN
  -- Buscar o primeiro usuário admin
  SELECT ur.user_id INTO admin_user_id
  FROM public.user_roles ur
  WHERE ur.role = 'admin'
  LIMIT 1;
  
  IF admin_user_id IS NOT NULL THEN
    -- Atualizar todas as tabelas para vincular ao admin
    UPDATE public.categories SET user_id = admin_user_id WHERE user_id IS NULL;
    UPDATE public.units SET user_id = admin_user_id WHERE user_id IS NULL;
    UPDATE public.items SET user_id = admin_user_id WHERE user_id IS NULL;
    UPDATE public.stock_movements SET user_id = admin_user_id WHERE user_id IS NULL;
    UPDATE public.standard_lists SET user_id = admin_user_id WHERE user_id IS NULL;
  END IF;
END;
$$;
