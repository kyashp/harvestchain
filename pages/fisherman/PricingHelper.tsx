import React, { useState } from 'react';
import { Card } from '../../components/ui/Card';
import { Spinner } from '../../components/ui/Spinner';
import { getFishPriceRecommendation } from '../../services/geminiService';


export const PricingHelper: React.FC = () => {
    const [fishType, setFishType] = useState('Tuna (Yellowfin)');
    const [season, setSeason] = useState('Peak Season');
    const [location, setLocation] = useState('Mindoro');
    const [recommendation, setRecommendation] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setRecommendation('');
        const result = await getFishPriceRecommendation(fishType, season, location);
        setRecommendation(result);
        setIsLoading(false);
    };

    return (
        <div className="max-w-4xl mx-auto">
            <Card>
                 <h2 className="text-2xl font-bold text-gray-800 mb-2">AI Pricing Helper</h2>
                 <p className="text-gray-600 mb-6">Get AI-powered price recommendations to ensure you get a fair price for your catch, fighting information asymmetry.</p>
                
                <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
                    <div>
                        <label htmlFor="fishType" className="block text-sm font-medium text-gray-700">Fish Type</label>
                        <select id="fishType" value={fishType} onChange={e => setFishType(e.target.value)} className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md">
                            <option>Tuna (Yellowfin)</option>
                            <option>Grouper (Lapu-Lapu)</option>
                            <option>Mackerel (Galunggong)</option>
                            <option>Sardines</option>
                        </select>
                    </div>
                     <div>
                        <label htmlFor="season" className="block text-sm font-medium text-gray-700">Season</label>
                        <select id="season" value={season} onChange={e => setSeason(e.target.value)} className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md">
                            <option>Peak Season</option>
                            <option>Off-Peak Season</option>
                        </select>
                    </div>
                     <div>
                        <label htmlFor="location" className="block text-sm font-medium text-gray-700">Region</label>
                         <select id="location" value={location} onChange={e => setLocation(e.target.value)} className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md">
                            <option>Mindoro</option>
                            <option>Palawan</option>
                             <option>General Santos</option>
                        </select>
                    </div>
                    <button type="submit" disabled={isLoading} className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:bg-blue-300">
                        {isLoading ? <Spinner className="w-5 h-5 text-white" /> : 'Get Recommendation'}
                    </button>
                </form>

                {(isLoading || recommendation) && (
                    <div className="mt-6 p-6 bg-blue-50 rounded-lg">
                        {isLoading && (
                            <div className="flex items-center">
                                <Spinner className="w-6 h-6 mr-3"/>
                                <p className="text-blue-800">The AI is analyzing market data...</p>
                            </div>
                        )}
                        {recommendation && (
                             <div className="flex items-start">
                                <img src="/aiPricingHelper.svg" alt="Price" className="w-8 h-8 mr-4 flex-shrink-0 mt-1" />
                                <div>
                                    <h3 className="text-lg font-semibold text-blue-900">AI Recommendation</h3>
                                    <p className="text-blue-800 whitespace-pre-wrap">{recommendation}</p>
                                </div>
                            </div>
                        )}
                    </div>
                )}
            </Card>
        </div>
    );
};
