import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown } from 'lucide-react';

interface Option {
    value: string;
    label: string;
}

interface ScrollableSelectProps {
    id?: string;
    value: string;
    onChange: (value: string) => void;
    options: Option[];
    placeholder?: string;
    disabled?: boolean;
    icon?: React.ReactNode;
    className?: string;
    maxHeight?: number;
}

const ScrollableSelect: React.FC<ScrollableSelectProps> = ({
    id,
    value,
    onChange,
    options,
    placeholder = 'Select an option',
    disabled = false,
    icon,
    className = '',
    maxHeight = 200,
}) => {
    const [isOpen, setIsOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const containerRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLInputElement>(null);

    const selectedOption = options.find((opt) => opt.value === value);

    // Filter options based on search term
    const filteredOptions = options.filter((option) =>
        option.label.toLowerCase().includes(searchTerm.toLowerCase())
    );

    // Close dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
                setIsOpen(false);
                setSearchTerm('');
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    // Focus input when dropdown opens
    useEffect(() => {
        if (isOpen && inputRef.current) {
            inputRef.current.focus();
        }
    }, [isOpen]);

    const handleSelect = (optionValue: string) => {
        onChange(optionValue);
        setIsOpen(false);
        setSearchTerm('');
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Escape') {
            setIsOpen(false);
            setSearchTerm('');
        } else if (e.key === 'Enter' && filteredOptions.length > 0) {
            handleSelect(filteredOptions[0].value);
        }
    };

    return (
        <div ref={containerRef} className={`relative ${className}`}>
            {/* Main Button */}
            <button
                id={id}
                type="button"
                onClick={() => !disabled && setIsOpen(!isOpen)}
                disabled={disabled}
                className={`w-full flex items-center justify-between px-4 py-2 border rounded-lg text-left transition-colors
                    ${icon ? 'pl-10' : 'pl-4'}
                    ${disabled
                        ? 'bg-gray-100 text-gray-400 cursor-not-allowed border-gray-200'
                        : 'bg-white border-gray-300 hover:border-gray-400 focus:ring-2 focus:ring-green-500 focus:border-transparent cursor-pointer'
                    }
                `}
            >
                {icon && (
                    <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">
                        {icon}
                    </span>
                )}
                <span className={selectedOption ? 'text-gray-900' : 'text-gray-500'}>
                    {selectedOption ? selectedOption.label : placeholder}
                </span>
                <ChevronDown
                    className={`h-5 w-5 text-gray-400 transition-transform ${isOpen ? 'rotate-180' : ''}`}
                />
            </button>

            {/* Dropdown */}
            {isOpen && (
                <div className="absolute z-50 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg overflow-hidden">
                    {/* Search Input */}
                    <div className="p-2 border-b border-gray-200">
                        <input
                            ref={inputRef}
                            type="text"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            onKeyDown={handleKeyDown}
                            placeholder="Search..."
                            className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none"
                        />
                    </div>

                    {/* Options List */}
                    <ul
                        className="overflow-y-auto"
                        style={{ maxHeight: `${maxHeight}px` }}
                    >
                        {filteredOptions.length > 0 ? (
                            filteredOptions.map((option) => (
                                <li key={option.value}>
                                    <button
                                        type="button"
                                        onClick={() => handleSelect(option.value)}
                                        className={`w-full px-4 py-2 text-left text-sm hover:bg-green-50 transition-colors
                                            ${option.value === value
                                                ? 'bg-green-100 text-green-700 font-medium'
                                                : 'text-gray-700'
                                            }
                                        `}
                                    >
                                        {option.label}
                                    </button>
                                </li>
                            ))
                        ) : (
                            <li className="px-4 py-3 text-sm text-gray-500 text-center">
                                No options found
                            </li>
                        )}
                    </ul>
                </div>
            )}
        </div>
    );
};

export default ScrollableSelect;
