import React from 'react';
import { Card } from '../../components/ui/Card';

export const ActiveFutures: React.FC = () => {
  return (
    <Card>
      <h2 className="text-xl font-bold text-gray-800 mb-4">Active Futures</h2>
      <p className="text-gray-500">This page is deprecated. Please use "My Contracts" instead to view your posted futures and accepted contracts.</p>
    </Card>
  );
};
