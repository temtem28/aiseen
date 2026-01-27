import { LineChart, Line, XAxis, YAxis, ResponsiveContainer, Tooltip, CartesianGrid } from 'recharts';

interface LineChartWidgetProps {
  title?: string;
  data: Array<{
    name: string;
    value: number;
    value2?: number;
  }>;
  showDots?: boolean;
  color?: string;
  color2?: string;
}

export default function LineChartWidget({ 
  title, 
  data, 
  showDots = true,
  color = '#22d3ee',
  color2 = '#f472b6'
}: LineChartWidgetProps) {
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-[#1a2332] border border-[#2a3444] rounded-lg px-3 py-2 shadow-xl">
          <p className="text-gray-400 text-xs mb-1">{label}</p>
          {payload.map((entry: any, index: number) => (
            <p key={index} className="text-white font-semibold text-sm" style={{ color: entry.color }}>
              {entry.name}: {entry.value}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="bg-[#0d1321] rounded-2xl p-5 border border-[#1a2332] h-full">
      {title && <h3 className="text-white font-semibold mb-4">{title}</h3>}
      
      <div className="h-48">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#1a2332" />
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
            <Tooltip content={<CustomTooltip />} />
            <Line 
              type="monotone" 
              dataKey="value" 
              name="Principal"
              stroke={color}
              strokeWidth={2}
              dot={showDots ? { fill: color, strokeWidth: 0, r: 4 } : false}
              activeDot={{ r: 6, fill: color }}
              style={{ filter: `drop-shadow(0 0 8px ${color}60)` }}
            />
            {data.some(d => d.value2 !== undefined) && (
              <Line 
                type="monotone" 
                dataKey="value2" 
                name="Secondaire"
                stroke={color2}
                strokeWidth={2}
                dot={showDots ? { fill: color2, strokeWidth: 0, r: 4 } : false}
                activeDot={{ r: 6, fill: color2 }}
                style={{ filter: `drop-shadow(0 0 8px ${color2}60)` }}
              />
            )}
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
