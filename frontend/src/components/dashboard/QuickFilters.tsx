import { Calendar, DollarSign, Filter } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface QuickFiltersProps {
  activeStatusFilter: string;
  activeDateFilter: string;
  activeIncomeFilter: string;
  onStatusChange: (status: string) => void;
  onDateChange: (date: string) => void;
  onIncomeChange: (income: string) => void;
}

export function QuickFilters({
  activeStatusFilter,
  activeDateFilter,
  activeIncomeFilter,
  onStatusChange,
  onDateChange,
  onIncomeChange,
}: QuickFiltersProps) {
  const statusFilters = ['All', 'Approved', 'Rejected', 'Unsigned'];
  const dateFilters = ['Today', 'This Week', 'This Month', 'All Time'];
  const incomeFilters = ['All', '<RM30K', 'RM30-50K', 'RM50-75K', '>RM75K'];

  return (
    <div className="glass-card rounded-xl p-4 space-y-4">
      <div className="flex items-center gap-2 text-muted-foreground">
        <Filter className="h-4 w-4" />
        <span className="text-sm font-medium">Quick Filters</span>
      </div>

      {/* Status Filters */}
      <div className="space-y-2">
        <p className="text-xs text-muted-foreground uppercase tracking-wider">Status</p>
        <div className="flex flex-wrap gap-2">
          {statusFilters.map((status) => (
            <Button
              key={status}
              variant={activeStatusFilter === status ? 'gradient' : 'outline'}
              size="sm"
              onClick={() => onStatusChange(status)}
              className={cn(
                'rounded-full text-xs',
                activeStatusFilter !== status && 'border-border hover:border-primary/40'
              )}
            >
              {status}
            </Button>
          ))}
        </div>
      </div>

      {/* Date Filters */}
      <div className="space-y-2">
        <p className="text-xs text-muted-foreground uppercase tracking-wider flex items-center gap-1">
          <Calendar className="h-3 w-3" />
          Date Range
        </p>
        <div className="flex flex-wrap gap-2">
          {dateFilters.map((date) => (
            <Button
              key={date}
              variant={activeDateFilter === date ? 'gradient' : 'outline'}
              size="sm"
              onClick={() => onDateChange(date)}
              className={cn(
                'rounded-full text-xs',
                activeDateFilter !== date && 'border-border hover:border-primary/40'
              )}
            >
              {date}
            </Button>
          ))}
        </div>
      </div>

      {/* Income Filters */}
      <div className="space-y-2">
        <p className="text-xs text-muted-foreground uppercase tracking-wider flex items-center gap-1">
          <DollarSign className="h-3 w-3" />
          Income Range
        </p>
        <div className="flex flex-wrap gap-2">
          {incomeFilters.map((income) => (
            <Button
              key={income}
              variant={activeIncomeFilter === income ? 'gradient' : 'outline'}
              size="sm"
              onClick={() => onIncomeChange(income)}
              className={cn(
                'rounded-full text-xs',
                activeIncomeFilter !== income && 'border-border hover:border-primary/40'
              )}
            >
              {income}
            </Button>
          ))}
        </div>
      </div>
    </div>
  );
}
