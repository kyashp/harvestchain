import React, { useState } from 'react';
import { User } from '../../types';

interface SidebarLinkProps {
  icon: React.ReactNode;
  label: string;
  active: boolean;
  onClick: () => void;
}

const SidebarLink: React.FC<SidebarLinkProps> = ({ icon, label, active, onClick }) => (
  <button
    onClick={onClick}
    className={`flex items-center w-full px-4 py-3 text-left transition-colors duration-200 rounded-lg ${
      active ? 'bg-blue-600 text-white' : 'text-gray-200 hover:bg-blue-800'
    }`}
  >
    <div className="w-6 h-6 mr-3 flex-shrink-0">{icon}</div>
    <span className="font-medium">{label}</span>
  </button>
);

interface DashboardLayoutProps {
  user: User;
  onLogout: () => void;
  children: React.ReactNode;
  activePage: string;
  setActivePage: (page: string) => void;
  navItems: { id: string, label: string, icon: React.ReactNode, labelShort?: string }[];
}

export const DashboardLayout: React.FC<DashboardLayoutProps> = ({ user, onLogout, children, activePage, setActivePage, navItems }) => {
  return (
    <div className="flex h-screen bg-gray-100 font-sans">
      {/* Sidebar */}
      <aside className="hidden md:flex flex-col w-64 bg-gray-800 text-white p-4">
        <div className="flex items-center mb-8">
          <img src="/fish.svg" alt="HarvestChain Logo" className="w-10 h-10" />
          <h1 className="text-2xl font-bold ml-2">HarvestChain</h1>
        </div>
        <nav className="flex-1 space-y-2">
          {navItems.map(item => (
            <SidebarLink
              key={item.id}
              icon={item.icon}
              label={item.label}
              active={activePage === item.id}
              onClick={() => setActivePage(item.id)}
            />
          ))}
        </nav>
        <div>
          <SidebarLink
            icon={<img src="/logOut.svg" alt="Logout" className="w-6 h-6 filter invert" />}
            label="Logout"
            active={false}
            onClick={onLogout}
          />
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <header className="flex items-center justify-between p-4 bg-white border-b">
          <div>
            <h2 className="text-2xl font-semibold text-gray-800 capitalize">
                {activePage.replace(/([A-Z])/g, ' $1').trim()}
            </h2>
          </div>
          <div className="flex items-center">
            <div className="text-right mr-4">
                <p className="font-semibold text-gray-700">{user.name}</p>
                <p className="text-sm text-gray-500">{user.type}</p>
            </div>
            <div className="w-12 h-12 bg-blue-500 rounded-full flex items-center justify-center text-white font-bold text-xl">
              {user.name.charAt(0).toUpperCase()}
            </div>
          </div>
        </header>

        {/* Content Area */}
        <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-100 p-6">
          {children}
        </main>
      </div>
    </div>
  );
};
