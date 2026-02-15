"use client";

import React, { useState } from 'react';
import { Users, FileText, CheckCircle, Upload, Mail, CheckSquare, ChevronRight, ChevronLeft, ChevronDown } from 'lucide-react';
import { cn } from "@/lib/utils";

const steps = [
    {
        id: 1,
        title: "Cohort Creation",
        description: "Instructor defines attachment period, requirements, and grading criteria.",
        icon: Users
    },
    {
        id: 2,
        title: "Student Enrollment",
        description: "Students fill digital enrollment forms and select their industry placement.",
        icon: FileText
    },
    {
        id: 3,
        title: "Placement Approval",
        description: "Faculty reviews and approves student placements before start date.",
        icon: CheckCircle
    },
    {
        id: 4,
        title: "Logbook Submission",
        description: "Students submit daily logs, weekly reports, and final project via mobile.",
        icon: Upload
    },
    {
        id: 5,
        title: "Supervisor Verification",
        description: "Industry supervisors receive automated email requests to verify logs.",
        icon: Mail
    },
    {
        id: 6,
        title: "Final Grading",
        description: "Instructor reviews verified logs and supervisor feedback to assign grade.",
        icon: CheckSquare
    }
];

export const PracticumProcessVisual = () => {
    const [activeStep, setActiveStep] = useState(1);

    return (
        <div
            className="w-full max-w-2xl mx-auto bg-white rounded-2xl shadow-xl border border-emerald-100 overflow-hidden overflow-x-auto"
            role="img"
            aria-label="Diagram of the digital practicum supervision workflow and stages"
            data-nosnippet
        >
            <div className="bg-emerald-50 p-4 border-b border-emerald-100 text-center">
                <h3 className="text-emerald-800 font-bold mb-1">Practicum Workflow</h3>
                <p className="text-emerald-600 text-xs uppercase tracking-wider font-semibold">Interactive Process</p>
            </div>

            <div className="p-4 md:p-8 grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-12 md:gap-y-24 min-w-[300px]">
                {/* Reorder steps for visual snake flow: 1, 2, 4, 3, 5, 6 */}
                {/* Row 1: 1(L), 2(R) */}
                {/* Row 2: 4(L), 3(R) -> Swapped to force standard L-to-R DOMan order */}
                {/* Row 3: 5(L), 6(R) */}
                {[
                    steps[0], // ID 1
                    steps[1], // ID 2
                    steps[3], // ID 4 (Placed Left)
                    steps[2], // ID 3 (Placed Right)
                    steps[4], // ID 5
                    steps[5]  // ID 6
                ].map((step) => {
                    const isActive = activeStep === step.id;
                    const isCompleted = activeStep > step.id;

                    return (
                        <div key={step.id} className="relative group">
                            <div
                                onMouseEnter={() => setActiveStep(step.id)}
                                className={cn(
                                    "relative flex items-center gap-4 p-4 rounded-xl transition-all duration-300 cursor-default border z-10 bg-white h-full",
                                    isActive
                                        ? "shadow-md ring-1 ring-amber-200 border-amber-200 scale-[1.05]"
                                        : "hover:bg-slate-50 border-slate-100 hover:border-slate-200"
                                )}
                            >
                                {/* Icon Bubble */}
                                <div className={cn(
                                    "relative z-10 w-12 h-12 rounded-full flex items-center justify-center shrink-0 transition-colors duration-300 shadow-sm",
                                    isActive ? "bg-amber-100 text-amber-600" :
                                        isCompleted ? "bg-emerald-100 text-emerald-600" :
                                            "bg-slate-100 text-slate-400 group-hover:bg-slate-200"
                                )}>
                                    <step.icon className="w-5 h-5" />
                                </div>

                                {/* Content */}
                                <div className="flex-1 min-w-0 text-left">
                                    <div className="flex justify-between items-center mb-1">
                                        <h4 className={cn(
                                            "font-bold text-sm transition-colors",
                                            isActive ? "text-amber-900" :
                                                isCompleted ? "text-emerald-900" : "text-slate-600"
                                        )}>
                                            {step.title}
                                        </h4>
                                        {isActive && (
                                            <span className="text-[10px] font-bold text-amber-600 bg-white px-2 py-0.5 rounded-full shadow-sm border border-amber-100 animate-in fade-in zoom-in duration-300 shrink-0">
                                                Active
                                            </span>
                                        )}
                                    </div>

                                    <p className={cn(
                                        "text-xs leading-relaxed transition-all duration-300",
                                        isActive ? "text-slate-600" : "text-slate-400"
                                    )}>
                                        {step.description}
                                    </p>
                                </div>
                            </div>

                            {/* Directional Arrows (Desktop Only) */}
                            <div className="hidden md:block absolute z-0 pointer-events-none w-full h-full inset-0">
                                {/* Arrow Right: ID 1->2 and ID 5->6 */}
                                {(step.id === 1 || step.id === 5) && (
                                    <div className="absolute top-1/2 -right-6 -translate-y-1/2 text-slate-300 z-20">
                                        <ChevronRight className={cn("w-6 h-6", isCompleted ? "text-emerald-400" : "")} />
                                    </div>
                                )}

                                {/* Arrow Left: ID 3->4 (From Right Cell to Left Cell) */}
                                {(step.id === 3) && (
                                    <div className="absolute top-1/2 -left-6 -translate-y-1/2 text-slate-300 z-20">
                                        <ChevronLeft className={cn("w-6 h-6", isCompleted ? "text-emerald-400" : "")} />
                                    </div>
                                )}

                                {/* Arrow Down: ID 2->3 and ID 4->5 */}
                                {(step.id === 2 || step.id === 4) && (
                                    <div className="absolute -bottom-12 left-1/2 -translate-x-1/2 text-slate-300 z-20">
                                        <ChevronDown className={cn("w-6 h-6", isCompleted ? "text-emerald-400" : "")} />
                                    </div>
                                )}
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};
