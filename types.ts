export enum ViewState {
  HOME = 'HOME',
  ISSUE = 'ISSUE',
  VERIFY = 'VERIFY',
  SETTINGS = 'SETTINGS'
}

export type UserRole = 'admin' | 'verifier';

export interface CertificateData {
  id: string;
  name: string;
  course: string;
  issueDate: string;
  expiryDate: string;
  timestamp?: number;
}

export interface VerificationResult {
  isValid: boolean;
  name?: string;
  course?: string;
  issueDate?: string;
  expiryDate?: string;
  error?: string;
  txHash?: string;
}

export interface TransactionReceiptInfo {
  hash: string;
  blockNumber: number;
  gasUsed: string;
  effectiveGasPrice: string;
  from: string;
  to: string;
}

export interface AppConfig {
  contractAddress: string;
  rpcUrl: string;
}