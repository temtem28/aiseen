import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface AIVisibilityChartProps {
  data: { name: string; score: number; color: string }[];
}

const AIVisibilityChart: React.FC<AIVisibilityChartProps> = ({ data }) => {
  const maxScore = Math.max(...data.map(d => d.score));

  return (
    <Card className="bg-[#0F1C2E] border-white/10">
      <CardHeader>
        <CardTitle className="text-white">Visibilité par IA</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {data.map((item, index) => (
            <div key={index}>
              <div className="flex justify-between mb-1">
                <span className="text-sm text-gray-300">{item.name}</span>
                <span className="text-sm font-semibold" style={{ color: item.color }}>
                  {item.score}%
                </span>
              </div>
              <div className="w-full bg-gray-700 rounded-full h-2">
                <div
                  className="h-2 rounded-full transition-all duration-1000"
                  style={{ width: `${item.score}%`, backgroundColor: item.color }}
                />
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default AIVisibilityChart;
