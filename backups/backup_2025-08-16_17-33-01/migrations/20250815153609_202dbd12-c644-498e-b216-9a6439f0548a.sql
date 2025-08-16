
-- Primeiro, vamos remover as políticas existentes que estão causando recursão
DROP POLICY IF EXISTS "Users can view companies they own or are members of" ON public.companies;
DROP POLICY IF EXISTS "Users can create companies" ON public.companies;
DROP POLICY IF EXISTS "Owners can update their companies" ON public.companies;
DROP POLICY IF EXISTS "Owners can delete their companies" ON public.companies;

-- Remover também as políticas problemáticas de company_users
DROP POLICY IF EXISTS "Company owners and admins can manage company users" ON public.company_users;

-- Criar função auxiliar para verificar se o usuário é super admin (sem recursão)
CREATE OR REPLACE FUNCTION public.is_super_admin(user_id uuid DEFAULT auth.uid())
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
AS $$
  SELECT CASE 
    WHEN user_id IS NULL THEN false
    WHEN EXISTS (
      SELECT 1 FROM auth.users u 
      WHERE u.id = user_id 
      AND u.email = 'moisestj86@gmail.com'
    ) THEN true
    ELSE false
  END
$$;

-- Criar políticas corrigidas para a tabela companies
CREATE POLICY "Users can view companies they own or are members of" ON public.companies
FOR SELECT
TO authenticated
USING (
  is_super_admin() OR 
  owner_id = auth.uid() OR
  EXISTS (
    SELECT 1 FROM public.company_users cu
    WHERE cu.company_id = companies.id 
      AND cu.user_id = auth.uid() 
      AND cu.is_active = true
  )
);

CREATE POLICY "Users can create companies" ON public.companies
FOR INSERT
TO authenticated
WITH CHECK (owner_id = auth.uid());

CREATE POLICY "Owners can update their companies" ON public.companies
FOR UPDATE
TO authenticated
USING (owner_id = auth.uid() OR is_super_admin())
WITH CHECK (owner_id = auth.uid() OR is_super_admin());

CREATE POLICY "Owners can delete their companies" ON public.companies
FOR DELETE
TO authenticated
USING (owner_id = auth.uid() OR is_super_admin());

-- Corrigir política para company_users
CREATE POLICY "Company owners and admins can manage company users" ON public.company_users
FOR ALL
TO authenticated
USING (
  is_super_admin() OR
  EXISTS (
    SELECT 1 FROM public.companies c
    WHERE c.id = company_users.company_id 
      AND c.owner_id = auth.uid()
  ) OR
  EXISTS (
    SELECT 1 FROM public.company_users cu
    WHERE cu.company_id = company_users.company_id 
      AND cu.user_id = auth.uid() 
      AND cu.permission_type = 'admin'::permission_type 
      AND cu.is_active = true
  )
)
WITH CHECK (
  is_super_admin() OR
  EXISTS (
    SELECT 1 FROM public.companies c
    WHERE c.id = company_users.company_id 
      AND c.owner_id = auth.uid()
  ) OR
  EXISTS (
    SELECT 1 FROM public.company_users cu
    WHERE cu.company_id = company_users.company_id 
      AND cu.user_id = auth.uid() 
      AND cu.permission_type = 'admin'::permission_type 
      AND cu.is_active = true
  )
);
