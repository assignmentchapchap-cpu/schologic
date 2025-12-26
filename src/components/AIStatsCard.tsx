import { ArrowUpRight, ArrowDownRight, Activity } from 'lucide-react';

interface AIStatsCardProps {
    averageScore: number; // 0-100
    studentCount: number;
    trend?: number; // Positive or negative percentage
    onClick: () => void;
}

export default function AIStatsCard({ averageScore, studentCount, trend = 2.4, onClick }: AIStatsCardProps) {
    // Determine status color
    const getColor = (score: number) => {
        if (score >= 80) return { text: 'text-emerald-600', bg: 'bg-emerald-50', border: 'border-emerald-100', ring: 'stroke-emerald-500' };
        if (score >= 60) return { text: 'text-amber-600', bg: 'bg-amber-50', border: 'border-amber-100', ring: 'stroke-amber-500' };
        return { text: 'text-red-600', bg: 'bg-red-50', border: 'border-red-100', ring: 'stroke-red-500' };
    };

    const styles = getColor(averageScore);
    const radius = 28;
    const circumference = 2 * Math.PI * radius;
    const offset = circumference - (averageScore / 100) * circumference;

    return (
        <div
            onClick={onClick}
            className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm hover:shadow-md hover:border-indigo-200 transition-all cursor-pointer group relative overflow-hidden"
        >
            <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
                <Activity className="w-24 h-24 text-indigo-600" />
            </div>

            <div className="flex justify-between items-start mb-4 relative z-10">
                <div>
                    <h3 className="text-slate-500 font-bold text-xs uppercase tracking-wider mb-1">Class Integrity</h3>
                    <div className="flex items-baseline gap-2">
                        <span className="text-3xl font-black text-slate-800">{averageScore}%</span>
                        <span className="text-sm font-bold text-slate-400">Authentic</span>
                    </div>
                </div>
                {/* Mini Radial Chart */}
                <div className="relative w-16 h-16">
                    <svg className="w-full h-full transform -rotate-90">
                        <circle
                            cx="32"
                            cy="32"
                            r={radius}
                            fill="none"
                            className="stroke-slate-100"
                            strokeWidth="6"
                        />
                        <circle
                            cx="32"
                            cy="32"
                            r={radius}
                            fill="none"
                            className={`${styles.ring} transition-all duration-1000 ease-out`}
                            strokeWidth="6"
                            strokeDasharray={circumference}
                            strokeDashoffset={offset}
                            strokeLinecap="round"
                        />
                    </svg>
                    <div className={`absolute inset-0 flex items-center justify-center ${styles.text}`}>
                        <Activity className="w-5 h-5" />
                    </div>
                </div>
            </div>

            <div className="flex items-center gap-3 relative z-10">
                <div className={`flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-bold ${trend >= 0 ? 'bg-emerald-50 text-emerald-600' : 'bg-red-50 text-red-600'}`}>
                    {trend >= 0 ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
                    {Math.abs(trend)}% vs last week
                </div>
                <span className="text-xs font-medium text-slate-400">{studentCount} active students</span>
            </div>
        </div>
    );
}
