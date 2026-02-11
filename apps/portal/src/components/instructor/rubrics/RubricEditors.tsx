
import { useState, useEffect, Fragment } from 'react';
import {
    RubricConfig,
    PracticumObservationGuide,
    PracticumReportScoreSheet,
    RubricSection,
    RubricCriterion,
    ObservationAttribute,
    ReportSection,
    AssessmentArea
} from '@schologic/practicum-core';
import { Plus, Trash2, Save, X, RotateCcw, AlertTriangle } from 'lucide-react';

// --- Logs Rubric Editor ---
interface LogsRubricEditorProps {
    initialRubric: RubricConfig;
    onSave: (rubric: RubricConfig) => void;
    onCancel: () => void;
    onDirtyChange?: (isDirty: boolean) => void;
}

export function LogsRubricEditor({ initialRubric, onSave, onCancel, onDirtyChange }: LogsRubricEditorProps) {
    // Deep clone to prevent state leaking to other cohorts (mutation of global constants)
    const [rubric, setRubric] = useState<RubricConfig>(() => JSON.parse(JSON.stringify(initialRubric)));
    const [isDirty, setIsDirty] = useState(false);
    const [isSaving, setIsSaving] = useState(false);

    // Sync from prop updates (e.g. after save)
    useEffect(() => {
        setRubric(JSON.parse(JSON.stringify(initialRubric)));
    }, [initialRubric]);

    useEffect(() => {
        const dirty = JSON.stringify(initialRubric) !== JSON.stringify(rubric);
        setIsDirty(dirty);
        if (onDirtyChange) onDirtyChange(dirty);
    }, [rubric, initialRubric]); // Removed onDirtyChange to prevent loop

    const handleCancel = () => {
        if (!isDirty || window.confirm("You have unsaved changes. Are you sure you want to discard them?")) {
            onCancel();
        }
    };

    const updateSection = (index: number, updates: Partial<RubricSection>) => {
        const newSections = [...rubric.sections];
        newSections[index] = { ...newSections[index], ...updates };
        setRubric({ ...rubric, sections: newSections });
    };

    const addSection = () => {
        const newSection: RubricSection = {
            id: `new-section-${Date.now()}`,
            title: 'New Section',
            description: '',
            criteria: []
        };
        setRubric({ ...rubric, sections: [...rubric.sections, newSection] });
    };

    const deleteSection = (index: number) => {
        const newSections = rubric.sections.filter((_, i) => i !== index);
        setRubric({ ...rubric, sections: newSections });
    };

    const updateCriterion = (secIndex: number, critIndex: number, updates: Partial<RubricCriterion>) => {
        const newSections = [...rubric.sections];
        const newCriteria = [...newSections[secIndex].criteria];
        newCriteria[critIndex] = { ...newCriteria[critIndex], ...updates };

        // Handle number conversion for max_points
        if (updates.max_points) {
            newCriteria[critIndex].max_points = Number(updates.max_points);
        }

        newSections[secIndex].criteria = newCriteria;
        setRubric({ ...rubric, sections: newSections });
    };

    const addCriterion = (secIndex: number) => {
        const newSections = [...rubric.sections];
        newSections[secIndex].criteria.push({
            id: `crit-${Date.now()}`,
            label: 'New Criterion',
            description: '',
            max_points: 5
        });
        setRubric({ ...rubric, sections: newSections });
    };

    const deleteCriterion = (secIndex: number, critIndex: number) => {
        const newSections = [...rubric.sections];
        newSections[secIndex].criteria = newSections[secIndex].criteria.filter((_, i) => i !== critIndex);
        setRubric({ ...rubric, sections: newSections });
    };

    // Calculate total marks on fly
    const currentTotal = rubric.sections.reduce((sum, section) =>
        sum + section.criteria.reduce((cSum, crit) => cSum + crit.max_points, 0)
        , 0);

    const isTotalMismatch = currentTotal !== rubric.total_marks;

    return (
        <div className="space-y-6 animate-fade-in">
            <div className="flex justify-between items-start bg-emerald-50 p-4 rounded-xl border border-emerald-100">
                <div className="flex-1">
                    <h3 className="font-bold text-emerald-900 border-b border-transparent hover:border-emerald-300 focus-within:border-emerald-500 transition-colors mb-2">
                        <input
                            value={rubric.title}
                            onChange={(e) => setRubric({ ...rubric, title: e.target.value })}
                            className="bg-transparent outline-none w-full text-lg"
                        />
                    </h3>

                    <div className="flex items-center gap-4">
                        <div className="flex items-center gap-2">
                            <span className="text-sm font-bold text-slate-600">Total Marks Config:</span>
                            <input
                                type="number"
                                value={rubric.total_marks}
                                onChange={(e) => setRubric({ ...rubric, total_marks: Number(e.target.value) })}
                                className="bg-white w-20 text-center border border-emerald-200 rounded px-2 py-1 outline-none text-emerald-700 font-bold"
                            />
                        </div>
                        {isTotalMismatch && (
                            <div className="flex items-center gap-2 text-amber-600 text-sm font-medium bg-amber-50 px-3 py-1 rounded-lg border border-amber-200 animate-pulse">
                                <AlertTriangle className="w-4 h-4" />
                                <span>Sum of criteria ({currentTotal}) does not match Total ({rubric.total_marks})</span>
                            </div>
                        )}
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    <button onClick={handleCancel} disabled={isSaving} className="p-2 text-slate-500 hover:bg-slate-100 rounded-lg disabled:opacity-50">
                        <X className="w-5 h-5" />
                    </button>
                    <button
                        onClick={async () => {
                            setIsSaving(true);
                            await onSave(rubric);
                            setIsSaving(false);
                        }}
                        disabled={isSaving}
                        className="flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 font-medium text-sm shadow-sm transition-all disabled:opacity-80 disabled:cursor-wait"
                    >
                        {isSaving ? (
                            <RotateCcw className="w-4 h-4 animate-spin" />
                        ) : (
                            <Save className="w-4 h-4" />
                        )}
                        {isSaving ? 'Saving...' : 'Save Changes'}
                    </button>
                </div>
            </div>

            <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden overflow-x-auto">
                <table className="w-full text-sm text-left">
                    <thead className="bg-slate-50 text-slate-700 font-bold border-b border-slate-200">
                        <tr>
                            <th className="p-4 w-1/4">Section</th>
                            <th className="p-4 w-1/4">Criterion</th>
                            <th className="p-4 w-1/3">Description</th>
                            <th className="p-4 text-right">Points</th>
                            <th className="p-4 w-10"></th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                        {rubric.sections.map((section, sIdx) => {
                            const rows = section.criteria.length > 0 ? section.criteria : [null];
                            return (
                                <Fragment key={section.id || `section-${sIdx}`}>
                                    {rows.map((criterion, cIdx) => (
                                        <tr key={criterion ? criterion.id : `empty-${sIdx}`} className="group hover:bg-slate-50/50">
                                            {cIdx === 0 && (
                                                <td className="p-4 align-top border-r border-slate-100 bg-slate-50/30" rowSpan={rows.length + 1}>
                                                    <div className="space-y-3 sticky top-4">
                                                        <input
                                                            value={section.title}
                                                            onChange={(e) => updateSection(sIdx, { title: e.target.value })}
                                                            className="w-full font-bold text-slate-800 bg-white border border-slate-200 focus:border-emerald-400 rounded px-2 py-1 transition-all outline-none"
                                                            placeholder="Section Title"
                                                        />
                                                        <textarea
                                                            value={section.description || ''}
                                                            onChange={(e) => updateSection(sIdx, { description: e.target.value })}
                                                            className="w-full text-xs text-slate-500 bg-white border border-slate-200 focus:border-emerald-400 rounded px-2 py-1 transition-all outline-none resize-none"
                                                            placeholder="Description (Optional)"
                                                            rows={4}
                                                        />
                                                        <button onClick={() => deleteSection(sIdx)} className="text-red-400 hover:text-red-600 text-xs flex items-center gap-1 mt-2 opacity-50 hover:opacity-100 transition-opacity">
                                                            <Trash2 className="w-3 h-3" /> Remove Section
                                                        </button>
                                                    </div>
                                                </td>
                                            )}

                                            {criterion ? (
                                                <>
                                                    <td className="p-4 align-top">
                                                        <textarea
                                                            value={criterion.label}
                                                            onChange={(e) => updateCriterion(sIdx, cIdx, { label: e.target.value })}
                                                            className="w-full font-bold text-slate-700 bg-white border border-slate-200 focus:border-emerald-400 rounded px-2 py-1 outline-none resize-none"
                                                            rows={2}
                                                        />
                                                        <label className="flex items-center gap-2 mt-2 cursor-pointer">
                                                            <input
                                                                type="checkbox"
                                                                checked={criterion.optional}
                                                                onChange={(e) => updateCriterion(sIdx, cIdx, { optional: e.target.checked })}
                                                                className="rounded border-slate-300 text-emerald-600 focus:ring-emerald-500"
                                                            />
                                                            <span className="text-xs text-slate-500 font-medium uppercase">Optional</span>
                                                        </label>
                                                    </td>
                                                    <td className="p-4 align-top text-slate-600">
                                                        <textarea
                                                            value={criterion.description || ''}
                                                            onChange={(e) => updateCriterion(sIdx, cIdx, { description: e.target.value })}
                                                            className="w-full bg-white border border-slate-200 focus:border-emerald-400 rounded px-2 py-1 outline-none resize-none"
                                                            rows={4}
                                                        />
                                                    </td>
                                                    <td className="p-4 align-top text-right">
                                                        <input
                                                            type="number"
                                                            value={criterion.max_points}
                                                            onChange={(e) => updateCriterion(sIdx, cIdx, { max_points: Number(e.target.value) })}
                                                            className="w-20 text-right font-bold text-emerald-600 bg-emerald-50 border border-emerald-100 focus:border-emerald-400 rounded px-2 py-1 outline-none"
                                                        />
                                                    </td>
                                                    <td className="p-4 align-top text-center pt-6">
                                                        <button onClick={() => deleteCriterion(sIdx, cIdx)} className="text-slate-300 hover:text-red-500 transition-colors">
                                                            <Trash2 className="w-4 h-4" />
                                                        </button>
                                                    </td>
                                                </>
                                            ) : (
                                                <td colSpan={4} className="p-4 text-center text-slate-400 italic bg-amber-50/50">
                                                    No criteria yet. Click below to add.
                                                </td>
                                            )}
                                        </tr>
                                    ))}
                                    {/* Add Criterion Row */}
                                    <tr key={`add-${sIdx}`}>
                                        <td colSpan={4} className="p-2 bg-slate-50/50 border-t border-slate-100">
                                            <button onClick={() => addCriterion(sIdx)} className="flex items-center gap-1 text-emerald-600 text-xs font-bold uppercase hover:bg-emerald-50 px-3 py-1.5 rounded transition-colors ml-4">
                                                <Plus className="w-3 h-3" /> Add Criterion
                                            </button>
                                        </td>
                                    </tr>
                                </Fragment>
                            );
                        })}
                        {/* Add Section Button */}
                        <tr>
                            <td colSpan={5} className="p-4 bg-slate-50 text-center border-t border-slate-200">
                                <button onClick={addSection} className="flex items-center gap-2 mx-auto px-4 py-2 bg-white border border-slate-200 shadow-sm text-slate-600 font-bold rounded-lg hover:border-emerald-300 hover:text-emerald-700 transition-all">
                                    <Plus className="w-4 h-4" /> Add New Section
                                </button>
                            </td>
                        </tr>
                    </tbody>
                </table>
            </div>
        </div>
    );
}

// --- Supervisor Rubric Editor ---
interface SupervisorRubricEditorProps {
    initialRubric: PracticumObservationGuide;
    onSave: (rubric: PracticumObservationGuide) => void;
    onCancel: () => void;
    onDirtyChange?: (isDirty: boolean) => void;
}

export function SupervisorRubricEditor({ initialRubric, onSave, onCancel, onDirtyChange }: SupervisorRubricEditorProps) {
    // Deep clone to prevent state leaking
    const [rubric, setRubric] = useState<PracticumObservationGuide>(() => JSON.parse(JSON.stringify(initialRubric)));
    const [isDirty, setIsDirty] = useState(false);
    const [isSaving, setIsSaving] = useState(false);

    // Sync from prop updates
    useEffect(() => {
        setRubric(JSON.parse(JSON.stringify(initialRubric)));
    }, [initialRubric]);

    useEffect(() => {
        const dirty = JSON.stringify(initialRubric) !== JSON.stringify(rubric);
        setIsDirty(dirty);
        if (onDirtyChange) onDirtyChange(dirty);
    }, [rubric, initialRubric]); // Removed onDirtyChange to prevent loop

    const handleCancel = () => {
        if (!isDirty || window.confirm("You have unsaved changes. Are you sure you want to discard them?")) {
            onCancel();
        }
    };

    const updateArea = (index: number, updates: Partial<AssessmentArea>) => {
        const newAreas = [...rubric.assessment_areas];
        newAreas[index] = { ...newAreas[index], ...updates };
        setRubric({ ...rubric, assessment_areas: newAreas });
    };

    const addArea = () => {
        setRubric({
            ...rubric,
            assessment_areas: [...rubric.assessment_areas, {
                category: 'New Category',
                attributes: []
            }]
        });
    };

    const deleteArea = (index: number) => {
        const newAreas = rubric.assessment_areas.filter((_, i) => i !== index);
        setRubric({ ...rubric, assessment_areas: newAreas });
    };

    const updateAttribute = (areaIdx: number, attrIdx: number, updates: Partial<ObservationAttribute>) => {
        const newAreas = [...rubric.assessment_areas];
        const newAttributes = [...newAreas[areaIdx].attributes];
        newAttributes[attrIdx] = { ...newAttributes[attrIdx], ...updates };
        newAreas[areaIdx].attributes = newAttributes;
        setRubric({ ...rubric, assessment_areas: newAreas });
    };

    const addAttribute = (areaIdx: number) => {
        const newAreas = [...rubric.assessment_areas];
        newAreas[areaIdx].attributes.push({
            id: `attr-${Date.now()}`,
            attribute: 'New Attribute',
            description: ''
        });
        setRubric({ ...rubric, assessment_areas: newAreas });
    };

    const deleteAttribute = (areaIdx: number, attrIdx: number) => {
        const newAreas = [...rubric.assessment_areas];
        newAreas[areaIdx].attributes = newAreas[areaIdx].attributes.filter((_, i) => i !== attrIdx);
        setRubric({ ...rubric, assessment_areas: newAreas });
    };

    // Calculate max possible score: Sum of all attributes * Max Grading Key
    const maxGradeKey = Math.max(...Object.keys(rubric.grading_key).map(Number));
    const totalAttributes = rubric.assessment_areas.reduce((sum, area) => sum + area.attributes.length, 0);
    const calculatedMaxScore = totalAttributes * maxGradeKey;

    const isTotalMismatch = calculatedMaxScore !== rubric.total_score;

    return (
        <div className="space-y-6 animate-fade-in">
            <div className="flex justify-between items-start bg-emerald-50 p-4 rounded-xl border border-emerald-100">
                <div className="flex-1">
                    <h3 className="font-bold text-emerald-900 border-b border-transparent hover:border-emerald-300 focus-within:border-emerald-500 transition-colors mb-2">
                        <input
                            value={rubric.title}
                            onChange={(e) => setRubric({ ...rubric, title: e.target.value })}
                            className="bg-transparent outline-none w-full text-lg"
                        />
                    </h3>
                    <div className="flex items-center gap-4">
                        <div className="flex items-center gap-2">
                            <span className="text-sm font-bold text-slate-600">Total Score Config:</span>
                            <input
                                type="number"
                                value={rubric.total_score}
                                onChange={(e) => setRubric({ ...rubric, total_score: Number(e.target.value) })}
                                className="bg-white w-20 text-center border border-emerald-200 rounded px-2 py-1 outline-none text-emerald-700 font-bold"
                            />
                        </div>
                        {isTotalMismatch && (
                            <div className="flex items-center gap-2 text-amber-600 text-sm font-medium bg-amber-50 px-3 py-1 rounded-lg border border-amber-200 animate-pulse">
                                <AlertTriangle className="w-4 h-4" />
                                <span>Calculated Max ({calculatedMaxScore}) matches items * max grade? {isTotalMismatch ? 'No' : 'Yes'}</span>
                            </div>
                        )}
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    <button onClick={handleCancel} disabled={isSaving} className="p-2 text-slate-500 hover:bg-slate-100 rounded-lg disabled:opacity-50">
                        <X className="w-5 h-5" />
                    </button>
                    <button
                        onClick={async () => {
                            setIsSaving(true);
                            await onSave(rubric);
                            setIsSaving(false);
                        }}
                        disabled={isSaving}
                        className="flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 font-medium text-sm shadow-sm transition-all disabled:opacity-80 disabled:cursor-wait"
                    >
                        {isSaving ? (
                            <RotateCcw className="w-4 h-4 animate-spin" />
                        ) : (
                            <Save className="w-4 h-4" />
                        )}
                        {isSaving ? 'Saving...' : 'Save Changes'}
                    </button>
                </div>
            </div>

            <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden overflow-x-auto">
                <table className="w-full text-sm text-left">
                    <thead className="bg-slate-50 text-slate-700 font-bold border-b border-slate-200">
                        <tr>
                            <th className="p-4 w-1/4">Category</th>
                            <th className="p-4 w-1/4">Attribute / Competency</th>
                            <th className="p-4 w-1/3">Description</th>
                            <th className="p-4 w-10"></th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                        {rubric.assessment_areas.map((area, sIdx) => {
                            const rows = area.attributes.length > 0 ? area.attributes : [null];
                            return (
                                <Fragment key={`area-${sIdx}`}>
                                    {rows.map((attr, cIdx) => (
                                        <tr key={attr ? attr.id : `empty-area-${sIdx}`} className="group hover:bg-slate-50/50">
                                            {cIdx === 0 && (
                                                <td className="p-4 align-top border-r border-slate-100 bg-slate-50/30" rowSpan={rows.length + 1}>
                                                    <div className="space-y-3 sticky top-4">
                                                        <input
                                                            value={area.category}
                                                            onChange={(e) => updateArea(sIdx, { category: e.target.value })}
                                                            className="w-full font-bold text-slate-800 bg-white border border-slate-200 focus:border-emerald-400 rounded px-2 py-1 transition-all outline-none"
                                                        />
                                                        <button onClick={() => deleteArea(sIdx)} className="text-red-400 hover:text-red-600 text-xs flex items-center gap-1 mt-2 opacity-50 hover:opacity-100 transition-opacity">
                                                            <Trash2 className="w-3 h-3" /> Remove Category
                                                        </button>
                                                    </div>
                                                </td>
                                            )}

                                            {attr ? (
                                                <>
                                                    <td className="p-4 align-top">
                                                        <textarea
                                                            value={attr.attribute || attr.competency || ''}
                                                            onChange={(e) => updateAttribute(sIdx, cIdx, {
                                                                attribute: attr.attribute ? e.target.value : undefined,
                                                                competency: attr.competency ? e.target.value : undefined
                                                            })}
                                                            placeholder="Attribute Name"
                                                            className="w-full font-bold text-slate-700 bg-white border border-slate-200 focus:border-emerald-400 rounded px-2 py-1 outline-none resize-none"
                                                            rows={2}
                                                        />
                                                    </td>
                                                    <td className="p-4 align-top text-slate-600">
                                                        <textarea
                                                            value={attr.description || ''}
                                                            onChange={(e) => updateAttribute(sIdx, cIdx, { description: e.target.value })}
                                                            className="w-full bg-white border border-slate-200 focus:border-emerald-400 rounded px-2 py-1 outline-none resize-none"
                                                            rows={4}
                                                        />
                                                    </td>
                                                    <td className="p-4 align-top text-center pt-6">
                                                        <button onClick={() => deleteAttribute(sIdx, cIdx)} className="text-slate-300 hover:text-red-500 transition-colors">
                                                            <Trash2 className="w-4 h-4" />
                                                        </button>
                                                    </td>
                                                </>
                                            ) : (
                                                <td colSpan={3} className="p-4 text-center text-slate-400 italic bg-amber-50/50">
                                                    No attributes yet.
                                                </td>
                                            )}
                                        </tr>
                                    ))}
                                    {/* Add Attribute Row */}
                                    <tr key={`add-attr-${sIdx}`}>
                                        <td colSpan={3} className="p-2 bg-slate-50/50 border-t border-slate-100">
                                            <button onClick={() => addAttribute(sIdx)} className="flex items-center gap-1 text-emerald-600 text-xs font-bold uppercase hover:bg-emerald-50 px-3 py-1.5 rounded transition-colors ml-4">
                                                <Plus className="w-3 h-3" /> Add Attribute
                                            </button>
                                        </td>
                                    </tr>
                                </Fragment>
                            );
                        })}
                        {/* Add Area Button */}
                        <tr>
                            <td colSpan={4} className="p-4 bg-slate-50 text-center border-t border-slate-200">
                                <button onClick={addArea} className="flex items-center gap-2 mx-auto px-4 py-2 bg-white border border-slate-200 shadow-sm text-slate-600 font-bold rounded-lg hover:border-emerald-300 hover:text-emerald-700 transition-all">
                                    <Plus className="w-4 h-4" /> Add Assessment Area
                                </button>
                            </td>
                        </tr>
                    </tbody>
                </table>
            </div>
        </div>
    );
}

// --- Report Rubric Editor ---
interface ReportRubricEditorProps {
    initialRubric: PracticumReportScoreSheet;
    onSave: (rubric: PracticumReportScoreSheet) => void;
    onCancel: () => void;
    onDirtyChange?: (isDirty: boolean) => void;
}

export function ReportRubricEditor({ initialRubric, onSave, onCancel, onDirtyChange }: ReportRubricEditorProps) {
    // Deep clone to prevent state leaking
    const [rubric, setRubric] = useState<PracticumReportScoreSheet>(() => JSON.parse(JSON.stringify(initialRubric)));
    const [isDirty, setIsDirty] = useState(false);
    const [isSaving, setIsSaving] = useState(false);

    // Sync from prop updates
    useEffect(() => {
        setRubric(JSON.parse(JSON.stringify(initialRubric)));
    }, [initialRubric]);

    useEffect(() => {
        const dirty = JSON.stringify(initialRubric) !== JSON.stringify(rubric);
        setIsDirty(dirty);
        if (onDirtyChange) onDirtyChange(dirty);
    }, [rubric, initialRubric]); // Removed onDirtyChange to prevent loop

    const handleCancel = () => {
        if (!isDirty || window.confirm("You have unsaved changes. Are you sure you want to discard them?")) {
            onCancel();
        }
    };

    const updateSection = (index: number, updates: Partial<ReportSection>) => {
        const newSections = [...rubric.sections];
        newSections[index] = { ...newSections[index], ...updates };

        // Ensure total marks updating logic if needed
        if (updates.marks) newSections[index].marks = Number(updates.marks);
        if (updates.total_marks) newSections[index].total_marks = Number(updates.total_marks);

        setRubric({ ...rubric, sections: newSections });
    };

    const addSection = () => {
        setRubric({
            ...rubric,
            sections: [...rubric.sections, {
                item_number: rubric.sections.length + 1,
                section: 'New Section',
                marks: 0
            }]
        });
    };

    const deleteSection = (index: number) => {
        const newSections = rubric.sections.filter((_, i) => i !== index);
        // Renumber items
        newSections.forEach((sec, i) => sec.item_number = i + 1);
        setRubric({ ...rubric, sections: newSections });
    };

    const addSubsection = (secIndex: number) => {
        const newSections = [...rubric.sections];
        const section = newSections[secIndex];
        if (!section.subsections) section.subsections = [];

        section.subsections.push({
            title: 'New Subsection',
            marks: 0
        });

        setRubric({ ...rubric, sections: newSections });
    };

    const updateSubsection = (secIndex: number, subIndex: number, updates: any) => {
        const newSections = [...rubric.sections];
        const section = newSections[secIndex];
        if (section.subsections) {
            section.subsections[subIndex] = { ...section.subsections[subIndex], ...updates };
            if (updates.marks) section.subsections[subIndex].marks = Number(updates.marks);
        }
        setRubric({ ...rubric, sections: newSections });
    };

    const deleteSubsection = (secIndex: number, subIndex: number) => {
        const newSections = [...rubric.sections];
        const section = newSections[secIndex];
        if (section.subsections) {
            section.subsections = section.subsections.filter((_, i) => i !== subIndex);
        }
        setRubric({ ...rubric, sections: newSections });
    };

    const currentTotal = rubric.sections.reduce((sum, sec) => {
        if (sec.subsections && sec.subsections.length > 0) {
            return sum + sec.subsections.reduce((s, sub) => s + (sub.marks || 0), 0);
        }
        return sum + (sec.marks || sec.total_marks || 0);
    }, 0);

    const isTotalMismatch = currentTotal !== rubric.total_report_marks;

    return (
        <div className="space-y-6 animate-fade-in">
            <div className="flex justify-between items-start bg-emerald-50 p-4 rounded-xl border border-emerald-100">
                <div className="flex-1">
                    <h3 className="font-bold text-emerald-900 border-b border-transparent hover:border-emerald-300 focus-within:border-emerald-500 transition-colors mb-2">
                        <input
                            value={rubric.title}
                            onChange={(e) => setRubric({ ...rubric, title: e.target.value })}
                            className="bg-transparent outline-none w-full text-lg"
                        />
                    </h3>
                    <div className="flex items-center gap-4">
                        <div className="flex items-center gap-2">
                            <span className="text-sm font-bold text-slate-600">Total Marks Config:</span>
                            <input
                                type="number"
                                value={rubric.total_report_marks}
                                onChange={(e) => setRubric({ ...rubric, total_report_marks: Number(e.target.value) })}
                                className="bg-white w-20 text-center border border-emerald-200 rounded px-2 py-1 outline-none text-emerald-700 font-bold"
                            />
                        </div>
                        {isTotalMismatch && (
                            <div className="flex items-center gap-2 text-amber-600 text-sm font-medium bg-amber-50 px-3 py-1 rounded-lg border border-amber-200 animate-pulse">
                                <AlertTriangle className="w-4 h-4" />
                                <span>Total ({currentTotal}) does not match Config ({rubric.total_report_marks})</span>
                            </div>
                        )}
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    <button onClick={handleCancel} disabled={isSaving} className="p-2 text-slate-500 hover:bg-slate-100 rounded-lg disabled:opacity-50">
                        <X className="w-5 h-5" />
                    </button>
                    <button
                        onClick={async () => {
                            setIsSaving(true);
                            await onSave(rubric);
                            setIsSaving(false);
                        }}
                        disabled={isSaving}
                        className="flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 font-medium text-sm shadow-sm transition-all disabled:opacity-80 disabled:cursor-wait"
                    >
                        {isSaving ? (
                            <RotateCcw className="w-4 h-4 animate-spin" />
                        ) : (
                            <Save className="w-4 h-4" />
                        )}
                        {isSaving ? 'Saving...' : 'Save Changes'}
                    </button>
                </div>
            </div>

            <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden overflow-x-auto">
                <table className="w-full text-sm text-left">
                    <thead className="bg-slate-50 text-slate-700 font-bold border-b border-slate-200">
                        <tr>
                            <th className="p-4 w-12 text-center">#</th>
                            <th className="p-4">Criteria / Section</th>
                            <th className="p-4 w-24 text-right">Max Marks</th>
                            <th className="p-4 w-10"></th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                        {rubric.sections.map((section, sIdx) => (
                            <Fragment key={section.item_number || `sec-${sIdx}`}>
                                <tr key={`sec-${sIdx}`} className="bg-slate-50/20 group hover:bg-slate-50/50">
                                    <td className="p-4 text-center">
                                        <input
                                            type="number"
                                            value={section.item_number}
                                            onChange={(e) => updateSection(sIdx, { item_number: Number(e.target.value) })}
                                            className="w-12 text-center bg-transparent outline-none font-bold text-slate-500 border border-transparent hover:border-slate-300 focus:border-emerald-400 rounded"
                                        />
                                    </td>
                                    <td className="p-4">
                                        <input
                                            value={section.section}
                                            onChange={(e) => updateSection(sIdx, { section: e.target.value })}
                                            className="w-full font-bold text-slate-800 bg-transparent outline-none border-b border-transparent hover:border-slate-300 focus:border-emerald-400"
                                            placeholder="Section Title"
                                        />
                                        <textarea
                                            value={section.details || ''}
                                            onChange={(e) => updateSection(sIdx, { details: e.target.value })}
                                            className="w-full text-xs text-slate-500 mt-2 bg-transparent outline-none border border-transparent hover:border-slate-300 focus:border-emerald-400 rounded px-1 py-1 resize-none"
                                            placeholder="Details (Optional)"
                                            rows={2}
                                        />
                                    </td>
                                    <td className="p-4 text-right">
                                        {(!section.subsections || section.subsections.length === 0) && (
                                            <input
                                                type="number"
                                                value={section.marks || section.total_marks || 0}
                                                onChange={(e) => updateSection(sIdx, { marks: Number(e.target.value), total_marks: Number(e.target.value) })}
                                                className="w-20 text-right font-bold text-emerald-600 bg-emerald-50 border border-transparent hover:border-emerald-200 focus:border-emerald-400 rounded px-2 py-1 outline-none"
                                            />
                                        )}
                                    </td>
                                    <td className="p-4 text-center">
                                        <div className="flex gap-2 justify-end opacity-0 group-hover:opacity-100 transition-opacity">
                                            <button onClick={() => addSubsection(sIdx)} title="Add Subsection" className="text-emerald-500 hover:text-emerald-700">
                                                <Plus className="w-4 h-4" />
                                            </button>
                                            <button onClick={() => deleteSection(sIdx)} title="Delete Section" className="text-slate-300 hover:text-red-500">
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                                {/* Subsections */}
                                {section.subsections?.map((sub, subIdx) => (
                                    <tr key={`sec-${sIdx}-sub-${subIdx}`} className="group hover:bg-slate-50/50">
                                        <td className="p-4"></td>
                                        <td className="p-4 pl-8 border-l-2 border-emerald-100">
                                            <textarea
                                                value={sub.title}
                                                onChange={(e) => updateSubsection(sIdx, subIdx, { title: e.target.value })}
                                                className="w-full text-slate-600 bg-transparent outline-none border border-transparent hover:border-slate-300 focus:border-emerald-400 rounded px-1 py-1 resize-none"
                                                rows={2}
                                            />
                                        </td>
                                        <td className="p-4 text-right">
                                            <input
                                                type="number"
                                                value={sub.marks}
                                                onChange={(e) => updateSubsection(sIdx, subIdx, { marks: Number(e.target.value) })}
                                                className="w-20 text-right font-mono text-slate-500 bg-transparent border border-transparent hover:border-slate-300 focus:border-emerald-400 rounded px-1 outline-none"
                                            />
                                        </td>
                                        <td className="p-4 text-center">
                                            <button onClick={() => deleteSubsection(sIdx, subIdx)} className="text-slate-300 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity">
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </Fragment>
                        ))}
                        {/* Add Section Button */}
                        <tr>
                            <td colSpan={4} className="p-4 bg-slate-50 text-center border-t border-slate-200">
                                <button onClick={addSection} className="flex items-center gap-2 mx-auto px-4 py-2 bg-white border border-slate-200 shadow-sm text-slate-600 font-bold rounded-lg hover:border-emerald-300 hover:text-emerald-700 transition-all">
                                    <Plus className="w-4 h-4" /> Add Page/Section
                                </button>
                            </td>
                        </tr>
                    </tbody>
                </table>
            </div>
        </div>
    );
}
