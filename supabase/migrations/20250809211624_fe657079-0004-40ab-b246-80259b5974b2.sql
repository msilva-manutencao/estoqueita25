-- Corrigir problemas de segurança identificados pelo linter

-- Recriar função para atualizar updated_at com search_path seguro
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER 
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

-- Recriar função para atualizar estoque com search_path seguro
CREATE OR REPLACE FUNCTION public.update_item_stock()
RETURNS TRIGGER 
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
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
$$;