import React, { useState, useRef } from 'react';
import { FaEye, FaEyeSlash } from 'react-icons/fa';

/**
 * MpinInput - A stylized MPIN input component with "proper dots"
 * @param {string} value - Current MPIN value
 * @param {function} onChange - Callback when value changes
 * @param {number} length - Expected length (4 or 6)
 * @param {boolean} disabled - Disable input
 * @param {boolean} autoFocus - Automatically focus on mount
 */
const MpinInput = ({ value, onChange, length = 4, disabled = false, autoFocus = true }) => {
    const [showMpin, setShowMpin] = useState(false);
    const inputRef = useRef(null);
    const slots = Array.from({ length });

    const handleClick = () => {
        if (inputRef.current) {
            inputRef.current.focus();
        }
    };

    return (
        <div
            className="flex flex-col items-center cursor-pointer w-full select-none"
            onClick={handleClick}
        >
            {/* Hidden Input for handling keyboard events */}
            <input
                ref={inputRef}
                type="tel"
                pattern="[0-9]*"
                inputMode="numeric"
                maxLength={length}
                value={value}
                onChange={(e) => {
                    const val = e.target.value.replace(/\D/g, '');
                    if (val.length <= length) {
                        onChange(val);
                    }
                }}
                disabled={disabled}
                autoFocus={autoFocus}
                className="absolute opacity-0 h-0 w-0 overflow-hidden"
                style={{ caretColor: 'transparent' }}
            />

            <div className="flex items-center gap-4 w-full justify-center">
                {/* Visible Stylized Slots */}
                <div className="flex gap-3 sm:gap-4 items-center justify-center flex-1">
                    {slots.map((_, index) => {
                        const isFilled = index < value.length;
                        const isCurrent = index === value.length && !disabled;
                        const digit = isFilled ? value[index] : '';

                        return (
                            <div
                                key={index}
                                className={`
                                    w-12 h-14 sm:w-14 sm:h-16 rounded-xl flex items-center justify-center text-2xl font-bold transition-all duration-300 transform
                                    ${isFilled
                                        ? 'bg-white border-2 border-[#1e2a4a] text-[#1e2a4a] shadow-md scale-100'
                                        : 'bg-gray-50 border-2 border-gray-200 text-transparent scale-95'}
                                    ${isCurrent
                                        ? 'border-[#1e2a4a] bg-white ring-4 ring-[#1e2a4a]/10 scale-100'
                                        : ''}
                                    ${disabled ? 'opacity-50 grayscale' : 'hover:border-gray-300'}
                                `}
                            >
                                {isFilled ? (
                                    showMpin ? (
                                        <span className="animate-fade-in">{digit}</span>
                                    ) : (
                                        <div className="w-3 h-3 rounded-full bg-[#1e2a4a] animate-scale-in" />
                                    )
                                ) : (
                                    isCurrent && <div className="w-[2px] h-6 bg-[#1e2a4a] animate-pulse" />
                                )}
                            </div>
                        );
                    })}
                </div>

                {/* Show/Hide Toggle - Floating Button Style */}
                <button
                    type="button"
                    onClick={(e) => {
                        e.stopPropagation();
                        setShowMpin(!showMpin);
                    }}
                    className={`
                        p-3 rounded-full transition-all duration-300 focus:outline-none
                        ${showMpin
                            ? 'bg-[#1e2a4a] text-white shadow-lg shadow-[#1e2a4a]/20'
                            : 'bg-white text-gray-400 hover:text-[#1e2a4a] hover:bg-gray-50 border border-gray-100'}
                    `}
                    title={showMpin ? "Hide MPIN" : "Show MPIN"}
                >
                    {showMpin ? <FaEyeSlash size={18} /> : <FaEye size={18} />}
                </button>
            </div>

            {/* Hint Text */}
            <p className="mt-4 text-[10px] font-bold text-gray-400 uppercase tracking-widest opacity-60">
                {value.length === length ? 'MPIN Complete' : `Enter ${length} digits`}
            </p>
        </div>
    );
};

export default MpinInput;
