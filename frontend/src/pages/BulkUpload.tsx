import { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Upload, FileText, X, Loader2, CheckCircle, XCircle, Clock, Files, Zap, BarChart3, LayoutDashboard } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { useLoan } from '@/context/LoanContext';
import { LoanApplication } from '@/types/loan';

interface FileItem {
  id: string;
  file: File;
  status: 'pending' | 'processing' | 'completed' | 'error';
  result?: {
    decision: 'APPROVED' | 'REJECTED';
    applicantName?: string;
    confidence?: number;
  };
  error?: string;
}

export default function BulkUpload() {
  const navigate = useNavigate();
  const { addApplication } = useLoan();
  const [files, setFiles] = useState<FileItem[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [processedCount, setProcessedCount] = useState(0);

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  }, []);

  const handleDragIn = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  }, []);

  const handleDragOut = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    const droppedFiles = Array.from(e.dataTransfer.files);
    addFiles(droppedFiles);
  }, []);

  const addFiles = (newFiles: File[]) => {
    const validFiles = newFiles.filter(file => {
      if (file.type !== 'application/pdf') return false;
      if (file.size > 10 * 1024 * 1024) return false;
      return true;
    });

    const fileItems: FileItem[] = validFiles.map(file => ({
      id: `${file.name}-${Date.now()}-${Math.random()}`,
      file,
      status: 'pending',
    }));

    setFiles(prev => [...prev, ...fileItems]);
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = e.target.files ? Array.from(e.target.files) : [];
    addFiles(selectedFiles);
    e.target.value = '';
  };

  const removeFile = (id: string) => {
    setFiles(prev => prev.filter(f => f.id !== id));
  };

  const clearAll = () => {
    setFiles([]);
    setProcessedCount(0);
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  };

  const processFiles = async () => {
    setIsProcessing(true);
    setProcessedCount(0);

    for (let i = 0; i < files.length; i++) {
      const fileItem = files[i];
      if (fileItem.status !== 'pending') continue;

      // Update to processing
      setFiles(prev => prev.map(f => 
        f.id === fileItem.id ? { ...f, status: 'processing' as const } : f
      ));

      // Simulate processing (replace with actual API call)
      await new Promise(resolve => setTimeout(resolve, 1500 + Math.random() * 1000));

      // Simulate result (replace with actual API response)
      const isApproved = Math.random() > 0.3;
      const applicantName = `Applicant ${i + 1}`;
      const confidence = 75 + Math.random() * 20;
      const income = Math.floor(5000 + Math.random() * 15000);
      const loanAmount = Math.floor(50000 + Math.random() * 200000);
      const debtToIncomeRatio = ((loanAmount / 12) / income * 100).toFixed(1);
      const creditScore = Math.floor(580 + Math.random() * 220);
      
      // Generate detailed AI analysis explanation
      const generateAIExplanation = (approved: boolean, fileName: string): string => {
        if (approved) {
          const approvalReasons = [
            `• <strong>Document Verification:</strong> All required documents from ${fileName} have been successfully verified and validated.`,
            `• <strong>Income Assessment:</strong> Monthly income of RM${income.toLocaleString()} meets the minimum threshold for the requested loan amount.`,
            `• <strong>Debt-to-Income Ratio:</strong> Calculated DTI of ${debtToIncomeRatio}% is within acceptable lending parameters.`,
            `• <strong>Credit Score:</strong> Estimated credit score of ${creditScore} indicates good creditworthiness.`,
            `• <strong>Signature Verification:</strong> Digital signature analysis confirmed with ${confidence.toFixed(1)}% confidence match.`,
            `• <strong>Risk Assessment:</strong> Overall risk profile categorized as LOW to MODERATE based on financial indicators.`,
          ];
          return approvalReasons.join('\n');
        } else {
          const rejectionReasons = [
            `• <strong>Document Analysis:</strong> Application processed from ${fileName}.`,
            `• <strong>Income Insufficiency:</strong> Monthly income of RM${income.toLocaleString()} does not meet the required threshold for a RM${loanAmount.toLocaleString()} loan.`,
            `• <strong>Debt-to-Income Ratio:</strong> Calculated DTI of ${debtToIncomeRatio}% exceeds the maximum allowable limit of 40%.`,
            `• <strong>Credit Assessment:</strong> Estimated credit score of ${creditScore} falls below the minimum requirement for approval.`,
            `• <strong>Risk Evaluation:</strong> Overall risk profile categorized as HIGH based on combined financial indicators.`,
            `• <strong>Recommendation:</strong> Applicant may reapply after improving debt-to-income ratio or with a lower loan amount.`,
          ];
          return rejectionReasons.join('\n');
        }
      };
      
      // Create loan application and add to context
      const newApplication: LoanApplication = {
        id: `BULK-${Date.now()}-${i}`,
        applicant_name: applicantName,
        created_at: new Date().toISOString(),
        monthly_income: income,
        loan_amount: loanAmount,
        status: isApproved ? 'approved' : 'rejected',
        signature_verified: true,
        signature_confidence: confidence,
        explanation: generateAIExplanation(isApproved, fileItem.file.name),
        source: 'bulk',
      };
      
      addApplication(newApplication);

      setFiles(prev => prev.map(f => 
        f.id === fileItem.id ? {
          ...f,
          status: 'completed' as const,
          result: {
            decision: isApproved ? 'APPROVED' : 'REJECTED',
            applicantName: applicantName,
            confidence: confidence,
          }
        } : f
      ));

      setProcessedCount(i + 1);
    }

    setIsProcessing(false);
  };

  const pendingFiles = files.filter(f => f.status === 'pending');
  const completedFiles = files.filter(f => f.status === 'completed');
  const approvedCount = completedFiles.filter(f => f.result?.decision === 'APPROVED').length;
  const rejectedCount = completedFiles.filter(f => f.result?.decision === 'REJECTED').length;
  const progress = files.length > 0 ? (processedCount / files.length) * 100 : 0;

  return (
    <div className="min-h-[calc(100vh-80px)] bg-gradient-to-br from-background via-background to-muted/20">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-secondary/10 border border-secondary/20 mb-4">
            <Files className="h-4 w-4 text-secondary" />
            <span className="text-sm font-medium text-secondary">Batch Processing</span>
          </div>
          <h1 className="text-4xl font-bold mb-3">
            <span className="text-foreground">Bulk </span>
            <span className="bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">Upload</span>
          </h1>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Upload multiple loan applications at once. Process 10-50 PDFs in minutes instead of hours.
          </p>
        </div>

        {/* Benefits Banner */}
        <Card className="mb-8 bg-gradient-to-r from-primary/5 to-secondary/5 border-primary/20">
          <CardContent className="py-4">
            <div className="flex flex-wrap items-center justify-center gap-6 text-sm">
              <div className="flex items-center gap-2">
                <Zap className="h-4 w-4 text-secondary" />
                <span><strong>87.5%</strong> time saved</span>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-primary" />
                <span>Process 20 apps in <strong>5 min</strong></span>
              </div>
              <div className="flex items-center gap-2">
                <BarChart3 className="h-4 w-4 text-primary" />
                <span>Instant summary reports</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Upload Area */}
          <div className="lg:col-span-2 space-y-6">
            {/* Drop Zone */}
            <Card>
              <CardContent className="p-6">
                <div
                  onDragEnter={handleDragIn}
                  onDragLeave={handleDragOut}
                  onDragOver={handleDrag}
                  onDrop={handleDrop}
                  className={cn(
                    'relative rounded-xl border-2 border-dashed p-8 transition-all duration-300',
                    isDragging
                      ? 'border-secondary bg-secondary/5 scale-[1.02]'
                      : 'border-muted-foreground/20 hover:border-primary/40 hover:bg-muted/30'
                  )}
                >
                  <input
                    type="file"
                    accept=".pdf"
                    multiple
                    onChange={handleFileSelect}
                    className="absolute inset-0 cursor-pointer opacity-0"
                    disabled={isProcessing}
                  />
                  
                  <div className="flex flex-col items-center gap-4 text-center">
                    <div className={cn(
                      'flex h-16 w-16 items-center justify-center rounded-2xl transition-all duration-300',
                      isDragging
                        ? 'bg-secondary/10 text-secondary scale-110'
                        : 'bg-primary/10 text-primary'
                    )}>
                      <Files className="h-8 w-8" />
                    </div>
                    
                    <div>
                      <p className="text-lg font-semibold text-foreground">
                        Drop multiple PDFs here
                      </p>
                      <p className="text-sm text-muted-foreground mt-1">
                        or click to browse files (select multiple)
                      </p>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Maximum 10MB per file • PDF only • Up to 50 files
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* File List */}
            {files.length > 0 && (
              <Card>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-lg">Files ({files.length})</CardTitle>
                  <Button variant="ghost" size="sm" onClick={clearAll} disabled={isProcessing}>
                    Clear All
                  </Button>
                </CardHeader>
                <CardContent className="space-y-2 max-h-80 overflow-y-auto">
                  {files.map((fileItem) => (
                    <div
                      key={fileItem.id}
                      className={cn(
                        'flex items-center gap-3 rounded-lg p-3 transition-colors',
                        fileItem.status === 'completed' && fileItem.result?.decision === 'APPROVED' && 'bg-success/5',
                        fileItem.status === 'completed' && fileItem.result?.decision === 'REJECTED' && 'bg-destructive/5',
                        fileItem.status === 'processing' && 'bg-primary/5',
                        fileItem.status === 'pending' && 'bg-muted/50'
                      )}
                    >
                      <div className={cn(
                        'flex h-10 w-10 items-center justify-center rounded-lg',
                        fileItem.status === 'completed' && fileItem.result?.decision === 'APPROVED' && 'bg-success/10 text-success',
                        fileItem.status === 'completed' && fileItem.result?.decision === 'REJECTED' && 'bg-destructive/10 text-destructive',
                        fileItem.status === 'processing' && 'bg-primary/10 text-primary',
                        fileItem.status === 'pending' && 'bg-muted text-muted-foreground'
                      )}>
                        {fileItem.status === 'processing' ? (
                          <Loader2 className="h-5 w-5 animate-spin" />
                        ) : fileItem.status === 'completed' ? (
                          fileItem.result?.decision === 'APPROVED' ? (
                            <CheckCircle className="h-5 w-5" />
                          ) : (
                            <XCircle className="h-5 w-5" />
                          )
                        ) : (
                          <FileText className="h-5 w-5" />
                        )}
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-foreground truncate text-sm">
                          {fileItem.file.name}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {formatFileSize(fileItem.file.size)}
                          {fileItem.result?.applicantName && ` • ${fileItem.result.applicantName}`}
                        </p>
                      </div>

                      {fileItem.status === 'completed' && fileItem.result && (
                        <Badge variant={fileItem.result.decision === 'APPROVED' ? 'default' : 'destructive'}>
                          {fileItem.result.decision}
                        </Badge>
                      )}

                      {fileItem.status === 'pending' && (
                        <button
                          onClick={() => removeFile(fileItem.id)}
                          className="rounded-full p-1 hover:bg-destructive/10 transition-colors"
                          disabled={isProcessing}
                        >
                          <X className="h-4 w-4 text-destructive" />
                        </button>
                      )}
                    </div>
                  ))}
                </CardContent>
              </Card>
            )}
          </div>

          {/* Summary Sidebar */}
          <div className="space-y-6">
            {/* Progress Card */}
            {isProcessing && (
              <Card className="border-primary/20">
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Loader2 className="h-5 w-5 animate-spin text-primary" />
                    Processing...
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <Progress value={progress} className="h-2 mb-2" />
                  <p className="text-sm text-muted-foreground">
                    {processedCount} of {files.length} files processed
                  </p>
                </CardContent>
              </Card>
            )}

            {/* Summary Stats */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-lg">Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Total Files</span>
                  <span className="font-semibold">{files.length}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Pending</span>
                  <span className="font-semibold text-muted-foreground">{pendingFiles.length}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Approved</span>
                  <span className="font-semibold text-success">{approvedCount}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Rejected</span>
                  <span className="font-semibold text-destructive">{rejectedCount}</span>
                </div>
              </CardContent>
            </Card>

            {/* Action Buttons */}
            <Button
              onClick={processFiles}
              disabled={pendingFiles.length === 0 || isProcessing}
              variant="hero"
              size="lg"
              className="w-full"
            >
              {isProcessing ? (
                <>
                  <Loader2 className="h-5 w-5 animate-spin" />
                  Processing...
                </>
              ) : (
                <>
                  <Upload className="h-5 w-5" />
                  Process {pendingFiles.length} Files
                </>
              )}
            </Button>

            {completedFiles.length > 0 && !isProcessing && (
              <Button
                onClick={() => navigate('/dashboard')}
                variant="outline"
                size="lg"
                className="w-full"
              >
                <LayoutDashboard className="h-5 w-5" />
                View in Dashboard
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
