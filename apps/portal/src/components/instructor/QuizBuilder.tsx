'use client';

import { useState } from 'react';
import { Plus, Trash2, Check, X, AlertCircle } from 'lucide-react';
import { QuizQuestion, QuizData } from '@/types/json-schemas';

interface QuizBuilderProps {
    questions: QuizQuestion[];
    onChange: (questions: QuizQuestion[]) => void;
}

function generateId(): string {
    return `q_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

export default function QuizBuilder({ questions, onChange }: QuizBuilderProps) {
    const [expandedQuestion, setExpandedQuestion] = useState<string | null>(null);

    const addQuestion = () => {
        const newQuestion: QuizQuestion = {
            id: generateId(),
            question: '',
            choices: ['', '', '', ''],
            correct_index: 0,
            points: 1
        };
        onChange([...questions, newQuestion]);
        setExpandedQuestion(newQuestion.id);
    };

    const updateQuestion = (id: string, updates: Partial<QuizQuestion>) => {
        onChange(questions.map(q => q.id === id ? { ...q, ...updates } : q));
    };

    const deleteQuestion = (id: string) => {
        onChange(questions.filter(q => q.id !== id));
        if (expandedQuestion === id) {
            setExpandedQuestion(null);
        }
    };

    const addChoice = (questionId: string) => {
        const question = questions.find(q => q.id === questionId);
        if (question && question.choices.length < 6) {
            updateQuestion(questionId, { choices: [...question.choices, ''] });
        }
    };

    const updateChoice = (questionId: string, choiceIndex: number, value: string) => {
        const question = questions.find(q => q.id === questionId);
        if (question) {
            const newChoices = [...question.choices];
            newChoices[choiceIndex] = value;
            updateQuestion(questionId, { choices: newChoices });
        }
    };

    const deleteChoice = (questionId: string, choiceIndex: number) => {
        const question = questions.find(q => q.id === questionId);
        if (question && question.choices.length > 2) {
            const newChoices = question.choices.filter((_, i) => i !== choiceIndex);
            // Adjust correct_index if needed
            let newCorrectIndex = question.correct_index;
            if (choiceIndex === question.correct_index) {
                newCorrectIndex = 0;
            } else if (choiceIndex < question.correct_index) {
                newCorrectIndex = question.correct_index - 1;
            }
            updateQuestion(questionId, { choices: newChoices, correct_index: newCorrectIndex });
        }
    };

    const setCorrectAnswer = (questionId: string, index: number) => {
        updateQuestion(questionId, { correct_index: index });
    };

    const totalPoints = questions.reduce((sum, q) => sum + q.points, 0);
    const hasErrors = questions.some(q =>
        !q.question.trim() ||
        q.choices.some(c => !c.trim()) ||
        q.choices.length < 2
    );

    return (
        <div className="space-y-4">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h3 className="font-bold text-slate-800 flex items-center gap-2">
                        Quiz Builder
                        <span className="text-xs bg-purple-100 text-purple-700 px-2 py-0.5 rounded-full">
                            {questions.length} questions
                        </span>
                    </h3>
                    <p className="text-xs text-slate-500 mt-1">
                        Total: <span className="font-bold">{totalPoints} points</span>
                    </p>
                </div>
                <button
                    type="button"
                    onClick={addQuestion}
                    className="flex items-center gap-1.5 px-3 py-2 bg-purple-600 text-white rounded-lg text-xs font-bold hover:bg-purple-700 transition-colors"
                >
                    <Plus className="w-3.5 h-3.5" />
                    Add Question
                </button>
            </div>

            {/* Validation Warning */}
            {hasErrors && questions.length > 0 && (
                <div className="flex items-center gap-2 p-3 bg-amber-50 border border-amber-200 rounded-lg text-amber-700 text-xs">
                    <AlertCircle className="w-4 h-4 flex-shrink-0" />
                    <span>Some questions are incomplete. Fill in all fields before publishing.</span>
                </div>
            )}

            {/* Questions List */}
            <div className="space-y-3">
                {questions.length === 0 && (
                    <div className="text-center py-8 text-slate-400 border-2 border-dashed border-slate-200 rounded-xl">
                        <p className="font-medium">No questions yet</p>
                        <p className="text-xs mt-1">Click "Add Question" to get started</p>
                    </div>
                )}

                {questions.map((question, qIndex) => {
                    const isExpanded = expandedQuestion === question.id;
                    const hasQuestionError = !question.question.trim();
                    const hasChoiceErrors = question.choices.some(c => !c.trim());

                    return (
                        <div
                            key={question.id}
                            className={`border rounded-xl overflow-hidden transition-all ${isExpanded
                                ? 'border-purple-300 ring-2 ring-purple-100'
                                : 'border-slate-200 hover:border-slate-300'
                                }`}
                        >
                            {/* Question Header - Always visible */}
                            <div
                                onClick={() => setExpandedQuestion(isExpanded ? null : question.id)}
                                className="flex items-center gap-3 p-3 bg-white cursor-pointer group"
                            >
                                <div className="w-6 h-6 rounded-lg bg-purple-100 text-purple-600 flex items-center justify-center text-xs font-bold flex-shrink-0">
                                    {qIndex + 1}
                                </div>
                                <div className="flex-1 min-w-0">
                                    {question.question ? (
                                        <p className="font-medium text-slate-700 text-sm truncate">
                                            {question.question}
                                        </p>
                                    ) : (
                                        <p className="text-slate-400 text-sm italic">Untitled question</p>
                                    )}
                                    <div className="flex items-center gap-2 mt-0.5">
                                        <span className="text-[10px] text-slate-400">
                                            {question.choices.length} choices • {question.points} pts
                                        </span>
                                        {(hasQuestionError || hasChoiceErrors) && (
                                            <span className="text-[10px] text-amber-500 font-medium">
                                                Incomplete
                                            </span>
                                        )}
                                    </div>
                                </div>
                                <button
                                    type="button"
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        deleteQuestion(question.id);
                                    }}
                                    className="p-1.5 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-lg opacity-0 group-hover:opacity-100 transition-all"
                                >
                                    <Trash2 className="w-4 h-4" />
                                </button>
                            </div>

                            {/* Expanded Editor */}
                            {isExpanded && (
                                <div className="p-4 bg-slate-50 border-t border-slate-100 space-y-4">
                                    {/* Question Text */}
                                    <div>
                                        <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">
                                            Question
                                        </label>
                                        <input
                                            type="text"
                                            value={question.question}
                                            onChange={(e) => updateQuestion(question.id, { question: e.target.value })}
                                            placeholder="Enter your question..."
                                            className={`w-full p-2.5 border rounded-lg text-sm focus:ring-2 focus:ring-purple-500 outline-none ${hasQuestionError ? 'border-amber-300 bg-amber-50' : 'border-slate-200'
                                                }`}
                                        />
                                    </div>

                                    {/* Points */}
                                    <div className="flex items-center gap-3">
                                        <label className="text-[10px] font-bold text-slate-500 uppercase">
                                            Points
                                        </label>
                                        <input
                                            type="number"
                                            min="1"
                                            max="100"
                                            value={question.points}
                                            onChange={(e) => updateQuestion(question.id, { points: parseInt(e.target.value) || 1 })}
                                            className="w-20 p-2 border border-slate-200 rounded-lg text-sm text-center font-bold focus:ring-2 focus:ring-purple-500 outline-none"
                                        />
                                    </div>

                                    {/* Choices */}
                                    <div>
                                        <label className="block text-[10px] font-bold text-slate-500 uppercase mb-2">
                                            Choices (click to mark correct)
                                        </label>
                                        <div className="space-y-2">
                                            {question.choices.map((choice, cIndex) => {
                                                const isCorrect = question.correct_index === cIndex;
                                                const isEmpty = !choice.trim();

                                                return (
                                                    <div key={cIndex} className="flex items-center gap-2">
                                                        {/* Correct indicator */}
                                                        <button
                                                            type="button"
                                                            onClick={() => setCorrectAnswer(question.id, cIndex)}
                                                            className={`w-7 h-7 rounded-full flex items-center justify-center transition-all flex-shrink-0 ${isCorrect
                                                                ? 'bg-emerald-500 text-white'
                                                                : 'bg-white border-2 border-slate-200 text-slate-300 hover:border-emerald-300 hover:text-emerald-400'
                                                                }`}
                                                            title={isCorrect ? 'Correct answer' : 'Mark as correct'}
                                                        >
                                                            {isCorrect && <Check className="w-4 h-4" />}
                                                        </button>

                                                        {/* Choice input */}
                                                        <input
                                                            type="text"
                                                            value={choice}
                                                            onChange={(e) => updateChoice(question.id, cIndex, e.target.value)}
                                                            placeholder={`Choice ${cIndex + 1}`}
                                                            className={`flex-1 p-2.5 border rounded-lg text-sm focus:ring-2 focus:ring-purple-500 outline-none ${isEmpty ? 'border-amber-300 bg-amber-50' : 'border-slate-200'
                                                                } ${isCorrect ? 'bg-emerald-50 border-emerald-200' : ''}`}
                                                        />

                                                        {/* Delete choice */}
                                                        {question.choices.length > 2 && (
                                                            <button
                                                                type="button"
                                                                onClick={() => deleteChoice(question.id, cIndex)}
                                                                className="p-1.5 text-slate-300 hover:text-red-500 rounded-lg transition-colors"
                                                            >
                                                                <X className="w-4 h-4" />
                                                            </button>
                                                        )}
                                                    </div>
                                                );
                                            })}
                                        </div>

                                        {/* Add Choice Button */}
                                        {question.choices.length < 6 && (
                                            <button
                                                type="button"
                                                onClick={() => addChoice(question.id)}
                                                className="mt-2 text-xs text-purple-600 hover:text-purple-700 font-medium flex items-center gap-1"
                                            >
                                                <Plus className="w-3.5 h-3.5" />
                                                Add another choice
                                            </button>
                                        )}
                                    </div>
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
