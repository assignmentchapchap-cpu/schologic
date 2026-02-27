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
        kpis: z.array(z.object({
            id: z.string(),
            module: z.string(),        // Source module ID or "generic"
            title: z.string(),
            type: z.enum(["automated", "self_assessment"]),
            enabled: z.boolean().default(true),
            is_auto: z.boolean().default(true),
            frequency: z.enum(["daily", "weekly", "biweekly", "end_of_pilot"]).default("weekly"),
        })).default([]),
        questions: z.record(z.string(), z.array(z.object({
            id: z.string(),
            text: z.string(),
            is_auto: z.boolean().default(true),
        }))).default({}),
        delivery: z.object({
            method: z.enum(["dashboard", "manual"]).default("dashboard"),
            frequency: z.enum(["weekly", "biweekly", "end_of_pilot"]).default("weekly"),
        }).default({ method: "dashboard", frequency: "weekly" }),
    }).default({
        kpis: [], questions: {},
        delivery: { method: "dashboard", frequency: "weekly" }
    }),

    // Tab 4: Branding (Login Page Customizer)
    branding_jsonb: z.object({
        subdomain: z.string().default(""),
        use_custom_domain: z.boolean().default(false),
        custom_domain: z.string().default(""),
        logo_url: z.string().default(""),
        logo_size: z.number().default(80),
        logo_has_transparency: z.boolean().default(false),
        primary_color: z.string().default("#4f46e5"),
        secondary_color: z.string().default("#0f172a"),
        template: z.enum(["split", "centered", "minimal"]).default("centered"),
        hero_image_url: z.string().default(""),
        text_overrides: z.object({
            heading: z.string().default("Welcome to Schologic LMS"),
            subtext: z.string().default("Please sign in to continue"),
            id_label: z.string().default("Email Address"),
            password_label: z.string().default("Password"),
            button_text: z.string().default("Sign In"),
        }).default({
            heading: "Welcome to Schologic LMS",
            subtext: "Please sign in to continue",
            id_label: "Email Address",
            password_label: "Password",
            button_text: "Sign In",
        }),
    }).default({
        subdomain: "", use_custom_domain: false, custom_domain: "",
        logo_url: "", logo_size: 80, logo_has_transparency: false,
        primary_color: "#4f46e5", secondary_color: "#0f172a",
        template: "centered", hero_image_url: "",
        text_overrides: {
            heading: "Welcome to Schologic LMS",
            subtext: "Please sign in to continue",
            id_label: "Email Address",
            password_label: "Password",
            button_text: "Sign In",
        },
    }),

    // Tab 5: Settings / Permissions
    permissions_jsonb: z.object({
        // ── Classes ──────────────────────────────────────────
        manage_classes: z.boolean().default(true),     // master
        class_create: z.boolean().default(true),
        class_edit: z.boolean().default(true),
        class_delete: z.boolean().default(false),      // destructive: off by default
        manage_assignments: z.boolean().default(true),
        manage_resources: z.boolean().default(true),

        // ── Practicums ────────────────────────────────────────
        manage_practicums: z.boolean().default(true),  // master
        practicum_create: z.boolean().default(true),
        practicum_edit: z.boolean().default(true),
        manage_logs: z.boolean().default(true),
        manage_supervisors: z.boolean().default(true),

        // ── Library ───────────────────────────────────────────
        allow_content_upload: z.boolean().default(true), // master
        library_upload: z.boolean().default(true),
        create_manual_assets: z.boolean().default(true),
        library_edit: z.boolean().default(true),
        library_delete: z.boolean().default(false),   // destructive: off by default
        distribute_content: z.boolean().default(true),

        // ── Students ──────────────────────────────────────────
        manage_students: z.boolean().default(true),   // master
        view_roster: z.boolean().default(true),
        remove_students: z.boolean().default(false),  // destructive: off by default
        message_students: z.boolean().default(true),

        // ── Advanced ──────────────────────────────────────────
        ai_assessment_override: z.boolean().default(true),
        communication_rules: z.enum(["standard", "moderated", "none"]).default("standard"),
    }).default({
        manage_classes: true, class_create: true, class_edit: true, class_delete: false,
        manage_assignments: true, manage_resources: true,
        manage_practicums: true, practicum_create: true, practicum_edit: true,
        manage_logs: true, manage_supervisors: true,
        allow_content_upload: true, library_upload: true, create_manual_assets: true,
        library_edit: true, library_delete: false, distribute_content: true,
        manage_students: true, view_roster: true, remove_students: false, message_students: true,
        ai_assessment_override: false, communication_rules: "standard"
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
            kpis_jsonb: { kpis: [], questions: {}, delivery: { method: "dashboard", frequency: "weekly" } },
            branding_jsonb: {
                subdomain: "", use_custom_domain: false, custom_domain: "",
                logo_url: "", logo_size: 80, logo_has_transparency: false,
                primary_color: "#4f46e5", secondary_color: "#0f172a",
                template: "centered", hero_image_url: "",
                text_overrides: {
                    heading: "Welcome to Schologic LMS", subtext: "Please sign in to continue",
                    id_label: "Email Address", password_label: "Password", button_text: "Sign In",
                },
            },
            permissions_jsonb: {
                manage_classes: true, class_create: true, class_edit: true, class_delete: false,
                manage_assignments: true, manage_resources: true,
                manage_practicums: true, practicum_create: true, practicum_edit: true,
                manage_logs: true, manage_supervisors: true,
                allow_content_upload: true, library_upload: true, create_manual_assets: true,
                library_edit: true, library_delete: false, distribute_content: true,
                manage_students: true, view_roster: true, remove_students: false, message_students: true,
                ai_assessment_override: true, communication_rules: "standard"
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
