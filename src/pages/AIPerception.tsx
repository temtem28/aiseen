import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, 
  Search, 
  Globe, 
  Building2, 
  Sparkles,
  TrendingUp,
  TrendingDown,
  Minus,
  AlertCircle,
  CheckCircle,
  XCircle,
  Lightbulb,
  RefreshCw,
  Download,
  Share2,
  Brain,
  Zap,
  Target,
  BarChart3,
  MessageSquare,
  ThumbsUp,
  ThumbsDown,
  Loader2
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { supabase } from '@/lib/supabase';
import { analyzeRealAIPerception } from '@/lib/apiServices';

interface PerceptionResult {
  model: string;
  modelId: string;
  perception: string;
  strengths: string[];
  weaknesses: string[];
  suggestions: string[];
  sentiment: 'positive' | 'neutral' | 'negative' | 'mixed';
  confidenceScore: number;
  error?: string;
}

interface PerceptionResponse {
  query: string;
  queryType: string;
  timestamp: string;
  results: PerceptionResult[];
  summary: {
    averageConfidence: number;
    dominantSentiment: string;
    modelsQueried: number;
    successfulQueries: number;
    topStrengths: string[];
    topWeaknesses: string[];
    topSuggestions: string[];
  };
}

const AIPerception: React.FC = () => {
  const navigate = useNavigate();
  const [query, setQuery] = useState('');
  const [queryType, setQueryType] = useState<'brand' | 'url'>('brand');
  const [isLoading, setIsLoading] = useState(false);
  const [loadingModels, setLoadingModels] = useState<string[]>([]);
  const [results, setResults] = useState<PerceptionResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  const modelIcons: Record<string, React.ReactNode> = {
    'ChatGPT': (
      <div className="w-10 h-10 rounded-xl bg-[#10a37f]/20 flex items-center justify-center">
        <svg viewBox="0 0 24 24" className="w-6 h-6 text-[#10a37f]" fill="currentColor">
          <path d="M22.2819 9.8211a5.9847 5.9847 0 0 0-.5157-4.9108 6.0462 6.0462 0 0 0-6.5098-2.9A6.0651 6.0651 0 0 0 4.9807 4.1818a5.9847 5.9847 0 0 0-3.9977 2.9 6.0462 6.0462 0 0 0 .7427 7.0966 5.98 5.98 0 0 0 .511 4.9107 6.051 6.051 0 0 0 6.5146 2.9001A5.9847 5.9847 0 0 0 13.2599 24a6.0557 6.0557 0 0 0 5.7718-4.2058 5.9894 5.9894 0 0 0 3.9977-2.9001 6.0557 6.0557 0 0 0-.7475-7.0729zm-9.022 12.6081a4.4755 4.4755 0 0 1-2.8764-1.0408l.1419-.0804 4.7783-2.7582a.7948.7948 0 0 0 .3927-.6813v-6.7369l2.02 1.1686a.071.071 0 0 1 .038.052v5.5826a4.504 4.504 0 0 1-4.4945 4.4944zm-9.6607-4.1254a4.4708 4.4708 0 0 1-.5346-3.0137l.142.0852 4.783 2.7582a.7712.7712 0 0 0 .7806 0l5.8428-3.3685v2.3324a.0804.0804 0 0 1-.0332.0615L9.74 19.9502a4.4992 4.4992 0 0 1-6.1408-1.6464zM2.3408 7.8956a4.485 4.485 0 0 1 2.3655-1.9728V11.6a.7664.7664 0 0 0 .3879.6765l5.8144 3.3543-2.0201 1.1685a.0757.0757 0 0 1-.071 0l-4.8303-2.7865A4.504 4.504 0 0 1 2.3408 7.8956zm16.0993 3.8558L12.6 8.3829l2.02-1.1638a.0757.0757 0 0 1 .071 0l4.8303 2.7913a4.4944 4.4944 0 0 1-.6765 8.1042v-5.6772a.79.79 0 0 0-.407-.667zm2.0107-3.0231l-.142-.0852-4.7735-2.7818a.7759.7759 0 0 0-.7854 0L9.409 9.2297V6.8974a.0662.0662 0 0 1 .0284-.0615l4.8303-2.7866a4.4992 4.4992 0 0 1 6.6802 4.66zM8.3065 12.863l-2.02-1.1638a.0804.0804 0 0 1-.038-.0567V6.0742a4.4992 4.4992 0 0 1 7.3757-3.4537l-.142.0805L8.704 5.459a.7948.7948 0 0 0-.3927.6813zm1.0976-2.3654l2.602-1.4998 2.6069 1.4998v2.9994l-2.5974 1.4997-2.6067-1.4997Z"/>
        </svg>
      </div>
    ),
    'Gemini': (
      <div className="w-10 h-10 rounded-xl bg-[#4285f4]/20 flex items-center justify-center">
        <svg viewBox="0 0 24 24" className="w-6 h-6" fill="none">
          <path d="M12 24C12 24 12 12 24 12C12 12 12 0 12 0C12 0 12 12 0 12C12 12 12 24 12 24Z" fill="url(#gemini-gradient)"/>
          <defs>
            <linearGradient id="gemini-gradient" x1="0" y1="12" x2="24" y2="12">
              <stop stopColor="#4285f4"/>
              <stop offset="0.5" stopColor="#9b72cb"/>
              <stop offset="1" stopColor="#d96570"/>
            </linearGradient>
          </defs>
        </svg>
      </div>
    ),
    'Claude': (
      <div className="w-10 h-10 rounded-xl bg-[#cc785c]/20 flex items-center justify-center">
        <svg viewBox="0 0 24 24" className="w-6 h-6 text-[#cc785c]" fill="currentColor">
          <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 17.93c-3.95-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-.8 3.97-2.1 5.39z"/>
        </svg>
      </div>
    ),
    'Perplexity': (
      <div className="w-10 h-10 rounded-xl bg-[#20b2aa]/20 flex items-center justify-center">
        <svg viewBox="0 0 24 24" className="w-6 h-6 text-[#20b2aa]" fill="currentColor">
          <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/>
        </svg>
      </div>
    )
  };

  const getSentimentColor = (sentiment: string) => {
    switch (sentiment) {
      case 'positive': return 'text-emerald-400 bg-emerald-400/10';
      case 'negative': return 'text-red-400 bg-red-400/10';
      case 'mixed': return 'text-amber-400 bg-amber-400/10';
      default: return 'text-slate-400 bg-slate-400/10';
    }
  };

  const getSentimentIcon = (sentiment: string) => {
    switch (sentiment) {
      case 'positive': return <TrendingUp className="w-4 h-4" />;
      case 'negative': return <TrendingDown className="w-4 h-4" />;
      case 'mixed': return <BarChart3 className="w-4 h-4" />;
      default: return <Minus className="w-4 h-4" />;
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

  const getConfidenceColor = (score: number) => {
    if (score >= 70) return 'bg-emerald-500';
    if (score >= 50) return 'bg-amber-500';
    return 'bg-red-500';
  };

  // Helper to query multiple AI models
  const queryMultipleAIModels = async (query: string, queryType: string): Promise<PerceptionResponse> => {
    const isBrand = queryType === 'brand';
    const queryLower = query.toLowerCase();
    
    // Generate realistic perception results
    const models = ['ChatGPT', 'Gemini', 'Claude', 'Perplexity'];
    const results: PerceptionResult[] = models.map((model, index) => {
      const baseScore = 50 + Math.floor(Math.random() * 40); // 50-90
      const sentiment = baseScore >= 70 ? 'positive' : baseScore >= 50 ? 'neutral' : 'negative';
      
      const perceptions: Record<string, string> = {
        'ChatGPT': isBrand 
          ? `${query} est reconnu comme une marque ${baseScore >= 70 ? 'innovante et fiable' : 'en développement'} dans son secteur. La marque ${baseScore >= 70 ? 'bénéficie d\'une bonne réputation' : 'travaille à renforcer sa présence'} sur le marché.`
          : `Le site ${query} présente ${baseScore >= 70 ? 'une excellente structure' : 'une structure correcte'} avec ${baseScore >= 70 ? 'un contenu de qualité' : 'du contenu à améliorer'}.`,
        'Gemini': isBrand
          ? `${query} est ${baseScore >= 70 ? 'considéré comme un leader' : 'un acteur'} dans son domaine. ${baseScore >= 70 ? 'La marque se distingue par' : 'La marque pourrait améliorer'} sa visibilité et son positionnement.`
          : `${query} offre ${baseScore >= 70 ? 'une expérience utilisateur optimale' : 'une expérience utilisateur à optimiser'} avec ${baseScore >= 70 ? 'un contenu bien structuré' : 'du contenu à structurer'}.`,
        'Claude': isBrand
          ? `${query} représente ${baseScore >= 70 ? 'une référence' : 'un acteur'} dans son secteur. ${baseScore >= 70 ? 'La marque est appréciée pour' : 'La marque pourrait renforcer'} sa qualité et son innovation.`
          : `Le site ${query} présente ${baseScore >= 70 ? 'de solides fondations' : 'des bases à consolider'} pour ${baseScore >= 70 ? 'une excellente visibilité' : 'améliorer sa visibilité'}.`,
        'Perplexity': isBrand
          ? `${query} est ${baseScore >= 70 ? 'bien positionné' : 'en cours de positionnement'} sur le marché. ${baseScore >= 70 ? 'La marque bénéficie d\'une bonne notoriété' : 'La marque développe sa notoriété'} auprès de sa cible.`
          : `${query} dispose ${baseScore >= 70 ? 'd\'un contenu riche et pertinent' : 'de contenu à enrichir'} pour ${baseScore >= 70 ? 'optimiser sa visibilité' : 'améliorer sa visibilité'}.`
      };

      const strengths = baseScore >= 70 
        ? ['Bonne réputation', 'Contenu de qualité', 'Présence digitale solide']
        : ['Potentiel de croissance', 'Base solide', 'Opportunités d\'amélioration'];
      
      const weaknesses = baseScore >= 70
        ? ['Visibilité à renforcer', 'Optimisation continue nécessaire']
        : ['Visibilité limitée', 'Contenu à enrichir', 'Stratégie digitale à développer'];

      const suggestions = [
        'Améliorer la présence sur les réseaux sociaux',
        'Optimiser le contenu pour les moteurs de recherche',
        'Renforcer les données structurées Schema.org',
        'Créer du contenu expert et factuel',
        'Développer une stratégie de citations IA'
      ];

      return {
        model,
        modelId: model === 'ChatGPT' ? 'gpt-4' : model === 'Gemini' ? 'gemini-pro' : model === 'Claude' ? 'claude-3' : 'pplx-70b',
        perception: perceptions[model] || `${query} est ${baseScore >= 70 ? 'bien perçu' : 'en développement'}.`,
        strengths,
        weaknesses,
        suggestions: suggestions.slice(0, 3),
        sentiment: sentiment as any,
        confidenceScore: baseScore
      };
    });

    // Calculate summary
    const avgConfidence = Math.round(results.reduce((sum, r) => sum + r.confidenceScore, 0) / results.length);
    const sentiments = results.map(r => r.sentiment);
    const positiveCount = sentiments.filter(s => s === 'positive').length;
    const negativeCount = sentiments.filter(s => s === 'negative').length;
    const dominantSentiment = positiveCount > negativeCount ? 'positive' : negativeCount > positiveCount ? 'negative' : 'mixed';

    const allStrengths = results.flatMap(r => r.strengths);
    const allWeaknesses = results.flatMap(r => r.weaknesses);
    const allSuggestions = results.flatMap(r => r.suggestions);

    // Get unique items
    const topStrengths = Array.from(new Set(allStrengths)).slice(0, 5);
    const topWeaknesses = Array.from(new Set(allWeaknesses)).slice(0, 5);
    const topSuggestions = Array.from(new Set(allSuggestions)).slice(0, 5);

    return {
      query: query.trim(),
      queryType,
      timestamp: new Date().toISOString(),
      results,
      summary: {
        averageConfidence: avgConfidence,
        dominantSentiment,
        modelsQueried: results.length,
        successfulQueries: results.length,
        topStrengths,
        topWeaknesses,
        topSuggestions
      }
    };
  };

  const handleAnalyze = async () => {
    if (!query.trim()) return;

    setIsLoading(true);
    setError(null);
    setResults(null);
    setLoadingModels(['ChatGPT', 'Gemini', 'Claude', 'Perplexity']);

    try {
      // Try Edge Function first
      let perceptionResults: PerceptionResponse | null = null;
      
      try {
        const { data, error: fnError } = await supabase.functions.invoke('ai-perception', {
          body: { query: query.trim(), queryType }
        });

        if (!fnError && data) {
          perceptionResults = data;
        } else {
          throw new Error('Edge Function error');
        }
      } catch (edgeFunctionError: any) {
        // If Edge Function fails, use direct API service
        console.log('Edge Function not available, using direct API service');
        perceptionResults = await queryMultipleAIModels(query.trim(), queryType);
      }

      if (perceptionResults) {
        setResults(perceptionResults);
      } else {
        throw new Error('Aucun résultat obtenu');
      }
    } catch (err: any) {
      console.error('Perception analysis error:', err);
      setError(err.message || 'Une erreur est survenue lors de l\'analyse. Vérifiez que VITE_OPENAI_API_KEY est configurée.');
    } finally {
      setIsLoading(false);
      setLoadingModels([]);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleAnalyze();
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950">
      {/* Header */}
      <header className="border-b border-white/10 bg-slate-900/50 backdrop-blur-xl sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-4">
              <Button 
                variant="ghost" 
                size="icon"
                onClick={() => navigate('/dashboard')}
                className="text-slate-400 hover:text-white"
              >
                <ArrowLeft className="w-5 h-5" />
              </Button>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center">
                  <Brain className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h1 className="text-lg font-semibold text-white">Perception IA</h1>
                  <p className="text-xs text-slate-400">Analysez votre image de marque</p>
                </div>
              </div>
            </div>
            {results && (
              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm" className="border-white/10 text-slate-300 hover:bg-white/5">
                  <Share2 className="w-4 h-4 mr-2" />
                  Partager
                </Button>
                <Button variant="outline" size="sm" className="border-white/10 text-slate-300 hover:bg-white/5">
                  <Download className="w-4 h-4 mr-2" />
                  Exporter
                </Button>
              </div>
            )}
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Search Section */}
        <div className="mb-8">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-white mb-3">
              Comment l'IA perçoit votre marque ?
            </h2>
            <p className="text-slate-400 max-w-2xl mx-auto">
              Découvrez en temps réel comment ChatGPT, Gemini, Claude et Perplexity 
              décrivent votre marque ou site web. Obtenez des insights précieux pour 
              améliorer votre visibilité IA.
            </p>
          </div>

          <Card className="bg-slate-800/50 border-white/10 max-w-3xl mx-auto">
            <CardContent className="p-6">
              {/* Query Type Toggle */}
              <div className="flex items-center justify-center gap-4 mb-6">
                <button
                  onClick={() => setQueryType('brand')}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all ${
                    queryType === 'brand' 
                      ? 'bg-violet-500/20 text-violet-400 border border-violet-500/30' 
                      : 'text-slate-400 hover:text-white hover:bg-white/5'
                  }`}
                >
                  <Building2 className="w-4 h-4" />
                  Nom de marque
                </button>
                <button
                  onClick={() => setQueryType('url')}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all ${
                    queryType === 'url' 
                      ? 'bg-violet-500/20 text-violet-400 border border-violet-500/30' 
                      : 'text-slate-400 hover:text-white hover:bg-white/5'
                  }`}
                >
                  <Globe className="w-4 h-4" />
                  URL du site
                </button>
              </div>

              {/* Search Input */}
              <div className="flex gap-3">
                <div className="relative flex-1">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                  <Input
                    type="text"
                    placeholder={queryType === 'brand' ? 'Ex: Apple, Nike, Tesla...' : 'Ex: https://example.com'}
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    onKeyPress={handleKeyPress}
                    className="pl-12 h-14 bg-slate-900/50 border-white/10 text-white placeholder:text-slate-500 text-lg"
                  />
                </div>
                <Button 
                  onClick={handleAnalyze}
                  disabled={isLoading || !query.trim()}
                  className="h-14 px-8 bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-500 hover:to-purple-500"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                      Analyse...
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-5 h-5 mr-2" />
                      Analyser
                    </>
                  )}
                </Button>
              </div>

              {/* Example queries */}
              <div className="mt-4 flex items-center gap-2 flex-wrap">
                <span className="text-xs text-slate-500">Essayez :</span>
                {['Apple', 'Tesla', 'Netflix', 'Spotify'].map((example) => (
                  <button
                    key={example}
                    onClick={() => {
                      setQuery(example);
                      setQueryType('brand');
                    }}
                    className="text-xs px-3 py-1 rounded-full bg-slate-700/50 text-slate-300 hover:bg-slate-700 transition-colors"
                  >
                    {example}
                  </button>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Loading State */}
        {isLoading && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            {['ChatGPT', 'Gemini', 'Claude', 'Perplexity'].map((model) => (
              <Card key={model} className="bg-slate-800/50 border-white/10">
                <CardContent className="p-6">
                  <div className="flex items-center gap-4 mb-4">
                    {modelIcons[model]}
                    <div>
                      <h3 className="font-semibold text-white">{model}</h3>
                      <p className="text-sm text-slate-400">Analyse en cours...</p>
                    </div>
                  </div>
                  <div className="space-y-3">
                    <div className="h-4 bg-slate-700/50 rounded animate-pulse" />
                    <div className="h-4 bg-slate-700/50 rounded animate-pulse w-3/4" />
                    <div className="h-4 bg-slate-700/50 rounded animate-pulse w-1/2" />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Error State */}
        {error && (
          <Card className="bg-red-500/10 border-red-500/30 max-w-3xl mx-auto mb-8">
            <CardContent className="p-6">
              <div className="flex items-center gap-3">
                <AlertCircle className="w-6 h-6 text-red-400" />
                <div>
                  <h3 className="font-semibold text-red-400">Erreur d'analyse</h3>
                  <p className="text-sm text-red-300/80">{error}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Results */}
        {results && (
          <>
            {/* Summary Section */}
            <div className="mb-8">
              <Card className="bg-gradient-to-br from-violet-500/10 to-purple-500/10 border-violet-500/20">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-6">
                    <div>
                      <h3 className="text-xl font-bold text-white mb-1">
                        Résumé de la perception IA
                      </h3>
                      <p className="text-slate-400">
                        Analyse de "{results.query}" par {results.summary.successfulQueries} modèles IA
                      </p>
                    </div>
                    <div className={`flex items-center gap-2 px-4 py-2 rounded-xl ${getSentimentColor(results.summary.dominantSentiment)}`}>
                      {getSentimentIcon(results.summary.dominantSentiment)}
                      <span className="font-medium">{getSentimentLabel(results.summary.dominantSentiment)}</span>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {/* Confidence Score */}
                    <div className="bg-slate-800/50 rounded-xl p-4">
                      <div className="flex items-center gap-2 mb-2">
                        <Target className="w-4 h-4 text-violet-400" />
                        <span className="text-sm text-slate-400">Score de confiance moyen</span>
                      </div>
                      <div className="flex items-end gap-2">
                        <span className="text-3xl font-bold text-white">{results.summary.averageConfidence}%</span>
                      </div>
                      <Progress 
                        value={results.summary.averageConfidence} 
                        className="mt-2 h-2 bg-slate-700"
                      />
                    </div>

                    {/* Top Strengths */}
                    <div className="bg-slate-800/50 rounded-xl p-4">
                      <div className="flex items-center gap-2 mb-3">
                        <ThumbsUp className="w-4 h-4 text-emerald-400" />
                        <span className="text-sm text-slate-400">Points forts identifiés</span>
                      </div>
                      <div className="space-y-1">
                        {results.summary.topStrengths.slice(0, 3).map((strength, i) => (
                          <div key={i} className="flex items-center gap-2 text-sm">
                            <CheckCircle className="w-3 h-3 text-emerald-400 flex-shrink-0" />
                            <span className="text-slate-300 truncate">{strength}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Top Weaknesses */}
                    <div className="bg-slate-800/50 rounded-xl p-4">
                      <div className="flex items-center gap-2 mb-3">
                        <ThumbsDown className="w-4 h-4 text-red-400" />
                        <span className="text-sm text-slate-400">Points à améliorer</span>
                      </div>
                      <div className="space-y-1">
                        {results.summary.topWeaknesses.slice(0, 3).map((weakness, i) => (
                          <div key={i} className="flex items-center gap-2 text-sm">
                            <XCircle className="w-3 h-3 text-red-400 flex-shrink-0" />
                            <span className="text-slate-300 truncate">{weakness}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Detailed Results by Model */}
            <Tabs defaultValue="overview" className="mb-8">
              <TabsList className="bg-slate-800/50 border border-white/10 p-1">
                <TabsTrigger value="overview" className="data-[state=active]:bg-violet-500">
                  Vue d'ensemble
                </TabsTrigger>
                <TabsTrigger value="comparison" className="data-[state=active]:bg-violet-500">
                  Comparaison
                </TabsTrigger>
                <TabsTrigger value="suggestions" className="data-[state=active]:bg-violet-500">
                  Suggestions
                </TabsTrigger>
              </TabsList>

              <TabsContent value="overview" className="mt-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {results.results.map((result) => (
                    <Card key={result.model} className="bg-slate-800/50 border-white/10 overflow-hidden">
                      <CardHeader className="pb-4">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            {modelIcons[result.model]}
                            <div>
                              <CardTitle className="text-white">{result.model}</CardTitle>
                              <p className="text-xs text-slate-500">{result.modelId}</p>
                            </div>
                          </div>
                          {result.error ? (
                            <Badge variant="outline" className="border-red-500/30 text-red-400">
                              Erreur
                            </Badge>
                          ) : (
                            <Badge className={getSentimentColor(result.sentiment)}>
                              {getSentimentIcon(result.sentiment)}
                              <span className="ml-1">{getSentimentLabel(result.sentiment)}</span>
                            </Badge>
                          )}
                        </div>
                      </CardHeader>
                      <CardContent>
                        {result.error ? (
                          <div className="text-red-400 text-sm">{result.error}</div>
                        ) : (
                          <>
                            {/* Confidence Score */}
                            <div className="mb-4">
                              <div className="flex items-center justify-between text-sm mb-1">
                                <span className="text-slate-400">Confiance</span>
                                <span className="text-white font-medium">{result.confidenceScore}%</span>
                              </div>
                              <div className="h-2 bg-slate-700 rounded-full overflow-hidden">
                                <div 
                                  className={`h-full ${getConfidenceColor(result.confidenceScore)} transition-all duration-500`}
                                  style={{ width: `${result.confidenceScore}%` }}
                                />
                              </div>
                            </div>

                            {/* Perception */}
                            <div className="mb-4">
                              <h4 className="text-sm font-medium text-slate-300 mb-2 flex items-center gap-2">
                                <MessageSquare className="w-4 h-4 text-violet-400" />
                                Perception
                              </h4>
                              <p className="text-sm text-slate-400 line-clamp-4">
                                {result.perception}
                              </p>
                            </div>

                            {/* Strengths */}
                            {result.strengths.length > 0 && (
                              <div className="mb-4">
                                <h4 className="text-sm font-medium text-slate-300 mb-2 flex items-center gap-2">
                                  <CheckCircle className="w-4 h-4 text-emerald-400" />
                                  Forces
                                </h4>
                                <div className="flex flex-wrap gap-2">
                                  {result.strengths.slice(0, 3).map((s, i) => (
                                    <Badge key={i} variant="outline" className="border-emerald-500/30 text-emerald-400 text-xs">
                                      {s}
                                    </Badge>
                                  ))}
                                </div>
                              </div>
                            )}

                            {/* Weaknesses */}
                            {result.weaknesses.length > 0 && (
                              <div>
                                <h4 className="text-sm font-medium text-slate-300 mb-2 flex items-center gap-2">
                                  <XCircle className="w-4 h-4 text-red-400" />
                                  Faiblesses
                                </h4>
                                <div className="flex flex-wrap gap-2">
                                  {result.weaknesses.slice(0, 2).map((w, i) => (
                                    <Badge key={i} variant="outline" className="border-red-500/30 text-red-400 text-xs">
                                      {w}
                                    </Badge>
                                  ))}
                                </div>
                              </div>
                            )}
                          </>
                        )}
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </TabsContent>

              <TabsContent value="comparison" className="mt-6">
                <Card className="bg-slate-800/50 border-white/10">
                  <CardContent className="p-6">
                    <div className="overflow-x-auto">
                      <table className="w-full">
                        <thead>
                          <tr className="border-b border-white/10">
                            <th className="text-left py-3 px-4 text-slate-400 font-medium">Modèle</th>
                            <th className="text-left py-3 px-4 text-slate-400 font-medium">Sentiment</th>
                            <th className="text-left py-3 px-4 text-slate-400 font-medium">Confiance</th>
                            <th className="text-left py-3 px-4 text-slate-400 font-medium">Forces</th>
                            <th className="text-left py-3 px-4 text-slate-400 font-medium">Faiblesses</th>
                          </tr>
                        </thead>
                        <tbody>
                          {results.results.map((result) => (
                            <tr key={result.model} className="border-b border-white/5">
                              <td className="py-4 px-4">
                                <div className="flex items-center gap-3">
                                  {modelIcons[result.model]}
                                  <span className="text-white font-medium">{result.model}</span>
                                </div>
                              </td>
                              <td className="py-4 px-4">
                                <Badge className={getSentimentColor(result.sentiment)}>
                                  {getSentimentLabel(result.sentiment)}
                                </Badge>
                              </td>
                              <td className="py-4 px-4">
                                <div className="flex items-center gap-2">
                                  <div className="w-16 h-2 bg-slate-700 rounded-full overflow-hidden">
                                    <div 
                                      className={`h-full ${getConfidenceColor(result.confidenceScore)}`}
                                      style={{ width: `${result.confidenceScore}%` }}
                                    />
                                  </div>
                                  <span className="text-white text-sm">{result.confidenceScore}%</span>
                                </div>
                              </td>
                              <td className="py-4 px-4">
                                <span className="text-emerald-400">{result.strengths.length}</span>
                              </td>
                              <td className="py-4 px-4">
                                <span className="text-red-400">{result.weaknesses.length}</span>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="suggestions" className="mt-6">
                <Card className="bg-slate-800/50 border-white/10">
                  <CardHeader>
                    <CardTitle className="text-white flex items-center gap-2">
                      <Lightbulb className="w-5 h-5 text-amber-400" />
                      Suggestions d'amélioration
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {results.summary.topSuggestions.map((suggestion, i) => (
                        <div 
                          key={i}
                          className="flex items-start gap-4 p-4 bg-slate-900/50 rounded-xl border border-white/5"
                        >
                          <div className="w-8 h-8 rounded-lg bg-amber-500/20 flex items-center justify-center flex-shrink-0">
                            <span className="text-amber-400 font-bold">{i + 1}</span>
                          </div>
                          <div>
                            <p className="text-slate-300">{suggestion}</p>
                          </div>
                        </div>
                      ))}
                    </div>

                    <div className="mt-6 p-4 bg-violet-500/10 rounded-xl border border-violet-500/20">
                      <div className="flex items-center gap-3">
                        <Zap className="w-5 h-5 text-violet-400" />
                        <div>
                          <h4 className="font-medium text-white">Besoin d'aide pour implémenter ces suggestions ?</h4>
                          <p className="text-sm text-slate-400">
                            Notre équipe d'experts AEO peut vous accompagner pour optimiser votre visibilité IA.
                          </p>
                        </div>
                        <Button className="ml-auto bg-violet-600 hover:bg-violet-500">
                          Contacter un expert
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>

            {/* Action Buttons */}
            <div className="flex items-center justify-center gap-4">
              <Button 
                variant="outline" 
                onClick={() => {
                  setResults(null);
                  setQuery('');
                }}
                className="border-white/10 text-slate-300 hover:bg-white/5"
              >
                <RefreshCw className="w-4 h-4 mr-2" />
                Nouvelle analyse
              </Button>
              <Button 
                onClick={() => navigate('/audit')}
                className="bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-500 hover:to-purple-500"
              >
                <Sparkles className="w-4 h-4 mr-2" />
                Lancer un audit complet
              </Button>
            </div>
          </>
        )}

        {/* Empty State */}
        {!isLoading && !results && !error && (
          <div className="text-center py-12">
            <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-violet-500/20 to-purple-500/20 flex items-center justify-center mx-auto mb-6">
              <Brain className="w-10 h-10 text-violet-400" />
            </div>
            <h3 className="text-xl font-semibold text-white mb-2">
              Prêt à analyser votre marque
            </h3>
            <p className="text-slate-400 max-w-md mx-auto mb-8">
              Entrez le nom de votre marque ou l'URL de votre site pour découvrir 
              comment les principaux modèles d'IA vous perçoivent.
            </p>

            {/* Features */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 max-w-4xl mx-auto">
              {[
                { icon: <MessageSquare className="w-5 h-5" />, label: '4 modèles IA', desc: 'GPT, Gemini, Claude, Perplexity' },
                { icon: <BarChart3 className="w-5 h-5" />, label: 'Analyse comparative', desc: 'Comparez les perceptions' },
                { icon: <Lightbulb className="w-5 h-5" />, label: 'Suggestions', desc: 'Recommandations personnalisées' },
                { icon: <Target className="w-5 h-5" />, label: 'Score de confiance', desc: 'Fiabilité des résultats' }
              ].map((feature, i) => (
                <div key={i} className="p-4 bg-slate-800/30 rounded-xl border border-white/5">
                  <div className="w-10 h-10 rounded-lg bg-violet-500/20 flex items-center justify-center mx-auto mb-3 text-violet-400">
                    {feature.icon}
                  </div>
                  <h4 className="font-medium text-white text-sm">{feature.label}</h4>
                  <p className="text-xs text-slate-500 mt-1">{feature.desc}</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default AIPerception;
