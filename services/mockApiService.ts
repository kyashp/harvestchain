import { User, UserType, FutureContract, AcceptedContract, InsurancePolicy } from '../types';

// MOCK DATABASE
let MOCK_USERS: User[] = [
    {
        id: '1',
        name: 'Tom',
        email: 'tom@harvestchain.com',
        type: UserType.FISHERMAN,
        did: 'did:example:12345',
        wallet: {
            address: '0x1234...AbCd',
            balance: 15750.00
        }
    },
    {
        id: '2',
        name: 'Global Fish Inc.',
        email: 'buyer@globalfish.com',
        type: UserType.BUYER,
        did: 'did:example:67890',
        wallet: {
            address: '0xABCD...1234',
            balance: 2500000.00
        }
    },
];

let MOCK_FUTURES: FutureContract[] = [
    { id: 'f1', buyerName: 'Global Fish Inc.', fishType: 'Tuna (Yellowfin)', originalQuantityKg: 500, remainingQuantityKg: 200, pricePerKg: 250, deliveryDate: '2024-08-15', status: 'PARTIALLY_ACCEPTED', postedBy: '2' },
    { id: 'f2', buyerName: 'Global Fish Inc.', fishType: 'Grouper (Lapu-Lapu)', originalQuantityKg: 200, remainingQuantityKg: 200, pricePerKg: 450, deliveryDate: '2024-08-20', status: 'OPEN', postedBy: '2' },
    { id: 'f3', buyerName: 'Seafood Exporters', fishType: 'Mackerel (Galunggong)', originalQuantityKg: 1000, remainingQuantityKg: 1000, pricePerKg: 120, deliveryDate: '2024-08-10', status: 'OPEN', postedBy: '2' },
    { id: 'f4', buyerName: 'Global Fish Inc.', fishType: 'Sardines', originalQuantityKg: 2000, remainingQuantityKg: 0, pricePerKg: 80, deliveryDate: '2024-07-30', status: 'COMPLETED', postedBy: '2' },
    { id: 'f5', buyerName: 'Tom', fishType: 'Sardines', originalQuantityKg: 300, remainingQuantityKg: 300, pricePerKg: 85, deliveryDate: '2024-08-25', status: 'OPEN', postedBy: '1' },
];

let MOCK_ACCEPTED_CONTRACTS: AcceptedContract[] = [
    { id: 'a1', accepterId: '1', buyerName: 'Global Fish Inc.', fishType: 'Tuna (Yellowfin)', quantityKg: 300, pricePerKg: 250, deliveryDate: '2024-08-15', status: 'ACCEPTED' },
    { id: 'a2', accepterId: '1', buyerName: 'Seafood Exporters', fishType: 'Sardines', quantityKg: 500, pricePerKg: 85, deliveryDate: '2024-07-25', status: 'COMPLETED' },
    { id: 'a3', accepterId: '1', buyerName: 'Global Fish Inc.', fishType: 'Tuna (Yellowfin)', quantityKg: 100, pricePerKg: 240, deliveryDate: '2024-07-15', status: 'DECLINED' },
];

let MOCK_INSURANCE_POLICIES: InsurancePolicy[] = [
    { id: 'ins1', name: 'Typhoon Coverage', description: 'Covers potential losses due to officially declared typhoons preventing fishing activities.', premium: 1500, coverage: 20000 },
    { id: 'ins2', name: 'Equipment Failure Insurance', description: 'Provides a payout for critical equipment failure (e.g., engine malfunction).', premium: 1000, coverage: 15000 },
    { id: 'ins3', name: 'Low Catch Protection', description: 'Pooled insurance that pays out if the community catch falls below a certain threshold.', premium: 800, coverage: 10000 },
];

let MOCK_ENROLLED_POLICIES: { fishermanId: string; policyId: string }[] = [
    { fishermanId: '1', policyId: 'ins1' },
];

// END MOCK DATABASE


const delay = (ms: number) => new Promise(res => setTimeout(res, ms));

export const api = {
    login: async (email: string, type: UserType): Promise<User | null> => {
        await delay(500);
        const user = MOCK_USERS.find(u => u.email.toLowerCase() === email.toLowerCase() && u.type === type);
        return user || null;
    },

    getFishermanDataForCreditScore: async (fishermanId: string): Promise<any> => {
        await delay(300);
        const accepted = MOCK_ACCEPTED_CONTRACTS.filter(c => c.accepterId === fishermanId);
        return {
            fishermanId: fishermanId,
            totalContracts: accepted.length,
            completedContracts: accepted.filter(c => c.status === 'COMPLETED').length,
            declinedContracts: accepted.filter(c => c.status === 'DECLINED').length,
            averageContractValue: accepted.length > 0 ? accepted.reduce((sum, c) => sum + (c.quantityKg * c.pricePerKg), 0) / accepted.length : 0,
            memberSince: '2023-01-15',
        };
    },

    getOpenFutures: async (userType: UserType): Promise<FutureContract[]> => {
        await delay(700);
        const postedByType = userType === 'BUYER' ? 'FISHERMAN' : 'BUYER';
        return MOCK_FUTURES.filter(c => (c.status === 'OPEN' || c.status === 'PARTIALLY_ACCEPTED') && MOCK_USERS.find(u => u.id === c.postedBy)?.type === postedByType);
    },

    acceptFuturePart: async (futureId: string, accepterId: string, quantity: number): Promise<void> => {
        await delay(1000);
        const future = MOCK_FUTURES.find(f => f.id === futureId);
        if (future && future.remainingQuantityKg >= quantity) {
            future.remainingQuantityKg -= quantity;
            if (future.remainingQuantityKg === 0) {
                future.status = 'COMPLETED';
            } else {
                future.status = 'PARTIALLY_ACCEPTED';
            }
            MOCK_ACCEPTED_CONTRACTS.push({
                id: `a${Date.now()}`,
                accepterId,
                buyerName: future.buyerName,
                fishType: future.fishType,
                quantityKg: quantity,
                pricePerKg: future.pricePerKg,
                deliveryDate: future.deliveryDate,
                status: 'ACCEPTED',
            });
        } else {
            throw new Error("Not enough quantity remaining or contract not found.");
        }
    },
    
    getUserAcceptedContracts: async (userId: string): Promise<AcceptedContract[]> => {
        await delay(600);
        return MOCK_ACCEPTED_CONTRACTS.filter(c => c.accepterId === userId).sort((a,b) => a.deliveryDate > b.deliveryDate ? -1 : 1);
    },

    getUserPostedFutures: async (userId: string): Promise<FutureContract[]> => {
        await delay(500);
        return MOCK_FUTURES.filter(c => c.postedBy === userId).sort((a,b) => a.deliveryDate > b.deliveryDate ? -1 : 1);
    },

    declineContract: async (contractId: string): Promise<void> => {
        await delay(1200);
        const contract = MOCK_ACCEPTED_CONTRACTS.find(c => c.id === contractId);
        if (contract) {
            contract.status = 'DECLINED';
        }
    },
    
    getBuyerContracts: async (buyerName: string): Promise<FutureContract[]> => {
        await delay(500);
        return MOCK_FUTURES.filter(c => c.buyerName === buyerName).sort((a,b) => a.deliveryDate > b.deliveryDate ? -1 : 1);
    },
    
    createFuture: async (data: Omit<FutureContract, 'id' | 'remainingQuantityKg' | 'status' | 'postedBy'>, postedBy: string): Promise<void> => {
        await delay(1500);
        const newFuture: FutureContract = {
            id: `f${Date.now()}`,
            ...data,
            remainingQuantityKg: data.originalQuantityKg,
            status: 'OPEN',
            postedBy,
        };
        MOCK_FUTURES.unshift(newFuture);
    },
    
    cancelFuture: async (futureId: string): Promise<void> => {
        await delay(800);
        const future = MOCK_FUTURES.find(f => f.id === futureId);
        if (future) {
            future.status = 'CANCELLED';
        }
    },

    getAvailablePolicies: async (): Promise<InsurancePolicy[]> => {
        await delay(400);
        return MOCK_INSURANCE_POLICIES;
    },

    getEnrolledPolicies: async (fishermanId: string): Promise<InsurancePolicy[]> => {
        await delay(450);
        const enrolledIds = MOCK_ENROLLED_POLICIES
            .filter(p => p.fishermanId === fishermanId)
            .map(p => p.policyId);
        return MOCK_INSURANCE_POLICIES.filter(p => enrolledIds.includes(p.id));
    },

    enrollInPolicy: async (fishermanId: string, policyId: string): Promise<void> => {
        await delay(900);
        const alreadyEnrolled = MOCK_ENROLLED_POLICIES.some(p => p.fishermanId === fishermanId && p.policyId === policyId);
        if (alreadyEnrolled) {
            throw new Error("Already enrolled in this policy.");
        }
        MOCK_ENROLLED_POLICIES.push({ fishermanId, policyId });
    }
};