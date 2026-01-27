import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface ScoreCardProps {
  title: string;
  score: number;
  maxScore: number;
  color: string;
}

const ScoreCard: React.FC<ScoreCardProps> = ({ title, score, maxScore, color }) => {
  const percentage = (score / maxScore) * 100;

  return (
    <Card className="bg-[#0F1C2E] border-white/10">
      <CardHeader>
        <CardTitle className="text-white text-lg">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex items-center justify-center">
          <div className="relative w-32 h-32">
            <svg className="w-32 h-32 transform -rotate-90">
              <circle cx="64" cy="64" r="56" stroke="#1e293b" strokeWidth="8" fill="none" />
              <circle
                cx="64"
                cy="64"
                r="56"
                stroke={color}
                strokeWidth="8"
                fill="none"
                strokeDasharray={`${percentage * 3.51} 351`}
                className="transition-all duration-1000"
              />
            </svg>
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-3xl font-bold text-white">{score}</span>
            </div>
          </div>
        </div>
        <p className="text-center text-gray-400 mt-4">sur {maxScore}</p>
      </CardContent>
    </Card>
  );
};

export default ScoreCard;
