"use client";

import { MessageSquare } from "lucide-react";
import { usePilotMessages } from "@/context/PilotMessageContext";

export function PilotDiscussionFAB() {
    const { togglePanel, isPanelOpen, unreadDmCount, unreadDiscussionCount } = usePilotMessages();
    const totalUnread = unreadDmCount + unreadDiscussionCount;

    // Hide FAB when panel is open to avoid visual clutter
    if (isPanelOpen) return null;

    return (
        <div className="fixed bottom-8 right-8 z-[200] animate-in slide-in-from-bottom-4 duration-300 flex flex-col items-end gap-2">
            <button
                onClick={togglePanel}
                className="group flex items-center gap-2.5 h-12 pl-4 pr-3.5 rounded-full bg-indigo-600 hover:bg-indigo-700 text-white shadow-xl shadow-indigo-500/25 hover:shadow-indigo-500/40 hover:scale-[1.03] active:scale-[0.98] transition-all duration-200 relative"
            >
                <span className="text-xs font-bold tracking-wide">Messages</span>
                <MessageSquare className="h-4.5 w-4.5" />
                {totalUnread > 0 && (
                    <span className="absolute -top-1.5 -right-1 h-5 min-w-[20px] px-1 rounded-full bg-red-500 text-[10px] font-black text-white flex items-center justify-center border-2 border-white shadow-sm shadow-red-500/30 animate-pulse">
                        {totalUnread > 9 ? '9+' : totalUnread}
                    </span>
                )}
            </button>
        </div>
    );
}
