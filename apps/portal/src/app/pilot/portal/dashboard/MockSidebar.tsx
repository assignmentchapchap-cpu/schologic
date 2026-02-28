import { Layout, Users, GraduationCap, Award, FileText, BookOpen, Zap, Settings, Command, HardDrive, Shield } from 'lucide-react';
import { usePilotForm } from "@/components/pilot/PilotFormContext";

export function MockSidebar() {
    const { watch } = usePilotForm();
    const scope = watch("scope_jsonb") || { core_modules: [], add_ons: [] };

    // Safety check arrays just in case
    const coreModules = Array.isArray(scope.core_modules) ? scope.core_modules : [];
    const addOns = Array.isArray(scope.add_ons) ? scope.add_ons : [];

    const navItems = [
        { label: 'Dashboard', icon: Layout, color: 'text-indigo-400', visible: true, active: true },
        { label: 'Users', icon: Users, color: 'text-amber-400', visible: true, active: false },
        { label: 'Classes', icon: GraduationCap, color: 'text-emerald-400', visible: coreModules.includes("Class Manager"), active: false },
        { label: 'Grades', icon: Award, color: 'text-yellow-400', visible: true, active: false },
        { label: 'Practicums', icon: FileText, color: 'text-blue-400', visible: coreModules.includes("Practicum Manager"), active: false },
        { label: 'Library', icon: BookOpen, color: 'text-fuchsia-400', visible: addOns.includes("OER Library"), active: false },
        { label: 'AI Usage', icon: Zap, color: 'text-violet-400', visible: addOns.includes("AI Assistant") || addOns.includes("AI Forensics"), active: false },
        { label: 'System Usage', icon: HardDrive, color: 'text-blue-400', visible: true, active: false },
        { label: 'Permissions', icon: Shield, color: 'text-rose-400', visible: true, active: false },
        { label: 'Universal Settings', icon: Settings, color: 'text-slate-400', visible: true, active: false },
    ];

    const branding = watch("branding_jsonb") || {};
    const instName = (branding as any).institution_name || "Schologic";
    const logoUrl = (branding as any).logo_url;

    return (
        <aside className="w-64 bg-[#0B1120] border-r border-[#1E293B] text-slate-300 flex flex-col h-full min-h-full shrink-0 shadow-2xl z-20">
            <div className="h-14 flex items-center px-6 border-b border-[#1E293B] bg-[#0B1120]/50 backdrop-blur-md sticky top-0 shrink-0">
                <div className="flex items-center gap-3 text-white font-bold tracking-tight text-base">
                    {logoUrl ? (
                        <div className="w-7.5 h-7.5 rounded-lg bg-white/5 p-1 flex items-center justify-center shrink-0">
                            <img src={logoUrl} alt="Logo" className="w-full h-full object-contain" />
                        </div>
                    ) : (
                        <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-rose-500 to-rose-600 flex items-center justify-center shadow-lg shadow-rose-900/40 shrink-0">
                            <Command className="w-4 h-4 text-white" />
                        </div>
                    )}
                    <span className="bg-clip-text text-transparent bg-gradient-to-r from-white to-slate-400 whitespace-nowrap tracking-tight leading-none">{instName}</span>
                </div>
            </div>
            <div className="flex-1 py-4 px-3 space-y-2 overflow-hidden">
                <div className="px-3 mb-3">
                    <span className="text-[10px] font-bold text-slate-500 uppercase tracking-[0.15em]">Main Menu</span>
                </div>
                {navItems.filter(item => item.visible).map(item => {
                    const Icon = item.icon;
                    return (
                        <div key={item.label} className={`flex items-center gap-4 px-4 py-3 text-[15px] font-semibold rounded-xl transition-all duration-300 cursor-default group ${item.active ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-900/40 translate-x-1' : 'text-slate-400 hover:text-slate-100 hover:bg-[#1E293B] hover:translate-x-1'}`}>
                            <Icon className={`w-5 h-5 shrink-0 transition-colors ${item.active ? 'text-white' : `${item.color} group-hover:text-slate-100`}`} />
                            <span className="whitespace-nowrap tracking-tight">{item.label}</span>
                            {item.active && <div className="ml-auto w-1 h-4 bg-white/30 rounded-full" />}
                        </div>
                    );
                })}
            </div>
            <div className="p-4 border-t border-[#1E293B] shrink-0">
                <div className="bg-[#1E293B]/50 rounded-xl p-3 border border-white/5">
                    <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-indigo-500/20 flex items-center justify-center text-indigo-400 font-bold text-xs ring-1 ring-indigo-500/30 shrink-0">
                            JD
                        </div>
                        <div className="overflow-hidden">
                            <p className="text-[11px] font-bold text-white truncate line-clamp-1 leading-none">John Doe</p>
                            <p className="text-[9px] text-slate-500 truncate line-clamp-1 italic mt-1 uppercase tracking-wider font-bold">Champion</p>
                        </div>
                    </div>
                </div>
            </div>
        </aside>
    );
}
