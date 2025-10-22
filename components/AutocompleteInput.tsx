'use client';

import { useState, useRef, useEffect } from 'react';
import { ChevronDown } from 'lucide-react';

interface AutocompleteInputProps {
  value: string;
  onChange: (value: string) => void;
  options: string[];
  placeholder?: string;
  className?: string;
  error?: string;
  label: string;
  required?: boolean;
}

export default function AutocompleteInput({
  value,
  onChange,
  options,
  placeholder,
  className = '',
  error,
  label,
  required = false,
}: AutocompleteInputProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [filteredOptions, setFilteredOptions] = useState<string[]>([]);
  const [highlightedIndex, setHighlightedIndex] = useState(-1);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleInputChange = (inputValue: string) => {
    onChange(inputValue);
    
    if (inputValue.length > 0) {
      const searchTerm = inputValue.toLowerCase();
      const filtered = options
        .filter((option) => option.toLowerCase().includes(searchTerm))
        .sort((a, b) => {
          const aLower = a.toLowerCase();
          const bLower = b.toLowerCase();
          
          // Corrispondenza esatta ha massima priorità
          if (aLower === searchTerm) return -1;
          if (bLower === searchTerm) return 1;
          
          // Inizia con il termine cercato ha seconda priorità
          const aStarts = aLower.startsWith(searchTerm);
          const bStarts = bLower.startsWith(searchTerm);
          if (aStarts && !bStarts) return -1;
          if (!aStarts && bStarts) return 1;
          
          // Ordine alfabetico per il resto
          return a.localeCompare(b, 'it');
        });
      
      setFilteredOptions(filtered);
      setIsOpen(true);
      setHighlightedIndex(-1);
    } else {
      setFilteredOptions([]);
      setIsOpen(false);
    }
  };

  const handleSelectOption = (option: string) => {
    onChange(option);
    setIsOpen(false);
    setFilteredOptions([]);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!isOpen || filteredOptions.length === 0) return;

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setHighlightedIndex((prev) =>
          prev < filteredOptions.length - 1 ? prev + 1 : prev
        );
        break;
      case 'ArrowUp':
        e.preventDefault();
        setHighlightedIndex((prev) => (prev > 0 ? prev - 1 : 0));
        break;
      case 'Enter':
        e.preventDefault();
        if (highlightedIndex >= 0 && highlightedIndex < filteredOptions.length) {
          handleSelectOption(filteredOptions[highlightedIndex]);
        }
        break;
      case 'Escape':
        setIsOpen(false);
        break;
    }
  };

  return (
    <div ref={wrapperRef} className="position-relative">
      <label className="form-label fw-semibold">
        {label} {required && '*'}
      </label>
      <div className="position-relative">
        <input
          ref={inputRef}
          type="text"
          value={value}
          onChange={(e) => handleInputChange(e.target.value)}
          onFocus={() => {
            if (value.length > 0) {
              const searchTerm = value.toLowerCase();
              const filtered = options
                .filter((option) => option.toLowerCase().includes(searchTerm))
                .sort((a, b) => {
                  const aLower = a.toLowerCase();
                  const bLower = b.toLowerCase();
                  
                  // Corrispondenza esatta ha massima priorità
                  if (aLower === searchTerm) return -1;
                  if (bLower === searchTerm) return 1;
                  
                  // Inizia con il termine cercato ha seconda priorità
                  const aStarts = aLower.startsWith(searchTerm);
                  const bStarts = bLower.startsWith(searchTerm);
                  if (aStarts && !bStarts) return -1;
                  if (!aStarts && bStarts) return 1;
                  
                  // Ordine alfabetico per il resto
                  return a.localeCompare(b, 'it');
                });
              
              setFilteredOptions(filtered);
              setIsOpen(true);
            }
          }}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          className={`form-control pe-5 ${className}`}
          autoComplete="off"
        />
        <ChevronDown
          size={20}
          className="position-absolute end-0 top-50 translate-middle-y me-3 text-muted"
          style={{
            transform: isOpen ? 'translateY(-50%) rotate(180deg)' : 'translateY(-50%)',
            transition: 'transform 0.2s'
          }}
        />
      </div>

      {isOpen && filteredOptions.length > 0 && (
        <div className="position-absolute w-100 mt-1 bg-white border rounded shadow-lg" style={{zIndex: 1050, maxHeight: '240px', overflowY: 'auto'}}>
          {filteredOptions.map((option, index) => (
            <button
              key={option}
              type="button"
              onClick={() => handleSelectOption(option)}
              onMouseEnter={() => setHighlightedIndex(index)}
              className={`w-100 text-start px-3 py-2 border-0 ${
                index === highlightedIndex ? 'bg-primary bg-opacity-10' : 'bg-white'
              }`}
              style={{
                transition: 'background-color 0.15s',
                cursor: 'pointer'
              }}
              onMouseOver={(e) => e.currentTarget.style.backgroundColor = 'rgba(0, 102, 204, 0.1)'}
              onMouseOut={(e) => {
                if (index !== highlightedIndex) {
                  e.currentTarget.style.backgroundColor = 'white';
                }
              }}
            >
              {option}
            </button>
          ))}
        </div>
      )}

      {error && <p className="text-danger small mt-1">{error}</p>}
    </div>
  );
}
