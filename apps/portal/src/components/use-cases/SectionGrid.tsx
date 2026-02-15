'use client';

import { cn } from "@/lib/utils";

interface SectionGridProps {
    children: React.ReactNode;
    className?: string;
    id?: string;
}

export function SectionGrid({ children, className, id }: SectionGridProps) {
    return (
        <section id={id} className={cn("container mx-auto px-6", className)}>
            <div className="grid grid-cols-1 md:grid-cols-12 gap-12">
                {children}
            </div>
        </section>
    );
}

export function GridColumn({
    children,
    span = 12,
    className
}: {
    children: React.ReactNode;
    span?: 4 | 5 | 6 | 7 | 8 | 12; // Constrain standard widths
    className?: string
}) {
    const colSpans = {
        4: "md:col-span-4",
        5: "md:col-span-5",
        6: "md:col-span-6",
        7: "md:col-span-7",
        8: "md:col-span-8",
        12: "md:col-span-12",
    };

    return (
        <div className={cn(colSpans[span], className)}>
            {children}
        </div>
    );
}
