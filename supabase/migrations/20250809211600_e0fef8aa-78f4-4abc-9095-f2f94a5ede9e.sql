-- Sistema de Gestão de Estoque - Criação de Tabelas

-- Criar tabela de categorias
CREATE TABLE public.categories (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Criar tabela de unidades de medida
CREATE TABLE public.units (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  abbreviation TEXT NOT NULL UNIQUE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Criar tabela de itens
CREATE TABLE public.items (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  category_id UUID REFERENCES public.categories(id) NOT NULL,
  unit_id UUID REFERENCES public.units(id) NOT NULL,
  current_stock DECIMAL(10,2) NOT NULL DEFAULT 0,
  minimum_stock DECIMAL(10,2) DEFAULT 10,
  expiry_date DATE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Criar tabela de listas padrão
CREATE TABLE public.standard_lists (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Criar tabela de itens das listas padrão
CREATE TABLE public.standard_list_items (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  standard_list_id UUID REFERENCES public.standard_lists(id) ON DELETE CASCADE NOT NULL,
  item_id UUID REFERENCES public.items(id) ON DELETE CASCADE NOT NULL,
  quantity DECIMAL(10,2) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(standard_list_id, item_id)
);

-- Criar tabela de movimentações de estoque
CREATE TABLE public.stock_movements (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  item_id UUID REFERENCES public.items(id) ON DELETE CASCADE NOT NULL,
  movement_type TEXT NOT NULL CHECK (movement_type IN ('entrada', 'saida')),
  quantity DECIMAL(10,2) NOT NULL,
  description TEXT,
  date TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Habilitar RLS em todas as tabelas
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.units ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.standard_lists ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.standard_list_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.stock_movements ENABLE ROW LEVEL SECURITY;

-- Criar políticas RLS (permitir acesso total por enquanto - será refinado com autenticação)
CREATE POLICY "Allow all operations on categories" ON public.categories FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all operations on units" ON public.units FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all operations on items" ON public.items FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all operations on standard_lists" ON public.standard_lists FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all operations on standard_list_items" ON public.standard_list_items FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all operations on stock_movements" ON public.stock_movements FOR ALL USING (true) WITH CHECK (true);

-- Função para atualizar updated_at automaticamente
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers para atualização automática de updated_at
CREATE TRIGGER update_categories_updated_at
  BEFORE UPDATE ON public.categories
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_items_updated_at
  BEFORE UPDATE ON public.items
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_standard_lists_updated_at
  BEFORE UPDATE ON public.standard_lists
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Função para atualizar estoque automaticamente
CREATE OR REPLACE FUNCTION public.update_item_stock()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.movement_type = 'entrada' THEN
    UPDATE public.items 
    SET current_stock = current_stock + NEW.quantity 
    WHERE id = NEW.item_id;
  ELSIF NEW.movement_type = 'saida' THEN
    UPDATE public.items 
    SET current_stock = current_stock - NEW.quantity 
    WHERE id = NEW.item_id;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger para atualizar estoque automaticamente
CREATE TRIGGER update_stock_on_movement
  AFTER INSERT ON public.stock_movements
  FOR EACH ROW
  EXECUTE FUNCTION public.update_item_stock();

-- Inserir dados iniciais de categorias
INSERT INTO public.categories (name, description) VALUES
  ('Alimentação', 'Produtos alimentícios'),
  ('Limpeza', 'Produtos de limpeza e higiene'),
  ('Escritório', 'Material de escritório'),
  ('Descartáveis', 'Produtos descartáveis'),
  ('Bebidas', 'Bebidas em geral');

-- Inserir dados iniciais de unidades
INSERT INTO public.units (name, abbreviation) VALUES
  ('Quilograma', 'kg'),
  ('Grama', 'g'),
  ('Litro', 'l'),
  ('Mililitro', 'ml'),
  ('Unidade', 'unidade'),
  ('Pacote', 'pacote'),
  ('Caixa', 'caixa'),
  ('Lata', 'lata'),
  ('Garrafa', 'garrafa');

-- Criar índices para melhor performance
CREATE INDEX idx_items_category_id ON public.items(category_id);
CREATE INDEX idx_items_unit_id ON public.items(unit_id);
CREATE INDEX idx_items_current_stock ON public.items(current_stock);
CREATE INDEX idx_items_expiry_date ON public.items(expiry_date);
CREATE INDEX idx_stock_movements_item_id ON public.stock_movements(item_id);
CREATE INDEX idx_stock_movements_date ON public.stock_movements(date);
CREATE INDEX idx_standard_list_items_list_id ON public.standard_list_items(standard_list_id);
CREATE INDEX idx_standard_list_items_item_id ON public.standard_list_items(item_id);