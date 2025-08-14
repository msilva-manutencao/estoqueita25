
import { useState, useEffect, useRef } from "react";
import { Input } from "@/components/ui/input";
import { useSupabaseItems } from "@/hooks/useSupabaseItems";
import { AlertTriangle, Check } from "lucide-react";

interface ItemNameInputProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}

export function ItemNameInput({ value, onChange, placeholder }: ItemNameInputProps) {
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [hasExactMatch, setHasExactMatch] = useState(false);
  const { items } = useSupabaseItems();
  const inputRef = useRef<HTMLInputElement>(null);
  const suggestionsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (value.length >= 2) {
      // Filtrar itens que começam com o texto digitado
      const filtered = items
        .filter(item => 
          item.name.toLowerCase().includes(value.toLowerCase())
        )
        .map(item => item.name)
        .slice(0, 5); // Limitar a 5 sugestões

      setSuggestions(filtered);
      
      // Verificar se existe um item com o nome exato
      const exactMatch = items.some(item => 
        item.name.toLowerCase() === value.toLowerCase()
      );
      setHasExactMatch(exactMatch);
      
      setShowSuggestions(filtered.length > 0);
    } else {
      setSuggestions([]);
      setShowSuggestions(false);
      setHasExactMatch(false);
    }
  }, [value, items]);

  // Fechar sugestões ao clicar fora
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        inputRef.current &&
        suggestionsRef.current &&
        !inputRef.current.contains(event.target as Node) &&
        !suggestionsRef.current.contains(event.target as Node)
      ) {
        setShowSuggestions(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSuggestionClick = (suggestion: string) => {
    onChange(suggestion);
    setShowSuggestions(false);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onChange(e.target.value);
  };

  const handleInputFocus = () => {
    if (suggestions.length > 0) {
      setShowSuggestions(true);
    }
  };

  return (
    <div className="relative">
      <div className="relative">
        <Input
          ref={inputRef}
          value={value}
          onChange={handleInputChange}
          onFocus={handleInputFocus}
          placeholder={placeholder}
          className={`pr-10 ${hasExactMatch ? 'border-orange-500 bg-orange-50' : ''}`}
        />
        {value && (
          <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
            {hasExactMatch ? (
              <AlertTriangle className="h-4 w-4 text-orange-500" />
            ) : (
              <Check className="h-4 w-4 text-green-500" />
            )}
          </div>
        )}
      </div>

      {hasExactMatch && (
        <p className="text-sm text-orange-600 mt-1 flex items-center">
          <AlertTriangle className="h-3 w-3 mr-1" />
          Um item com este nome já existe
        </p>
      )}

      {showSuggestions && suggestions.length > 0 && (
        <div
          ref={suggestionsRef}
          className="absolute top-full left-0 right-0 z-50 bg-white border border-gray-200 rounded-md shadow-lg mt-1 max-h-48 overflow-y-auto"
        >
          <div className="p-2 text-xs text-gray-500 border-b">
            Itens existentes:
          </div>
          {suggestions.map((suggestion, index) => (
            <button
              key={index}
              type="button"
              className="w-full text-left px-3 py-2 hover:bg-gray-100 text-sm transition-colors"
              onClick={() => handleSuggestionClick(suggestion)}
            >
              {suggestion}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
