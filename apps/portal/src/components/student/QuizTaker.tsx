'use client';

import { useState, useEffect } from 'react';
import { CheckCircle, ChevronLeft, ChevronRight, AlertCircle, Clock, Award } from 'lucide-react';
import { QuizQuestion, QuizData, QuizSubmission } from '@/types/json-schemas';

interface QuizTakerProps {
    quizData: QuizData;
    onSubmit: (responses: Record<string, number>, score: number) => void;
    isSubmitting?: boolean;
}

export default function QuizTaker({ quizData, onSubmit, isSubmitting }: QuizTakerProps) {
    const [responses, setResponses] = useState<Record<string, number>>({});
    const [currentIndex, setCurrentIndex] = useState(0);
    const [showConfirm, setShowConfirm] = useState(false);
    const [startTime] = useState<number>(Date.now());

    const questions = quizData.questions;
    const currentQuestion = questions[currentIndex];
    const totalQuestions = questions.length;

    // Check if all questions are answered
    const answeredCount = Object.keys(responses).length;
    const allAnswered = answeredCount === totalQuestions;
    const unansweredQuestions = questions.filter(q => responses[q.id] === undefined);

    const selectAnswer = (questionId: string, choiceIndex: number) => {
        setResponses({ ...responses, [questionId]: choiceIndex });
    };

    const goToQuestion = (index: number) => {
        if (index >= 0 && index < totalQuestions) {
            setCurrentIndex(index);
        }
    };

    const calculateScore = (): number => {
        let score = 0;
        questions.forEach(q => {
            if (responses[q.id] === q.correct_index) {
                score += q.points;
            }
        });
        return score;
    };

    const handleSubmit = () => {
        const score = calculateScore();
        onSubmit(responses, score);
    };

    const totalPoints = questions.reduce((sum, q) => sum + q.points, 0);

    return (
        <div className="space-y-6">
            {/* Progress Header */}
            <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-sm">
                <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                        <Clock className="w-4 h-4 text-slate-400" />
                        <span className="text-xs font-medium text-slate-500">
                            {answeredCount} of {totalQuestions} answered
                        </span>
                    </div>
                    <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-purple-600">
                            {totalPoints} points total
                        </span>
                    </div>
                </div>

                {/* Question Pills */}
                <div className="flex flex-wrap gap-2">
                    {questions.map((q, idx) => {
                        const isAnswered = responses[q.id] !== undefined;
                        const isCurrent = idx === currentIndex;

                        return (
                            <button
                                key={q.id}
                                onClick={() => goToQuestion(idx)}
                                className={`
                                    w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all
                                    ${isCurrent
                                        ? 'bg-purple-600 text-white ring-2 ring-purple-300'
                                        : isAnswered
                                            ? 'bg-emerald-100 text-emerald-700 border border-emerald-200'
                                            : 'bg-slate-100 text-slate-500 border border-slate-200 hover:bg-slate-200'
                                    }
                                `}
                            >
                                {idx + 1}
                            </button>
                        );
                    })}
                </div>
            </div>

            {/* Current Question */}
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                <div className="p-6">
                    <div className="flex items-center gap-2 mb-4">
                        <span className="px-2 py-1 bg-purple-100 text-purple-700 rounded-lg text-xs font-bold">
                            Question {currentIndex + 1} of {totalQuestions}
                        </span>
                        <span className="px-2 py-1 bg-slate-100 text-slate-600 rounded-lg text-xs font-bold">
                            {currentQuestion.points} pts
                        </span>
                    </div>

                    <h2 className="text-lg font-bold text-slate-900 mb-6">
                        {currentQuestion.question}
                    </h2>

                    {/* Choices */}
                    <div className="space-y-3">
                        {currentQuestion.choices.map((choice, idx) => {
                            const isSelected = responses[currentQuestion.id] === idx;

                            return (
                                <button
                                    key={idx}
                                    onClick={() => selectAnswer(currentQuestion.id, idx)}
                                    className={`
                                        w-full flex items-center gap-3 p-4 rounded-xl border-2 text-left transition-all
                                        ${isSelected
                                            ? 'border-purple-500 bg-purple-50 ring-2 ring-purple-100'
                                            : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50'
                                        }
                                    `}
                                >
                                    <div className={`
                                        w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 transition-all
                                        ${isSelected
                                            ? 'bg-purple-600 text-white'
                                            : 'bg-white border-2 border-slate-300'
                                        }
                                    `}>
                                        {isSelected && <CheckCircle className="w-4 h-4" />}
                                    </div>
                                    <span className={`font-medium ${isSelected ? 'text-purple-900' : 'text-slate-700'}`}>
                                        {choice}
                                    </span>
                                </button>
                            );
                        })}
                    </div>
                </div>

                {/* Navigation Footer */}
                <div className="px-6 py-4 bg-slate-50 border-t border-slate-100 flex items-center justify-between">
                    <button
                        onClick={() => goToQuestion(currentIndex - 1)}
                        disabled={currentIndex === 0}
                        className="flex items-center gap-1 px-4 py-2 text-slate-500 hover:text-slate-700 font-bold text-sm disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                    >
                        <ChevronLeft className="w-4 h-4" /> Previous
                    </button>

                    {currentIndex === totalQuestions - 1 ? (
                        <button
                            onClick={() => setShowConfirm(true)}
                            className="flex items-center gap-2 px-6 py-2.5 bg-purple-600 hover:bg-purple-700 text-white rounded-xl font-bold text-sm transition-all shadow-md"
                        >
                            Submit Quiz
                        </button>
                    ) : (
                        <button
                            onClick={() => goToQuestion(currentIndex + 1)}
                            className="flex items-center gap-1 px-4 py-2 text-purple-600 hover:text-purple-700 font-bold text-sm transition-colors"
                        >
                            Next <ChevronRight className="w-4 h-4" />
                        </button>
                    )}
                </div>
            </div>

            {/* Submit Confirmation Modal */}
            {showConfirm && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
                    <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full overflow-hidden animate-in fade-in zoom-in-95">
                        <div className="p-6">
                            <div className="w-12 h-12 rounded-full bg-purple-100 flex items-center justify-center mx-auto mb-4">
                                <Award className="w-6 h-6 text-purple-600" />
                            </div>
                            <h3 className="text-xl font-bold text-slate-900 text-center mb-2">
                                Ready to Submit?
                            </h3>
                            {!allAnswered && (
                                <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 mb-4">
                                    <div className="flex items-start gap-2">
                                        <AlertCircle className="w-5 h-5 text-amber-500 flex-shrink-0 mt-0.5" />
                                        <div>
                                            <p className="font-bold text-amber-700 text-sm">Heads up!</p>
                                            <p className="text-amber-600 text-xs mt-1">
                                                You have {unansweredQuestions.length} unanswered question(s).
                                                Unanswered questions will be marked as incorrect.
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            )}
                            <p className="text-slate-500 text-center text-sm">
                                You've answered <span className="font-bold">{answeredCount}</span> of <span className="font-bold">{totalQuestions}</span> questions.
                                Once submitted, you cannot change your answers.
                            </p>
                        </div>
                        <div className="px-6 py-4 bg-slate-50 border-t border-slate-100 flex gap-3">
                            <button
                                onClick={() => setShowConfirm(false)}
                                className="flex-1 px-4 py-2.5 text-slate-500 hover:text-slate-700 font-bold text-sm transition-colors"
                            >
                                Review Answers
                            </button>
                            <button
                                onClick={handleSubmit}
                                disabled={isSubmitting}
                                className="flex-1 px-4 py-2.5 bg-purple-600 hover:bg-purple-700 text-white rounded-xl font-bold text-sm transition-all disabled:opacity-50"
                            >
                                {isSubmitting ? 'Submitting...' : 'Submit Quiz'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
