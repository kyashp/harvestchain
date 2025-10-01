import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Card } from '../../components/ui/Card';
import { InsurancePolicy, User } from '../../types';
import { api } from '../../services/mockApiService';
import { getCreditScore } from '../../services/geminiService';
import { Spinner } from '../../components/ui/Spinner';


export const FinancialServices: React.FC<{ user: User }> = ({ user }) => {
    const [enrolledPolicies, setEnrolledPolicies] = useState<InsurancePolicy[]>([]);
    const [availablePolicies, setAvailablePolicies] = useState<InsurancePolicy[]>([]);
    const [creditScore, setCreditScore] = useState<number | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isEnrolling, setIsEnrolling] = useState<string | null>(null);

    const fetchData = useCallback(async () => {
        setIsLoading(true);
        const [enrolled, available, fishermanData] = await Promise.all([
            api.getEnrolledPolicies(user.id),
            api.getAvailablePolicies(),
            api.getFishermanDataForCreditScore(user.id)
        ]);

        const enrolledIds = new Set(enrolled.map(p => p.id));
        setEnrolledPolicies(enrolled);
        setAvailablePolicies(available.filter(p => !enrolledIds.has(p.id)));

        // Fetch credit score in parallel
        if (fishermanData) {
            const scoreData = await getCreditScore(fishermanData);
            setCreditScore(scoreData.score);
        }

        setIsLoading(false);
    }, [user.id]);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    const handleEnroll = async (policy: InsurancePolicy) => {
        setIsEnrolling(policy.id);
        try {
            await api.enrollInPolicy(user.id, policy.id);
            fetchData(); // Refresh all data
        } catch (error) {
            console.error("Failed to enroll", error);
        } finally {
            setIsEnrolling(null);
        }
    };
    
    const maxLoanAmount = useMemo(() => {
        if (!creditScore) return 0;
        // Simple formula: for every point above 400, you can borrow 50 PHP.
        const loanable = (creditScore - 400) * 50;
        return loanable > 0 ? loanable : 0;
    }, [creditScore]);

    if (isLoading && enrolledPolicies.length === 0) {
        return <div className="flex justify-center mt-8"><Spinner /></div>;
    }

    return (
        <div className="space-y-8">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2 space-y-8">
                    <div>
                        <h2 className="text-2xl font-bold text-gray-800">Your Enrolled Policies</h2>
                        {enrolledPolicies.length > 0 ? (
                            <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-6">
                                {enrolledPolicies.map(policy => (
                                    <Card key={policy.id} className="bg-blue-50 border border-blue-200 min-w-0">
                                        <h3 className="font-bold text-blue-800">{policy.name}</h3>
                                        <p className="text-sm text-gray-600 mt-2">{policy.description}</p>
                                        <div className="mt-4 flex justify-between items-end">
                                            <div>
                                                <p className="text-xs text-gray-500">Coverage</p>
                                                <p className="font-semibold text-lg text-green-700">PHP {policy.coverage.toLocaleString()}</p>
                                            </div>
                                            <span className="px-3 py-1 text-xs font-semibold text-green-800 bg-green-200 rounded-full">ACTIVE</span>
                                        </div>
                                    </Card>
                                ))}
                            </div>
                        ) : (
                            <Card className="mt-4">
                                <p className="text-gray-500">You are not enrolled in any insurance policies yet.</p>
                            </Card>
                        )}
                    </div>

                    <div>
                        <h2 className="text-2xl font-bold text-gray-800">Available Pooled Insurance</h2>
                        <p className="mt-1 text-gray-600">Protect your livelihood with community-backed insurance.</p>
                        {availablePolicies.length > 0 ? (
                            <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-6">
                                {availablePolicies.map(policy => (
                                    <Card key={policy.id} className="flex flex-col justify-between hover:shadow-lg transition-shadow min-w-0">
                                        <div>
                                            <h3 className="font-bold text-gray-800">{policy.name}</h3>
                                            <p className="text-sm text-gray-600 mt-2 h-20">{policy.description}</p>
                                            <div className="mt-4 grid grid-cols-2 gap-4 text-center">
                                                <div>
                                                    <p className="text-xs text-gray-500">Premium</p>
                                                    <p className="font-semibold text-lg text-red-600">PHP {policy.premium.toLocaleString()}</p>
                                                </div>
                                                <div>
                                                    <p className="text-xs text-gray-500">Coverage</p>
                                                    <p className="font-semibold text-lg text-green-700">PHP {policy.coverage.toLocaleString()}</p>
                                                </div>
                                            </div>
                                        </div>
                                        <button
                                            onClick={() => handleEnroll(policy)}
                                            disabled={isEnrolling === policy.id}
                                            className="mt-6 w-full py-2 px-4 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition disabled:bg-blue-300"
                                        >
                                            {isEnrolling === policy.id ? <Spinner className="w-5 h-5 mx-auto" /> : 'Enroll Now'}
                                        </button>
                                    </Card>
                                ))}
                            </div>
                        ) : (
                            <Card className="mt-4">
                                <p className="text-gray-500">There are no new insurance policies available for enrollment.</p>
                            </Card>
                        )}
                    </div>
                </div>
                
                {/* Pooled Lending Section */}
                <div className="space-y-6">
                     <h2 className="text-2xl font-bold text-gray-800">Pooled Lending</h2>
                    <Card>
                        <div className="flex items-center mb-4">
                            <img src="/financial-services.svg" alt="Cash" className="w-8 h-8 mr-3" />
                            <h3 className="text-xl font-bold text-gray-800">Loan Eligibility</h3>
                        </div>
                        <p className="text-sm text-gray-600 mb-4">Your loan eligibility is determined by your AI-powered credit score. A higher score unlocks larger loan amounts.</p>
                        
                        {isLoading ? <Spinner /> : (
                            <div className="space-y-4 text-center">
                                <div>
                                    <p className="text-sm text-gray-500">Your Credit Score</p>
                                    <p className="text-3xl font-bold text-blue-600">{creditScore ?? 'N/A'}</p>
                                </div>
                                <div className="p-4 bg-blue-50 rounded-lg">
                                    <p className="text-sm text-blue-800">Maximum Loanable Amount</p>
                                    <p className="text-2xl font-bold text-green-700">PHP {maxLoanAmount.toLocaleString()}</p>
                                </div>
                                <button
                                    disabled={maxLoanAmount <= 0}
                                    className="w-full py-2 px-4 bg-green-600 text-white font-semibold rounded-lg hover:bg-green-700 transition disabled:bg-gray-300 disabled:cursor-not-allowed"
                                >
                                    Apply for Loan
                                </button>
                            </div>
                        )}
                    </Card>
                </div>
            </div>
        </div>
    );
};