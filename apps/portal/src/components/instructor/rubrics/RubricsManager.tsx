'use client';

import { useState } from 'react';
import {
    RubricConfig,
    PracticumObservationGuide,
    PracticumReportScoreSheet
} from '@schologic/practicum-core';
import { LogsRubricViewer, SupervisorRubricViewer, ReportRubricViewer } from './RubricViewers';
import { LogsRubricEditor, SupervisorRubricEditor, ReportRubricEditor } from './RubricEditors';
import { updatePracticumRubric } from '@/app/actions/practicum';
import { useToast } from '@/context/ToastContext';
import { useNavigationGuard } from '@/context/NavigationGuardContext';
import { List, Users, FileText } from 'lucide-react';
import ConfirmDialog from '@/components/ConfirmDialog';

interface RubricsManagerProps {
    practicumId: string;
    logsRubric: RubricConfig;
    supervisorRubric: PracticumObservationGuide;
    reportRubric: PracticumReportScoreSheet;
    onUpdate?: (type: 'logs' | 'supervisor' | 'report', data: any) => void;
    onDirtyStateChange?: (isDirty: boolean) => void;
}

type Tab = 'logs' | 'supervisor' | 'report';

export default function RubricsManager({
    practicumId,
    logsRubric: initialLogsRubric,
    supervisorRubric: initialSupervisorRubric,
    reportRubric: initialReportRubric,
    onUpdate,
    onDirtyStateChange
}: RubricsManagerProps) {
    const [activeTab, setActiveTab] = useState<Tab>('logs');
    const [isEditing, setIsEditing] = useState(false);
    const [isDirty, setIsDirty] = useState(false);
    const { showToast } = useToast();
    const { blockNavigation, allowNavigation } = useNavigationGuard();

    // Internal Dialog State
    const [showConfirm, setShowConfirm] = useState(false);
    const [pendingTab, setPendingTab] = useState<Tab | null>(null);

    // Propagate dirty state to parent and context
    const handleDirtyChange = (dirty: boolean) => {
        setIsDirty(dirty);
        if (onDirtyStateChange) onDirtyStateChange(dirty);

        if (dirty) {
            blockNavigation('rubrics', 'You have unsaved changes to the rubric. Are you sure you want to leave?');
        } else {
            allowNavigation('rubrics');
        }
    };

    const handleTabChange = (tab: Tab) => {
        if (isDirty) {
            setPendingTab(tab);
            setShowConfirm(true);
        } else {
            setActiveTab(tab);
        }
    };

    const confirmTabChange = () => {
        if (pendingTab) {
            setIsEditing(false);
            handleDirtyChange(false);
            setActiveTab(pendingTab);
        }
        setShowConfirm(false);
    };

    const cancelTabChange = () => {
        setPendingTab(null);
        setShowConfirm(false);
    };

    // Local state for rubrics to support editing
    const [logsRubric, setLogsRubric] = useState(initialLogsRubric);
    const [supervisorRubric, setSupervisorRubric] = useState(initialSupervisorRubric);
    const [reportRubric, setReportRubric] = useState(initialReportRubric);

    return (
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            {/* Sidebar Navigation */}
            <div className="lg:col-span-1 space-y-2">
                <button
                    onClick={() => handleTabChange('logs')}
                    disabled={false} // Always enabled, handled by guard
                    className={`w-full flex items-center gap-3 p-3 rounded-xl text-sm font-bold transition-all ${activeTab === 'logs'
                        ? 'bg-emerald-600 text-white shadow-md shadow-emerald-200'
                        : 'bg-white text-slate-600 hover:bg-slate-50 border border-transparent hover:border-slate-200'
                        }`}
                >
                    <List className="w-5 h-5" />
                    <div className="text-left">
                        <p>Logs Assessment</p>
                        <p className={`text-xs font-normal opacity-80 ${activeTab === 'logs' ? 'text-emerald-100' : 'text-slate-400'}`}>
                            Daily/Weekly Entries
                        </p>
                    </div>
                </button>

                <button
                    onClick={() => handleTabChange('supervisor')}
                    className={`w-full flex items-center gap-3 p-3 rounded-xl text-sm font-bold transition-all ${activeTab === 'supervisor'
                        ? 'bg-emerald-600 text-white shadow-md shadow-emerald-200'
                        : 'bg-white text-slate-600 hover:bg-slate-50 border border-transparent hover:border-slate-200'
                        }`}
                >
                    <Users className="w-5 h-5" />
                    <div className="text-left">
                        <p>Supervisor Report</p>
                        <p className={`text-xs font-normal opacity-80 ${activeTab === 'supervisor' ? 'text-emerald-100' : 'text-slate-400'}`}>
                            Field Assessment
                        </p>
                    </div>
                </button>

                <button
                    onClick={() => handleTabChange('report')}
                    className={`w-full flex items-center gap-3 p-3 rounded-xl text-sm font-bold transition-all ${activeTab === 'report'
                        ? 'bg-emerald-600 text-white shadow-md shadow-emerald-200'
                        : 'bg-white text-slate-600 hover:bg-slate-50 border border-transparent hover:border-slate-200'
                        }`}
                >
                    <FileText className="w-5 h-5" />
                    <div className="text-left">
                        <p>Final Report</p>
                        <p className={`text-xs font-normal opacity-80 ${activeTab === 'report' ? 'text-emerald-100' : 'text-slate-400'}`}>
                            Project/Thesis
                        </p>
                    </div>
                </button>
            </div>

            {/* Content Area */}
            <div className="lg:col-span-3">
                {activeTab === 'logs' && (
                    isEditing
                        ? <LogsRubricEditor
                            initialRubric={logsRubric}
                            onSave={async (newRubric) => {
                                setLogsRubric(newRubric);
                                setIsEditing(false);
                                handleDirtyChange(false);
                                try {
                                    const result = await updatePracticumRubric(practicumId, 'logs', newRubric);
                                    if (!result.success) throw new Error(result.error);
                                    showToast("Logs rubric updated successfully", "success");
                                    if (onUpdate) onUpdate('logs', newRubric);
                                } catch (err) {
                                    console.error("Failed to save logs rubric", err);
                                    alert("Falied to save changes to server.");
                                }
                            }}
                            onCancel={() => { setIsEditing(false); handleDirtyChange(false); }}
                            onDirtyChange={handleDirtyChange}
                        />
                        : <LogsRubricViewer rubric={logsRubric} onEdit={() => setIsEditing(true)} />
                )}

                {activeTab === 'supervisor' && (
                    isEditing
                        ? <SupervisorRubricEditor
                            initialRubric={supervisorRubric}
                            onSave={async (newRubric) => {
                                setSupervisorRubric(newRubric);
                                setIsEditing(false);
                                handleDirtyChange(false);
                                try {
                                    const result = await updatePracticumRubric(practicumId, 'supervisor', newRubric);
                                    if (!result.success) throw new Error(result.error);
                                    showToast("Supervisor rubric updated successfully", "success");
                                    if (onUpdate) onUpdate('supervisor', newRubric);
                                } catch (err) {
                                    console.error("Failed to save supervisor rubric", err);
                                    alert("Falied to save changes to server.");
                                }
                            }}
                            onCancel={() => { setIsEditing(false); handleDirtyChange(false); }}
                            onDirtyChange={handleDirtyChange}
                        />
                        : <SupervisorRubricViewer rubric={supervisorRubric} onEdit={() => setIsEditing(true)} />
                )}

                {activeTab === 'report' && (
                    isEditing
                        ? <ReportRubricEditor
                            initialRubric={reportRubric}
                            onSave={async (newRubric) => {
                                setReportRubric(newRubric);
                                setIsEditing(false);
                                handleDirtyChange(false);
                                try {
                                    const result = await updatePracticumRubric(practicumId, 'report', newRubric);
                                    if (!result.success) throw new Error(result.error);
                                    showToast("Report rubric updated successfully", "success");
                                    if (onUpdate) onUpdate('report', newRubric);
                                } catch (err) {
                                    console.error("Failed to save report rubric", err);
                                    alert("Falied to save changes to server.");
                                }
                            }}
                            onCancel={() => { setIsEditing(false); handleDirtyChange(false); }}
                            onDirtyChange={handleDirtyChange}
                        />
                        : <ReportRubricViewer rubric={reportRubric} onEdit={() => setIsEditing(true)} />
                )}
            </div>

            <ConfirmDialog
                isOpen={showConfirm}
                title="Unsaved Changes"
                message="You are switching tabs without saving. Your changes will be lost."
                strConfirm="Discard Changes"
                strCancel="Keep Editing"
                variant="danger"
                onConfirm={confirmTabChange}
                onCancel={cancelTabChange}
            />
        </div>
    );
}
