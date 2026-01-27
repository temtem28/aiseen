import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Tooltip, Cell } from 'recharts';

interface BarChartWidgetProps {
  title: string;
  data: Array<{
    name: string;
    value: number;
    color?: string;
  }>;
  showLegend?: boolean;
  legendItems?: Array<{
    label: string;
    color: string;
  }>;
  height?: number;
}

export default function BarChartWidget({ title, data, showLegend = false, legendItems, height = 180 }: BarChartWidgetProps) {
  const defaultColor = '#22d3ee';

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-[#1a2332] border border-[#2a3444] rounded-lg px-3 py-2 shadow-xl">
          <p className="text-gray-400 text-xs">{label}</p>
          <p className="text-white font-semibold">{payload[0].value}</p>
        </div>
      );
    }
    return null;
  };

  // If no title, render just the chart
  if (!title) {
    return (
      <div style={{ height }}>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
            <XAxis 
              dataKey="name" 
              axisLine={false}
              tickLine={false}
              tick={{ fill: '#6b7280', fontSize: 11 }}
            />
            <YAxis 
              axisLine={false}
              tickLine={false}
              tick={{ fill: '#6b7280', fontSize: 11 }}
            />
            <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(34, 211, 238, 0.1)' }} />
            <Bar 
              dataKey="value" 
              radius={[4, 4, 0, 0]}
              maxBarSize={40}
            >
              {data.map((entry, index) => (
                <Cell 
                  key={`cell-${index}`} 
                  fill={entry.color || defaultColor}
                  style={{ filter: `drop-shadow(0 0 8px ${entry.color || defaultColor}40)` }}
                />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    );
  }

  return (
    <div className="bg-[#0d1321] rounded-2xl p-5 border border-[#1a2332]">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-white font-semibold">{title}</h3>
        {showLegend && legendItems && (
          <div className="flex flex-col gap-1">
            {legendItems.map((item, index) => (
              <div key={index} className="flex items-center gap-2">
                <div 
                  className="w-2 h-2 rounded-full" 
                  style={{ backgroundColor: item.color }}
                />
                <span className="text-xs text-gray-400">{item.label}</span>
              </div>
            ))}
          </div>
        )}
      </div>
      
      <div style={{ height }}>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
            <XAxis 
              dataKey="name" 
              axisLine={false}
              tickLine={false}
              tick={{ fill: '#6b7280', fontSize: 11 }}
            />
            <YAxis 
              axisLine={false}
              tickLine={false}
              tick={{ fill: '#6b7280', fontSize: 11 }}
            />
            <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(34, 211, 238, 0.1)' }} />
            <Bar 
              dataKey="value" 
              radius={[4, 4, 0, 0]}
              maxBarSize={40}
            >
              {data.map((entry, index) => (
                <Cell 
                  key={`cell-${index}`} 
                  fill={entry.color || defaultColor}
                  style={{ filter: `drop-shadow(0 0 8px ${entry.color || defaultColor}40)` }}
                />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
