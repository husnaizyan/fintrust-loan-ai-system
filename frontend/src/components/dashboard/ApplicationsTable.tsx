import { useState } from 'react';
import { Eye, ChevronUp, ChevronDown, Search, Filter } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { LoanApplication } from '@/types/loan';
import { cn } from '@/lib/utils';

interface ApplicationsTableProps {
  applications: LoanApplication[];
  onViewDetails: (app: LoanApplication) => void;
}

type SortField = 'created_at' | 'monthly_income' | 'loan_amount' | 'status';
type SortDirection = 'asc' | 'desc';

export function ApplicationsTable({ applications, onViewDetails }: ApplicationsTableProps) {
  const [sortField, setSortField] = useState<SortField>('created_at');
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc');
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('desc');
    }
  };

  const filteredApplications = applications
    .filter((app) => {
      const matchesSearch =
        app.applicant_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        app.id.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesStatus = statusFilter === 'all' || app.status === statusFilter;
      return matchesSearch && matchesStatus;
    })
    .sort((a, b) => {
      let comparison = 0;
      switch (sortField) {
        case 'created_at':
          comparison = new Date(a.created_at || '').getTime() - new Date(b.created_at || '').getTime();
          break;
        case 'monthly_income':
          comparison = a.monthly_income - b.monthly_income;
          break;
        case 'loan_amount':
          comparison = a.loan_amount - b.loan_amount;
          break;
        case 'status':
          comparison = a.status.localeCompare(b.status);
          break;
      }
      return sortDirection === 'asc' ? comparison : -comparison;
    });

  const SortIcon = ({ field }: { field: SortField }) => {
    if (sortField !== field) return null;
    return sortDirection === 'asc' ? (
      <ChevronUp className="h-4 w-4" />
    ) : (
      <ChevronDown className="h-4 w-4" />
    );
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('ms-MY', {
      style: 'currency',
      currency: 'MYR',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  return (
    <div className="glass-card rounded-xl overflow-hidden">
      {/* Header with Search and Filters */}
      <div className="p-4 border-b border-border">
        <div className="flex flex-col sm:flex-row gap-4">
          {/* Search */}
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search by name or ID..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full rounded-lg border border-input bg-background pl-10 pr-4 py-2 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20"
            />
          </div>

          {/* Status Filter */}
          <div className="flex items-center gap-2">
            <Filter className="h-4 w-4 text-muted-foreground" />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="rounded-lg border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
            >
              <option value="all">All Status</option>
              <option value="approved">Approved</option>
              <option value="rejected">Rejected</option>
              <option value="unsigned">Unsigned</option>
              <option value="pending">Pending</option>
            </select>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-border bg-muted/30">
              <th className="text-left p-4 text-xs uppercase tracking-wider text-muted-foreground font-semibold">
                Application ID
              </th>
              <th className="text-left p-4 text-xs uppercase tracking-wider text-muted-foreground font-semibold">
                Applicant
              </th>
              <th
                onClick={() => handleSort('created_at')}
                className="text-left p-4 text-xs uppercase tracking-wider text-muted-foreground font-semibold cursor-pointer hover:text-foreground transition-colors"
              >
                <span className="flex items-center gap-1">
                  Date
                  <SortIcon field="created_at" />
                </span>
              </th>
              <th
                onClick={() => handleSort('monthly_income')}
                className="text-right p-4 text-xs uppercase tracking-wider text-muted-foreground font-semibold cursor-pointer hover:text-foreground transition-colors"
              >
                <span className="flex items-center justify-end gap-1">
                  Income
                  <SortIcon field="monthly_income" />
                </span>
              </th>
              <th
                onClick={() => handleSort('loan_amount')}
                className="text-right p-4 text-xs uppercase tracking-wider text-muted-foreground font-semibold cursor-pointer hover:text-foreground transition-colors"
              >
                <span className="flex items-center justify-end gap-1">
                  Loan Amount
                  <SortIcon field="loan_amount" />
                </span>
              </th>
              <th
                onClick={() => handleSort('status')}
                className="text-center p-4 text-xs uppercase tracking-wider text-muted-foreground font-semibold cursor-pointer hover:text-foreground transition-colors"
              >
                <span className="flex items-center justify-center gap-1">
                  Status
                  <SortIcon field="status" />
                </span>
              </th>
              <th className="text-center p-4 text-xs uppercase tracking-wider text-muted-foreground font-semibold">
                Action
              </th>
            </tr>
          </thead>
          <tbody>
            {filteredApplications.length === 0 ? (
              <tr>
                <td colSpan={7} className="p-8 text-center text-muted-foreground">
                  No applications found
                </td>
              </tr>
            ) : (
              filteredApplications.map((app, index) => (
                <tr
                  key={app.id}
                  className={cn(
                    'border-b border-border/50 transition-colors hover:bg-muted/30',
                    index % 2 === 0 ? 'bg-transparent' : 'bg-muted/10'
                  )}
                >
                  <td className="p-4">
                    <span className="font-mono text-sm text-foreground">{app.id}</span>
                  </td>
                  <td className="p-4">
                    <span className="font-medium text-foreground">{app.applicant_name}</span>
                  </td>
                  <td className="p-4 text-muted-foreground">{formatDate(app.created_at || '')}</td>
                  <td className="p-4 text-right font-medium text-foreground">
                    {formatCurrency(app.monthly_income)}
                  </td>
                  <td className="p-4 text-right font-medium text-foreground">
                    {formatCurrency(app.loan_amount)}
                  </td>
                  <td className="p-4 text-center">
                    <Badge
                      variant={
                        app.status === 'approved'
                          ? 'approved'
                          : app.status === 'rejected'
                          ? 'rejected'
                          : 'pending'
                      }
                    >
                      {app.status.charAt(0).toUpperCase() + app.status.slice(1)}
                    </Badge>
                  </td>
                  <td className="p-4 text-center">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onViewDetails(app)}
                      className="text-primary hover:text-primary"
                    >
                      <Eye className="h-4 w-4 mr-1" />
                      View
                    </Button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
