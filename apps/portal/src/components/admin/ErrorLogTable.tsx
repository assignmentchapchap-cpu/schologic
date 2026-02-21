'use client';

import { useState, useEffect } from 'react';
import { getSystemErrors, SystemErrorLog } from '@/app/actions/getSystemErrors';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow
} from '@/components/ui/table';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import {
    ChevronLeft,
    ChevronRight,
    Search,
    AlertCircle,
    Clock,
    FileText,
    User,
    RefreshCw
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import Link from 'next/link';

export default function ErrorLogTable() {
    const [logs, setLogs] = useState<SystemErrorLog[]>([]);
    const [loading, setLoading] = useState(true);
    const [total, setTotal] = useState(0);
    const [page, setPage] = useState(1);
    const [search, setSearch] = useState('');
    const [debouncedSearch, setDebouncedSearch] = useState('');
    const LIMIT = 20;

    // Debounce search
    useEffect(() => {
        const timer = setTimeout(() => {
            setDebouncedSearch(search);
            setPage(1); // Reset to page 1 on search
        }, 500);
        return () => clearTimeout(timer);
    }, [search]);

    const fetchLogs = async () => {
        setLoading(true);
        try {
            const { data, total, error } = await getSystemErrors(page, LIMIT, debouncedSearch);
            if (error) {
                console.error("Failed to fetch logs:", error);
            } else {
                setLogs(data);
                setTotal(total);
            }
        } catch (err) {
            console.error("Error fetching logs:", err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchLogs();
    }, [page, debouncedSearch]);

    const totalPages = Math.ceil(total / LIMIT);

    return (
        <div className="space-y-4">
            {/* Toolbar */}
            <div className="flex flex-col sm:flex-row justify-between gap-4">
                <div className="relative w-full sm:w-72">
                    <Search className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                    <Input
                        placeholder="Search errors or paths..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="pl-9"
                    />
                </div>
                <Button
                    variant="outline"
                    size="sm"
                    onClick={fetchLogs}
                    disabled={loading}
                    className="gap-2"
                >
                    <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
                    Refresh
                </Button>
            </div>

            {/* Table */}
            <div className="rounded-md border bg-white shadow-sm overflow-hidden">
                <Table>
                    <TableHeader className="bg-slate-50">
                        <TableRow>
                            <TableHead className="w-[180px]">Time</TableHead>
                            <TableHead className="w-[200px]">Path</TableHead>
                            <TableHead>Error Message</TableHead>
                            <TableHead className="w-[150px]">User</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {loading && logs.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={4} className="h-24 text-center">
                                    <div className="flex items-center justify-center gap-2 text-slate-500">
                                        <RefreshCw className="h-4 w-4 animate-spin" /> Loading logs...
                                    </div>
                                </TableCell>
                            </TableRow>
                        ) : logs.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={4} className="h-24 text-center text-slate-500">
                                    No errors found.
                                </TableCell>
                            </TableRow>
                        ) : (
                            logs.map((log) => (
                                <TableRow key={log.id} className="group hover:bg-slate-50 transition-colors">
                                    <TableCell className="font-mono text-xs text-slate-500 whitespace-nowrap">
                                        <div className="flex items-center gap-2">
                                            <Clock className="w-3 h-3" />
                                            {formatDistanceToNow(new Date(log.created_at), { addSuffix: true })}
                                        </div>
                                        <div className="text-[10px] text-slate-400 mt-1">
                                            {new Date(log.created_at).toLocaleString()}
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <div className="flex items-center gap-2 text-xs font-medium text-slate-700 max-w-[200px] truncate" title={log.path}>
                                            <FileText className="w-3 h-3 text-slate-400" />
                                            {log.path}
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <div className="text-sm font-medium text-red-600 break-all max-w-[400px]">
                                            {log.error_message}
                                        </div>
                                        {log.stack_trace && (
                                            <details className="mt-1">
                                                <summary className="text-[10px] text-slate-400 cursor-pointer hover:text-indigo-600 select-none">Show Stack Trace</summary>
                                                <pre className="mt-2 text-[10px] bg-slate-100 p-2 rounded overflow-auto max-h-[150px] whitespace-pre-wrap font-mono text-slate-600">
                                                    {log.stack_trace}
                                                </pre>
                                            </details>
                                        )}
                                    </TableCell>
                                    <TableCell>
                                        <div className="flex items-center gap-2 text-xs text-slate-600">
                                            <User className="w-3 h-3 text-slate-400" />
                                            {log.users?.email ? (
                                                <span className="truncate max-w-[120px]" title={log.users.email}>
                                                    {log.users.email}
                                                </span>
                                            ) : log.user_id ? (
                                                <Link href={`/admin/users/${log.user_id}`} className="text-indigo-600 hover:underline truncate max-w-[120px]" title="View Profile">
                                                    View Profile
                                                </Link>
                                            ) : (
                                                <span className="text-slate-400 italic">Anonymous</span>
                                            )}
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
            </div>

            {/* Pagination */}
            <div className="flex items-center justify-between text-sm text-slate-500">
                <div>
                    Showing {logs.length > 0 ? (page - 1) * LIMIT + 1 : 0} to {Math.min(page * LIMIT, total)} of {total} errors
                </div>
                <div className="flex gap-2">
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setPage(p => Math.max(1, p - 1))}
                        disabled={page === 1 || loading}
                    >
                        <ChevronLeft className="h-4 w-4" />
                    </Button>
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                        disabled={page >= totalPages || loading}
                    >
                        <ChevronRight className="h-4 w-4" />
                    </Button>
                </div>
            </div>
        </div>
    );
}
