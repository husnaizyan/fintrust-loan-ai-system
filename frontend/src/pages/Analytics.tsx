import { TrendingUp, TrendingDown, BarChart3, PieChart, Activity } from 'lucide-react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  RadialBarChart,
  RadialBar,
  Legend,
} from 'recharts';

export default function Analytics() {
  const areaData = [
    { week: 'W1', approved: 24, rejected: 8 },
    { week: 'W2', approved: 28, rejected: 12 },
    { week: 'W3', approved: 35, rejected: 10 },
    { week: 'W4', approved: 42, rejected: 14 },
    { week: 'W5', approved: 38, rejected: 9 },
    { week: 'W6', approved: 45, rejected: 11 },
    { week: 'W7', approved: 52, rejected: 13 },
    { week: 'W8', approved: 48, rejected: 8 },
  ];

  const radialData = [
    { name: 'Processing', value: 85, fill: '#6366f1' },
    { name: 'Accuracy', value: 92, fill: '#1e3a8a' },
    { name: 'Satisfaction', value: 78, fill: '#8b5cf6' },
  ];

  const metrics = [
    {
      title: 'Weekly Growth',
      value: '+12.5%',
      trend: 'up',
      description: 'Applications increased',
      icon: TrendingUp,
    },
    {
      title: 'Avg Decision Time',
      value: '2.4 min',
      trend: 'down',
      description: '15% faster than last month',
      icon: Activity,
    },
    {
      title: 'Model Accuracy',
      value: '94.2%',
      trend: 'up',
      description: 'Prediction accuracy',
      icon: BarChart3,
    },
    {
      title: 'Risk Score Avg',
      value: '3.2/10',
      trend: 'down',
      description: 'Lower is better',
      icon: PieChart,
    },
  ];

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-background py-8">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        {/* Page Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold gradient-text">Advanced Analytics</h1>
          <p className="text-muted-foreground mt-2">
            Deep insights and performance metrics for the loan approval system
          </p>
        </div>

        {/* Metrics Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {metrics.map((metric, index) => (
            <div
              key={metric.title}
              className="stat-card animate-slide-up"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">{metric.title}</p>
                  <p className="text-2xl font-bold text-foreground mt-1">{metric.value}</p>
                  <div className="flex items-center gap-1 mt-2">
                    {metric.trend === 'up' ? (
                      <TrendingUp className="h-3 w-3 text-success" />
                    ) : (
                      <TrendingDown className="h-3 w-3 text-destructive" />
                    )}
                    <span className="text-xs text-muted-foreground">{metric.description}</span>
                  </div>
                </div>
                <div className="flex h-10 w-10 items-center justify-center rounded-xl gradient-primary">
                  <metric.icon className="h-5 w-5 text-white" />
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Charts Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          {/* Area Chart - Full Width on Mobile */}
          <div className="lg:col-span-2 glass-card rounded-xl p-6">
            <h3 className="text-lg font-semibold text-foreground mb-4">
              Weekly Application Trends
            </h3>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={areaData}>
                  <defs>
                    <linearGradient id="colorApproved" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#1e3a8a" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#1e3a8a" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="colorRejected" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#dc2626" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#dc2626" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                  <XAxis dataKey="week" tick={{ fontSize: 12, fill: '#64748b' }} />
                  <YAxis tick={{ fontSize: 12, fill: '#64748b' }} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'white',
                      borderRadius: '12px',
                      border: 'none',
                      boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                    }}
                  />
                  <Legend />
                  <Area
                    type="monotone"
                    dataKey="approved"
                    stroke="#1e3a8a"
                    strokeWidth={2}
                    fillOpacity={1}
                    fill="url(#colorApproved)"
                    name="Approved"
                  />
                  <Area
                    type="monotone"
                    dataKey="rejected"
                    stroke="#dc2626"
                    strokeWidth={2}
                    fillOpacity={1}
                    fill="url(#colorRejected)"
                    name="Rejected"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Radial Chart */}
          <div className="glass-card rounded-xl p-6">
            <h3 className="text-lg font-semibold text-foreground mb-4">
              Performance Metrics
            </h3>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <RadialBarChart
                  cx="50%"
                  cy="50%"
                  innerRadius="20%"
                  outerRadius="80%"
                  barSize={20}
                  data={radialData}
                >
                  <RadialBar
                    background
                    dataKey="value"
                    cornerRadius={10}
                  />
                  <Legend
                    iconSize={10}
                    layout="horizontal"
                    verticalAlign="bottom"
                    formatter={(value) => (
                      <span className="text-sm text-muted-foreground">{value}</span>
                    )}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'white',
                      borderRadius: '12px',
                      border: 'none',
                      boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                    }}
                    formatter={(value: number) => [`${value}%`, '']}
                  />
                </RadialBarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="glass-card rounded-xl p-6 gradient-primary text-white">
            <h3 className="text-lg font-semibold mb-2">AI Model Performance</h3>
            <p className="text-4xl font-bold mb-2">94.2%</p>
            <p className="text-sm text-white/70">
              Decision accuracy based on historical validation data
            </p>
          </div>

          <div className="glass-card rounded-xl p-6">
            <h3 className="text-lg font-semibold text-foreground mb-2">Processing Queue</h3>
            <p className="text-4xl font-bold text-primary mb-2">12</p>
            <p className="text-sm text-muted-foreground">
              Applications currently in review pipeline
            </p>
          </div>

          <div className="glass-card rounded-xl p-6">
            <h3 className="text-lg font-semibold text-foreground mb-2">System Health</h3>
            <div className="flex items-center gap-2">
              <div className="h-3 w-3 rounded-full bg-success animate-pulse" />
              <p className="text-lg font-medium text-success">Operational</p>
            </div>
            <p className="text-sm text-muted-foreground mt-2">
              All services running normally
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
