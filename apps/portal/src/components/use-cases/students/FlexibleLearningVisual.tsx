import { Home, School, Briefcase, Wifi, Smartphone } from 'lucide-react';

export const FlexibleLearningVisual = () => {
    return (
        <div className="relative w-full h-full min-h-[300px] flex items-center justify-center">
            {/* Background Rings */}
            <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-64 h-64 rounded-full border border-purple-200 animate-pulse" />
                <div className="absolute w-48 h-48 rounded-full border border-purple-300/50" />
            </div>

            {/* Central Node (Student) */}
            <div className="relative z-10 w-20 h-20 bg-purple-600 rounded-2xl flex items-center justify-center shadow-xl shadow-purple-200 transform hover:scale-110 transition-transform duration-300">
                <Smartphone className="w-10 h-10 text-white" />
                <div className="absolute -top-2 -right-2 w-6 h-6 bg-green-500 rounded-full border-2 border-white flex items-center justify-center">
                    <Wifi className="w-3 h-3 text-white" />
                </div>
            </div>

            {/* Satellite Nodes */}
            {/* Home Learning */}
            <div className="absolute top-10 left-10 md:left-20 animate-bounce duration-[3000ms]">
                <div className="w-16 h-16 bg-white rounded-xl border-2 border-purple-100 flex items-center justify-center shadow-lg">
                    <Home className="w-8 h-8 text-purple-400" />
                </div>
                <div className="absolute top-full left-1/2 -translate-x-1/2 mt-2 text-xs font-bold text-purple-800 bg-purple-50 px-2 py-1 rounded-md">
                    Home
                </div>
            </div>

            {/* Campus Learning */}
            <div className="absolute top-10 right-10 md:right-20 animate-bounce duration-[4000ms]">
                <div className="w-16 h-16 bg-white rounded-xl border-2 border-purple-100 flex items-center justify-center shadow-lg">
                    <School className="w-8 h-8 text-purple-400" />
                </div>
                <div className="absolute top-full left-1/2 -translate-x-1/2 mt-2 text-xs font-bold text-purple-800 bg-purple-50 px-2 py-1 rounded-md">
                    Campus
                </div>
            </div>

            {/* Workplace Learning */}
            <div className="absolute bottom-10 left-1/2 -translate-x-1/2 animate-bounce duration-[3500ms]">
                <div className="w-16 h-16 bg-white rounded-xl border-2 border-purple-100 flex items-center justify-center shadow-lg">
                    <Briefcase className="w-8 h-8 text-purple-400" />
                </div>
                <div className="absolute top-full left-1/2 -translate-x-1/2 mt-2 text-xs font-bold text-purple-800 bg-purple-50 px-2 py-1 rounded-md">
                    Work
                </div>
            </div>

            {/* Connecting Dashed Lines (SVG Overlay) */}
            <svg className="absolute inset-0 w-full h-full pointer-events-none" style={{ zIndex: 1 }}>
                {/* Lines connecting center to nodes - roughly estimated coords based on flex positioning */}
                <path d="M120 120 L180 180" stroke="#d8b4fe" strokeWidth="2" strokeDasharray="6 4" className="opacity-50" />
                <path d="M280 120 L220 180" stroke="#d8b4fe" strokeWidth="2" strokeDasharray="6 4" className="opacity-50" />
                <path d="M200 280 L200 220" stroke="#d8b4fe" strokeWidth="2" strokeDasharray="6 4" className="opacity-50" />
            </svg>
        </div>
    );
};
