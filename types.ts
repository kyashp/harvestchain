export enum UserType {
  FISHERMAN = 'FISHERMAN',
  BUYER = 'BUYER',
}

export interface User {
  id: string;
  name: string;
  type: UserType;
  email: string;
  did?: string;
  wallet?: {
    address: string;
    balance: number;
  };
}

export interface CreditScoreData {
  score: number;
  factors: {
    positive: string[];
    negative: string[];
  };
  history: {
    month: string;
    score: number;
  }[];
}

export interface FutureContract {
  id: string;
  buyerName: string;
  fishType: string;
  originalQuantityKg: number;
  remainingQuantityKg: number;
  pricePerKg: number;
  deliveryDate: string;
  status: 'OPEN' | 'PARTIALLY_ACCEPTED' | 'ACCEPTED' | 'COMPLETED' | 'CANCELLED';
  postedBy: string;
}

export interface AcceptedContract {
  id: string;
  buyerName: string;
  fishType: string;
  quantityKg: number;
  pricePerKg: number;
  deliveryDate: string;
  status: 'ACCEPTED' | 'COMPLETED' | 'DECLINED';
  accepterId: string;
}

export interface InsurancePolicy {
  id: string;
  name: string;
  description: string;
  premium: number;
  coverage: number;
}
