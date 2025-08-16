-- =====================================================
-- SCRIPT DE RESTAURAÇÃO DO BACKUP SUPABASE
-- Data: 16/08/2025 17:33:01
-- Projeto: gulysdbrpzrfcvsaaare
-- =====================================================

-- IMPORTANTE: Execute este script em um banco limpo após aplicar as migrações

BEGIN;

-- =====================================================
-- 1. RESTAURAR EMPRESAS
-- =====================================================
INSERT INTO public.companies (id, name, description, created_at, updated_at, owner_id, is_active) VALUES
('c8c850fd-1e67-4eb4-ad13-109286f22827', 'Itatiaia', 'Itatiaia - Refeitório', '2025-08-14 10:15:51.849197+00', '2025-08-15 10:28:04.083588+00', '5a1c93de-21cb-403b-bc22-848082041618', true),
('d30b82ab-3dfd-4af1-9fe7-73f73949f5d2', 'Empresa X', 'Empresa para testes', '2025-08-14 10:32:01.205778+00', '2025-08-16 19:18:36.318553+00', 'fb98f869-ef72-480d-a4b3-924167c39edd', true)
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  updated_at = EXCLUDED.updated_at,
  is_active = EXCLUDED.is_active;

-- =====================================================
-- 2. RESTAURAR CATEGORIAS
-- =====================================================
INSERT INTO public.categories (id, name, description, created_at, updated_at, user_id, company_id) VALUES
('88a121f7-05bb-4349-9279-648565e64b12', 'Alimentação', 'Produtos alimentícios', '2025-08-09 21:15:55.858984+00', '2025-08-14 11:02:22.812408+00', null, 'c8c850fd-1e67-4eb4-ad13-109286f22827'),
('2cc79a96-f7f0-4c5f-987a-c7bb34180890', 'Limpeza', 'Produtos de limpeza e higiene', '2025-08-09 21:15:55.858984+00', '2025-08-14 11:02:22.812408+00', null, 'c8c850fd-1e67-4eb4-ad13-109286f22827'),
('dcefd640-a75c-4c87-80e8-e8bb5443fa90', 'Frutas ', '', '2025-08-12 18:09:30.059322+00', '2025-08-14 11:02:22.812408+00', null, 'c8c850fd-1e67-4eb4-ad13-109286f22827'),
('8a9c58d6-f926-4e44-9157-9a7a49a1c5bc', 'Café ', 'Bebidas em geral', '2025-08-09 21:15:55.858984+00', '2025-08-14 11:02:22.812408+00', null, 'c8c850fd-1e67-4eb4-ad13-109286f22827'),
('8fc9119e-0a31-4a07-b573-72268660f480', 'Eletrônicos', 'Produtos eletrônicos', '2025-08-14 11:10:56.418498+00', '2025-08-14 11:10:56.418498+00', null, 'd30b82ab-3dfd-4af1-9fe7-73f73949f5d2'),
('3937aae9-6be0-48bb-a6cb-a28b43c89d7b', 'Escritório', 'Material de escritório', '2025-08-14 11:10:56.418498+00', '2025-08-14 11:10:56.418498+00', null, 'd30b82ab-3dfd-4af1-9fe7-73f73949f5d2'),
('61817a12-3c95-4bd2-bfde-e375702c527a', 'Açougue ', '', '2025-08-14 16:05:05.706533+00', '2025-08-14 16:05:05.706533+00', null, 'c8c850fd-1e67-4eb4-ad13-109286f22827')
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  updated_at = EXCLUDED.updated_at;

-- =====================================================
-- 3. RESTAURAR UNIDADES
-- =====================================================
INSERT INTO public.units (id, name, abbreviation, created_at, user_id, company_id) VALUES
('51208df4-34a4-4e14-8393-dcee11d46d16', 'Quilograma', 'kg', '2025-08-09 21:15:55.858984+00', null, 'c8c850fd-1e67-4eb4-ad13-109286f22827'),
('afcc8053-b0d1-4f36-a2f4-d1523b9fb275', 'Grama', 'g', '2025-08-09 21:15:55.858984+00', null, 'c8c850fd-1e67-4eb4-ad13-109286f22827'),
('d92afc86-7bfe-4082-a63e-7a5086cc8cd4', 'Litro', 'l', '2025-08-09 21:15:55.858984+00', null, 'c8c850fd-1e67-4eb4-ad13-109286f22827'),
('dd583130-6b3f-474c-a7f8-cc336d3e10ce', 'Mililitro', 'ml', '2025-08-09 21:15:55.858984+00', null, 'c8c850fd-1e67-4eb4-ad13-109286f22827'),
('1da14747-b2b1-4d99-b97b-2ebb84f6ec1c', 'Unidade', 'unidade', '2025-08-09 21:15:55.858984+00', null, 'c8c850fd-1e67-4eb4-ad13-109286f22827'),
('7152c9f6-c7b8-4e83-91d0-d9d6821ab009', 'Pacote', 'pacote', '2025-08-09 21:15:55.858984+00', null, 'c8c850fd-1e67-4eb4-ad13-109286f22827'),
('4a3260aa-438d-40c2-810a-07eaeba2cb03', 'Caixa', 'caixa', '2025-08-09 21:15:55.858984+00', null, 'c8c850fd-1e67-4eb4-ad13-109286f22827'),
('337837d9-f5cf-4b87-b563-1cf85f18da27', 'Lata', 'lata', '2025-08-09 21:15:55.858984+00', null, 'c8c850fd-1e67-4eb4-ad13-109286f22827'),
('61ef934a-b942-455e-be00-b6c76d67bd35', 'Garrafa', 'garrafa', '2025-08-09 21:15:55.858984+00', null, 'c8c850fd-1e67-4eb4-ad13-109286f22827'),
('8bff5080-03b6-416d-9a0f-24a97094ffde', 'Balde', 'BD', '2025-08-12 13:54:10.774594+00', null, 'c8c850fd-1e67-4eb4-ad13-109286f22827'),
('57c662f3-693a-42c5-b953-551e22074d90', 'Peça', 'pç', '2025-08-14 11:10:56.418498+00', null, 'd30b82ab-3dfd-4af1-9fe7-73f73949f5d2'),
('dcd01fa5-cbef-4f30-ae62-de238f68dc24', 'Caixa', 'cx', '2025-08-14 11:10:56.418498+00', null, 'd30b82ab-3dfd-4af1-9fe7-73f73949f5d2'),
('a874c029-1527-4e10-8479-43c183650a70', 'Pacote', 'pct', '2025-08-14 11:10:56.418498+00', null, 'd30b82ab-3dfd-4af1-9fe7-73f73949f5d2')
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  abbreviation = EXCLUDED.abbreviation;

-- =====================================================
-- 4. NOTA SOBRE ITENS
-- =====================================================
-- Os itens são muitos (122+) para incluir neste script
-- Use o arquivo items_data.json para importar via ferramenta
-- ou crie um script separado para os itens

-- =====================================================
-- 5. VERIFICAÇÕES
-- =====================================================
SELECT 'Empresas restauradas: ' || COUNT(*) FROM public.companies;
SELECT 'Categorias restauradas: ' || COUNT(*) FROM public.categories;
SELECT 'Unidades restauradas: ' || COUNT(*) FROM public.units;

COMMIT;

-- =====================================================
-- INSTRUÇÕES ADICIONAIS
-- =====================================================
/*
1. Para restaurar os itens, use:
   - Importe items_data.json via interface do Supabase
   - Ou crie script SQL específico para itens

2. Para restaurar movimentações:
   - Importe stock_movements_data.json
   - Verifique se os estoques ficaram corretos

3. As políticas RLS e funções já estão nas migrações

4. Teste todas as funcionalidades após a restauração
*/