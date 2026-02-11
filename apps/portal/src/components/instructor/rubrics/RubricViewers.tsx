import { useState, Fragment } from 'react';
import {
    RubricConfig,
    PracticumObservationGuide,
    PracticumReportScoreSheet,
    RubricSection,
    RubricCriterion,
    ObservationAttribute,
    ReportSection
} from '@schologic/practicum-core';
import { CheckCircle2, AlertCircle, FileText, Check, Pencil } from 'lucide-react';

// --- Logs Assessment Viewer ---
export function LogsRubricViewer({ rubric, onEdit }: { rubric: RubricConfig, onEdit?: () => void }) {
    const [viewMode, setViewMode] = useState<'list' | 'matrix'>('list');

    if (!rubric) return <EmptyState label="Logs Rubric" />;

    return (
        <div className="space-y-6 animate-fade-in">
            <div className="flex justify-between items-center bg-emerald-50 p-4 rounded-xl border border-emerald-100">
                <div>
                    <h3 className="font-bold text-emerald-900">{rubric.title}</h3>
                    <p className="text-emerald-700 text-sm">Total Marks: {rubric.total_marks}</p>
                </div>
                <div className="flex items-center gap-2">
                    {onEdit && (
                        <button
                            onClick={onEdit}
                            className="p-2 text-emerald-600 hover:bg-emerald-100 rounded-lg transition-colors border border-transparent hover:border-emerald-200"
                            title="Edit Template"
                        >
                            <Pencil className="w-5 h-5" />
                        </button>
                    )}
                    <div className="bg-white p-1 rounded-lg shadow-sm border border-emerald-100 flex text-sm">
                        <button
                            onClick={() => setViewMode('list')}
                            className={`px-3 py-1.5 rounded-md transition-all font-medium ${viewMode === 'list'
                                ? 'bg-emerald-100 text-emerald-800'
                                : 'text-slate-500 hover:text-emerald-600'
                                }`}
                        >
                            List
                        </button>
                        <button
                            onClick={() => setViewMode('matrix')}
                            className={`px-3 py-1.5 rounded-md transition-all font-medium ${viewMode === 'matrix'
                                ? 'bg-emerald-100 text-emerald-800'
                                : 'text-slate-500 hover:text-emerald-600'
                                }`}
                        >
                            Matrix
                        </button>
                    </div>
                </div>
            </div>

            {viewMode === 'list' ? (
                // List View
                <div className="grid gap-6">
                    {(rubric.sections || []).map((section: RubricSection) => (
                        <div key={section.id} className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
                            <div className="bg-slate-50 p-3 border-b border-slate-200">
                                <h4 className="font-bold text-slate-800 text-sm uppercase tracking-wider">{section.title}</h4>
                                {section.description && <p className="text-xs text-slate-500 mt-1">{section.description}</p>}
                            </div>
                            <div className="divide-y divide-slate-100">
                                {section.criteria.map((criterion: RubricCriterion) => (
                                    <div key={criterion.id} className="p-4 hover:bg-slate-50 transition-colors flex justify-between gap-4">
                                        <div>
                                            <p className="font-bold text-slate-800 text-sm">{criterion.label}</p>
                                            <p className="text-xs text-slate-500 mt-1">{criterion.description}</p>
                                            {criterion.optional && (
                                                <span className="inline-block mt-2 px-2 py-0.5 bg-blue-50 text-blue-600 text-[10px] font-bold uppercase rounded-full">Optional</span>
                                            )}
                                        </div>
                                        <div className="shrink-0">
                                            <span className="px-3 py-1 bg-emerald-100 text-emerald-700 font-bold text-xs rounded-full">
                                                {criterion.max_points} pts
                                            </span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>
            ) : (
                // Matrix View
                <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden overflow-x-auto">
                    <table className="w-full text-sm text-left">
                        <thead className="bg-slate-50 text-slate-700 font-bold border-b border-slate-200">
                            <tr>
                                <th className="p-4 w-1/4">Section</th>
                                <th className="p-4 w-1/4">Criterion</th>
                                <th className="p-4 w-1/3">Description</th>
                                <th className="p-4 text-right">Points</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {(rubric.sections || []).map((section) => (
                                section.criteria.map((criterion, idx) => (
                                    <tr key={criterion.id} className="hover:bg-slate-50/50">
                                        {/* Show Section Title only for first item */}
                                        {idx === 0 && (
                                            <td className="p-4 align-top border-r border-slate-100 bg-slate-50/30" rowSpan={section.criteria.length}>
                                                <div className="sticky top-0">
                                                    <p className="font-bold text-slate-800">{section.title}</p>
                                                    <p className="text-xs text-slate-500 mt-1">{section.description}</p>
                                                </div>
                                            </td>
                                        )}
                                        <td className="p-4 align-top">
                                            <p className="font-bold text-slate-700">{criterion.label}</p>
                                            {criterion.optional && (
                                                <span className="inline-block mt-1 px-1.5 py-0.5 bg-blue-50 text-blue-600 text-[10px] font-bold uppercase rounded">Optional</span>
                                            )}
                                        </td>
                                        <td className="p-4 align-top text-slate-600">
                                            {criterion.description}
                                        </td>
                                        <td className="p-4 align-top text-right">
                                            <span className="font-bold text-emerald-600">{criterion.max_points}</span>
                                        </td>
                                    </tr>
                                ))
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
}

// --- Supervisor Assessment Viewer ---
export function SupervisorRubricViewer({ rubric, onEdit }: { rubric: PracticumObservationGuide, onEdit?: () => void }) {
    const [viewMode, setViewMode] = useState<'list' | 'matrix'>('list');

    if (!rubric) return <EmptyState label="Supervisor Guide" />;

    return (
        <div className="space-y-6 animate-fade-in">
            <div className="flex justify-between items-center bg-emerald-50 p-4 rounded-xl border border-emerald-100">
                <div>
                    <h3 className="font-bold text-emerald-900">{rubric.title}</h3>
                    <p className="text-emerald-700 text-sm">Total Score: {rubric.total_score}</p>
                </div>
                <div className="flex items-center gap-2">
                    {onEdit && (
                        <button
                            onClick={onEdit}
                            className="p-2 text-emerald-600 hover:bg-emerald-100 rounded-lg transition-colors border border-transparent hover:border-emerald-200"
                            title="Edit Template"
                        >
                            <Pencil className="w-5 h-5" />
                        </button>
                    )}
                    <div className="bg-white p-1 rounded-lg shadow-sm border border-emerald-100 flex text-sm">
                        <button
                            onClick={() => setViewMode('list')}
                            className={`px-3 py-1.5 rounded-md transition-all font-medium ${viewMode === 'list'
                                ? 'bg-emerald-100 text-emerald-800'
                                : 'text-slate-500 hover:text-emerald-600'
                                }`}
                        >
                            List
                        </button>
                        <button
                            onClick={() => setViewMode('matrix')}
                            className={`px-3 py-1.5 rounded-md transition-all font-medium ${viewMode === 'matrix'
                                ? 'bg-emerald-100 text-emerald-800'
                                : 'text-slate-500 hover:text-emerald-600'
                                }`}
                        >
                            Matrix
                        </button>
                    </div>
                </div>
            </div>

            {/* Grading Key - Always Visible */}
            <div className="bg-white p-4 rounded-xl border border-slate-200 text-sm">
                <p className="font-bold text-slate-700 mb-2 text-xs uppercase tracking-wider">Grading Key</p>
                <div className="flex flex-wrap gap-2">
                    {Object.entries(rubric.grading_key || {}).map(([key, label]) => (
                        <span key={key} className="px-3 py-1 bg-slate-100 text-slate-600 rounded-lg text-xs font-medium border border-slate-200">
                            <strong className="text-slate-900">{key}</strong> = {label}
                        </span>
                    ))}
                </div>
            </div>

            {viewMode === 'list' ? (
                // List View
                <div className="grid gap-6">
                    {(rubric.assessment_areas || []).map((area, idx) => (
                        <div key={idx} className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
                            <div className="bg-slate-50 p-3 border-b border-slate-200">
                                <h4 className="font-bold text-slate-800 text-sm uppercase tracking-wider">{area.category}</h4>
                            </div>
                            <div className="divide-y divide-slate-100">
                                {area.attributes.map((attr, aIdx) => (
                                    <div key={aIdx} className="p-4 hover:bg-slate-50 transition-colors">
                                        <div className="flex items-start gap-3">
                                            <div className="mt-1 w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0" />
                                            <div>
                                                <p className="font-bold text-slate-800 text-sm">
                                                    {attr.attribute || attr.competency}
                                                </p>
                                                <p className="text-xs text-slate-500 mt-1">{attr.description}</p>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>
            ) : (
                // Matrix View
                <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden overflow-x-auto">
                    <table className="w-full text-sm text-left">
                        <thead className="bg-slate-50 text-slate-700 font-bold border-b border-slate-200">
                            <tr>
                                <th className="p-4 w-1/5">Category</th>
                                <th className="p-4 w-1/4">Attribute / Competency</th>
                                <th className="p-4">Description</th>
                                {/* Dynamically generate Grade Columns */}
                                {Object.keys(rubric.grading_key || {}).sort((a, b) => Number(b) - Number(a)).map(key => (
                                    <th key={key} className="p-4 text-center w-12 bg-slate-100/50 border-l border-slate-200">
                                        {key}
                                    </th>
                                ))}
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {(rubric.assessment_areas || []).map((area) => (
                                area.attributes.map((attr, idx) => (
                                    <tr key={`${area.category}-${idx}`} className="hover:bg-slate-50/50">
                                        {idx === 0 && (
                                            <td className="p-4 align-top border-r border-slate-100 bg-slate-50/30" rowSpan={area.attributes.length}>
                                                <div className="sticky top-0 font-bold text-slate-800">
                                                    {area.category}
                                                </div>
                                            </td>
                                        )}
                                        <td className="p-4 align-top font-bold text-slate-700">
                                            {attr.attribute || attr.competency}
                                        </td>
                                        <td className="p-4 align-top text-slate-600 border-r border-slate-100">
                                            {attr.description}
                                        </td>
                                        {/* Grade Radio Buttons */}
                                        {Object.keys(rubric.grading_key || {}).sort((a, b) => Number(b) - Number(a)).map(key => (
                                            <td key={key} className="p-4 text-center align-top border-l border-slate-100 bg-slate-50/20">
                                                <div className="flex justify-center">
                                                    <input
                                                        type="radio"
                                                        disabled
                                                        className="w-4 h-4 text-emerald-600 border-slate-300 focus:ring-emerald-500 cursor-not-allowed"
                                                    />
                                                </div>
                                            </td>
                                        ))}
                                    </tr>
                                ))
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
}

// --- Final Report Viewer ---
export function ReportRubricViewer({ rubric, onEdit }: { rubric: PracticumReportScoreSheet, onEdit?: () => void }) {
    const [viewMode, setViewMode] = useState<'list' | 'matrix'>('list');

    if (!rubric) return <EmptyState label="Report Score Sheet" />;

    return (
        <div className="space-y-6 animate-fade-in">
            <div className="flex justify-between items-center bg-emerald-50 p-4 rounded-xl border border-emerald-100">
                <div>
                    <h3 className="font-bold text-emerald-900">{rubric.title}</h3>
                    <p className="text-emerald-700 text-sm">Total Marks: {rubric.total_report_marks}%</p>
                </div>
                <div className="flex items-center gap-2">
                    {onEdit && (
                        <button
                            onClick={onEdit}
                            className="p-2 text-emerald-600 hover:bg-emerald-100 rounded-lg transition-colors border border-transparent hover:border-emerald-200"
                            title="Edit Template"
                        >
                            <Pencil className="w-5 h-5" />
                        </button>
                    )}
                    <div className="bg-white p-1 rounded-lg shadow-sm border border-emerald-100 flex text-sm">
                        <button
                            onClick={() => setViewMode('list')}
                            className={`px-3 py-1.5 rounded-md transition-all font-medium ${viewMode === 'list'
                                ? 'bg-emerald-100 text-emerald-800'
                                : 'text-slate-500 hover:text-emerald-600'
                                }`}
                        >
                            List
                        </button>
                        <button
                            onClick={() => setViewMode('matrix')}
                            className={`px-3 py-1.5 rounded-md transition-all font-medium ${viewMode === 'matrix'
                                ? 'bg-emerald-100 text-emerald-800'
                                : 'text-slate-500 hover:text-emerald-600'
                                }`}
                        >
                            Matrix
                        </button>
                    </div>
                </div>
            </div>

            {viewMode === 'list' ? (
                // List View
                <div className="space-y-4">
                    {(rubric.sections || []).map((section: ReportSection, idx) => (
                        <div key={idx} className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
                            <div className="p-4 flex justify-between items-start gap-4">
                                <div>
                                    <div className="flex items-center gap-2 mb-1">
                                        <span className="w-6 h-6 rounded-full bg-slate-100 text-slate-500 flex items-center justify-center text-xs font-bold">
                                            {section.item_number}
                                        </span>
                                        <h4 className="font-bold text-slate-800 text-sm">{section.section}</h4>
                                    </div>
                                    {section.details && <p className="text-xs text-slate-500 ml-8">{section.details}</p>}

                                    {section.subsections && (
                                        <div className="mt-4 ml-8 space-y-2 border-l-2 border-slate-100 pl-4">
                                            {section.subsections.map((sub, sIdx) => (
                                                <div key={sIdx} className="flex justify-between items-center text-sm">
                                                    <span className="text-slate-600">{sub.title}</span>
                                                    <span className="text-slate-400 font-mono text-xs">{sub.marks} pts</span>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                                <div className="shrink-0">
                                    {(section.marks || section.total_marks) && (
                                        <span className="px-3 py-1 bg-slate-100 text-slate-600 font-bold text-xs rounded-full border border-slate-200">
                                            {section.marks || section.total_marks} marks
                                        </span>
                                    )}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            ) : (
                // Matrix View (Score Sheet Table)
                <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden overflow-x-auto">
                    <table className="w-full text-sm text-left">
                        <thead className="bg-slate-50 text-slate-700 font-bold border-b border-slate-200">
                            <tr>
                                <th className="p-4 w-12 text-center">#</th>
                                <th className="p-4">Criteria / Section</th>
                                <th className="p-4 w-24 text-right">Max Marks</th>
                                <th className="p-4 w-24 text-center bg-slate-100/50 border-l border-slate-200">Score</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {(rubric.sections || []).map((section, idx) => (
                                <Fragment key={idx}>
                                    {/* Main Section Row */}
                                    <tr className={`hover:bg-slate-50/50 ${section.subsections ? 'bg-slate-50/30 font-bold text-slate-800' : ''}`}>
                                        <td className="p-4 text-center font-bold text-slate-500">{section.item_number}</td>
                                        <td className="p-4">
                                            <p className={section.subsections ? 'font-bold uppercase tracking-wider text-xs md:text-sm' : 'font-bold'}>
                                                {section.section}
                                            </p>
                                            {section.details && <p className="text-xs text-slate-500 mt-0.5 font-normal">{section.details}</p>}
                                        </td>
                                        <td className="p-4 text-right">
                                            {(section.marks || section.total_marks) && (
                                                <span className="bg-slate-100 px-2 py-0.5 rounded text-xs font-bold text-slate-600">
                                                    {section.marks || section.total_marks}
                                                </span>
                                            )}
                                        </td>
                                        <td className="p-4 text-center border-l border-slate-100 bg-slate-50/20">
                                            {!section.subsections && (
                                                <div className="w-16 h-8 border border-slate-200 rounded mx-auto bg-white" />
                                            )}
                                        </td>
                                    </tr>
                                    {/* Subsections */}
                                    {section.subsections?.map((sub, sIdx) => (
                                        <tr key={`sec-${idx}-sub-${sIdx}`} className="hover:bg-slate-50/50">
                                            <td className="p-4 text-center text-slate-300 border-r border-transparent"></td>
                                            <td className="p-4 pl-8 text-slate-600 border-l-2 border-emerald-100">
                                                {sub.title}
                                            </td>
                                            <td className="p-4 text-right font-mono text-slate-500 text-xs">
                                                {sub.marks}
                                            </td>
                                            <td className="p-4 text-center border-l border-slate-100 bg-slate-50/20">
                                                <div className="w-16 h-8 border border-slate-200 rounded mx-auto bg-white" />
                                            </td>
                                        </tr>
                                    ))}
                                </Fragment>
                            ))}
                            {/* Total Row */}
                            <tr className="bg-emerald-50/50 font-bold text-emerald-900 border-t-2 border-emerald-100">
                                <td colSpan={2} className="p-4 text-right uppercase tracking-wider text-xs">Total Score</td>
                                <td className="p-4 text-right text-lg">{rubric.total_report_marks}</td>
                                <td className="p-4 text-center border-l border-emerald-200 bg-white">
                                    <div className="w-16 h-10 border-2 border-emerald-200 rounded mx-auto bg-emerald-50/20" />
                                </td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            )}

            {rubric.final_grading_notes && (
                <div className="bg-yellow-50 p-4 rounded-xl border border-yellow-100 text-sm text-yellow-800">
                    <h5 className="font-bold mb-2 flex items-center gap-2"><AlertCircle className="w-4 h-4" /> Grading Notes</h5>
                    <ul className="list-disc list-inside space-y-1 text-xs">
                        {rubric.final_grading_notes.map((note, idx) => (
                            <li key={idx}>{note}</li>
                        ))}
                    </ul>
                </div>
            )}
        </div>
    );
}

// Helper Components
function EmptyState({ label }: { label: string }) {
    return (
        <div className="text-center py-12 border-2 border-dashed border-slate-200 rounded-xl bg-slate-50">
            <AlertCircle className="w-8 h-8 text-slate-300 mx-auto mb-3" />
            <p className="text-slate-500 font-medium">No {label} configured.</p>
        </div>
    );
}
