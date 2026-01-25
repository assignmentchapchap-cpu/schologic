'use client';

import { LucideIcon, ChevronRight } from 'lucide-react';

export interface Column<T> {
    header: string;
    accessorKey?: keyof T;
    cell?: (item: T) => React.ReactNode;
    className?: string;
}

interface AdminTableProps<T> {
    columns: Column<T>[];
    data: T[];
    onRowClick?: (item: T) => void;
    isLoading?: boolean;
    emptyMessage?: string;
    actions?: (item: T) => React.ReactNode;
}

export default function AdminTable<T extends { id: string | number }>({
    columns,
    data,
    onRowClick,
    isLoading = false,
    emptyMessage = "No data found",
    actions
}: AdminTableProps<T>) {

    if (isLoading) {
        return (
            <div className="w-full bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-sm">
                <div className="animate-pulse">
                    <div className="h-12 bg-slate-50 border-b border-slate-100 mb-4"></div>
                    {[...Array(5)].map((_, i) => (
                        <div key={i} className="h-16 mx-4 bg-slate-50 rounded-xl mb-3"></div>
                    ))}
                </div>
            </div>
        );
    }

    if (data.length === 0) {
        return (
            <div className="text-center py-12 bg-white rounded-3xl border border-slate-200 border-dashed">
                <p className="text-slate-400 font-bold">{emptyMessage}</p>
            </div>
        );
    }

    return (
        <div className="w-full bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-sm">
            <table className="w-full text-left border-collapse">
                <thead>
                    <tr className="bg-slate-50 border-b border-slate-100">
                        {columns.map((col, idx) => (
                            <th
                                key={idx}
                                className={`py-4 px-6 text-xs font-bold text-slate-400 uppercase tracking-wider first:pl-8 ${col.className || ''}`}
                            >
                                {col.header}
                            </th>
                        ))}
                        {(onRowClick || actions) && <th className="py-4 px-6"></th>}
                    </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                    {data.map((row) => (
                        <tr
                            key={row.id}
                            onClick={() => onRowClick && onRowClick(row)}
                            className={`group transition-colors ${onRowClick ? 'hover:bg-slate-50 cursor-pointer' : ''}`}
                        >
                            {columns.map((col, idx) => (
                                <td key={idx} className={`py-4 px-6 text-sm font-medium text-slate-700 first:pl-8 ${col.className || ''}`}>
                                    {col.cell ? col.cell(row) : (row[col.accessorKey as keyof T] as React.ReactNode)}
                                </td>
                            ))}
                            <td className="py-4 px-6 text-right w-10">
                                <div className="flex items-center justify-end gap-2">
                                    {actions && actions(row)}
                                    {onRowClick && (
                                        <ChevronRight className="w-5 h-5 text-slate-300 group-hover:text-indigo-400 transition-colors" />
                                    )}
                                </div>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}
