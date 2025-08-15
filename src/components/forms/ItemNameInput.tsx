
import { useState, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Command, CommandGroup, CommandItem, CommandList } from '@/components/ui/command';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertTriangle } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useCurrentCompany } from '@/hooks/useCurrentCompany';

interface Item {
  id: string;
  name: string;
  current_stock: number;
}

interface ItemNameInputProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
}

export const ItemNameInput = ({ value, onChange, placeholder, className }: ItemNameInputProps) => {
  const [suggestions, setSuggestions] = useState<Item[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [exactMatch, setExactMatch] = useState<Item | null>(null);
  const { currentCompany } = useCurrentCompany();

  const searchItems = async (searchTerm: string) => {
    if (!searchTerm.trim() || searchTerm.length < 2 || !currentCompany) {
      setSuggestions([]);
      setExactMatch(null);
      return;
    }

    try {
      const { data: items, error } = await supabase
        .from('items')
        .select('id, name, current_stock')
        .eq('company_id', currentCompany.id)
        .ilike('name', `%${searchTerm}%`)
        .limit(10);

      if (error) throw error;

      setSuggestions(items || []);
      
      // Verificar se existe match exato
      const exact = items?.find(item => 
        item.name.toLowerCase() === searchTerm.toLowerCase()
      );
      setExactMatch(exact || null);
    } catch (error) {
      console.error('Erro ao buscar itens:', error);
      setSuggestions([]);
      setExactMatch(null);
    }
  };

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      searchItems(value);
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [value, currentCompany]);

  const handleSelectSuggestion = (item: Item) => {
    onChange(item.name);
    setShowSuggestions(false);
  };

  return (
    <div className="relative space-y-2">
      <Input
        value={value}
        onChange={(e) => {
          onChange(e.target.value);
          setShowSuggestions(true);
        }}
        onFocus={() => setShowSuggestions(true)}
        onBlur={() => {
          // Delay para permitir clique nas sugestões
          setTimeout(() => setShowSuggestions(false), 200);
        }}
        placeholder={placeholder}
        className={className}
      />

      {exactMatch && (
        <Alert className="border-yellow-200 bg-yellow-50">
          <AlertTriangle className="h-4 w-4 text-yellow-600" />
          <AlertDescription className="text-yellow-800">
            Item "{exactMatch.name}" já existe no estoque (Quantidade: {exactMatch.current_stock})
          </AlertDescription>
        </Alert>
      )}

      {showSuggestions && suggestions.length > 0 && (
        <div className="absolute z-50 w-full bg-white border border-gray-200 rounded-md shadow-lg max-h-60 overflow-auto">
          <Command>
            <CommandList>
              <CommandGroup heading="Itens existentes">
                {suggestions.map((item) => (
                  <CommandItem
                    key={item.id}
                    onSelect={() => handleSelectSuggestion(item)}
                    className="cursor-pointer"
                  >
                    <div className="flex justify-between w-full">
                      <span>{item.name}</span>
                      <span className="text-sm text-gray-500">
                        Estoque: {item.current_stock}
                      </span>
                    </div>
                  </CommandItem>
                ))}
              </CommandGroup>
            </CommandList>
          </Command>
        </div>
      )}
    </div>
  );
};
