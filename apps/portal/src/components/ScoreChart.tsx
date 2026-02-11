"use client";

import React from 'react';
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    Cell
} from 'recharts';

interface ScoreChartProps {
    data: { index: number; prob: number }[];
}

const ScoreChart: React.FC<ScoreChartProps> = ({ data }) => {
    if (!data || data.length === 0) return null;

    return (
        <div className="w-full mt-4 block overflow-hidden">
            <ResponsiveContainer width="100%" aspect={2.5}>
                <BarChart data={data} margin={{ top: 10, right: 10, left: 10, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#334155" />
                    <XAxis dataKey="index" hide />
                    <YAxis domain={[0, 1]} hide />
                    <Tooltip
                        cursor={{ fill: 'rgba(255, 255, 255, 0.05)' }}
                        contentStyle={{
                            backgroundColor: '#0F172A',
                            borderRadius: '12px',
                            border: '1px solid #334155',
                            boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.5)',
                            padding: '12px'
                        }}
                        itemStyle={{ color: '#fff', fontSize: '12px', fontWeight: 'bold' }}
                        labelStyle={{ color: '#94a3b8', fontSize: '10px', marginBottom: '4px', textTransform: 'uppercase' }}
                        labelFormatter={(label) => `Segment ${Number(label) + 1}`}
                        formatter={(value: number | undefined) => [`${((value || 0) * 100).toFixed(1)}%`, 'AI Probability']}
                    />
                    <Bar dataKey="prob" radius={[6, 6, 0, 0]}>
                        {data.map((entry, index) => (
                            <Cell
                                key={`cell-${index}`}
                                fill={entry.prob > 0.8 ? '#ef4444' : entry.prob > 0.5 ? '#f59e0b' : '#10b981'}
                            />
                        ))}
                    </Bar>
                </BarChart>
            </ResponsiveContainer>
        </div>
    );
};

export default ScoreChart;
