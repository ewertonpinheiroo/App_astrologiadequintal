'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { MapPin, Loader2, X } from 'lucide-react';
import { useLocationSearch, LocationSuggestion } from '@/hooks/use-location-search';
import { cn } from '@/lib/utils';

interface LocationAutocompleteProps {
  label?: string;
  placeholder?: string;
  value: string;
  onChange: (value: string, coordinates?: { latitude: number; longitude: number }) => void;
  required?: boolean;
  className?: string;
}

export default function LocationAutocomplete({
  label = 'Local de Nascimento',
  placeholder = 'Ex: São Paulo, SP, Brasil',
  value,
  onChange,
  required = false,
  className
}: LocationAutocompleteProps) {
  const [inputValue, setInputValue] = useState(value);
  const [isOpen, setIsOpen] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const [hasSelectedSuggestion, setHasSelectedSuggestion] = useState(false);
  
  const inputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const debounceRef = useRef<NodeJS.Timeout>();

  const {
    suggestions,
    loading,
    error,
    searchLocations,
    formatLocationName,
    getCoordinates,
    clearSuggestions
  } = useLocationSearch();

  // Debounce da busca
  const debouncedSearch = useCallback((query: string) => {
    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }
    
    debounceRef.current = setTimeout(() => {
      searchLocations(query);
    }, 300);
  }, [searchLocations]);

  // Atualiza o valor do input quando o prop value muda
  useEffect(() => {
    setInputValue(value);
  }, [value]);

  // Fecha dropdown ao clicar fora
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node) &&
        !inputRef.current?.contains(event.target as Node)
      ) {
        setIsOpen(false);
        setSelectedIndex(-1);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    setInputValue(newValue);
    setHasSelectedSuggestion(false);
    
    if (newValue.trim()) {
      debouncedSearch(newValue);
      setIsOpen(true);
    } else {
      clearSuggestions();
      setIsOpen(false);
      onChange('');
    }
    
    setSelectedIndex(-1);
  };

  const handleSuggestionSelect = (suggestion: LocationSuggestion) => {
    const formattedName = formatLocationName(suggestion);
    const coordinates = getCoordinates(suggestion);
    
    setInputValue(formattedName);
    setHasSelectedSuggestion(true);
    setIsOpen(false);
    setSelectedIndex(-1);
    
    onChange(formattedName, coordinates);
    
    // Remove o foco do input
    inputRef.current?.blur();
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!isOpen || suggestions.length === 0) return;

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setSelectedIndex(prev => 
          prev < suggestions.length - 1 ? prev + 1 : 0
        );
        break;
      
      case 'ArrowUp':
        e.preventDefault();
        setSelectedIndex(prev => 
          prev > 0 ? prev - 1 : suggestions.length - 1
        );
        break;
      
      case 'Enter':
        e.preventDefault();
        if (selectedIndex >= 0 && suggestions[selectedIndex]) {
          handleSuggestionSelect(suggestions[selectedIndex]);
        }
        break;
      
      case 'Escape':
        setIsOpen(false);
        setSelectedIndex(-1);
        inputRef.current?.blur();
        break;
    }
  };

  const handleClear = () => {
    setInputValue('');
    setHasSelectedSuggestion(false);
    setIsOpen(false);
    onChange('');
    clearSuggestions();
    inputRef.current?.focus();
  };

  const handleFocus = () => {
    if (inputValue.trim() && !hasSelectedSuggestion) {
      debouncedSearch(inputValue);
      setIsOpen(true);
    }
  };

  return (
    <div className={cn('space-y-2', className)}>
      <Label htmlFor="location" className="flex items-center gap-2">
        <MapPin className="w-4 h-4" />
        {label} {required && '*'}
      </Label>
      
      <div className="relative">
        <Input
          ref={inputRef}
          id="location"
          type="text"
          value={inputValue}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          onFocus={handleFocus}
          placeholder={placeholder}
          className="transition-all duration-200 focus:ring-2 focus:ring-purple-500 pr-10"
          required={required}
          autoComplete="off"
        />
        
        {/* Botão de limpar */}
        {inputValue && (
          <button
            type="button"
            onClick={handleClear}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        )}
        
        {/* Loading indicator */}
        {loading && (
          <div className="absolute right-3 top-1/2 -translate-y-1/2">
            <Loader2 className="w-4 h-4 animate-spin text-purple-500" />
          </div>
        )}
        
        {/* Dropdown de sugestões */}
        {isOpen && (suggestions.length > 0 || error) && (
          <div
            ref={dropdownRef}
            className="absolute z-50 w-full mt-1 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-md shadow-lg max-h-60 overflow-auto"
          >
            {error ? (
              <div className="p-3 text-sm text-red-600 dark:text-red-400">
                {error}
              </div>
            ) : (
              suggestions.map((suggestion, index) => {
                const formattedName = formatLocationName(suggestion);
                const coordinates = getCoordinates(suggestion);
                
                return (
                  <button
                    key={suggestion.place_id}
                    type="button"
                    onClick={() => handleSuggestionSelect(suggestion)}
                    className={cn(
                      'w-full text-left p-3 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors border-b border-gray-100 dark:border-gray-600 last:border-b-0',
                      selectedIndex === index && 'bg-purple-50 dark:bg-purple-900/20'
                    )}
                  >
                    <div className="flex items-start gap-2">
                      <MapPin className="w-4 h-4 text-purple-500 mt-0.5 flex-shrink-0" />
                      <div className="flex-1 min-w-0">
                        <div className="font-medium text-sm truncate">
                          {formattedName}
                        </div>
                        <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                          {coordinates.latitude.toFixed(4)}, {coordinates.longitude.toFixed(4)}
                        </div>
                      </div>
                    </div>
                  </button>
                );
              })
            )}
          </div>
        )}
      </div>
      
      <p className="text-sm text-muted-foreground">
        Digite a cidade, estado e país onde você nasceu
      </p>
    </div>
  );
}