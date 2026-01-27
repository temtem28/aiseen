import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

interface RecommendationCardProps {
  title: string;
  description: string;
  priority: 'high' | 'medium' | 'low';
  category: string;
}

const RecommendationCard: React.FC<RecommendationCardProps> = ({ title, description, priority, category }) => {
  const priorityColors = {
    high: 'bg-red-500/20 text-red-400 border-red-500/50',
    medium: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/50',
    low: 'bg-green-500/20 text-green-400 border-green-500/50'
  };

  return (
    <Card className="bg-[#0F1C2E] border-white/10 hover:border-[#06B6D4]/50 transition-all">
      <CardHeader>
        <div className="flex items-start justify-between">
          <CardTitle className="text-white text-base">{title}</CardTitle>
          <Badge className={priorityColors[priority]}>{priority}</Badge>
        </div>
        <Badge variant="outline" className="w-fit mt-2">{category}</Badge>
      </CardHeader>
      <CardContent>
        <p className="text-gray-400 text-sm">{description}</p>
      </CardContent>
    </Card>
  );
};

export default RecommendationCard;
