import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Bot, Sparkles, Brain, MessageSquare } from 'lucide-react';

interface AIModel {
  name: string;
  icon: React.ElementType;
  visibility: number;
  mentions: number;
  trend: 'up' | 'down' | 'stable';
  color: string;
}

interface AIVisibilityWidgetProps {
  data?: {
    chatgpt?: number;
    gemini?: number;
    claude?: number;
    perplexity?: number;
  };
}

export default function AIVisibilityWidget({ data }: AIVisibilityWidgetProps) {
  const aiModels: AIModel[] = [
    {
      name: 'ChatGPT',
      icon: Bot,
      visibility: data?.chatgpt || 0,
      mentions: Math.round((data?.chatgpt || 0) * 1.2),
      trend: 'up',
      color: 'from-emerald-500 to-emerald-600'
    },
    {
      name: 'Gemini',
      icon: Sparkles,
      visibility: data?.gemini || 0,
      mentions: Math.round((data?.gemini || 0) * 0.8),
      trend: 'stable',
      color: 'from-blue-500 to-blue-600'
    },
    {
      name: 'Claude',
      icon: Brain,
      visibility: data?.claude || 0,
      mentions: Math.round((data?.claude || 0) * 0.9),
      trend: 'up',
      color: 'from-orange-500 to-orange-600'
    },
    {
      name: 'Perplexity',
      icon: MessageSquare,
      visibility: data?.perplexity || 0,
      mentions: Math.round((data?.perplexity || 0) * 0.7),
      trend: 'down',
      color: 'from-purple-500 to-purple-600'
    }
  ];

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'up': return '↑';
      case 'down': return '↓';
      default: return '→';
    }
  };

  const getTrendColor = (trend: string) => {
    switch (trend) {
      case 'up': return 'text-emerald-400';
      case 'down': return 'text-red-400';
      default: return 'text-gray-400';
    }
  };

  return (
    <Card className="bg-gray-900/50 border-gray-800 backdrop-blur-sm">
      <CardHeader className="pb-2">
        <CardTitle className="text-white flex items-center gap-2">
          <Bot className="h-5 w-5 text-cyan-400" />
          Visibilité IA par Modèle
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {aiModels.map((model) => (
            <div key={model.name} className="relative">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <model.icon className="h-4 w-4 text-gray-400" />
                  <span className="text-sm font-medium text-white">{model.name}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-sm text-gray-400">{model.mentions} mentions</span>
                  <span className={`text-sm font-medium ${getTrendColor(model.trend)}`}>
                    {getTrendIcon(model.trend)} {model.visibility}%
                  </span>
                </div>
              </div>
              <div className="h-2 bg-gray-800 rounded-full overflow-hidden">
                <div 
                  className={`h-full bg-gradient-to-r ${model.color} rounded-full transition-all duration-500`}
                  style={{ width: `${model.visibility}%` }}
                />
              </div>
            </div>
          ))}
        </div>
        
        {(!data || Object.values(data).every(v => v === 0)) && (
          <div className="mt-4 p-3 bg-gray-800/50 rounded-lg border border-gray-700">
            <p className="text-sm text-gray-400 text-center">
              Lancez un audit pour voir votre visibilité IA
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
