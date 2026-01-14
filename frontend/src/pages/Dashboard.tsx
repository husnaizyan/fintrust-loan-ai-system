import { useState, useMemo } from 'react';
import { StatsCards } from '@/components/dashboard/StatsCards';
import { DashboardCharts } from '@/components/dashboard/DashboardCharts';
import { ApplicationsTable } from '@/components/dashboard/ApplicationsTable';
import { QuickFilters } from '@/components/dashboard/QuickFilters';
import { ExportOptions } from '@/components/dashboard/ExportOptions';
import { useLoan } from '@/context/LoanContext';
import { LoanApplication } from '@/types/loan';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, XCircle, ShieldCheck, ShieldAlert } from 'lucide-react';

export default function Dashboard() {
  const { applications } = useLoan();
  const [selectedApp, setSelectedApp] = useState<LoanApplication | null>(null);
  const [statusFilter, setStatusFilter] = useState('All');
  const [dateFilter, setDateFilter] = useState('All Time');
  const [incomeFilter, setIncomeFilter] = useState('All');

  // Calculate stats
  const stats = useMemo(() => {
    const total = applications.length;
    const approved = applications.filter((a) => a.status === 'approved').length;
    const rejected = applications.filter((a) => a.status === 'rejected').length;

    return {
      totalApplications: total,
      approvedRate: total > 0 ? (approved / total) * 100 : 0,
      rejectedRate: total > 0 ? (rejected / total) * 100 : 0,
      averageTime: '2.4 min',
      approvedTrend: 5.2,
      rejectedTrend: -2.8,
      approvedCount: approved,
      rejectedCount: rejected,
    };
  }, [applications]);

  // Filter applications based on sidebar filters
  const filteredApplications = useMemo(() => {
    return applications.filter((app) => {
      // Status filter
      if (statusFilter !== 'All') {
        if (statusFilter.toLowerCase() !== app.status) return false;
      }

      // Date filter
      const appDate = new Date(app.created_at || '');
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      if (dateFilter === 'Today') {
        const appDateStart = new Date(appDate);
        appDateStart.setHours(0, 0, 0, 0);
        if (appDateStart.getTime() !== today.getTime()) return false;
      } else if (dateFilter === 'This Week') {
        const weekAgo = new Date(today);
        weekAgo.setDate(weekAgo.getDate() - 7);
        if (appDate < weekAgo) return false;
      } else if (dateFilter === 'This Month') {
        const monthAgo = new Date(today);
        monthAgo.setMonth(monthAgo.getMonth() - 1);
        if (appDate < monthAgo) return false;
      }

      // Income filter (RM-based values)
      if (incomeFilter !== 'All') {
        const income = app.monthly_income;
        if (incomeFilter === '<RM30K' && income >= 30000) return false;
        if (incomeFilter === 'RM30-50K' && (income < 30000 || income >= 50000)) return false;
        if (incomeFilter === 'RM50-75K' && (income < 50000 || income >= 75000)) return false;
        if (incomeFilter === '>RM75K' && income < 75000) return false;
      }

      return true;
    });
  }, [applications, statusFilter, dateFilter, incomeFilter]);

  const handleViewDetails = (app: LoanApplication) => {
    setSelectedApp(app);
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('ms-MY', {
      style: 'currency',
      currency: 'MYR',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  // Parse and clean AI explanation - removes HTML tags and formats as clean text
  const formatExplanation = (explanation: string): string => {
    // Remove HTML tags and clean up bullet separators
    return explanation
      .replace(/<\/?strong>/g, '')
      .replace(/<\/?[^>]+(>|$)/g, '')
      .replace(/•\s*/g, '\n• ')
      .trim();
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-background py-8">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        {/* Page Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold gradient-text">Analytics Dashboard</h1>
          <p className="text-muted-foreground mt-2">
            Monitor application trends, approval rates, and performance metrics
          </p>
        </div>

        {/* Stats Cards */}
        <div className="mb-8">
          <StatsCards
            totalApplications={stats.totalApplications}
            approvedRate={stats.approvedRate}
            rejectedRate={stats.rejectedRate}
            averageTime={stats.averageTime}
            approvedTrend={stats.approvedTrend}
            rejectedTrend={stats.rejectedTrend}
          />
        </div>

        {/* Charts */}
        <div className="mb-8">
          <h2 className="text-lg font-semibold text-foreground mb-4">Insights</h2>
          <DashboardCharts
            approvedCount={stats.approvedCount}
            rejectedCount={stats.rejectedCount}
          />
        </div>

        {/* Filters and Table Section */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Sidebar */}
          <div className="lg:col-span-1 space-y-4">
            <QuickFilters
              activeStatusFilter={statusFilter}
              activeDateFilter={dateFilter}
              activeIncomeFilter={incomeFilter}
              onStatusChange={setStatusFilter}
              onDateChange={setDateFilter}
              onIncomeChange={setIncomeFilter}
            />
            <ExportOptions applications={filteredApplications} />
          </div>

          {/* Table */}
          <div className="lg:col-span-3">
            <h2 className="text-lg font-semibold text-foreground mb-4">
              Recent Applications
            </h2>
            <ApplicationsTable
              applications={filteredApplications}
              onViewDetails={handleViewDetails}
            />
          </div>
        </div>
      </div>

      {/* Application Details Dialog */}
      <Dialog open={!!selectedApp} onOpenChange={() => setSelectedApp(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold">
              Application Details
            </DialogTitle>
          </DialogHeader>
          
          {selectedApp && (
            <div className="space-y-4">
              {/* Status */}
              <div className="flex items-center justify-between p-4 rounded-lg bg-muted/30">
                <div className="flex items-center gap-3">
                  {selectedApp.status === 'approved' ? (
                    <CheckCircle className="h-8 w-8 text-success" />
                  ) : (
                    <XCircle className="h-8 w-8 text-destructive" />
                  )}
                  <div>
                    <p className="text-sm text-muted-foreground">Decision</p>
                    <Badge
                      variant={selectedApp.status === 'approved' ? 'approved' : 'rejected'}
                      size="lg"
                    >
                      {selectedApp.status.toUpperCase()}
                    </Badge>
                  </div>
                </div>
              </div>

              {/* Details Grid */}
              <div className="grid grid-cols-2 gap-4">
                <div className="p-3 rounded-lg bg-muted/20">
                  <p className="text-xs text-muted-foreground uppercase tracking-wider">ID</p>
                  <p className="font-mono text-sm font-medium">{selectedApp.id}</p>
                </div>
                <div className="p-3 rounded-lg bg-muted/20">
                  <p className="text-xs text-muted-foreground uppercase tracking-wider">Date</p>
                  <p className="text-sm font-medium">
                    {new Date(selectedApp.created_at || '').toLocaleDateString()}
                  </p>
                </div>
                <div className="p-3 rounded-lg bg-muted/20">
                  <p className="text-xs text-muted-foreground uppercase tracking-wider">Applicant</p>
                  <p className="text-sm font-medium">{selectedApp.applicant_name}</p>
                </div>
                <div className="p-3 rounded-lg bg-muted/20">
                  <p className="text-xs text-muted-foreground uppercase tracking-wider">Income</p>
                  <p className="text-sm font-medium">{formatCurrency(selectedApp.monthly_income)}</p>
                </div>
                <div className="p-3 rounded-lg bg-muted/20 col-span-2">
                  <p className="text-xs text-muted-foreground uppercase tracking-wider">Loan Amount</p>
                  <p className="text-lg font-bold">{formatCurrency(selectedApp.loan_amount)}</p>
                </div>
              </div>

              {/* Signature Status */}
              <div className="flex items-center gap-3 p-4 rounded-lg border border-border">
                {selectedApp.signature_verified ? (
                  <ShieldCheck className="h-6 w-6 text-success" />
                ) : (
                  <ShieldAlert className="h-6 w-6 text-warning" />
                )}
                <div className="flex-1">
                  <p className="font-medium">Signature Verification</p>
                  <p className="text-sm text-muted-foreground">
                    {selectedApp.signature_verified ? 'Verified' : 'Not Verified'}
                  </p>
                </div>
                {selectedApp.signature_confidence && (
                  <div className="text-right">
                    <p className="text-xl font-bold text-primary">
                      {selectedApp.signature_confidence.toFixed(1)}%
                    </p>
                    <p className="text-xs text-muted-foreground">Confidence</p>
                  </div>
                )}
              </div>

              {/* Explanation */}
              {selectedApp.explanation && (
                <div className="p-4 rounded-lg bg-primary/5 border border-primary/10 max-h-48 overflow-y-auto">
                  <p className="text-xs text-muted-foreground uppercase tracking-wider mb-2">
                    AI Analysis
                  </p>
                  <p className="text-sm text-foreground leading-relaxed whitespace-pre-line">
                    {formatExplanation(selectedApp.explanation)}
                  </p>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
