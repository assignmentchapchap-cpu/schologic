import Link from "next/link";
import { Bell, MessageSquare } from "lucide-react";
import { Button } from "@/components/ui/Button";

export function PilotGlobalHeader() {
    return (
        <header className="sticky top-0 z-40 bg-white border-b border-slate-200">
            <div className="flex items-center justify-between px-6 h-16">
                <div className="flex items-center gap-6">
                    <img src="/logo_updated.png" alt="Schologic" className="h-6 w-auto" />
                    <div className="h-6 w-px bg-slate-200" />
                    <span className="text-sm font-serif font-bold text-slate-900">Pilot Management Portal</span>
                </div>

                <div className="flex items-center gap-2">
                    <Button variant="ghost" size="sm" className="hidden md:flex text-slate-600 hover:text-slate-900">
                        <MessageSquare className="h-4 w-4 mr-2" />
                        Discussion Board
                    </Button>
                    <Button variant="ghost" size="sm" className="text-slate-600 hover:text-slate-900 relative">
                        <Bell className="h-5 w-5" />
                        <span className="absolute top-2 right-2.5 h-2 w-2 rounded-full bg-rose-500 animate-pulse" />
                    </Button>
                    <div className="h-8 w-8 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center ml-2">
                        <span className="text-xs font-bold text-slate-600">CH</span>
                    </div>
                </div>
            </div>
        </header>
    );
}
