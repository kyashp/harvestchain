import React, { useState } from 'react';
import { User } from '../../types';
import { DashboardLayout } from '../../components/layout/DashboardLayout';
import { CreateFuture } from './CreateFuture';
import { MyContracts } from './MyContracts';
import { DashboardHome } from './DashboardHome';
import { FuturesMarket } from './FuturesMarket';
import { PricingHelper } from '../fisherman/PricingHelper';


interface BuyerDashboardProps {
  user: User;
  onLogout: () => void;
}

const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: <img src="/dashboard.svg" alt="Dashboard" className="w-6 h-6 filter invert" /> },
    { id: 'createFuture', label: 'Create Future', icon: <img src="/createFuture.svg" alt="Create Future" className="w-6 h-6 filter invert" /> },
    { id: 'myContracts', label: 'My Contracts', icon: <img src="/myContracts.svg" alt="My Contracts" className="w-6 h-6 filter invert" /> },
    { id: 'futuresMarket', label: 'Futures Market', icon: <img src="/futuresMarket.svg" alt="Futures Market" className="w-6 h-6 filter invert" /> },
    { id: 'pricingHelper', label: 'AI Pricing Helper', icon: <img src="/aiPricingHelper.svg" alt="AI Pricing Helper" className="w-6 h-6 filter invert" /> },
];

export const BuyerDashboard: React.FC<BuyerDashboardProps> = ({ user, onLogout }) => {
  const [activePage, setActivePage] = useState('dashboard');
  const [refreshKey, setRefreshKey] = useState(0);

  const handleFutureCreated = () => {
    // Switch to my contracts and trigger a refresh
    setActivePage('myContracts');
    setRefreshKey(prev => prev + 1);
  }

  const renderContent = () => {
    switch (activePage) {
      case 'dashboard':
        return <DashboardHome user={user} setActivePage={setActivePage} />;
      case 'createFuture':
        return <CreateFuture user={user} onFutureCreated={handleFutureCreated} />;
      case 'myContracts':
        return <MyContracts user={user} />;
      case 'futuresMarket':
        return <FuturesMarket user={user} />;
      case 'pricingHelper':
        return <PricingHelper />;
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
