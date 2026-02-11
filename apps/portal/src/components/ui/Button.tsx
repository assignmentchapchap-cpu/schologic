import React from 'react';
import { Loader2 } from 'lucide-react';
import { twMerge } from 'tailwind-merge';

// Button Variants
type ButtonVariant = 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger' | 'success';
type ButtonSize = 'sm' | 'md' | 'lg';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: ButtonVariant;
    size?: ButtonSize;
    isLoading?: boolean;
    fullWidth?: boolean;
    leftIcon?: React.ReactNode;
    rightIcon?: React.ReactNode;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(({
    className,
    variant = 'primary',
    size = 'md',
    isLoading = false,
    fullWidth = false,
    leftIcon,
    rightIcon,
    children,
    disabled,
    ...props
}, ref) => {

    const baseStyles = 'inline-flex items-center justify-center font-bold transition-all focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed';

    const variants = {
        primary: 'bg-indigo-600 text-white hover:bg-indigo-700 focus:ring-indigo-500 shadow-sm hover:shadow active:scale-[0.98]',
        secondary: 'bg-slate-100 text-slate-700 hover:bg-slate-200 focus:ring-slate-400 active:scale-[0.98]',
        outline: 'border-2 border-slate-200 bg-transparent text-slate-700 hover:border-indigo-600 hover:text-indigo-600 focus:ring-indigo-500 active:scale-[0.98]',
        ghost: 'bg-transparent text-slate-600 hover:bg-slate-50 hover:text-indigo-600 focus:ring-indigo-500',
        danger: 'bg-red-50 text-red-600 hover:bg-red-100 focus:ring-red-500 active:scale-[0.98]',
        success: 'bg-emerald-600 text-white hover:bg-emerald-700 focus:ring-emerald-500 shadow-sm hover:shadow active:scale-[0.98]',
    };

    const sizes = {
        sm: 'h-9 px-3 text-xs rounded-lg',
        md: 'h-12 px-5 text-sm rounded-xl', // Standard Desktop
        lg: 'h-[52px] px-6 text-base rounded-2xl', // Mobile / Auth
    };

    return (
        <button
            ref={ref}
            className={twMerge(
                baseStyles,
                variants[variant],
                sizes[size],
                fullWidth && 'w-full',
                className
            )}
            disabled={disabled || isLoading}
            {...props}
        >
            {isLoading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
            {!isLoading && leftIcon && <span className="mr-2">{leftIcon}</span>}
            {children}
            {!isLoading && rightIcon && <span className="ml-2">{rightIcon}</span>}
        </button>
    );
});

Button.displayName = 'Button';
