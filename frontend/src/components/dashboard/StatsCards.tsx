import { Users, TrendingUp, TrendingDown, Clock, CheckCircle, XCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

interface StatsCardsProps {
  totalApplications: number;
  approvedRate: number;
  rejectedRate: number;
  averageTime: string;
  approvedTrend: number;
  rejectedTrend: number;
}

export function StatsCards({
  totalApplications,
  approvedRate,
  rejectedRate,
  averageTime,
  approvedTrend,
  rejectedTrend,
}: StatsCardsProps) {
  const stats = [
    {
      title: 'Total Applications',
      value: totalApplications.toLocaleString(),
      icon: Users,
      trend: null,
      gradient: 'from-primary to-secondary',
    },
    {
      title: 'Approval Rate',
      value: `${approvedRate.toFixed(1)}%`,
      icon: CheckCircle,
      trend: approvedTrend,
      trendUp: approvedTrend > 0,
      gradient: 'from-success to-emerald-400',
    },
    {
      title: 'Rejection Rate',
      value: `${rejectedRate.toFixed(1)}%`,
      icon: XCircle,
      trend: rejectedTrend,
      trendUp: rejectedTrend < 0,
      gradient: 'from-destructive to-rose-400',
    },
    {
      title: 'Avg. Processing Time',
      value: averageTime,
      icon: Clock,
      trend: null,
      gradient: 'from-accent to-violet-400',
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {stats.map((stat, index) => (
        <div
          key={stat.title}
          className="stat-card relative overflow-hidden animate-slide-up"
          style={{ animationDelay: `${index * 100}ms` }}
        >
          {/* Background gradient decoration */}
          <div className={cn(
            'absolute top-0 right-0 w-32 h-32 rounded-full blur-3xl opacity-10 -translate-y-1/2 translate-x-1/2',
            `bg-gradient-to-br ${stat.gradient}`
          )} />
          
          <div className="relative">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-muted-foreground font-medium">{stat.title}</p>
                <p className="text-3xl font-bold text-foreground mt-2">{stat.value}</p>
              </div>
              <div className={cn(
                'flex h-12 w-12 items-center justify-center rounded-xl',
                `bg-gradient-to-br ${stat.gradient}`
              )}>
                <stat.icon className="h-6 w-6 text-white" />
              </div>
            </div>
            
            {stat.trend !== null && (
              <div className="flex items-center gap-1 mt-4">
                {stat.trendUp ? (
                  <TrendingUp className="h-4 w-4 text-success" />
                ) : (
                  <TrendingDown className="h-4 w-4 text-destructive" />
                )}
                <span className={cn(
                  'text-sm font-medium',
                  stat.trendUp ? 'text-success' : 'text-destructive'
                )}>
                  {Math.abs(stat.trend).toFixed(1)}%
                </span>
                <span className="text-xs text-muted-foreground">vs last month</span>
              </div>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
