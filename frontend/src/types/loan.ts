export interface LoanApplication {
  id: string;
  applicant_name: string;
  loan_amount: number;
  monthly_income: number;
  status: 'approved' | 'rejected' | 'pending';
  signature_verified: boolean;
  signature_confidence?: number;
  explanation?: string;
  source?: string;
  created_at?: string;
}

export interface UploadResponse {
  status: 'success' | 'incomplete';
  application_id: string;
  applicant_name: string;
  decision: 'approved' | 'rejected' | 'Approved' | 'Rejected';
  signature_verified: boolean;
  signature_confidence: number;
  explanation: string;
  income?: number;
  loan_amount?: number;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

export interface DashboardStats {
  totalApplications: number;
  approvedRate: number;
  rejectedRate: number;
  averageProcessingTime: string;
  approvedTrend: number;
  rejectedTrend: number;
}
