import React, { useState, useEffect, useCallback } from 'react';
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';
import { Card } from '../../components/ui/Card';
import { Spinner } from '../../components/ui/Spinner';
import { getCreditScore } from '../../services/geminiService';
import { api } from '../../services/mockApiService';
import { CreditScoreData, User } from '../../types';

const ScoreGauge: React.FC<{ score: number }> = ({ score }) => {
    const percentage = ((score - 300) / (850 - 300)) * 100;
    const rotation = (percentage / 100) * 180 - 90;
    const color = score < 580 ? 'text-red-500' : score < 670 ? 'text-yellow-500' : 'text-green-500';

    return (
        <div className="relative w-64 h-32 mx-auto">
            <div className="absolute w-full h-full rounded-t-full border-t-4 border-r-4 border-l-4 border-gray-200" style={{ clipPath: 'inset(0 0 0 0 round 128px 128px 0 0)' }}></div>
             <div className="absolute w-full h-full rounded-t-full border-t-4 border-r-4 border-l-4 border-green-500" style={{ clipPath: `inset(0 ${100 - (670-300)/(850-300)*100}% 0 0 round 128px 128px 0 0)` }}></div>
            <div className="absolute w-full h-full rounded-t-full border-t-4 border-r-4 border-l-4 border-yellow-500" style={{ clipPath: `inset(0 ${100 - (580-300)/(850-300)*100}% 0 0 round 128px 128px 0 0)` }}></div>
            <div className="absolute w-full h-full rounded-t-full border-t-4 border-r-4 border-l-4 border-red-500" style={{ clipPath: 'inset(0 100% 0 0 round 128px 128px 0 0)' }}></div>
            <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 transition-transform duration-1000" style={{ transform: `translateX(-50%) rotate(${rotation}deg)`, transformOrigin: 'bottom center' }}>
                <div className="w-1 h-28 bg-gray-700 rounded-t-full"></div>
                <div className="absolute -bottom-2 -left-2 w-4 h-4 bg-gray-800 rounded-full border-2 border-white"></div>
            </div>
            <div className="absolute bottom-0 left-1/2 -translate-x-1/2">
                <span className={`text-4xl font-bold ${color}`}>{score}</span>
                <p className="text-sm text-gray-500">Credit Score</p>
            </div>
             <span className="absolute bottom-1 left-2 text-xs text-gray-500">300</span>
             <span className="absolute bottom-1 right-2 text-xs text-gray-500">850</span>
        </div>
    );
};

export const CreditScore: React.FC<{ user: User }> = ({ user }) => {
    const [scoreData, setScoreData] = useState<CreditScoreData | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    const fetchScore = useCallback(async () => {
        setIsLoading(true);
        const fishermanData = await api.getFishermanDataForCreditScore(user.id);
        const data = await getCreditScore(fishermanData);
        setScoreData(data);
        setIsLoading(false);
    }, [user.id]);

    useEffect(() => {
        fetchScore();
    }, [fetchScore]);

    if (isLoading) {
        return (
            <div className="flex flex-col items-center justify-center h-full">
                <Spinner />
                <p className="mt-4 text-gray-600">Calculating your AI-powered credit score...</p>
            </div>
        );
    }

    if (!scoreData) {
        return <Card><p>Could not load credit score data.</p></Card>;
    }

    return (
        <div className="space-y-6">
            {scoreData && scoreData.score < 500 && (
                <Card className="bg-red-50 border-red-500 border">
                    <h3 className="text-lg font-semibold text-red-800">Account Restricted</h3>
                    <p className="text-red-700 mt-1">Your credit score is below the required minimum. You are temporarily unable to accept new contracts. Please improve your score by completing existing contracts successfully and avoiding declines.</p>
                </Card>
            )}
            <Card className="text-center">
                <h2 className="text-2xl font-bold text-gray-800 mb-4">Your Financial Reputation</h2>
                <ScoreGauge score={scoreData.score} />
                <button onClick={fetchScore} className="mt-6 px-6 py-2 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition">
                    Recalculate Score
                </button>
            </Card>


        </div>
    );
};