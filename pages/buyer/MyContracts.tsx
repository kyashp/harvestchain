import React, { useState, useEffect } from 'react';
import { AcceptedContract, FutureContract, User } from '../../types';
import { Card } from '../../components/ui/Card';
import { Spinner } from '../../components/ui/Spinner';
import { api } from '../../services/mockApiService';

const CancelModal: React.FC<{
    contract: FutureContract;
    onClose: () => void;
    onConfirm: () => void;
    isLoading: boolean;
}> = ({ contract, onClose, onConfirm, isLoading }) => {
    const remainingValue = contract.remainingQuantityKg * contract.pricePerKg;
    const penalty = remainingValue * 0.20;
    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
            <Card className="w-full max-w-md">
                <h2 className="text-xl font-bold text-red-600">Cancel Contract?</h2>
                <p className="mt-2 text-gray-600">
                    Are you sure you want to cancel this contract? The unfulfilled portion will be removed from the market.
                </p>
                <div className="mt-4 p-4 bg-yellow-50 rounded-lg">
                    <p className="font-bold text-yellow-800">Penalty Warning</p>
                    <p className="text-sm text-yellow-700">
                        A 20% fee on the remaining contract value will be forfeited from your escrow.
                    </p>
                    <p className="text-sm text-yellow-700 mt-2">
                        Penalty Amount: <span className="font-semibold">PHP {penalty.toLocaleString()}</span>
                    </p>
                </div>
                <div className="mt-6 flex justify-end space-x-4">
                    <button onClick={onClose} className="px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300">
                        Keep Contract
                    </button>
                    <button
                        onClick={onConfirm}
                        disabled={isLoading}
                        className="px-4 py-2 bg-red-600 text-white font-semibold rounded-lg hover:bg-red-700 transition disabled:bg-red-300"
                    >
                        {isLoading ? <Spinner className="w-5 h-5"/> : 'Yes, Cancel'}
                    </button>
                </div>
            </Card>
        </div>
    );
};

export const MyContracts: React.FC<{ user: User }> = ({ user }) => {
  const [acceptedContracts, setAcceptedContracts] = useState<AcceptedContract[]>([]);
  const [postedFutures, setPostedFutures] = useState<FutureContract[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isCancelling, setIsCancelling] = useState(false);
  const [selectedContract, setSelectedContract] = useState<FutureContract | null>(null);

  const fetchContracts = async () => {
    setIsLoading(true);
    const [accepted, posted] = await Promise.all([
      api.getUserAcceptedContracts(user.id),
      api.getUserPostedFutures(user.id)
    ]);
    setAcceptedContracts(accepted);
    setPostedFutures(posted);
    setIsLoading(false);
  };

  useEffect(() => {
    fetchContracts();
  }, [user.id]);
  
  const handleCancel = async () => {
      if (!selectedContract) return;
      setIsCancelling(true);
      try {
          await api.cancelFuture(selectedContract.id);
          fetchContracts();
      } catch (error) {
          console.error("Failed to cancel contract", error);
      } finally {
          setIsCancelling(false);
          setSelectedContract(null);
      }
  }

  if (isLoading) {
    return <div className="flex justify-center mt-8"><Spinner /></div>;
  }
  
  const getStatusChip = (status: string) => {
      switch(status) {
          case 'ACCEPTED': return <span className="px-3 py-1 text-xs font-semibold text-blue-800 bg-blue-100 rounded-full">{status}</span>;
          case 'COMPLETED': return <span className="px-3 py-1 text-xs font-semibold text-gray-800 bg-gray-200 rounded-full">{status}</span>;
          case 'DECLINED': return <span className="px-3 py-1 text-xs font-semibold text-red-800 bg-red-100 rounded-full">{status}</span>;
          case 'OPEN': return <span className="px-3 py-1 text-xs font-semibold text-green-800 bg-green-100 rounded-full">{status}</span>;
          case 'PARTIALLY_ACCEPTED': return <span className="px-3 py-1 text-xs font-semibold text-yellow-800 bg-yellow-100 rounded-full">PARTIAL</span>;
          case 'CANCELLED': return <span className="px-3 py-1 text-xs font-semibold text-red-800 bg-red-100 rounded-full">{status}</span>;
          default: return null;
      }
  }

  return (
    <>
    {selectedContract && (
        <CancelModal 
            contract={selectedContract}
            onClose={() => setSelectedContract(null)}
            onConfirm={handleCancel}
            isLoading={isCancelling}
        />
    )}
    <Card>
      <h2 className="text-xl font-bold text-gray-800 mb-4">My Contracts</h2>
        {acceptedContracts.length === 0 && postedFutures.length === 0 ? (
             <p className="text-gray-500">You have not accepted or posted any contracts yet.</p>
        ) : (
            <>
            <h3 className="text-lg font-semibold mt-4 mb-2">Accepted Contracts</h3>
            <div className="flow-root">
                 <div className="-mx-4 -my-2 overflow-x-auto sm:-mx-6 lg:-mx-8">
                    <div className="inline-block min-w-full py-2 align-middle sm:px-6 lg:px-8">
                        <table className="min-w-full divide-y divide-gray-300">
                            <thead>
                            <tr>
                                <th scope="col" className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900 sm:pl-0">Fish Type</th>
                                <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Seller</th>
                                <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Quantity</th>
                                <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Total Value</th>
                                <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Delivery By</th>
                                <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Status</th>
                            </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200">
                            {acceptedContracts.map((contract) => (
                                <tr key={contract.id}>
                                <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-gray-900 sm:pl-0">{contract.fishType}</td>
                                <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">{contract.buyerName}</td>
                                <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">{contract.quantityKg} kg</td>
                                <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">PHP {(contract.pricePerKg * contract.quantityKg).toLocaleString()}</td>
                                <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">{contract.deliveryDate}</td>
                                <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">{getStatusChip(contract.status)}</td>
                                </tr>
                            ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
            <h3 className="text-lg font-semibold mt-8 mb-2">Posted Futures</h3>
            <div className="flow-root">
                 <div className="-mx-4 -my-2 overflow-x-auto sm:-mx-6 lg:-mx-8">
                    <div className="inline-block min-w-full py-2 align-middle sm:px-6 lg:px-8">
                        <table className="min-w-full divide-y divide-gray-300">
                            <thead>
                            <tr>
                                <th scope="col" className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900 sm:pl-0">Fish Type</th>
                                <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Quantity</th>
                                <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Price per Kg</th>
                                <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Delivery By</th>
                                <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Status</th>
                                <th scope="col" className="relative py-3.5 pl-3 pr-4 sm:pr-0">
                                    <span className="sr-only">Actions</span>
                                </th>
                            </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200">
                            {postedFutures.map((contract) => (
                                <tr key={contract.id}>
                                <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-gray-900 sm:pl-0">{contract.fishType}</td>
                                <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">{contract.originalQuantityKg} kg</td>
                                <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">PHP {contract.pricePerKg.toLocaleString()}</td>
                                <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">{contract.deliveryDate}</td>
                                <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                                    {getStatusChip(contract.status)}
                                    {(contract.status === 'PARTIALLY_ACCEPTED' || contract.status === 'ACCEPTED') && contract.remainingQuantityKg >= 0 && (
                                        <p className="text-xs text-gray-500 mt-1">
                                            {contract.originalQuantityKg - contract.remainingQuantityKg} / {contract.originalQuantityKg} kg accepted
                                        </p>
                                    )}
                                </td>
                                 <td className="relative whitespace-nowrap py-4 pl-3 pr-4 text-right text-sm font-medium sm:pr-0">
                                    {(contract.status === 'OPEN' || contract.status === 'PARTIALLY_ACCEPTED') && (
                                        <button onClick={() => setSelectedContract(contract)} className="text-red-600 hover:text-red-900">
                                            Cancel
                                        </button>
                                    )}
                                </td>
                                </tr>
                            ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
            </>
        )}
    </Card>
    </>
  );
};
