"use client";

import { MessageSquare } from "lucide-react";
import { Button } from "@/components/ui/Button";

export function PilotDiscussionFAB() {
    return (
        <div className="fixed bottom-8 right-8 z-50 animate-in slide-in-from-bottom flex flex-col items-end gap-2">
            <Button
                size="lg"
                className="h-14 w-14 rounded-2xl shadow-xl shadow-indigo-500/20 bg-indigo-600 hover:bg-indigo-700 text-white flex items-center justify-center hover:scale-105 transition-transform"
                onClick={() => {
                    // Trigger the dialog context here in Phase 4
                    console.log("Discussion FAB Clicked");
                }}
            >
                <MessageSquare className="h-6 w-6" />
                <span className="sr-only">Open Discussion Board</span>
            </Button>
        </div>
    );
}
