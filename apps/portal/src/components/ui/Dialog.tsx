'use client';

import * as React from 'react';
import { X } from 'lucide-react';
import { cn } from '@/lib/utils';

interface DialogProps {
    open?: boolean;
    onOpenChange?: (open: boolean) => void;
    children: React.ReactNode;
}

export function Dialog({ open, onOpenChange, children }: DialogProps) {
    const [isOpen, setIsOpen] = React.useState(open || false);

    React.useEffect(() => {
        if (open !== undefined) {
            setIsOpen(open);
        }
    }, [open]);

    const handleClose = () => {
        if (onOpenChange) {
            onOpenChange(false);
        } else {
            setIsOpen(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
            {/* Backdrop */}
            <div
                className="fixed inset-0 bg-black/50 backdrop-blur-sm transition-opacity animate-fade-in"
                onClick={handleClose}
            />
            {/* Dialog Container - we pass children here which usually is DialogContent */}
            {children}
        </div>
    );
}

interface DialogContentProps extends React.HTMLAttributes<HTMLDivElement> {
    children: React.ReactNode;
    hideCloseButton?: boolean;
}

export function DialogContent({ className, children, hideCloseButton, ...props }: DialogContentProps) {
    // Note: The close button logic is usually handled by the DialogContext in Radix, 
    // but here we are simplifying. If checking for close, parent needs to pass onOpenChange ideally.
    // For now we assume the Close button inside the modal content (implemented in StudentProfileModal) is enough,
    // or we assume the backdrop click handles "cancel". 
    // However, StudentProfileModal *already* implements its own X button.

    return (
        <div
            className={cn(
                "relative z-50 w-full bg-white shadow-lg animate-in fade-in-0 zoom-in-95 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-95 duration-200 sm:rounded-lg md:w-full",
                className
            )}
            {...props}
        >
            {children}
        </div>
    );
}
