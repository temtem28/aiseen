import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';

interface AuditData {
  date: string;
  overall: number;
  seo: number;
  performance: number;
}

interface ScoreEvolutionChartProps {
  data: AuditData[];
}

export default function ScoreEvolutionChart({ data }: ScoreEvolutionChartProps) {
  if (data.length === 0) {
    return null;
  }

  return (
    <ResponsiveContainer width="100%" height="100%">
      <LineChart data={data} margin={{ top: 5, right: 30, left: 0, bottom: 5 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
        <XAxis 
          dataKey="date" 
          stroke="#9CA3AF" 
          fontSize={12} 
          tickLine={false}
          axisLine={{ stroke: '#374151' }}
        />
        <YAxis 
          domain={[0, 100]} 
          stroke="#9CA3AF" 
          fontSize={12}
          tickLine={false}
          axisLine={{ stroke: '#374151' }}
        />
        <Tooltip 
          contentStyle={{ 
            backgroundColor: '#1F2937', 
            border: '1px solid #374151',
            borderRadius: '8px',
            color: '#F9FAFB'
          }}
          labelStyle={{ color: '#9CA3AF' }}
        />
        <Legend 
          wrapperStyle={{ paddingTop: '10px' }}
          formatter={(value) => <span style={{ color: '#9CA3AF' }}>{value}</span>}
        />
        <Line 
          type="monotone" 
          dataKey="overall" 
          name="Global" 
          stroke="#8B5CF6" 
          strokeWidth={2} 
          dot={{ fill: '#8B5CF6', strokeWidth: 0 }} 
          activeDot={{ r: 6, fill: '#8B5CF6' }}
        />
        <Line 
          type="monotone" 
          dataKey="seo" 
          name="SEO" 
          stroke="#10B981" 
          strokeWidth={2} 
          dot={{ fill: '#10B981', strokeWidth: 0 }} 
          activeDot={{ r: 6, fill: '#10B981' }}
        />
        <Line 
          type="monotone" 
          dataKey="performance" 
          name="AEO" 
          stroke="#06B6D4" 
          strokeWidth={2} 
          dot={{ fill: '#06B6D4', strokeWidth: 0 }} 
          activeDot={{ r: 6, fill: '#06B6D4' }}
        />
      </LineChart>
    </ResponsiveContainer>
  );
}

