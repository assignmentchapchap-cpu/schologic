
import { AlertCircle, CheckCircle, Info } from 'lucide-react';

interface AlertProps {
    type?: 'success' | 'error' | 'info';
    message: string;
}

export default function Alert({ type = 'error', message }: AlertProps) {
    const styles = {
        success: 'bg-emerald-50 border-emerald-200 text-emerald-800',
        error: 'bg-red-50 border-red-200 text-red-800',
        info: 'bg-indigo-50 border-indigo-200 text-indigo-800'
    };

    const icons = {
        success: <CheckCircle className="w-5 h-5 text-emerald-500 shrink-0" />,
        error: <AlertCircle className="w-5 h-5 text-red-500 shrink-0" />,
        info: <Info className="w-5 h-5 text-indigo-500 shrink-0" />
    };

    return (
        <div className={`p-4 rounded-xl border flex items-start gap-3 text-sm ${styles[type]}`}>
            {icons[type]}
            <span className="font-medium pt-0.5">{message}</span>
        </div>
    );
}
