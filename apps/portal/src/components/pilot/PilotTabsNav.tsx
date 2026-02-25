"use client";

import { usePathname, useRouter } from "next/navigation";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";

const TABS = [
    { value: "team", label: "01. Team & Tasks", href: "/pilot/team" },
    { value: "scope", label: "02. Scope", href: "/pilot/scope" },
    { value: "kpis", label: "03. KPIs", href: "/pilot/kpis" },
    { value: "branding", label: "04. Branding", href: "/pilot/branding" },
    { value: "settings", label: "05. Settings", href: "/pilot/settings" },
    { value: "dashboard", label: "06. Dashboard", href: "/pilot/dashboard" },
    { value: "preview", label: "07. Submit", href: "/pilot/preview" },
];

export function PilotTabsNav() {
    const pathname = usePathname();
    const router = useRouter();

    // Determine active tab from pathname, default to team
    const activeTab = TABS.find((tab) => pathname.startsWith(tab.href))?.value || "team";

    const handleTabChange = (value: string) => {
        const tab = TABS.find((t) => t.value === value);
        if (tab) {
            router.push(tab.href);
        }
    };

    return (
        <div className="border-b border-slate-200 bg-white px-6 pt-4">
            <Tabs value={activeTab} onValueChange={handleTabChange} className="w-full">
                <TabsList className="h-10 bg-transparent p-0 justify-start space-x-6">
                    {TABS.map((tab) => (
                        <TabsTrigger
                            key={tab.value}
                            value={tab.value}
                            className="h-10 rounded-none border-b-2 border-transparent px-2 pb-3 pt-2 font-semibold text-slate-500 hover:text-slate-900 focus-visible:ring-0 focus-visible:ring-offset-0 data-[state=active]:border-indigo-600 data-[state=active]:text-indigo-600 data-[state=active]:shadow-none"
                        >
                            {tab.label}
                        </TabsTrigger>
                    ))}
                </TabsList>
            </Tabs>
        </div>
    );
}
