'use client';

import * as React from 'react';
import { ChevronDown } from 'lucide-react';
import { twMerge } from 'tailwind-merge';

interface AccordionProps {
    children: React.ReactNode;
    type?: 'single' | 'multiple';
    collapsible?: boolean;
    defaultValue?: string;
    className?: string;
}

const AccordionContext = React.createContext<{
    activeValue: string | null;
    setActiveValue: (value: string | null) => void;
    collapsible: boolean;
} | null>(null);

export function Accordion({ children, type = 'single', collapsible = true, defaultValue, className }: AccordionProps) {
    const [activeValue, setActiveValue] = React.useState<string | null>(defaultValue || null);

    return (
        <AccordionContext.Provider value={{ activeValue, setActiveValue, collapsible }}>
            <div className={twMerge('w-full', className)}>
                {children}
            </div>
        </AccordionContext.Provider>
    );
}

export function AccordionItem({ children, value, className }: { children: React.ReactNode; value: string; className?: string }) {
    return (
        <div data-state={value === React.useContext(AccordionContext)?.activeValue ? 'open' : 'closed'} className={className}>
            {React.Children.map(children, (child) => {
                if (React.isValidElement(child)) {
                    return React.cloneElement(child as React.ReactElement<any>, { value });
                }
                return child;
            })}
        </div>
    );
}

export function AccordionTrigger({ children, className, value }: { children: React.ReactNode; className?: string; value?: string }) {
    const context = React.useContext(AccordionContext);
    if (!context) return null;

    const isOpen = context.activeValue === value;

    const handleClick = () => {
        if (isOpen && context.collapsible) {
            context.setActiveValue(null);
        } else if (value) {
            context.setActiveValue(value);
        }
    };

    return (
        <button
            type="button"
            onClick={handleClick}
            className={twMerge(
                'flex w-full items-center justify-between py-4 font-medium transition-all hover:underline [&[data-state=open]>svg]:rotate-180',
                className
            )}
            data-state={isOpen ? 'open' : 'closed'}
        >
            {children}
            <ChevronDown className="h-4 w-4 shrink-0 transition-transform duration-200" />
        </button>
    );
}

export function AccordionContent({ children, className, value }: { children: React.ReactNode; className?: string; value?: string }) {
    const context = React.useContext(AccordionContext);
    if (!context) return null;

    const isOpen = context.activeValue === value;

    if (!isOpen) return null;

    return (
        <div
            className={twMerge(
                'overflow-hidden text-sm transition-all data-[state=closed]:animate-accordion-up data-[state=open]:animate-accordion-down',
                className
            )}
            data-state={isOpen ? 'open' : 'closed'}
        >
            <div className="pb-4 pt-0">{children}</div>
        </div>
    );
}
