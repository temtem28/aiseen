import { useNavigate } from 'react-router-dom';
import { 
  Search, 
  BarChart3, 
  FileText, 
  Trophy, 
  Bot, 
  Calendar,
  Telescope,
  Mic
} from 'lucide-react';

interface QuickAction {
  title: string;
  description: string;
  icon: React.ElementType;
  path: string;
  color: string;
  bgColor: string;
  available: boolean;
}

export default function QuickActionsGrid() {
  const navigate = useNavigate();

  const actions: QuickAction[] = [
    {
      title: 'Nouvel Audit SEO/AEO',
      description: 'Analysez votre site web',
      icon: Search,
      path: '/audit',
      color: 'text-cyan-400',
      bgColor: 'bg-cyan-500/10 hover:bg-cyan-500/20',
      available: true
    },
    {
      title: 'Historique des Audits',
      description: 'Consultez vos analyses passées',
      icon: BarChart3,
      path: '/audit/history',
      color: 'text-purple-400',
      bgColor: 'bg-purple-500/10 hover:bg-purple-500/20',
      available: true
    },
    {
      title: 'Perception IA',
      description: 'Comment les IA vous voient',
      icon: Telescope,
      path: '/ai-perception',
      color: 'text-emerald-400',
      bgColor: 'bg-emerald-500/10 hover:bg-emerald-500/20',
      available: true
    },
    {
      title: 'Analyse Concurrentielle',
      description: 'Comparez votre visibilité',
      icon: Trophy,
      path: '/competitive-analysis',
      color: 'text-orange-400',
      bgColor: 'bg-orange-500/10 hover:bg-orange-500/20',
      available: true
    },
    {
      title: 'Générateur de Contenu',
      description: 'Créez du contenu optimisé IA',
      icon: FileText,
      path: '/content-generator',
      color: 'text-pink-400',
      bgColor: 'bg-pink-500/10 hover:bg-pink-500/20',
      available: true
    },
    {
      title: 'Rapports Hebdo',
      description: 'Vos rapports automatiques',
      icon: Calendar,
      path: '/weekly-reports',
      color: 'text-indigo-400',
      bgColor: 'bg-indigo-500/10 hover:bg-indigo-500/20',
      available: true
    },
    {
      title: 'Citations IA',
      description: 'Suivez vos mentions IA',
      icon: Mic,
      path: '/ai-citations',
      color: 'text-blue-400',
      bgColor: 'bg-blue-500/10 hover:bg-blue-500/20',
      available: true
    },
    {
      title: 'Tests Multi-Modèles',
      description: 'GPT-4, Gemini, Claude...',
      icon: Bot,
      path: '/multi-model-test',
      color: 'text-yellow-400',
      bgColor: 'bg-yellow-500/10 hover:bg-yellow-500/20',
      available: false
    }
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      {actions.map((action, index) => (
        <button
          key={`${action.path}-${index}`}
          onClick={() => action.available && navigate(action.path)}
          disabled={!action.available}
          className={`relative p-4 rounded-xl border border-gray-800 ${action.bgColor} transition-all duration-300 text-left group ${
            action.available ? 'cursor-pointer hover:border-gray-600 hover:scale-[1.02]' : 'cursor-not-allowed opacity-60'
          }`}
        >
          {!action.available && (
            <span className="absolute top-2 right-2 text-[10px] px-2 py-0.5 bg-gray-700 text-gray-300 rounded-full">
              Bientôt
            </span>
          )}
          <action.icon className={`h-8 w-8 ${action.color} mb-3`} />
          <h3 className="text-sm font-semibold text-white mb-1">{action.title}</h3>
          <p className="text-xs text-gray-400">{action.description}</p>
        </button>
      ))}
    </div>
  );
}
