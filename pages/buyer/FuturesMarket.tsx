import React, { useState, useEffect } from 'react';
import { FutureContract, User } from '../../types';
import { Card } from '../../components/ui/Card';
import { Spinner } from '../../components/ui/Spinner';
import { api } from '../../services/mockApiService';

const AcceptModal: React.FC<{
    contract: FutureContract;
    onClose: () => void;
    onAccept: (quantity: number) => void;
    isLoading: boolean;
    userType: string;
    user: User;
}> = ({ contract, onClose, onAccept, isLoading, userType, user }) => {
    const [quantity, setQuantity] = useState(contract.remainingQuantityKg);

    const handleAccept = () => {
        if (quantity > 0 && quantity <= contract.remainingQuantityKg) {
            onAccept(quantity);
        }
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
            <Card className="w-full max-w-lg">
                <h2 className="text-xl font-bold">Accept Contract for {contract.fishType}</h2>
                <p className="text-sm text-gray-500">From: {contract.buyerName}</p>
                <div className="mt-4">
                    <label htmlFor="quantity" className="block text-sm font-medium text-gray-700">
                        Quantity to Accept (kg)
                    </label>
                    <input
                        type="number"
                        id="quantity"
                        value={quantity}
                        onChange={(e) => setQuantity(Number(e.target.value))}
                        max={contract.remainingQuantityKg}
                        min="1"
                        className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    />
                    <p className="text-xs text-gray-500 mt-1">
                        Maximum available: {contract.remainingQuantityKg} kg
                    </p>
                </div>
                <div className="mt-4 text-lg font-semibold">
                    {userType === 'BUYER' ? 'Estimated Payment' : 'Estimated Payout'}: PHP {(quantity * contract.pricePerKg).toLocaleString()}
                </div>
                <div className="mt-6 flex justify-end space-x-4">
                    <button onClick={onClose} className="px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300">
                        Cancel
                    </button>
                    <button
                        onClick={handleAccept}
                        disabled={isLoading}
                        className="px-4 py-2 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition disabled:bg-blue-300"
                    >
                        {isLoading ? <Spinner className="w-5 h-5" /> : 'Confirm Acceptance'}
                    </button>
                </div>
            </Card>
        </div>
    );
};

export const FuturesMarket: React.FC<{ user: User }> = ({ user }) => {
  const [contracts, setContracts] = useState<FutureContract[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isAccepting, setIsAccepting] = useState(false);
  const [selectedContract, setSelectedContract] = useState<FutureContract | null>(null);

  const fetchContracts = async () => {
      setIsLoading(true);
      const openContracts = await api.getOpenFutures(user.type);
      setContracts(openContracts);
      setIsLoading(false);
  };

  useEffect(() => {
    fetchContracts();
  }, []);
  
  const handleAccept = async (quantity: number) => {
      if (!selectedContract) return;
      setIsAccepting(true);
      try {
          await api.acceptFuturePart(selectedContract.id, user.id, quantity);
          setSelectedContract(null);
          fetchContracts(); // Refetch to update list
      } catch (error) {
          console.error(error);
          // show error toast in real app
      } finally {
          setIsAccepting(false);
      }
  };
  
  const getStatusChip = (status: FutureContract['status']) => {
      switch(status) {
          case 'OPEN': return <span className="px-3 py-1 text-xs font-semibold text-green-800 bg-green-100 rounded-full">{status}</span>;
          case 'PARTIALLY_ACCEPTED': return <span className="px-3 py-1 text-xs font-semibold text-yellow-800 bg-yellow-100 rounded-full">PARTIAL</span>;
          default: return null;
      }
  }

  if (isLoading && contracts.length === 0) {
    return <div className="flex justify-center mt-8"><Spinner /></div>;
  }

  return (
    <div className="space-y-6">
        {selectedContract && (
            <AcceptModal
                contract={selectedContract}
                onClose={() => setSelectedContract(null)}
                onAccept={handleAccept}
                isLoading={isAccepting}
                userType={user.type}
                user={user}
            />
        )}
        <Card>
            <h2 className="text-xl font-bold text-gray-800">Open & Partially Filled Futures</h2>
            <p className="mt-1 text-sm text-gray-600">Lock in prices for your future catch. You can accept the full remaining amount or a partial quantity.</p>
        </Card>
        {contracts.length === 0 ? (
            <Card className="text-center">
                <p className="text-gray-500">No open futures contracts available at the moment.</p>
            </Card>
        ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
                {contracts.map(contract => (
                <Card key={contract.id} className="flex flex-col justify-between">
                    <div>
                        <div className="flex justify-between items-start">
                             <h3 className="text-lg font-bold text-gray-800">{contract.fishType}</h3>
                             {getStatusChip(contract.status)}
                        </div>
                        <p className="text-sm text-gray-500">From: {contract.buyerName}</p>
                        
                        <div className="mt-4 space-y-2 text-sm">
                            <div className="flex justify-between">
                                <span className="text-gray-600 font-medium">Remaining Quantity:</span>
                                <span>{contract.remainingQuantityKg} / {contract.originalQuantityKg} kg</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-gray-600 font-medium">Price:</span>
                                <span className="font-semibold text-green-600">PHP {contract.pricePerKg.toLocaleString()} / kg</span>
                            </div>
                             <div className="flex justify-between">
                                <span className="text-gray-600 font-medium">Total Value (Original):</span>
                                <span className="font-bold">PHP {(contract.originalQuantityKg * contract.pricePerKg).toLocaleString()}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-gray-600 font-medium">Delivery By:</span>
                                <span>{contract.deliveryDate}</span>
                            </div>
                        </div>
                    </div>
                    <button 
                        onClick={() => setSelectedContract(contract)}
                        className="mt-6 w-full py-2 px-4 font-semibold rounded-lg transition bg-blue-600 text-white hover:bg-blue-700"
                    >
                        Accept Contract
                    </button>
                </Card>
                ))}
            </div>
        )}
    </div>
  );
};
