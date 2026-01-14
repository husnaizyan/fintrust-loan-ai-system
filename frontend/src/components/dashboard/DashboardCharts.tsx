import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  BarChart,
  Bar,
} from 'recharts';

interface DashboardChartsProps {
  approvedCount: number;
  rejectedCount: number;
}

export function DashboardCharts({ approvedCount, rejectedCount }: DashboardChartsProps) {
  const pieData = [
    { name: 'Approved', value: approvedCount },
    { name: 'Rejected', value: rejectedCount },
  ];

  const lineData = [
    { month: 'Aug', applications: 45, approved: 32 },
    { month: 'Sep', applications: 52, approved: 38 },
    { month: 'Oct', applications: 48, approved: 35 },
    { month: 'Nov', applications: 61, approved: 45 },
    { month: 'Dec', applications: 55, approved: 42 },
    { month: 'Jan', applications: 68, approved: 51 },
  ];

  const barData = [
    { range: '<30K', approved: 15, rejected: 25 },
    { range: '30-50K', approved: 35, rejected: 20 },
    { range: '50-75K', approved: 55, rejected: 12 },
    { range: '75-100K', approved: 72, rejected: 8 },
    { range: '>100K', approved: 85, rejected: 5 },
  ];

  const COLORS = {
    primary: '#1e3a8a',
    secondary: '#6366f1',
    success: '#16a34a',
    destructive: '#dc2626',
    muted: '#94a3b8',
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Pie Chart */}
      <div className="glass-card rounded-xl p-6">
        <h3 className="text-lg font-semibold text-foreground mb-4">
          Approval Distribution
        </h3>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={pieData}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={90}
                paddingAngle={5}
                dataKey="value"
              >
                <Cell fill={COLORS.success} />
                <Cell fill={COLORS.destructive} />
              </Pie>
              <Tooltip
                contentStyle={{
                  backgroundColor: 'white',
                  borderRadius: '12px',
                  border: 'none',
                  boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                }}
              />
              <Legend
                verticalAlign="bottom"
                iconType="circle"
                formatter={(value) => (
                  <span className="text-sm text-muted-foreground">{value}</span>
                )}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>
        <div className="flex justify-center gap-8 mt-4">
          <div className="text-center">
            <p className="text-2xl font-bold text-success">{approvedCount}</p>
            <p className="text-xs text-muted-foreground">Approved</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-destructive">{rejectedCount}</p>
            <p className="text-xs text-muted-foreground">Rejected</p>
          </div>
        </div>
      </div>

      {/* Line Chart */}
      <div className="glass-card rounded-xl p-6">
        <h3 className="text-lg font-semibold text-foreground mb-4">
          Applications Over Time
        </h3>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={lineData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis 
                dataKey="month" 
                tick={{ fontSize: 12, fill: '#64748b' }}
                axisLine={{ stroke: '#e2e8f0' }}
              />
              <YAxis 
                tick={{ fontSize: 12, fill: '#64748b' }}
                axisLine={{ stroke: '#e2e8f0' }}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: 'white',
                  borderRadius: '12px',
                  border: 'none',
                  boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                }}
              />
              <Legend />
              <Line
                type="monotone"
                dataKey="applications"
                stroke={COLORS.primary}
                strokeWidth={3}
                dot={{ fill: COLORS.primary, strokeWidth: 2 }}
                name="Total"
              />
              <Line
                type="monotone"
                dataKey="approved"
                stroke={COLORS.success}
                strokeWidth={3}
                dot={{ fill: COLORS.success, strokeWidth: 2 }}
                name="Approved"
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Bar Chart */}
      <div className="glass-card rounded-xl p-6">
        <h3 className="text-lg font-semibold text-foreground mb-4">
          Approval by Income Level
        </h3>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={barData} barCategoryGap="20%">
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis 
                dataKey="range" 
                tick={{ fontSize: 10, fill: '#64748b' }}
                axisLine={{ stroke: '#e2e8f0' }}
              />
              <YAxis 
                tick={{ fontSize: 12, fill: '#64748b' }}
                axisLine={{ stroke: '#e2e8f0' }}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: 'white',
                  borderRadius: '12px',
                  border: 'none',
                  boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                }}
              />
              <Legend />
              <Bar
                dataKey="approved"
                fill={COLORS.secondary}
                radius={[4, 4, 0, 0]}
                name="Approved %"
              />
              <Bar
                dataKey="rejected"
                fill={COLORS.muted}
                radius={[4, 4, 0, 0]}
                name="Rejected %"
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
