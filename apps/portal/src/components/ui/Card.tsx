import React from 'react';
import { twMerge } from 'tailwind-merge';

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
    noPadding?: boolean;
    hoverEffect?: boolean;
}

export const Card = React.forwardRef<HTMLDivElement, CardProps>(({
    className,
    children,
    noPadding = false,
    hoverEffect = false,
    ...props
}, ref) => {
    return (
        <div
            ref={ref}
            className={twMerge(
                'bg-white border border-slate-200 shadow-sm rounded-3xl', // The "Premium" token
                !noPadding && 'p-5 md:p-8', // Responsive padding
                hoverEffect && 'hover:shadow-md hover:border-indigo-300 transition-all duration-300 cursor-pointer',
                className
            )}
            {...props}
        >
            {children}
        </div>
    );
});

Card.displayName = 'Card';
