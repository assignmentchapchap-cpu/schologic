import React from 'react';
import { twMerge } from 'tailwind-merge';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
    label?: string;
    error?: string;
    leftIcon?: React.ReactNode;
    rightIcon?: React.ReactNode;
    fullWidth?: boolean;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(({
    className,
    label,
    error,
    leftIcon,
    rightIcon,
    fullWidth = true,
    id,
    ...props
}, ref) => {

    // Auto-generate ID if not provided but label exists (basic accessibility)
    const inputId = id || (label ? label.toLowerCase().replace(/\s+/g, '-') : undefined);

    return (
        <div className={`${fullWidth ? 'w-full' : 'inline-block'} mb-4`}>
            {label && (
                <label
                    htmlFor={inputId}
                    className="block text-sm font-bold text-slate-700 mb-1.5 ml-1"
                >
                    {label}
                </label>
            )}

            <div className="relative group">
                {leftIcon && (
                    <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-500 transition-colors">
                        {leftIcon}
                    </div>
                )}

                <input
                    ref={ref}
                    id={inputId}
                    className={twMerge(
                        'w-full bg-white border border-slate-200 text-slate-800 placeholder:text-slate-400',
                        'rounded-xl text-base transition-all outline-none',
                        'p-3.5', // 14px padding
                        'focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500',
                        'disabled:bg-slate-50 disabled:text-slate-500',
                        leftIcon && 'pl-10',
                        rightIcon && 'pr-10',
                        error && 'border-red-300 focus:border-red-500 focus:ring-red-200',
                        className
                    )}
                    {...props}
                />

                {rightIcon && (
                    <div className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400">
                        {rightIcon}
                    </div>
                )}
            </div>

            {error && (
                <p className="mt-1.5 ml-1 text-sm text-red-600 font-medium animate-in slide-in-from-left-1">
                    {error}
                </p>
            )}
        </div>
    );
});

Input.displayName = 'Input';
