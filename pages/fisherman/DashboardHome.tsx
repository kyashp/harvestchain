import React from 'react';
import { User } from '../../types';
import { Card } from '../../components/ui/Card';


interface DashboardHomeProps {
  user: User;
  setActivePage: (page: string) => void;
}

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


export const DashboardHome: React.FC<DashboardHomeProps> = ({ user, setActivePage }) => {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-800">Welcome back, {user.name.split(' ')[0]}!</h1>
        <p className="text-gray-600 mt-1">Here's your overview for today.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="md:col-span-2">
            <h2 className="text-xl font-bold text-gray-800 mb-4">Quick Actions</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <QuickActionButton
                    icon="/futuresMarket.svg"
                    label="Find Futures"
                    description="Accept new contracts"
                    onClick={() => setActivePage('futuresMarket')}
                />
                 <QuickActionButton
                    icon="/myContracts.svg"
                    label="Manage My Contracts"
                    description="View your accepted contracts"
                    onClick={() => setActivePage('myContracts')}
                />
                 <QuickActionButton
                    icon="/credit-score.svg"
                    label="Check Credit Score"
                    description="See your financial reputation"
                    onClick={() => setActivePage('creditScore')}
                />
                 <QuickActionButton
                    icon="/financial-services.svg"
                    label="Enroll in Services"
                    description="Get insurance or loans"
                    onClick={() => setActivePage('financialServices')}
                />
            </div>
        </Card>
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
                    <p className="text-sm text-gray-500">Self Sovereign Identity (SSI)</p>
                    <p className="text-xs font-mono text-gray-700 bg-gray-100 p-2 rounded break-all">
                        {user.did || 'did:example:12345'}
                    </p>
                </div>
                <button 
                    className="w-full py-2 px-4 bg-green-600 text-white font-semibold rounded-lg hover:bg-green-700 transition"
                    onClick={() => alert('Withdraw with GCash functionality not implemented yet.')}
                >
                    Withdraw with GCash
                </button>
            </div>
        </Card>
      </div>
    </div>
  );
};
