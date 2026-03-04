"use client";

import { usePathname, useRouter } from "next/navigation";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useEffect, useState } from "react";

const TABS = [
    { value: "scope", label: "01. Scope", href: "/portal/scope" },
    { value: "team", label: "02. Team & Tasks", href: "/portal/team" },
    { value: "kpis", label: "03. KPIs", href: "/portal/kpis" },
    { value: "branding", label: "04. Branding", href: "/portal/branding" },
    { value: "settings", label: "05. Settings", href: "/portal/settings" },
    { value: "dashboard", label: "06. Dashboard", href: "/portal/dashboard" },
    { value: "preview", label: "07. Submit", href: "/portal/preview" },
];

interface PilotTabsNavProps {
    isChampion?: boolean;
    permissions?: Record<string, string>;
}

export function PilotTabsNav({ isChampion, permissions = {} }: PilotTabsNavProps) {
    const pathname = usePathname();
    const router = useRouter();

    const [mounted, setMounted] = useState(false);

    // Filter tabs based on permissions
    // Champions see all. Standard users don't see tabs labeled 'none', except 'team' which is always visible so everyone has a home tab.
    const visibleTabs = TABS.filter((tab) => {
        if (isChampion) return true;
        if (tab.value === 'team') return true;
        return permissions[tab.value] !== 'none';
    });

    // Determine active tab from pathname, default to scope or the first visible tab
    const activeTab = visibleTabs.find((tab) => pathname.startsWith(tab.href))?.value || visibleTabs[0]?.value || "team";

    useEffect(() => {
        setMounted(true);
    }, []);

    const handleTabChange = (value: string) => {
        const tab = visibleTabs.find((t) => t.value === value);
        if (tab) {
            router.push(tab.href);
        }
    };

    // Render a skeleton or just the container before mounting to prevent
    // radix-ui Tabs hydration mismatch from server vs client router state differences.
    if (!mounted) {
        return (
            <div className="border-b border-slate-200 bg-white px-6 pt-4 h-[57px]" />
        );
    }

    return (
        <div className="border-b border-slate-200 bg-white px-6 pt-4">
            <Tabs defaultValue={activeTab} value={activeTab} onValueChange={handleTabChange} className="w-full">
                <TabsList className="h-10 bg-transparent p-0 justify-start space-x-6">
                    {visibleTabs.map((tab) => (
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
