import { User } from './user.model';

/**
 * Status lifecycle of a merchant application.
 */
export type ApplicationStatus =
  | 'DRAFT'
  | 'SUBMITTED'
  | 'UNDER_REVIEW'
  | 'APPROVED'
  | 'REJECTED'
  | 'ON_HOLD';

export type BusinessType =
  | 'SOLE_PROPRIETORSHIP'
  | 'PARTNERSHIP'
  | 'LLC'
  | 'CORPORATION'
  | 'NON_PROFIT';

export type RiskDecision = 'APPROVE' | 'REJECT' | 'HOLD';

// ─── Sub-models ───────────────────────────────────────────────────────────────

export interface BusinessInfo {
  legalName: string;
  tradeName?: string;
  businessType: BusinessType;
  taxId: string; // sensitive — masked by default
  incorporationDate: string; // ISO date
  website?: string;
  description: string;
}

export interface Address {
  street: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
}

export interface ContactInfo {
  ownerName: string;
  ownerEmail: string;
  ownerPhone: string;
  address: Address;
}

export interface BankingInfo {
  bankName: string;
  accountNumber: string; // sensitive — masked by default
  routingNumber: string; // sensitive — masked by default
  monthlyVolume: number;
  averageTicket: number;
}

export interface RiskHistoryEntry {
  id: string;
  decision: RiskDecision;
  notes: string;
  reviewerId: string;
  reviewerName: string;
  createdAt: string;
}

// ─── Root Application model ──────────────────────────────────────────────────

export interface MerchantApplication {
  id: string;
  status: ApplicationStatus;
  createdBy: string; // User ID
  assignedReviewer?: string; // User ID
  businessInfo: BusinessInfo;
  contactInfo: ContactInfo;
  bankingInfo: BankingInfo;
  riskHistory: RiskHistoryEntry[];
  createdAt: string;
  updatedAt: string;
}

// ─── Paginated response wrapper ───────────────────────────────────────────────

export interface ApplicationSummary {
  id: string;
  status: ApplicationStatus;
  merchantName: string;
  assignedReviewer?: string;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}
