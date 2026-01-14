import { useState } from 'react';
import { FileUpload } from '@/components/upload/FileUpload';
import { ResultDisplay } from '@/components/upload/ResultDisplay';
import { ChatInterface } from '@/components/upload/ChatInterface';
import { useLoan } from '@/context/LoanContext';
import { toast } from '@/hooks/use-toast';
import { Sparkles, Shield, Zap } from 'lucide-react';

export default function Upload() {
  const [isLoading, setIsLoading] = useState(false);
  const [isIncomplete, setIsIncomplete] = useState(false);
  const { currentResult, setCurrentResult, addApplication, clearChat } = useLoan();

  const handleUpload = async (file: File) => {
    setIsLoading(true);
    setIsIncomplete(false);
    clearChat();

    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await fetch('http://127.0.0.1:8000/api/loan/upload-pdf', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Upload failed');
      }

      const data = await response.json();
      console.log('API Response:', data); // Debug log to verify backend response

      // Only mark as incomplete if signature is actually missing (not just rejected decision)
      const isSignatureMissing = !data.signature_verified && data.signature_confidence < 50;
      
      if (isSignatureMissing) {
        setIsIncomplete(true);
        setCurrentResult({
          ...data,
          applicant_name: data.applicant_name || 'Unknown',
          application_id: data.application_id || 'N/A',
          decision: 'unsigned',
          signature_verified: false,
          signature_confidence: data.signature_confidence || 0,
          explanation: 'Application is incomplete due to missing signature.',
        });
        
        // Store unsigned applications in recent applications
        addApplication({
          id: data.application_id || `UNSIGNED-${Date.now()}`,
          applicant_name: data.applicant_name || 'Unknown',
          created_at: new Date().toISOString(),
          monthly_income: data.income || 0,
          loan_amount: data.loan_amount || 0,
          status: 'pending',
          signature_verified: false,
          signature_confidence: data.signature_confidence || 0,
          explanation: 'Application is incomplete due to missing signature.',
          source: 'single',
        });
        
        toast({
          title: 'Incomplete Application',
          description: 'The uploaded document is missing a signature.',
          variant: 'destructive',
        });
      } else {
        // Handle successful/approved applications
        setCurrentResult({
          ...data,
          applicant_name: data.applicant_name || 'Unknown',
          application_id: data.application_id,
          decision: data.decision,
          signature_verified: data.signature_verified,
          signature_confidence: data.signature_confidence,
          income: data.income,
          loan_amount: data.loan_amount,
          explanation: data.explanation || '',
        });
        
        // Normalize decision to lowercase
        const normalizedDecision = data.decision?.toLowerCase() as 'approved' | 'rejected';
        
        // Ensure signature_verified is a proper boolean
        const isSignatureVerified = Boolean(data.signature_verified);
        
        addApplication({
          id: data.application_id,
          applicant_name: data.applicant_name,
          created_at: new Date().toISOString(),
          monthly_income: data.income || 0,
          loan_amount: data.loan_amount || 0,
          status: normalizedDecision,
          signature_verified: isSignatureVerified,
          signature_confidence: data.signature_confidence || 0,
          explanation: data.explanation,
          source: 'single',
        });

        toast({
          title: 'Application Processed',
          description: `Application ${normalizedDecision === 'approved' ? 'approved' : 'rejected'} successfully.`,
          variant: normalizedDecision === 'approved' ? 'default' : 'destructive',
        });
      }
    } catch (error) {
      console.error('Upload error:', error);
      toast({
        title: 'Upload Failed',
        description: 'There was an error processing your application. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-4.5rem)] bg-background py-12 relative overflow-hidden">
      {/* Background orbs */}
      <div className="floating-orb floating-orb-1" />
      <div className="floating-orb floating-orb-2" />
      
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Page Header */}
        <div className="mb-12 text-center max-w-2xl mx-auto">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 mb-6">
            <Sparkles className="h-4 w-4 text-primary" />
            <span className="text-sm font-medium text-primary">AI-Powered Analysis</span>
          </div>
          <h1 className="text-4xl sm:text-5xl font-bold gradient-text-hero mb-4">
            Upload Loan Application
          </h1>
          <p className="text-lg text-muted-foreground leading-relaxed">
            Submit your loan application for instant AI-powered analysis and approval decision
          </p>
        </div>

        {/* Feature highlights */}
        <div className="grid grid-cols-3 gap-4 max-w-2xl mx-auto mb-12">
          {[
            { icon: Zap, label: 'Instant Analysis' },
            { icon: Shield, label: 'Signature Verified' },
            { icon: Sparkles, label: 'AI Explanation' },
          ].map(({ icon: Icon, label }) => (
            <div key={label} className="flex flex-col items-center gap-2 text-center">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
                <Icon className="h-5 w-5" />
              </div>
              <span className="text-xs font-medium text-muted-foreground">{label}</span>
            </div>
          ))}
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 max-w-6xl mx-auto">
          {/* Left: Upload Section */}
          <div className="space-y-6">
            <div className="glass-card-premium p-8">
              <h2 className="text-xl font-semibold text-foreground mb-6 flex items-center gap-3">
                <span className="flex h-10 w-10 items-center justify-center rounded-xl gradient-primary text-sm font-bold text-primary-foreground shadow-purple">
                  1
                </span>
                Upload Document
              </h2>
              <FileUpload onUpload={handleUpload} isLoading={isLoading} />
            </div>

            {/* Instructions */}
            <div className="glass-card p-6">
              <h3 className="font-semibold text-foreground mb-4">How It Works</h3>
              <ol className="space-y-3 text-sm">
                {[
                  'Upload a loan application PDF document',
                  'Our AI analyzes the application and verifies the signature',
                  'View the decision and detailed explanation',
                  'Use the chat to ask questions about the decision',
                ].map((step, i) => (
                  <li key={i} className="flex gap-3 items-start">
                    <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-xs font-bold text-primary">
                      {i + 1}
                    </span>
                    <span className="text-muted-foreground pt-0.5">{step}</span>
                  </li>
                ))}
              </ol>
            </div>
          </div>

          {/* Right: Results Section */}
          <div className="space-y-6">
            <h2 className="text-xl font-semibold text-foreground flex items-center gap-3">
              <span className="flex h-10 w-10 items-center justify-center rounded-xl gradient-primary text-sm font-bold text-primary-foreground shadow-purple">
                2
              </span>
              Analysis Results
            </h2>
            <ResultDisplay result={currentResult} isIncomplete={isIncomplete} />
          </div>
        </div>
      </div>

      {/* Chat Interface - always visible for user to see */}
      <ChatInterface applicationId={currentResult?.application_id || null} />
    </div>
  );
}
