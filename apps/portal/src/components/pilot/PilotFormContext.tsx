"use client";

import React, { createContext, useContext, ReactNode } from "react";
import { useForm, UseFormReturn, FormProvider } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";

// Global Schema representing the unified pilot_requests row
export const pilotBlueprintSchema = z.object({
    id: z.string().uuid().optional(),
    champion_id: z.string().uuid().optional(),

    // Tab 2: Scope
    scope_jsonb: z.object({
        core_modules: z.array(z.string()).default([]),
        add_ons: z.array(z.string()).default([]),
        target_departments: z.array(z.string()).default([]),
        pilot_period_weeks: z.number().default(4),
        max_students: z.number().default(200),
        max_instructors: z.number().default(5),
    }).default({
        core_modules: [], add_ons: [], target_departments: [],
        pilot_period_weeks: 4, max_students: 200, max_instructors: 5
    }),

    // Tab 3: KPIs
    kpis_jsonb: z.object({
        selected_kpis: z.array(z.string()).default([]),
        measurement_criteria: z.record(z.string(), z.string()).default({}),
    }).default({
        selected_kpis: [], measurement_criteria: {}
    }),

    // Tab 4: Branding
    branding_jsonb: z.object({
        subdomain: z.string().optional(),
        custom_domain: z.string().optional(),
        logo_url: z.string().optional(),
        primary_color: z.string().default("#4f46e5"), // Indigo-600
        secondary_color: z.string().default("#0f172a"), // Slate-900
    }).default({
        primary_color: "#4f46e5", secondary_color: "#0f172a"
    }),

    // Tab 5: Settings / Permissions
    permissions_jsonb: z.object({
        independent_class_management: z.boolean().default(false),
        allow_content_upload: z.boolean().default(true),
        ai_assessment_override: z.boolean().default(false),
        allow_student_roster_management: z.boolean().default(false),
        communication_rules: z.string().default("standard"),
    }).default({
        independent_class_management: false, allow_content_upload: true,
        ai_assessment_override: false, allow_student_roster_management: false,
        communication_rules: "standard"
    }),

    // Tab 6: Admin Dashboard layout setup
    dashboard_layout_jsonb: z.object({
        view_type: z.enum(["academic", "analytics"]).default("academic"),
        selected_widgets: z.array(z.string()).default([]),
    }).default({
        view_type: "academic", selected_widgets: []
    }),

    // Cross-Tab Activity Tracker
    tasks_jsonb: z.array(z.object({
        id: z.string(),
        tab: z.string(),
        title: z.string(),
        status: z.enum(['pending', 'in_progress', 'completed']).default('pending'),
        assigned_to: z.string().optional(),
        start_date: z.string().optional(),
        due_date: z.string().optional(),
        is_auto: z.boolean().default(true),
        sort_order: z.number().default(0),
    })).default([]),

    // Per-tab Edit History
    changelog_jsonb: z.record(z.string(), z.array(z.object({
        time: z.string(),
        user: z.string(),
        action: z.string(),
    }))).default({}),

    // Progress Tracking
    completed_tabs_jsonb: z.array(z.string()).default([]),
});

export type PilotBlueprint = z.infer<typeof pilotBlueprintSchema>;

// Context Definition
const PilotFormContext = createContext<UseFormReturn<PilotBlueprint> | undefined>(undefined);

export function PilotFormProvider({
    children,
    defaultValues
}: {
    children: ReactNode;
    defaultValues?: Partial<PilotBlueprint>;
}) {
    const formMethods = useForm<PilotBlueprint>({
        resolver: zodResolver(pilotBlueprintSchema) as any,
        defaultValues: defaultValues || {
            scope_jsonb: {
                core_modules: [], add_ons: [], target_departments: [],
                pilot_period_weeks: 4, max_students: 200, max_instructors: 5
            },
            kpis_jsonb: { selected_kpis: [], measurement_criteria: {} },
            branding_jsonb: { primary_color: "#4f46e5", secondary_color: "#0f172a" },
            permissions_jsonb: {
                independent_class_management: false, allow_content_upload: true,
                ai_assessment_override: false, allow_student_roster_management: false,
                communication_rules: "standard"
            },
            dashboard_layout_jsonb: { view_type: "academic", selected_widgets: [] },
            tasks_jsonb: [],
            changelog_jsonb: {},
            completed_tabs_jsonb: []
        },
        mode: "onChange"
    });

    return (
        <PilotFormContext.Provider value={formMethods}>
            <FormProvider {...formMethods}>
                {children}
            </FormProvider>
        </PilotFormContext.Provider>
    );
}

export function usePilotForm() {
    const context = useContext(PilotFormContext);
    if (!context) {
        throw new Error("usePilotForm must be used within a PilotFormProvider");
    }
    return context;
}
