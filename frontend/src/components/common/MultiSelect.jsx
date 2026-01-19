import React, { useState, useRef, useEffect } from 'react';
import { FaChevronDown, FaCheck, FaTimes } from 'react-icons/fa';

const MultiSelect = ({ options, selected = [], onChange, placeholder = "Select...", label }) => {
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef(null);

    // Close on click outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const toggleOption = (option) => {
        let newSelected;
        if (selected.includes(option)) {
            newSelected = selected.filter(item => item !== option);
        } else {
            newSelected = [...selected, option];
        }
        onChange(newSelected);
    };

    const clearSelection = (e) => {
        e.stopPropagation();
        onChange([]);
    };

    return (
        <div className="relative" ref={dropdownRef}>
            {label && <label className="block text-xs font-bold text-slate-600 mb-1.5">{label}</label>}
            <div
                className="w-full bg-slate-50 border border-slate-200 rounded-lg py-2.5 px-3 text-sm text-slate-700 cursor-pointer flex justify-between items-center hover:border-blue-400 focus:border-blue-500 transition shadow-sm"
                onClick={() => setIsOpen(!isOpen)}
            >
                <div className="flex-1 truncate">
                    {selected.length === 0 ? (
                        <span className="text-slate-400">{placeholder}</span>
                    ) : (
                        <div className="flex flex-wrap gap-1">
                            {selected.length <= 2 ? (
                                selected.map(item => (
                                    <span key={item} className="bg-blue-100 text-blue-700 px-1.5 py-0.5 rounded text-[10px] font-bold">
                                        {item}
                                    </span>
                                ))
                            ) : (
                                <span className="bg-blue-100 text-blue-700 px-2 py-0.5 rounded text-xs font-bold">
                                    {selected.length} selected
                                </span>
                            )}
                        </div>
                    )}
                </div>
                <div className="flex items-center gap-2 ml-2">
                    {selected.length > 0 && (
                        <button
                            onClick={clearSelection}
                            className="text-slate-400 hover:text-slate-600 p-0.5 rounded-full hover:bg-slate-200 transaction"
                        >
                            <FaTimes size={10} />
                        </button>
                    )}
                    <FaChevronDown size={10} className={`text-slate-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
                </div>
            </div>

            {isOpen && (
                <div className="absolute z-30 w-full mt-1 bg-white border border-slate-200 rounded-lg shadow-xl max-h-60 overflow-y-auto custom-scrollbar animate-in fade-in zoom-in-95 duration-100">
                    {options.length === 0 ? (
                        <div className="p-3 text-xs text-slate-400 text-center">No options available</div>
                    ) : (
                        <div className="p-1">
                            {options.map(option => (
                                <div
                                    key={option}
                                    className={`flex items-center gap-2 px-3 py-2 cursor-pointer rounded-md text-xs font-medium transition ${selected.includes(option) ? 'bg-blue-50 text-blue-700' : 'text-slate-600 hover:bg-slate-50'}`}
                                    onClick={() => toggleOption(option)}
                                >
                                    <div className={`w-4 h-4 rounded border flex items-center justify-center transition-colors ${selected.includes(option) ? 'bg-blue-600 border-blue-600' : 'border-slate-300 bg-white'}`}>
                                        {selected.includes(option) && <FaCheck size={10} className="text-white" />}
                                    </div>
                                    <span className="flex-1 truncate">{option}</span>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default MultiSelect;
