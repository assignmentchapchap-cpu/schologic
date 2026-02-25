import { PilotGlobalHeader } from "@/components/pilot/PilotGlobalHeader";
import { PilotTabsNav } from "@/components/pilot/PilotTabsNav";
import { PilotDiscussionFAB } from "@/components/pilot/PilotDiscussionFAB";
import { PilotFormProvider } from "@/components/pilot/PilotFormContext";

export default function PilotPortalLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <PilotFormProvider>
            <div className="min-h-screen bg-slate-50 flex flex-col relative">
                {/* Global Header */}
                <PilotGlobalHeader />

                {/* Sticky Horizontal Tabs Navigation */}
                <div className="sticky top-16 z-30">
                    <PilotTabsNav />
                </div>

                {/* Main scrollable content area wrapper */}
                <main className="flex-1 w-full max-w-7xl mx-auto py-8 px-4 sm:px-6 relative">
                    {children}
                </main>

                {/* Persistent Discussion Interface */}
                <PilotDiscussionFAB />
            </div>
        </PilotFormProvider>
    );
}
