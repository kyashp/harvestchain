import React, { useState } from 'react';
import { User, UserType } from './types';
import { LoginPage } from './pages/LoginPage';
import { FishermanDashboard } from './pages/fisherman/FishermanDashboard';
import { BuyerDashboard } from './pages/buyer/BuyerDashboard';
import { api } from './services/mockApiService';

const App: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async (email: string, type: UserType) => {
    setIsLoading(true);
    const loggedInUser = await api.login(email, type);
    if (loggedInUser) {
      setUser(loggedInUser);
    }
    setIsLoading(false);
  };

  const handleLogout = () => {
    setUser(null);
  };

  if (!user) {
    return <LoginPage onLogin={handleLogin} isLoading={isLoading} />;
  }

  if (user.type === UserType.FISHERMAN) {
    return <FishermanDashboard user={user} onLogout={handleLogout} />;
  }

  if (user.type === UserType.BUYER) {
    return <BuyerDashboard user={user} onLogout={handleLogout} />;
  }

  return <div>Error: Unknown user type</div>;
};

export default App;
