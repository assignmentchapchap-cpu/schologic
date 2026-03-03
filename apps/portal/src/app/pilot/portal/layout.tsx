import { PilotGlobalHeader } from "@/components/pilot/PilotGlobalHeader";
import { PilotTabsNav } from "@/components/pilot/PilotTabsNav";
import { PilotDiscussionFAB } from "@/components/pilot/PilotDiscussionFAB";
import { PilotFormProvider, PilotBlueprint } from "@/components/pilot/PilotFormContext";
import { PilotMessageProvider } from "@/context/PilotMessageContext";
import { PilotMessagingPanel } from "@/components/pilot/PilotMessagingPanel";
import { getCurrentPilotRequest } from "@/app/actions/pilotPortal";
import { recordMemberPresence } from "@/app/actions/pilotTeam";
import { redirect } from "next/navigation";
import { createSessionClient } from "@schologic/database";
import { cookies } from "next/headers";

export default async function PilotPortalLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const res = await getCurrentPilotRequest();

    // Automatically track presence and transition status
    await recordMemberPresence();

    if (res.error || !res.data) {
        // If unauthorized or no pilot, they shouldn't be here.
        redirect('/login');
    }

    const { pilot, identity } = res.data;
    const p = pilot as any;

    // Map database columns to the PilotBlueprint schema
    const rawScope = p.scope_jsonb || {};
    const defaultValues: Partial<PilotBlueprint> = {
        id: p.id as string,
        champion_id: (p.champion_id as string) || undefined,
        scope_jsonb: {
            core_modules: rawScope.core_modules || p.modules_jsonb?.core || [],
            add_ons: rawScope.add_ons || p.modules_jsonb?.add_ons || [],
            target_departments: rawScope.target_departments || [],
            pilot_period_weeks: rawScope.pilot_period_weeks || 4,
            max_students: rawScope.max_students || 200,
            max_instructors: rawScope.max_instructors || 5
        },
        kpis_jsonb: (p.kpis_jsonb && typeof p.kpis_jsonb === 'object' && !Array.isArray(p.kpis_jsonb))
            ? {
                kpis: Array.isArray(p.kpis_jsonb.kpis) ? p.kpis_jsonb.kpis : [],
                questions: (p.kpis_jsonb.questions && typeof p.kpis_jsonb.questions === 'object') ? p.kpis_jsonb.questions : {},
                delivery: (p.kpis_jsonb.delivery && typeof p.kpis_jsonb.delivery === 'object')
                    ? p.kpis_jsonb.delivery
                    : { method: "dashboard", frequency: "weekly" },
            }
            : undefined,
        branding_jsonb: (() => {
            const raw = (p.branding_jsonb && typeof p.branding_jsonb === 'object' && !Array.isArray(p.branding_jsonb))
                ? p.branding_jsonb : {};
            const textRaw = (raw.text_overrides && typeof raw.text_overrides === 'object') ? raw.text_overrides : {};
            return {
                subdomain: raw.subdomain || "",
                use_custom_domain: raw.use_custom_domain ?? false,
                custom_domain: raw.custom_domain || "",
                logo_url: raw.logo_url || "",
                logo_size: raw.logo_size ?? 80,
                logo_has_transparency: raw.logo_has_transparency ?? false,
                primary_color: raw.primary_color || "#4f46e5",
                secondary_color: raw.secondary_color || "#0f172a",
                template: raw.template || "centered",
                hero_image_url: raw.hero_image_url || "",
                text_overrides: {
                    heading: textRaw.heading || "Welcome to Schologic LMS",
                    subtext: textRaw.subtext || "Please sign in to continue",
                    id_label: textRaw.id_label || "Email Address",
                    password_label: textRaw.password_label || "Password",
                    button_text: textRaw.button_text || "Sign In",
                },
            };
        })(),
        permissions_jsonb: p.permissions_jsonb || undefined,
        dashboard_layout_jsonb: p.dashboard_layout_jsonb || undefined,
        tasks_jsonb: Array.isArray(p.tasks_jsonb) ? p.tasks_jsonb : [],
        changelog_jsonb: (p.changelog_jsonb && typeof p.changelog_jsonb === 'object' && !Array.isArray(p.changelog_jsonb)) ? p.changelog_jsonb : {},
        completed_tabs_jsonb: p.completed_tabs_jsonb || [],
    };

    // Fetch team members for the messaging recipient list
    const cookieStore = await cookies();
    const supabase = createSessionClient(cookieStore);
    const { data: teamMembersData } = await supabase
        .from('pilot_team_members')
        .select(`
            user_id,
            is_champion,
            status,
            profiles:user_id (
                first_name,
                last_name,
                email
            )
        `)
        .eq('pilot_request_id', p.id)
        .order('created_at', { ascending: true });

    const initialMembers = (teamMembersData || []).map((m: any) => ({
        user_id: m.user_id,
        is_champion: m.is_champion,
        status: m.status,
        profiles: m.profiles,
    }));

    return (
        <PilotFormProvider defaultValues={defaultValues}>
            <PilotMessageProvider
                identity={{ id: identity.id, full_name: identity.full_name, email: identity.email }}
                pilotRequestId={p.id}
                initialMembers={initialMembers}
            >
                <div className="min-h-screen bg-slate-50 flex flex-col relative">
                    {/* Global Header */}
                    <PilotGlobalHeader identity={identity} />

                    {/* Sticky Horizontal Tabs Navigation */}
                    <div className="sticky top-16 z-30">
                        <PilotTabsNav />
                    </div>

                    {/* Main scrollable content area wrapper */}
                    <main className="flex-1 w-full max-w-7xl mx-auto py-8 px-4 sm:px-6 relative">
                        {children}
                    </main>

                    {/* Messaging */}
                    <PilotDiscussionFAB />
                    <PilotMessagingPanel />
                </div>
            </PilotMessageProvider>
        </PilotFormProvider>
    );
}
