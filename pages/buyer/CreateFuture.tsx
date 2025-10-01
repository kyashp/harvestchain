import React, { useState, useMemo } from 'react';
import { Card } from '../../components/ui/Card';
import { Spinner } from '../../components/ui/Spinner';
import { api } from '../../services/mockApiService';
import { User } from '../../types';

export const CreateFuture: React.FC<{ user: User, onFutureCreated: () => void }> = ({ user, onFutureCreated }) => {
    const [fishType, setFishType] = useState('Tuna (Yellowfin)');
    const [quantity, setQuantity] = useState(100);
    const [price, setPrice] = useState(250);
    const [date, setDate] = useState(new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]);
    const [isLoading, setIsLoading] = useState(false);
    const [successMessage, setSuccessMessage] = useState('');

    const escrowAmount = useMemo(() => quantity * price, [quantity, price]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setSuccessMessage('');

        await api.createFuture({
            buyerName: user.name,
            fishType: fishType,
            originalQuantityKg: quantity,
            pricePerKg: price,
            deliveryDate: date,
        }, user.id);
        
        setIsLoading(false);
        setSuccessMessage(`Successfully created a futures contract for ${quantity}kg of ${fishType}!`);
        onFutureCreated();

        // reset form
        setFishType('Tuna (Yellowfin)');
        setQuantity(100);
        setPrice(250);
        setDate(new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]);
    };

    return (
        <Card className="max-w-2xl mx-auto">
            <h2 className="text-2xl font-bold text-gray-800 mb-2">Create a Micro-Future Contract</h2>
            <p className="text-gray-600 mb-6">Post a buy order on the market. This will be visible to all fishermen on the platform.</p>

            <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                    <label htmlFor="fishType" className="block text-sm font-medium text-gray-700">Fish Type</label>
                    <select id="fishType" value={fishType} onChange={e => setFishType(e.target.value)} className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md">
                        <option>Tuna (Yellowfin)</option>
                        <option>Grouper (Lapu-Lapu)</option>
                        <option>Mackerel (Galunggong)</option>
                        <option>Sardines</option>
                    </select>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                     <div>
                        <label htmlFor="quantity" className="block text-sm font-medium text-gray-700">Quantity (kg)</label>
                        <input type="number" id="quantity" value={quantity} onChange={e => setQuantity(Number(e.target.value))} required min="1" className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500" />
                    </div>
                     <div>
                        <label htmlFor="price" className="block text-sm font-medium text-gray-700">Price per kg (PHP)</label>
                        <input type="number" id="price" value={price} onChange={e => setPrice(Number(e.target.value))} required min="1" className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500" />
                    </div>
                </div>

                <div>
                    <label htmlFor="date" className="block text-sm font-medium text-gray-700">Delivery Date</label>
                    <input type="date" id="date" value={date} onChange={e => setDate(e.target.value)} required min={new Date().toISOString().split('T')[0]} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500" />
                </div>

                <div className="mt-4 p-4 bg-blue-50 rounded-lg text-center">
                    <p className="text-sm text-blue-700">Required Escrow Deposit (100% of value)</p>
                    <p className="text-xl font-bold text-blue-900">PHP {escrowAmount.toLocaleString()}</p>
                </div>

                <div className="pt-4">
                     <button type="submit" disabled={isLoading} className="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:bg-blue-300">
                        {isLoading ? <Spinner className="w-5 h-5 text-white" /> : 'Deposit Escrow & Post Contract'}
                    </button>
                </div>
            </form>

            {successMessage && (
                <div className="mt-6 p-4 bg-green-50 rounded-lg text-center text-green-800 font-medium">
                    {successMessage}
                </div>
            )}
        </Card>
    );
};