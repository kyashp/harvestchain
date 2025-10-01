import React, { useState, useEffect } from 'react';
import { User, FutureContract } from '../../types';
import { Card } from '../../components/ui/Card';

import { api } from '../../services/mockApiService';
import { Spinner } from '../../components/ui/Spinner';


const QuickActionButton: React.FC<{
    icon: string,
    label: string,
    onClick: () => void,
    description: string,
}> = ({ icon, label, onClick, description }) => (
    <button onClick={onClick} className="text-left p-4 rounded-lg hover:bg-gray-100 transition w-full">
        <div className="flex items-center">
            <div className="bg-blue-100 p-3 rounded-full">
                <img src={icon} alt={label} className="w-6 h-6" />
            </div>
            <div className="ml-4">
                <h3 className="font-semibold text-gray-800">{label}</h3>
                <p className="text-sm text-gray-500">{description}</p>
            </div>
        </div>
    </button>
);


export const DashboardHome: React.FC<{ user: User, setActivePage: (page: string) => void }> = ({ user, setActivePage }) => {
    const [contracts, setContracts] = useState<FutureContract[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchContracts = async () => {
            setIsLoading(true);
            const myContracts = await api.getBuyerContracts(user.name);
            setContracts(myContracts.filter(c => c.status === 'OPEN' || c.status === 'PARTIALLY_ACCEPTED'));
            setIsLoading(false);
        };
        fetchContracts();
    }, [user.name]);

    const totalValue = contracts.reduce((sum, c) => sum + (c.originalQuantityKg * c.pricePerKg), 0);
    
    return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-800">Welcome, {user.name}!</h1>
        <p className="text-gray-600 mt-1">Manage your seafood procurement seamlessly.</p>
      </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card className="md:col-span-2">
                <h2 className="text-xl font-bold text-gray-800 mb-4">Quick Actions</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <QuickActionButton
                        icon="/createFuture.svg"
                        label="Create New Future"
                        description="Post a new buy order"
                        onClick={() => setActivePage('createFuture')}
                    />
                    <QuickActionButton
                        icon="/myContracts.svg"
                        label="Manage Contracts"
                        description="View all your futures"
                        onClick={() => setActivePage('activeFutures')}
                    />
                </div>
            </Card>
             <Card>
                <h2 className="text-xl font-bold text-gray-800 mb-4">Active Contracts Summary</h2>
                {isLoading ? <div className="flex justify-center"><Spinner/></div> : (
                     <div className="space-y-4">
                        <div>
                            <p className="text-sm text-gray-500">Open & Partial Contracts</p>
                            <p className="text-3xl font-bold text-blue-600">
                                {contracts.length}
                            </p>
                        </div>
                        <div>
                            <p className="text-sm text-gray-500">Total Value of Active Contracts</p>
                            <p className="text-2xl font-bold text-green-600">
                                PHP {totalValue.toLocaleString()}
                            </p>
                        </div>
                    </div>
                )}
            </Card>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
             <Card>
                <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center">
                    <img src="/wallet.svg" alt="Wallet" className="w-6 h-6 mr-2" />
                    My Wallet
                </h2>
                <div className="space-y-4">
                    <div>
                        <p className="text-sm text-gray-500">Current Balance</p>
                        <p className="text-2xl font-bold text-green-600">
                            PHP {user.wallet?.balance.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </p>
                    </div>
                     <div>
                        <p className="text-sm text-gray-500">Wallet Address</p>
                        <p className="text-xs font-mono text-gray-700 bg-gray-100 p-2 rounded break-all">
                            {user.wallet?.address}
                        </p>
                    </div>
                    <div>
                        <p className="text-sm text-gray-500">Self Sovereign Identity DID</p>
                        <p className="text-xs font-mono text-gray-700 bg-gray-100 p-2 rounded break-all">
                            {user.did || 'N/A'}
                        </p>
                    </div>
                    <div className="flex space-x-4">
                        <button
                            className="flex-1 py-2 px-4 bg-green-500 text-white font-semibold rounded-lg hover:bg-green-600 transition"
                            onClick={() => alert('Deposit functionality coming soon')}
                        >
                            Deposit
                        </button>
                        <button
                            className="flex-1 py-2 px-4 bg-red-500 text-white font-semibold rounded-lg hover:bg-red-600 transition"
                            onClick={() => alert('Withdraw functionality coming soon')}
                        >
                            Withdraw
                        </button>
                    </div>
                </div>
            </Card>
        </div>
    </div>
  );
};
