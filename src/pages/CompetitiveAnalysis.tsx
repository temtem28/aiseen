import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, 
  Trophy, 
  Plus, 
  X, 
  Search, 
  BarChart3,
  Target,
  TrendingUp,
  TrendingDown,
  Minus,
  Zap,
  CheckCircle2,
  AlertTriangle,
  Lightbulb,
  Crown,
  Medal,
  Award,
  Globe,
  Bot,
  FileText,
  Shield
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { supabase } from '@/lib/supabase';
import { performRealCompetitiveAnalysis } from '@/lib/apiServices';

interface AIVisibility {
  chatgpt: number;
  gemini: number;
  claude: number;
  perplexity: number;
}

interface KeyMetrics {
  contentQuality: number;
  technicalSEO: number;
  brandAuthority: number;
  aiReadiness: number;
  structuredData: number;
}

interface CompetitorAnalysis {
  site: string;
  seoScore: number;
  aeoScore: number;
  overallScore: number;
  aiVisibility: AIVisibility;
  strengths: string[];
  weaknesses: string[];
  brandPerception: string;
  sentiment: 'positive' | 'neutral' | 'negative' | 'mixed';
  keyMetrics: KeyMetrics;
}

interface CompetitiveReport {
  mainSite: CompetitorAnalysis;
  competitors: CompetitorAnalysis[];
  recommendations: string[];
  competitiveAdvantages: string[];
  areasToImprove: string[];
  marketPosition: string;
}

interface Rankings {
  seo: number;
  aeo: number;
  overall: number;
  total: number;
}

interface AnalysisResult {
  success: boolean;
  timestamp: string;
  report: CompetitiveReport;
  rankings: Rankings;
  summary: {
    mainSiteScore: number;
    averageCompetitorScore: number;
    scoreDifference: number;
  };
}

// AI Model Icons
const ChatGPTIcon = () => (
  <svg viewBox="0 0 24 24" className="w-5 h-5" fill="currentColor">
    <path d="M22.282 9.821a5.985 5.985 0 0 0-.516-4.91 6.046 6.046 0 0 0-6.51-2.9A6.065 6.065 0 0 0 4.981 4.18a5.985 5.985 0 0 0-3.998 2.9 6.046 6.046 0 0 0 .743 7.097 5.98 5.98 0 0 0 .51 4.911 6.051 6.051 0 0 0 6.515 2.9A5.985 5.985 0 0 0 13.26 24a6.056 6.056 0 0 0 5.772-4.206 5.99 5.99 0 0 0 3.997-2.9 6.056 6.056 0 0 0-.747-7.073zM13.26 22.43a4.476 4.476 0 0 1-2.876-1.04l.141-.081 4.779-2.758a.795.795 0 0 0 .392-.681v-6.737l2.02 1.168a.071.071 0 0 1 .038.052v5.583a4.504 4.504 0 0 1-4.494 4.494zM3.6 18.304a4.47 4.47 0 0 1-.535-3.014l.142.085 4.783 2.759a.771.771 0 0 0 .78 0l5.843-3.369v2.332a.08.08 0 0 1-.033.062L9.74 19.95a4.5 4.5 0 0 1-6.14-1.646zM2.34 7.896a4.485 4.485 0 0 1 2.366-1.973V11.6a.766.766 0 0 0 .388.676l5.815 3.355-2.02 1.168a.076.076 0 0 1-.071 0l-4.83-2.786A4.504 4.504 0 0 1 2.34 7.872zm16.597 3.855l-5.833-3.387L15.119 7.2a.076.076 0 0 1 .071 0l4.83 2.791a4.494 4.494 0 0 1-.676 8.105v-5.678a.79.79 0 0 0-.407-.667zm2.01-3.023l-.141-.085-4.774-2.782a.776.776 0 0 0-.785 0L9.409 9.23V6.897a.066.066 0 0 1 .028-.061l4.83-2.787a4.5 4.5 0 0 1 6.68 4.66zm-12.64 4.135l-2.02-1.164a.08.08 0 0 1-.038-.057V6.075a4.5 4.5 0 0 1 7.375-3.453l-.142.08L8.704 5.46a.795.795 0 0 0-.393.681zm1.097-2.365l2.602-1.5 2.607 1.5v2.999l-2.597 1.5-2.607-1.5z"/>
  </svg>
);

const GeminiIcon = () => (
  <svg viewBox="0 0 24 24" className="w-5 h-5" fill="currentColor">
    <path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm0 3.6c4.636 0 8.4 3.764 8.4 8.4s-3.764 8.4-8.4 8.4S3.6 16.636 3.6 12 7.364 3.6 12 3.6zm0 2.4a6 6 0 100 12 6 6 0 000-12z"/>
  </svg>
);

const ClaudeIcon = () => (
  <svg viewBox="0 0 24 24" className="w-5 h-5" fill="currentColor">
    <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/>
  </svg>
);

const PerplexityIcon = () => (
  <svg viewBox="0 0 24 24" className="w-5 h-5" fill="currentColor">
    <circle cx="12" cy="12" r="10" fill="none" stroke="currentColor" strokeWidth="2"/>
    <path d="M12 6v12M6 12h12" stroke="currentColor" strokeWidth="2"/>
  </svg>
);

export default function CompetitiveAnalysis() {
  const navigate = useNavigate();
  const [mainSite, setMainSite] = useState('');
  const [competitors, setCompetitors] = useState<string[]>(['', '', '']);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState('overview');

  const handleAddCompetitor = () => {
    if (competitors.length < 3) {
      setCompetitors([...competitors, '']);
    }
  };

  const handleRemoveCompetitor = (index: number) => {
    if (competitors.length > 1) {
      setCompetitors(competitors.filter((_, i) => i !== index));
    }
  };

  const handleCompetitorChange = (index: number, value: string) => {
    const newCompetitors = [...competitors];
    newCompetitors[index] = value;
    setCompetitors(newCompetitors);
  };


  const handleAnalyze = async () => {
    if (!mainSite.trim()) {
      setError('Veuillez entrer votre site principal');
      return;
    }

    const validCompetitors = competitors.filter(c => c.trim());
    if (validCompetitors.length === 0) {
      setError('Veuillez entrer au moins un concurrent');
      return;
    }

    setIsAnalyzing(true);
    setError(null);
    setResult(null);

    try {
      // Try Edge Function first
      let analysisResult: AnalysisResult | null = null;
      
      try {
        const { data, error: fnError } = await supabase.functions.invoke('competitive-analysis', {
          body: {
            mainSite: mainSite.trim(),
            competitors: validCompetitors
          }
        });

        if (!fnError && data && !data.error) {
          analysisResult = data;
        } else {
          throw new Error('Edge Function error');
        }
      } catch (edgeFunctionError: any) {
        // If Edge Function fails, use direct API service
        console.log('Edge Function not available, using direct API service');
        analysisResult = await performRealCompetitiveAnalysis(mainSite.trim(), validCompetitors);
      }

      if (analysisResult) {
        setResult(analysisResult);
        setActiveTab('overview');
      } else {
        throw new Error('Aucun résultat obtenu');
      }
    } catch (err: any) {
      console.error('Analysis error:', err);
      setError(err.message || 'Une erreur est survenue lors de l\'analyse. Vérifiez que les sites sont accessibles.');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-emerald-400';
    if (score >= 60) return 'text-cyan-400';
    if (score >= 40) return 'text-yellow-400';
    return 'text-red-400';
  };

  const getScoreBgColor = (score: number) => {
    if (score >= 80) return 'bg-emerald-500/20';
    if (score >= 60) return 'bg-cyan-500/20';
    if (score >= 40) return 'bg-yellow-500/20';
    return 'bg-red-500/20';
  };

  const getRankIcon = (rank: number) => {
    if (rank === 1) return <Crown className="w-5 h-5 text-yellow-400" />;
    if (rank === 2) return <Medal className="w-5 h-5 text-gray-300" />;
    if (rank === 3) return <Award className="w-5 h-5 text-orange-400" />;
    return <span className="text-gray-400 font-bold">#{rank}</span>;
  };

  const getTrendIcon = (diff: number) => {
    if (diff > 0) return <TrendingUp className="w-4 h-4 text-emerald-400" />;
    if (diff < 0) return <TrendingDown className="w-4 h-4 text-red-400" />;
    return <Minus className="w-4 h-4 text-gray-400" />;
  };

  const getSentimentColor = (sentiment: string) => {
    switch (sentiment) {
      case 'positive': return 'text-emerald-400 bg-emerald-500/20';
      case 'negative': return 'text-red-400 bg-red-500/20';
      case 'mixed': return 'text-yellow-400 bg-yellow-500/20';
      default: return 'text-gray-400 bg-gray-500/20';
    }
  };

  const getSentimentLabel = (sentiment: string) => {
    switch (sentiment) {
      case 'positive': return 'Positif';
      case 'negative': return 'Négatif';
      case 'mixed': return 'Mixte';
      default: return 'Neutre';
    }
  };

  // Render loading skeleton
  const renderSkeleton = () => (
    <div className="space-y-6 animate-pulse">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="h-32 bg-gray-800/50 rounded-xl" />
        ))}
      </div>
      <div className="h-80 bg-gray-800/50 rounded-xl" />
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="h-64 bg-gray-800/50 rounded-xl" />
        <div className="h-64 bg-gray-800/50 rounded-xl" />
      </div>
    </div>
  );

  // Render bar chart for scores comparison
  const renderBarChart = (data: CompetitorAnalysis[], metric: 'seoScore' | 'aeoScore' | 'overallScore', label: string) => {
    const maxScore = Math.max(...data.map(d => d[metric]));
    const sortedData = [...data].sort((a, b) => b[metric] - a[metric]);

    return (
      <div className="space-y-3">
        <h4 className="text-sm font-medium text-gray-400">{label}</h4>
        {sortedData.map((item, index) => (
          <div key={item.site} className="space-y-1">
            <div className="flex justify-between text-sm">
              <span className={`flex items-center gap-2 ${index === 0 ? 'text-white font-medium' : 'text-gray-400'}`}>
                {getRankIcon(index + 1)}
                <span className="truncate max-w-[150px]">{item.site}</span>
                {item.site === result?.report.mainSite.site && (
                  <span className="text-xs px-2 py-0.5 bg-cyan-500/20 text-cyan-400 rounded-full">Vous</span>
                )}
              </span>
              <span className={getScoreColor(item[metric])}>{item[metric]}</span>
            </div>
            <div className="h-2 bg-gray-800 rounded-full overflow-hidden">
              <div 
                className={`h-full rounded-full transition-all duration-1000 ${
                  item.site === result?.report.mainSite.site ? 'bg-gradient-to-r from-cyan-500 to-purple-500' : 'bg-gray-600'
                }`}
                style={{ width: `${(item[metric] / 100) * 100}%` }}
              />
            </div>
          </div>
        ))}
      </div>
    );
  };

  // Render AI visibility comparison
  const renderAIVisibilityComparison = () => {
    if (!result) return null;

    const allSites = [result.report.mainSite, ...result.report.competitors];
    const aiModels = [
      { key: 'chatgpt', name: 'ChatGPT', icon: ChatGPTIcon, color: 'text-emerald-400' },
      { key: 'gemini', name: 'Gemini', icon: GeminiIcon, color: 'text-blue-400' },
      { key: 'claude', name: 'Claude', icon: ClaudeIcon, color: 'text-orange-400' },
      { key: 'perplexity', name: 'Perplexity', icon: PerplexityIcon, color: 'text-purple-400' }
    ];

    return (
      <div className="space-y-4">
        {aiModels.map(model => (
          <div key={model.key} className="space-y-2">
            <div className="flex items-center gap-2 text-sm">
              <model.icon />
              <span className={model.color}>{model.name}</span>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
              {allSites.map(site => (
                <div 
                  key={site.site} 
                  className={`p-2 rounded-lg ${
                    site.site === result.report.mainSite.site 
                      ? 'bg-gradient-to-r from-cyan-500/20 to-purple-500/20 border border-cyan-500/30' 
                      : 'bg-gray-800/50'
                  }`}
                >
                  <div className="text-xs text-gray-400 truncate">{site.site}</div>
                  <div className={`text-lg font-bold ${getScoreColor(site.aiVisibility[model.key as keyof AIVisibility])}`}>
                    {site.aiVisibility[model.key as keyof AIVisibility]}%
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    );
  };

  // Render radar-like metrics comparison
  const renderMetricsComparison = () => {
    if (!result) return null;

    const metrics = [
      { key: 'contentQuality', label: 'Qualité Contenu', icon: FileText },
      { key: 'technicalSEO', label: 'SEO Technique', icon: Globe },
      { key: 'brandAuthority', label: 'Autorité Marque', icon: Shield },
      { key: 'aiReadiness', label: 'Préparation IA', icon: Bot },
      { key: 'structuredData', label: 'Données Structurées', icon: BarChart3 }
    ];

    const mainSite = result.report.mainSite;
    const avgCompetitor = {
      contentQuality: Math.round(result.report.competitors.reduce((sum, c) => sum + c.keyMetrics.contentQuality, 0) / result.report.competitors.length),
      technicalSEO: Math.round(result.report.competitors.reduce((sum, c) => sum + c.keyMetrics.technicalSEO, 0) / result.report.competitors.length),
      brandAuthority: Math.round(result.report.competitors.reduce((sum, c) => sum + c.keyMetrics.brandAuthority, 0) / result.report.competitors.length),
      aiReadiness: Math.round(result.report.competitors.reduce((sum, c) => sum + c.keyMetrics.aiReadiness, 0) / result.report.competitors.length),
      structuredData: Math.round(result.report.competitors.reduce((sum, c) => sum + c.keyMetrics.structuredData, 0) / result.report.competitors.length)
    };

    return (
      <div className="space-y-4">
        {metrics.map(metric => {
          const mainValue = mainSite.keyMetrics[metric.key as keyof KeyMetrics];
          const avgValue = avgCompetitor[metric.key as keyof typeof avgCompetitor];
          const diff = mainValue - avgValue;

          return (
            <div key={metric.key} className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-sm text-gray-300">
                  <metric.icon className="w-4 h-4 text-gray-500" />
                  {metric.label}
                </div>
                <div className="flex items-center gap-2">
                  {getTrendIcon(diff)}
                  <span className={`text-sm ${diff >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                    {diff >= 0 ? '+' : ''}{diff}
                  </span>
                </div>
              </div>
              <div className="relative h-3 bg-gray-800 rounded-full overflow-hidden">
                {/* Competitor average marker */}
                <div 
                  className="absolute top-0 bottom-0 w-0.5 bg-gray-500 z-10"
                  style={{ left: `${avgValue}%` }}
                />
                {/* Main site bar */}
                <div 
                  className={`h-full rounded-full transition-all duration-1000 ${
                    mainValue >= avgValue 
                      ? 'bg-gradient-to-r from-cyan-500 to-emerald-500' 
                      : 'bg-gradient-to-r from-orange-500 to-red-500'
                  }`}
                  style={{ width: `${mainValue}%` }}
                />
              </div>
              <div className="flex justify-between text-xs text-gray-500">
                <span>Vous: {mainValue}</span>
                <span>Moy. concurrents: {avgValue}</span>
              </div>
            </div>
          );
        })}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-950 via-gray-900 to-gray-950">
      {/* Header */}
      <header className="border-b border-gray-800 bg-gray-950/80 backdrop-blur-xl sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => navigate('/dashboard')}
                className="text-gray-400 hover:text-white"
              >
                <ArrowLeft className="h-5 w-5" />
              </Button>
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-xl bg-gradient-to-br from-orange-500/20 to-red-500/20">
                  <Trophy className="h-6 w-6 text-orange-400" />
                </div>
                <div>
                  <h1 className="text-xl font-bold text-white">Analyse Concurrentielle</h1>
                  <p className="text-sm text-gray-400">Comparez votre visibilité IA avec vos concurrents</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Input Form */}
        {!result && !isAnalyzing && (
          <Card className="bg-gray-900/50 border-gray-800 mb-8">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <Target className="h-5 w-5 text-orange-400" />
                Configurez votre analyse
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Main Site Input */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-300">
                  Votre site / marque
                </label>
                <div className="relative">
                  <Globe className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-500" />
                  <Input
                    value={mainSite}
                    onChange={(e) => setMainSite(e.target.value)}
                    placeholder="exemple.com ou Nom de marque"
                    className="pl-10 bg-gray-800/50 border-gray-700 text-white placeholder:text-gray-500 focus:border-cyan-500"
                  />
                </div>
              </div>

              {/* Competitors Inputs */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <label className="text-sm font-medium text-gray-300">
                    Concurrents (max 3)
                  </label>
                  {competitors.length < 3 && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={handleAddCompetitor}
                      className="text-cyan-400 hover:text-cyan-300"
                    >
                      <Plus className="h-4 w-4 mr-1" />
                      Ajouter
                    </Button>
                  )}
                </div>
                {competitors.map((competitor, index) => (
                  <div key={index} className="flex gap-2">
                    <div className="relative flex-1">
                      <Trophy className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-500" />
                      <Input
                        value={competitor}
                        onChange={(e) => handleCompetitorChange(index, e.target.value)}
                        placeholder={`Concurrent ${index + 1}`}
                        className="pl-10 bg-gray-800/50 border-gray-700 text-white placeholder:text-gray-500 focus:border-orange-500"
                      />
                    </div>
                    {competitors.length > 1 && (
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleRemoveCompetitor(index)}
                        className="text-gray-500 hover:text-red-400"
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                ))}
              </div>

              {error && (
                <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/30 text-red-400 text-sm">
                  {error}
                </div>
              )}

              <Button
                onClick={handleAnalyze}
                className="w-full bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white"
              >
                <Search className="h-4 w-4 mr-2" />
                Lancer l'analyse concurrentielle
              </Button>

              {/* Info Box */}
              <div className="p-4 rounded-xl bg-gradient-to-r from-orange-500/10 to-red-500/10 border border-orange-500/20">
                <h4 className="font-medium text-white mb-2 flex items-center gap-2">
                  <Zap className="h-4 w-4 text-orange-400" />
                  Ce que vous obtiendrez
                </h4>
                <ul className="space-y-1 text-sm text-gray-400">
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="h-3 w-3 text-emerald-400" />
                    Scores SEO et AEO comparatifs
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="h-3 w-3 text-emerald-400" />
                    Visibilité IA par modèle (ChatGPT, Gemini, Claude, Perplexity)
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="h-3 w-3 text-emerald-400" />
                    Analyse des forces et faiblesses
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="h-3 w-3 text-emerald-400" />
                    Recommandations stratégiques personnalisées
                  </li>
                </ul>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Loading State */}
        {isAnalyzing && (
          <div className="space-y-6">
            <div className="text-center py-12">
              <div className="relative inline-flex">
                <div className="w-20 h-20 rounded-full border-4 border-gray-700 border-t-orange-500 animate-spin" />
                <Trophy className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-8 w-8 text-orange-400" />
              </div>
              <h3 className="mt-6 text-xl font-semibold text-white">Analyse en cours...</h3>
              <p className="mt-2 text-gray-400">Nous comparons votre visibilité avec vos concurrents</p>
              <div className="mt-6 max-w-md mx-auto space-y-3">
                {['Analyse de votre site', 'Analyse des concurrents', 'Comparaison des métriques', 'Génération des recommandations'].map((step, i) => (
                  <div key={step} className="flex items-center gap-3 text-sm">
                    <div className={`w-6 h-6 rounded-full flex items-center justify-center ${
                      i < 2 ? 'bg-emerald-500/20 text-emerald-400' : 'bg-gray-800 text-gray-500'
                    }`}>
                      {i < 2 ? <CheckCircle2 className="w-4 h-4" /> : <div className="w-2 h-2 rounded-full bg-current animate-pulse" />}
                    </div>
                    <span className={i < 2 ? 'text-gray-300' : 'text-gray-500'}>{step}</span>
                  </div>
                ))}
              </div>
            </div>
            {renderSkeleton()}
          </div>
        )}

        {/* Results */}
        {result && !isAnalyzing && (
          <div className="space-y-6">
            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              {/* Your Score */}
              <Card className="bg-gradient-to-br from-cyan-500/10 to-purple-500/10 border-cyan-500/30">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-gray-400">Votre Score Global</span>
                    {getRankIcon(result.rankings.overall)}
                  </div>
                  <div className={`text-3xl font-bold ${getScoreColor(result.report.mainSite.overallScore)}`}>
                    {result.report.mainSite.overallScore}
                  </div>
                  <div className="text-xs text-gray-500 mt-1">
                    #{result.rankings.overall} sur {result.rankings.total}
                  </div>
                </CardContent>
              </Card>

              {/* Score Difference */}
              <Card className="bg-gray-900/50 border-gray-800">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-gray-400">vs Moyenne Concurrents</span>
                    {getTrendIcon(result.summary.scoreDifference)}
                  </div>
                  <div className={`text-3xl font-bold ${result.summary.scoreDifference >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                    {result.summary.scoreDifference >= 0 ? '+' : ''}{result.summary.scoreDifference}
                  </div>
                  <div className="text-xs text-gray-500 mt-1">
                    Moy: {result.summary.averageCompetitorScore}
                  </div>
                </CardContent>
              </Card>

              {/* SEO Rank */}
              <Card className="bg-gray-900/50 border-gray-800">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-gray-400">Classement SEO</span>
                    <Globe className="h-4 w-4 text-blue-400" />
                  </div>
                  <div className="text-3xl font-bold text-white">
                    #{result.rankings.seo}
                  </div>
                  <div className="text-xs text-gray-500 mt-1">
                    Score: {result.report.mainSite.seoScore}
                  </div>
                </CardContent>
              </Card>

              {/* AEO Rank */}
              <Card className="bg-gray-900/50 border-gray-800">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-gray-400">Classement AEO</span>
                    <Bot className="h-4 w-4 text-purple-400" />
                  </div>
                  <div className="text-3xl font-bold text-white">
                    #{result.rankings.aeo}
                  </div>
                  <div className="text-xs text-gray-500 mt-1">
                    Score: {result.report.mainSite.aeoScore}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Market Position */}
            <Card className="bg-gradient-to-r from-orange-500/10 to-red-500/10 border-orange-500/20">
              <CardContent className="p-4">
                <div className="flex items-start gap-3">
                  <Target className="h-5 w-5 text-orange-400 mt-0.5" />
                  <div>
                    <h3 className="font-medium text-white mb-1">Position sur le marché</h3>
                    <p className="text-gray-300 text-sm">{result.report.marketPosition}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Tabs */}
            <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
              <TabsList className="bg-gray-800/50 border border-gray-700 p-1">
                <TabsTrigger value="overview" className="data-[state=active]:bg-gray-700">
                  Vue d'ensemble
                </TabsTrigger>
                <TabsTrigger value="ai-visibility" className="data-[state=active]:bg-gray-700">
                  Visibilité IA
                </TabsTrigger>
                <TabsTrigger value="comparison" className="data-[state=active]:bg-gray-700">
                  Comparaison détaillée
                </TabsTrigger>
                <TabsTrigger value="recommendations" className="data-[state=active]:bg-gray-700">
                  Recommandations
                </TabsTrigger>
              </TabsList>

              {/* Overview Tab */}
              <TabsContent value="overview" className="space-y-6">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Score Comparison Charts */}
                  <Card className="bg-gray-900/50 border-gray-800">
                    <CardHeader>
                      <CardTitle className="text-white text-lg">Comparaison des Scores</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-6">
                      {renderBarChart([result.report.mainSite, ...result.report.competitors], 'overallScore', 'Score Global')}
                      {renderBarChart([result.report.mainSite, ...result.report.competitors], 'seoScore', 'Score SEO')}
                      {renderBarChart([result.report.mainSite, ...result.report.competitors], 'aeoScore', 'Score AEO')}
                    </CardContent>
                  </Card>

                  {/* Key Metrics Comparison */}
                  <Card className="bg-gray-900/50 border-gray-800">
                    <CardHeader>
                      <CardTitle className="text-white text-lg">Métriques Clés vs Concurrents</CardTitle>
                    </CardHeader>
                    <CardContent>
                      {renderMetricsComparison()}
                    </CardContent>
                  </Card>
                </div>

                {/* Strengths and Weaknesses */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <Card className="bg-gray-900/50 border-gray-800">
                    <CardHeader>
                      <CardTitle className="text-white text-lg flex items-center gap-2">
                        <CheckCircle2 className="h-5 w-5 text-emerald-400" />
                        Vos Avantages Concurrentiels
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <ul className="space-y-2">
                        {result.report.competitiveAdvantages.map((adv, i) => (
                          <li key={i} className="flex items-start gap-2 text-sm">
                            <Zap className="h-4 w-4 text-emerald-400 mt-0.5 shrink-0" />
                            <span className="text-gray-300">{adv}</span>
                          </li>
                        ))}
                      </ul>
                    </CardContent>
                  </Card>

                  <Card className="bg-gray-900/50 border-gray-800">
                    <CardHeader>
                      <CardTitle className="text-white text-lg flex items-center gap-2">
                        <AlertTriangle className="h-5 w-5 text-orange-400" />
                        Domaines à Améliorer
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <ul className="space-y-2">
                        {result.report.areasToImprove.map((area, i) => (
                          <li key={i} className="flex items-start gap-2 text-sm">
                            <Target className="h-4 w-4 text-orange-400 mt-0.5 shrink-0" />
                            <span className="text-gray-300">{area}</span>
                          </li>
                        ))}
                      </ul>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>

              {/* AI Visibility Tab */}
              <TabsContent value="ai-visibility" className="space-y-6">
                <Card className="bg-gray-900/50 border-gray-800">
                  <CardHeader>
                    <CardTitle className="text-white text-lg flex items-center gap-2">
                      <Bot className="h-5 w-5 text-purple-400" />
                      Visibilité par Modèle IA
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {renderAIVisibilityComparison()}
                  </CardContent>
                </Card>

                {/* Brand Perception Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {[result.report.mainSite, ...result.report.competitors].map((site) => (
                    <Card 
                      key={site.site} 
                      className={`border ${
                        site.site === result.report.mainSite.site 
                          ? 'bg-gradient-to-br from-cyan-500/10 to-purple-500/10 border-cyan-500/30' 
                          : 'bg-gray-900/50 border-gray-800'
                      }`}
                    >
                      <CardHeader className="pb-2">
                        <div className="flex items-center justify-between">
                          <CardTitle className="text-white text-base truncate">{site.site}</CardTitle>
                          <span className={`text-xs px-2 py-1 rounded-full ${getSentimentColor(site.sentiment)}`}>
                            {getSentimentLabel(site.sentiment)}
                          </span>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <p className="text-sm text-gray-400 mb-4">{site.brandPerception}</p>
                        <div className="grid grid-cols-2 gap-2 text-xs">
                          <div>
                            <span className="text-gray-500">Forces:</span>
                            <ul className="mt-1 space-y-1">
                              {site.strengths.slice(0, 2).map((s, i) => (
                                <li key={i} className="text-emerald-400 truncate">{s}</li>
                              ))}
                            </ul>
                          </div>
                          <div>
                            <span className="text-gray-500">Faiblesses:</span>
                            <ul className="mt-1 space-y-1">
                              {site.weaknesses.slice(0, 2).map((w, i) => (
                                <li key={i} className="text-red-400 truncate">{w}</li>
                              ))}
                            </ul>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </TabsContent>

              {/* Detailed Comparison Tab */}
              <TabsContent value="comparison" className="space-y-6">
                <Card className="bg-gray-900/50 border-gray-800 overflow-hidden">
                  <CardHeader>
                    <CardTitle className="text-white text-lg">Tableau Comparatif Complet</CardTitle>
                  </CardHeader>
                  <CardContent className="p-0">
                    <div className="overflow-x-auto">
                      <table className="w-full">
                        <thead className="bg-gray-800/50">
                          <tr>
                            <th className="px-4 py-3 text-left text-sm font-medium text-gray-400">Site</th>
                            <th className="px-4 py-3 text-center text-sm font-medium text-gray-400">Score Global</th>
                            <th className="px-4 py-3 text-center text-sm font-medium text-gray-400">SEO</th>
                            <th className="px-4 py-3 text-center text-sm font-medium text-gray-400">AEO</th>
                            <th className="px-4 py-3 text-center text-sm font-medium text-gray-400">ChatGPT</th>
                            <th className="px-4 py-3 text-center text-sm font-medium text-gray-400">Gemini</th>
                            <th className="px-4 py-3 text-center text-sm font-medium text-gray-400">Claude</th>
                            <th className="px-4 py-3 text-center text-sm font-medium text-gray-400">Perplexity</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-800">
                          {[result.report.mainSite, ...result.report.competitors].map((site, index) => (
                            <tr 
                              key={site.site}
                              className={site.site === result.report.mainSite.site ? 'bg-cyan-500/5' : ''}
                            >
                              <td className="px-4 py-3">
                                <div className="flex items-center gap-2">
                                  {getRankIcon(index + 1)}
                                  <span className="text-white text-sm truncate max-w-[150px]">{site.site}</span>
                                  {site.site === result.report.mainSite.site && (
                                    <span className="text-xs px-2 py-0.5 bg-cyan-500/20 text-cyan-400 rounded-full">Vous</span>
                                  )}
                                </div>
                              </td>
                              <td className="px-4 py-3 text-center">
                                <span className={`font-bold ${getScoreColor(site.overallScore)}`}>{site.overallScore}</span>
                              </td>
                              <td className="px-4 py-3 text-center">
                                <span className={getScoreColor(site.seoScore)}>{site.seoScore}</span>
                              </td>
                              <td className="px-4 py-3 text-center">
                                <span className={getScoreColor(site.aeoScore)}>{site.aeoScore}</span>
                              </td>
                              <td className="px-4 py-3 text-center">
                                <span className={getScoreColor(site.aiVisibility.chatgpt)}>{site.aiVisibility.chatgpt}%</span>
                              </td>
                              <td className="px-4 py-3 text-center">
                                <span className={getScoreColor(site.aiVisibility.gemini)}>{site.aiVisibility.gemini}%</span>
                              </td>
                              <td className="px-4 py-3 text-center">
                                <span className={getScoreColor(site.aiVisibility.claude)}>{site.aiVisibility.claude}%</span>
                              </td>
                              <td className="px-4 py-3 text-center">
                                <span className={getScoreColor(site.aiVisibility.perplexity)}>{site.aiVisibility.perplexity}%</span>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Recommendations Tab */}
              <TabsContent value="recommendations" className="space-y-6">
                <Card className="bg-gradient-to-br from-orange-500/10 to-red-500/10 border-orange-500/20">
                  <CardHeader>
                    <CardTitle className="text-white text-lg flex items-center gap-2">
                      <Lightbulb className="h-5 w-5 text-yellow-400" />
                      Recommandations Stratégiques
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {result.report.recommendations.map((rec, i) => (
                        <div 
                          key={i}
                          className="flex items-start gap-4 p-4 rounded-xl bg-gray-900/50 border border-gray-800"
                        >
                          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-orange-500 to-red-500 flex items-center justify-center text-white font-bold text-sm shrink-0">
                            {i + 1}
                          </div>
                          <div>
                            <p className="text-gray-200">{rec}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                {/* Action Buttons */}
                <div className="flex flex-wrap gap-4">
                  <Button
                    onClick={() => {
                      setResult(null);
                      setMainSite('');
                      setCompetitors(['', '', '']);
                    }}
                    variant="outline"
                    className="border-gray-700 text-gray-300 hover:bg-gray-800"
                  >
                    <Search className="h-4 w-4 mr-2" />
                    Nouvelle Analyse
                  </Button>
                  <Button
                    onClick={() => navigate('/audit')}
                    className="bg-gradient-to-r from-cyan-500 to-purple-500 hover:from-cyan-600 hover:to-purple-600"
                  >
                    <BarChart3 className="h-4 w-4 mr-2" />
                    Audit SEO/AEO Complet
                  </Button>
                  <Button
                    onClick={() => navigate('/ai-perception')}
                    variant="outline"
                    className="border-purple-500/50 text-purple-400 hover:bg-purple-500/10"
                  >
                    <Bot className="h-4 w-4 mr-2" />
                    Perception IA Détaillée
                  </Button>
                </div>
              </TabsContent>
            </Tabs>
          </div>
        )}
      </main>
    </div>
  );
}
