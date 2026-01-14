import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { LoanApplication, UploadResponse, ChatMessage } from '@/types/loan';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface LoanContextType {
  applications: LoanApplication[];
  addApplication: (app: LoanApplication) => void;
  currentResult: UploadResponse | null;
  setCurrentResult: (result: UploadResponse | null) => void;
  chatMessages: ChatMessage[];
  addChatMessage: (message: ChatMessage) => void;
  clearChat: () => void;
  isLoading: boolean;
  refreshApplications: () => Promise<void>;
}

const LoanContext = createContext<LoanContextType | undefined>(undefined);

export function LoanProvider({ children }: { children: ReactNode }) {
  const [applications, setApplications] = useState<LoanApplication[]>([]);
  const [currentResult, setCurrentResult] = useState<UploadResponse | null>(null);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Fetch applications from database on mount
  const fetchApplications = async () => {
    try {
      setIsLoading(true);
      const { data, error } = await supabase
        .from('loan_applications')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching applications:', error);
        toast.error('Failed to load applications');
        return;
      }

      // Map database fields to LoanApplication type
      const mappedApps: LoanApplication[] = (data || []).map(app => ({
        id: app.id,
        applicant_name: app.applicant_name,
        loan_amount: Number(app.loan_amount),
        monthly_income: Number(app.monthly_income),
        status: app.status as 'pending' | 'approved' | 'rejected',
        signature_verified: app.signature_verified || false,
        signature_confidence: app.signature_confidence ? Number(app.signature_confidence) : undefined,
        explanation: app.explanation || undefined,
        created_at: app.created_at,
        source: app.source || 'single',
      }));

      setApplications(mappedApps);
    } catch (error) {
      console.error('Error fetching applications:', error);
      toast.error('Failed to load applications');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchApplications();
  }, []);

  const addApplication = async (app: LoanApplication) => {
    try {
      const { data, error } = await supabase
        .from('loan_applications')
        .insert({
          applicant_name: app.applicant_name,
          loan_amount: app.loan_amount,
          monthly_income: app.monthly_income,
          status: app.status,
          signature_verified: app.signature_verified,
          signature_confidence: app.signature_confidence,
          explanation: app.explanation,
          source: app.source || 'single',
        })
        .select()
        .single();

      if (error) {
        console.error('Error saving application:', error);
        toast.error('Failed to save application');
        // Still add to local state for immediate UI feedback
        setApplications(prev => [app, ...prev]);
        return;
      }

      // Use the returned data with database-generated ID
      const savedApp: LoanApplication = {
        id: data.id,
        applicant_name: data.applicant_name,
        loan_amount: Number(data.loan_amount),
        monthly_income: Number(data.monthly_income),
        status: data.status as 'pending' | 'approved' | 'rejected',
        signature_verified: data.signature_verified || false,
        signature_confidence: data.signature_confidence ? Number(data.signature_confidence) : undefined,
        explanation: data.explanation || undefined,
        created_at: data.created_at,
        source: data.source || 'single',
      };

      setApplications(prev => [savedApp, ...prev]);
      toast.success('Application saved to database');
    } catch (error) {
      console.error('Error saving application:', error);
      toast.error('Failed to save application');
      setApplications(prev => [app, ...prev]);
    }
  };

  const refreshApplications = async () => {
    await fetchApplications();
  };

  const addChatMessage = (message: ChatMessage) => {
    setChatMessages(prev => [...prev, message]);
  };

  const clearChat = () => {
    setChatMessages([]);
  };

  return (
    <LoanContext.Provider
      value={{
        applications,
        addApplication,
        currentResult,
        setCurrentResult,
        chatMessages,
        addChatMessage,
        clearChat,
        isLoading,
        refreshApplications,
      }}
    >
      {children}
    </LoanContext.Provider>
  );
}

export function useLoan() {
  const context = useContext(LoanContext);
  if (context === undefined) {
    throw new Error('useLoan must be used within a LoanProvider');
  }
  return context;
}
