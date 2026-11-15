export interface Medication {
  id: string;
  name: string;
  genericName: string;
  dosage: string;
  timeSlot: 'Morning' | 'Afternoon' | 'Evening' | 'Night';
  scheduledTime: string;
  instructions: string;
  pillColor: string;
  shape: string;
  takenToday: boolean;
  takenAt?: string;
  remainingPills: number;
  totalPills: number;
  refillThreshold: number;
  price: number;
  pharmacyPartner: string;
  isDoubleDoseRisk?: boolean;
}

export interface AdherenceLog {
  id: string;
  timestamp: string;
  medicationName: string;
  status: 'taken' | 'missed' | 'warning' | 'refill_ordered';
  notes: string;
  verificationMethod: 'voice' | 'vision' | 'manual';
}

export interface PharmacyOrder {
  id: string;
  medicationName: string;
  quantity: string;
  price: number;
  orderedAt: string;
  status: 'Delivered' | 'Dispatched' | 'Processing' | 'Demo only';
  partner: 'Tata 1mg' | 'Apollo Pharmacy' | 'PharmEasy' | 'Not connected';
  paidBy: string;
}

export interface SeniorProfile {
  name: string;
  nickname: string;
  age: number;
  relation: string;
  caregiverName: string;
  caregiverPhone: string;
  caregiverCity: string;
  seniorCity: string;
  subscriptionPlan: string;
  insurancePartner: string;
  insurancePolicyNumber: string;
  adherenceRate: number;
  annualSavings: number;
}
