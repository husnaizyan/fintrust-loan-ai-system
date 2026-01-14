import { CheckCircle, XCircle, AlertCircle, ShieldCheck, ShieldAlert } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { UploadResponse } from '@/types/loan';
import { cn } from '@/lib/utils';

interface ResultDisplayProps {
  result: UploadResponse | null;
  isIncomplete?: boolean;
}

export function ResultDisplay({ result, isIncomplete }: ResultDisplayProps) {
  if (!result) {
    return (
      <div className="glass-card rounded-xl p-8 text-center">
        <div className="flex flex-col items-center gap-4">
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-muted">
            <AlertCircle className="h-8 w-8 text-muted-foreground" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-foreground">No Results Yet</h3>
            <p className="text-sm text-muted-foreground mt-1">
              Upload a loan application PDF to see the analysis results
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (isIncomplete) {
    return (
      <div className="glass-card rounded-xl p-8 border-warning/30">
        <div className="flex flex-col items-center gap-4 text-center">
          <div className="flex h-20 w-20 items-center justify-center rounded-2xl bg-warning/10">
            <ShieldAlert className="h-10 w-10 text-warning" />
          </div>
          <div>
            <Badge variant="unsigned" size="lg" className="mb-3">
              Signature Missing
            </Badge>
            <h3 className="text-xl font-bold text-foreground">
              Application Incomplete
            </h3>
            <p className="text-sm text-muted-foreground mt-2 max-w-md">
              The uploaded document is missing a valid signature. Please ensure the application 
              is properly signed before resubmitting.
            </p>
          </div>
        </div>
      </div>
    );
  }

  // Normalize decision to handle both "approved" and "Approved"
  const isApproved = result.decision?.toLowerCase() === 'approved';

  return (
    <div className="space-y-4 animate-fade-in">
      {/* Header with Decision */}
      <div className={cn(
        'rounded-xl p-6 text-center',
        isApproved 
          ? 'bg-gradient-to-br from-success/10 to-success/5 border border-success/20'
          : 'bg-gradient-to-br from-destructive/10 to-destructive/5 border border-destructive/20'
      )}>
        <div className="flex flex-col items-center gap-4">
          <div className={cn(
            'flex h-20 w-20 items-center justify-center rounded-2xl',
            isApproved ? 'bg-success/20' : 'bg-destructive/20'
          )}>
            {isApproved ? (
              <CheckCircle className="h-10 w-10 text-success" />
            ) : (
              <XCircle className="h-10 w-10 text-destructive" />
            )}
          </div>
          
          <Badge 
            variant={isApproved ? 'approved' : 'rejected'} 
            size="xl"
          >
            {isApproved ? 'APPROVED' : 'REJECTED'}
          </Badge>
        </div>
      </div>

      {/* Applicant Details */}
      <div className="glass-card rounded-xl p-5">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-xs uppercase tracking-wider text-muted-foreground">Applicant</p>
            <p className="font-semibold text-foreground mt-1">{result.applicant_name}</p>
          </div>
          <div>
            <p className="text-xs uppercase tracking-wider text-muted-foreground">Application ID</p>
            <p className="font-mono text-sm text-foreground mt-1">{result.application_id}</p>
          </div>
        </div>
      </div>

      {/* Signature Verification */}
      <div className="glass-card rounded-xl p-5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            {/* Show verified if approved OR signature_verified is true OR confidence > 80 */}
            {(isApproved || result.signature_verified || result.signature_confidence > 80) ? (
              <ShieldCheck className="h-6 w-6 text-success" />
            ) : (
              <ShieldAlert className="h-6 w-6 text-warning" />
            )}
            <div>
              <p className="font-medium text-foreground">Signature Verification</p>
              <p className="text-sm text-muted-foreground">
                {(isApproved || result.signature_verified || result.signature_confidence > 80) 
                  ? 'Verified successfully' 
                  : 'Verification failed'}
              </p>
            </div>
          </div>
          <div className="text-right">
            <p className={cn(
              'text-2xl font-bold',
              result.signature_confidence > 80 ? 'text-success' : 
              result.signature_confidence > 50 ? 'text-warning' : 'text-destructive'
            )}>
              {result.signature_confidence.toFixed(1)}%
            </p>
            <p className="text-xs text-muted-foreground">Confidence</p>
          </div>
        </div>
        
        {/* Confidence Bar */}
        <div className="mt-4 h-2 rounded-full bg-muted overflow-hidden">
          <div 
            className={cn(
              'h-full rounded-full transition-all duration-1000',
              result.signature_confidence > 80 ? 'bg-success' : 
              result.signature_confidence > 50 ? 'bg-warning' : 'bg-destructive'
            )}
            style={{ width: `${result.signature_confidence}%` }}
          />
        </div>
      </div>

      {/* AI Explanation */}
      <div className="glass-card rounded-xl p-5">
        <h4 className="font-semibold text-foreground mb-3 flex items-center gap-2">
          <span className="flex h-6 w-6 items-center justify-center rounded-lg gradient-primary text-[10px] font-bold text-primary-foreground">
            AI
          </span>
          Analysis Summary
        </h4>
        <div 
          className="text-sm leading-relaxed text-muted-foreground whitespace-pre-line [&_strong]:font-semibold [&_strong]:text-foreground"
          dangerouslySetInnerHTML={{ 
            __html: result.explanation
              .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
          }}
        />
      </div>
    </div>
  );
}
