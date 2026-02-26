import { PilotGlobalHeader } from "@/components/pilot/PilotGlobalHeader";
import { PilotTabsNav } from "@/components/pilot/PilotTabsNav";
import { PilotDiscussionFAB } from "@/components/pilot/PilotDiscussionFAB";
import { PilotFormProvider, PilotBlueprint } from "@/components/pilot/PilotFormContext";
import { getCurrentPilotRequest } from "@/app/actions/pilotPortal";
import { redirect } from "next/navigation";

export default async function PilotPortalLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const res = await getCurrentPilotRequest();

    if (res.error || !res.data) {
        // If unauthorized or no pilot, they shouldn't be here.
        redirect('/login');
    }

    const { pilot } = res.data;
    const p = pilot as any;

    // Map database columns to the PilotBlueprint schema
    const defaultValues: Partial<PilotBlueprint> = {
        id: p.id as string,
        champion_id: (p.champion_id as string) || undefined,
        scope_jsonb: p.scope_jsonb || {
            core_modules: p.modules_jsonb?.core || [],
            add_ons: p.modules_jsonb?.add_ons || [],
            target_departments: [],
            pilot_period_weeks: 4,
            max_students: 200,
            max_instructors: 5
        },
        kpis_jsonb: p.kpis_jsonb || undefined,
        branding_jsonb: p.branding_jsonb || undefined,
        permissions_jsonb: p.permissions_jsonb || undefined,
        dashboard_layout_jsonb: p.dashboard_layout_jsonb || undefined,
        completed_tabs_jsonb: p.completed_tabs_jsonb || [],
    };

    return (
        <PilotFormProvider defaultValues={defaultValues}>
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
