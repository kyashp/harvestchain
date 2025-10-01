import React, { useState } from 'react';
import { User } from '../../types';
import { DashboardLayout } from '../../components/layout/DashboardLayout';
import { MyContracts } from './MyContracts';
import { FuturesMarket } from './FuturesMarket';
import { CreditScore } from './CreditScore';
import { PricingHelper } from './PricingHelper';
import { FinancialServices } from './FinancialServices';
import { DashboardHome } from './DashboardHome';
import { CreateFuture } from './CreateFuture';


interface FishermanDashboardProps {
  user: User;
  onLogout: () => void;
}

const navItems = [
    { id: 'dashboard', label: 'Dashboard', labelShort: 'Dashboard', icon: <img src="/dashboard.svg" alt="Dashboard" className="w-6 h-6 filter invert" /> },
    { id: 'createFuture', label: 'Create Futures', labelShort: 'Create', icon: <img src="/createFuture.svg" alt="Create Futures" className="w-6 h-6 filter invert" /> },
    { id: 'futuresMarket', label: 'Futures Market', labelShort: 'Market', icon: <img src="/futuresMarket.svg" alt="Futures Market" className="w-6 h-6 filter invert" /> },
    { id: 'myContracts', label: 'My Contracts', labelShort: 'Contracts', icon: <img src="/myContracts.svg" alt="My Contracts" className="w-6 h-6 filter invert" /> },
    { id: 'creditScore', label: 'Credit Score', labelShort: 'Credit', icon: <img src="/credit-score.svg" alt="Credit Score" className="w-6 h-6 filter invert" /> },
    { id: 'pricingHelper', label: 'AI Pricing Helper', labelShort: 'Pricing', icon: <img src="/aiPricingHelper.svg" alt="AI Pricing Helper" className="w-6 h-6 filter invert" /> },
    { id: 'financialServices', label: 'Financial Services', labelShort: 'Finance', icon: <img src="/financial-services.svg" alt="Financial Services" className="w-6 h-6 filter invert" /> },
];

export const FishermanDashboard: React.FC<FishermanDashboardProps> = ({ user, onLogout }) => {
  const [activePage, setActivePage] = useState('dashboard');
  const [refreshKey, setRefreshKey] = useState(0);

  const handleFutureCreated = () => {
    // Switch to futures market and trigger a refresh
    setActivePage('futuresMarket');
    setRefreshKey(prev => prev + 1);
  }

  const renderContent = () => {
    switch (activePage) {
      case 'dashboard':
        return <DashboardHome user={user} setActivePage={setActivePage} />;
      case 'createFuture':
        return <CreateFuture user={user} onFutureCreated={handleFutureCreated} />;
      case 'futuresMarket':
        return <FuturesMarket user={user} />;
      case 'myContracts':
        return <MyContracts user={user} />;
      case 'creditScore':
        return <CreditScore user={user} />;
      case 'pricingHelper':
        return <PricingHelper />;
      case 'financialServices':
        return <FinancialServices user={user} />;
      default:
        return <div>Select a page</div>;
    }
  };

  return (
    <DashboardLayout
      user={user}
      onLogout={onLogout}
      activePage={activePage}
      setActivePage={setActivePage}
      navItems={navItems}
    >
      {renderContent()}
    </DashboardLayout>
  );
};
