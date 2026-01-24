'use client';

import { CheckCircle, XCircle, HelpCircle } from 'lucide-react';
import { QuizQuestion, QuizData, QuizSubmission } from '@/types/json-schemas';

interface QuizResultsProps {
    quizData: QuizData;
    submission: QuizSubmission;
    maxPoints: number;
}

export default function QuizResults({ quizData, submission, maxPoints }: QuizResultsProps) {
    const questions = quizData.questions;
    const responses = submission.quiz_responses;
    const score = submission.auto_score;

    // Calculate stats
    let correctCount = 0;
    let incorrectCount = 0;
    let unansweredCount = 0;

    questions.forEach(q => {
        const response = responses[q.id];
        if (response === undefined) {
            unansweredCount++;
        } else if (response === q.correct_index) {
            correctCount++;
        } else {
            incorrectCount++;
        }
    });

    const percentage = maxPoints > 0 ? Math.round((score / maxPoints) * 100) : 0;

    return (
        <div className="space-y-6">
            {/* Score Summary */}
            <div className="bg-gradient-to-br from-purple-50 to-indigo-50 rounded-2xl p-6 border border-purple-100">
                <div className="flex items-center justify-between mb-4">
                    <h3 className="font-bold text-purple-900 text-lg">Quiz Results</h3>
                    <div className="text-right">
                        <div className="text-3xl font-black text-purple-700">
                            {score} / {maxPoints}
                        </div>
                        <div className="text-sm font-bold text-purple-500">{percentage}%</div>
                    </div>
                </div>

                {/* Stats Row */}
                <div className="flex gap-4">
                    <div className="flex items-center gap-2 px-3 py-1.5 bg-emerald-100 text-emerald-700 rounded-lg text-sm font-bold">
                        <CheckCircle className="w-4 h-4" />
                        {correctCount} Correct
                    </div>
                    <div className="flex items-center gap-2 px-3 py-1.5 bg-red-100 text-red-700 rounded-lg text-sm font-bold">
                        <XCircle className="w-4 h-4" />
                        {incorrectCount} Incorrect
                    </div>
                    {unansweredCount > 0 && (
                        <div className="flex items-center gap-2 px-3 py-1.5 bg-slate-100 text-slate-600 rounded-lg text-sm font-bold">
                            <HelpCircle className="w-4 h-4" />
                            {unansweredCount} Skipped
                        </div>
                    )}
                </div>
            </div>

            {/* Question Breakdown */}
            <div className="space-y-3">
                <h4 className="font-bold text-slate-700 text-sm uppercase tracking-wider">Response Breakdown</h4>

                {questions.map((question, idx) => {
                    const selectedIndex = responses[question.id];
                    const isCorrect = selectedIndex === question.correct_index;
                    const wasAnswered = selectedIndex !== undefined;

                    return (
                        <div
                            key={question.id}
                            className={`rounded-xl border p-4 ${!wasAnswered
                                    ? 'bg-slate-50 border-slate-200'
                                    : isCorrect
                                        ? 'bg-emerald-50 border-emerald-200'
                                        : 'bg-red-50 border-red-200'
                                }`}
                        >
                            <div className="flex items-start gap-3">
                                {/* Status Icon */}
                                <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${!wasAnswered
                                        ? 'bg-slate-200 text-slate-500'
                                        : isCorrect
                                            ? 'bg-emerald-500 text-white'
                                            : 'bg-red-500 text-white'
                                    }`}>
                                    {!wasAnswered ? (
                                        <HelpCircle className="w-4 h-4" />
                                    ) : isCorrect ? (
                                        <CheckCircle className="w-4 h-4" />
                                    ) : (
                                        <XCircle className="w-4 h-4" />
                                    )}
                                </div>

                                {/* Question Content */}
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2 mb-1">
                                        <span className="text-xs font-bold text-slate-400">Q{idx + 1}</span>
                                        <span className="text-xs font-bold text-slate-500">{question.points} pts</span>
                                    </div>
                                    <p className="font-medium text-slate-800 text-sm mb-2">
                                        {question.question}
                                    </p>

                                    {/* Choices */}
                                    <div className="space-y-1">
                                        {question.choices.map((choice, cIdx) => {
                                            const isSelected = selectedIndex === cIdx;
                                            const isCorrectChoice = question.correct_index === cIdx;

                                            return (
                                                <div
                                                    key={cIdx}
                                                    className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs ${isCorrectChoice
                                                            ? 'bg-emerald-100 text-emerald-700 font-bold'
                                                            : isSelected
                                                                ? 'bg-red-100 text-red-700 font-bold'
                                                                : 'bg-white text-slate-600'
                                                        }`}
                                                >
                                                    {isCorrectChoice && <CheckCircle className="w-3 h-3" />}
                                                    {isSelected && !isCorrectChoice && <XCircle className="w-3 h-3" />}
                                                    <span>{choice}</span>
                                                    {isSelected && <span className="ml-auto text-[10px] uppercase tracking-wider opacity-70">Selected</span>}
                                                    {isCorrectChoice && <span className="ml-auto text-[10px] uppercase tracking-wider opacity-70">Correct</span>}
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>

                                {/* Points */}
                                <div className={`text-right flex-shrink-0 ${isCorrect ? 'text-emerald-600' : 'text-slate-400'
                                    }`}>
                                    <div className="font-bold text-lg">
                                        {isCorrect ? `+${question.points}` : '0'}
                                    </div>
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
