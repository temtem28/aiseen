import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabase';
import { searchRealAICitations } from '@/lib/apiServices';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { useToast } from '@/hooks/use-toast';
import {
  Bot, ArrowLeft, Search, Mic, Bell, TrendingUp, TrendingDown,
  AlertCircle, CheckCircle2, Clock, Globe, MessageSquare, Sparkles,
  RefreshCw, Filter, Download, Plus, Trash2, Eye, ExternalLink,
  ThumbsUp, ThumbsDown, Minus, Zap, Target, BarChart3, Settings,
  ChevronRight, ChevronDown, Play, Pause, Calendar, X
} from 'lucide-react';

interface Citation {
  id: string;
  ai_model: string;
  query_text: string;
  response_text: string;
  citation_context: string;
  citation_position: number;
  sentiment: string;
  confidence_score: number;
  brand_mentioned: string;
  url_mentioned: string | null;
  is_positive: boolean;
  is_new: boolean;
  detected_at: string;
}

interface MonitoringQuery {
  id: string;
  query_text: string;
  category: string;
  keywords: string[];
  is_active: boolean;
  last_checked_at: string | null;
  check_frequency: string;
}

interface Stats {
  totalCitations: number;
  newCitations: number;
  positiveCitations: number;
  negativeCitations: number;
  avgPosition: number;
  avgConfidence: number;
  byModel: { model: string; count: number; percentage: number }[];
  trend: 'up' | 'down' | 'stable';
  trendValue: number;
}

export default function AICitations() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  const [citations, setCitations] = useState<Citation[]>([]);
  const [queries, setQueries] = useState<MonitoringQuery[]>([]);
  const [stats, setStats] = useState<Stats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isScanning, setIsScanning] = useState(false);
  const [scanProgress, setScanProgress] = useState(0);
  const [scanStep, setScanStep] = useState('');
  
  // Filtres
  const [filterModel, setFilterModel] = useState<string>('all');
  const [filterSentiment, setFilterSentiment] = useState<string>('all');
  const [filterNew, setFilterNew] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState('');

  // Configuration de surveillance
  const [showConfig, setShowConfig] = useState(false);
  const [brandName, setBrandName] = useState('');
  const [brandUrl, setBrandUrl] = useState('');
  const [industry, setIndustry] = useState('');
  const [keywords, setKeywords] = useState('');
  const [customQueries, setCustomQueries] = useState('');

  // Citation sélectionnée pour détails
  const [selectedCitation, setSelectedCitation] = useState<Citation | null>(null);

  useEffect(() => {
    if (user) {
      loadData();
    }
  }, [user]);

  const loadData = async () => {
    setIsLoading(true);
    try {
      // Charger les citations (gracefully handle missing table)
      try {
        const { data: citationsData, error: citationsError } = await supabase
          .from('ai_citations')
          .select('*')
          .eq('user_id', user?.id)
          .order('detected_at', { ascending: false });

        if (citationsError && citationsError.code !== 'PGRST116' && !citationsError.message?.includes('does not exist')) {
          throw citationsError;
        }
        setCitations(citationsData || []);
      } catch (citationsError: any) {
        // Table doesn't exist or other error - use empty array
        console.log('Citations table not available:', citationsError);
        setCitations([]);
      }

      // Charger les requêtes de surveillance (gracefully handle missing table)
      try {
        const { data: queriesData, error: queriesError } = await supabase
          .from('citation_queries')
          .select('*')
          .eq('user_id', user?.id)
          .order('created_at', { ascending: false });

        if (queriesError && queriesError.code !== 'PGRST116' && !queriesError.message?.includes('does not exist')) {
          throw queriesError;
        }
        setQueries(queriesData || []);
      } catch (queriesError: any) {
        // Table doesn't exist or other error - use empty array
        console.log('Citation queries table not available:', queriesError);
        setQueries([]);
      }

      // Calculer les statistiques
      if (citations.length > 0) {
        calculateStats(citations);
      } else {
        // Set default stats if no citations
        setStats({
          totalCitations: 0,
          newCitations: 0,
          positiveCitations: 0,
          negativeCitations: 0,
          avgPosition: 0,
          avgConfidence: 0,
          byModel: [],
          trend: 'stable',
          trendValue: 0
        });
      }
    } catch (error) {
      console.error('Error loading data:', error);
      // Don't show error toast for missing tables
      if (error && typeof error === 'object' && 'code' in error && error.code === 'PGRST116') {
        // Table doesn't exist - this is OK, just use empty data
        setCitations([]);
        setQueries([]);
        setStats({
          totalCitations: 0,
          newCitations: 0,
          positiveCitations: 0,
          negativeCitations: 0,
          avgPosition: 0,
          avgConfidence: 0,
          byModel: [],
          trend: 'stable',
          trendValue: 0
        });
      } else {
        toast({
          title: 'Erreur',
          description: 'Impossible de charger les données',
          variant: 'destructive'
        });
      }
    } finally {
      setIsLoading(false);
    }
  };

  const calculateStats = (data: Citation[]) => {
    const totalCitations = data.length;
    const newCitations = data.filter(c => c.is_new).length;
    const positiveCitations = data.filter(c => c.sentiment === 'positive').length;
    const negativeCitations = data.filter(c => c.sentiment === 'negative').length;
    
    const avgPosition = data.length > 0 
      ? Math.round(data.reduce((acc, c) => acc + (c.citation_position || 0), 0) / data.length)
      : 0;
    
    const avgConfidence = data.length > 0
      ? Math.round(data.reduce((acc, c) => acc + (c.confidence_score || 0), 0) / data.length)
      : 0;

    // Citations par modèle
    const modelCounts: Record<string, number> = {};
    data.forEach(c => {
      modelCounts[c.ai_model] = (modelCounts[c.ai_model] || 0) + 1;
    });
    
    const byModel = Object.entries(modelCounts).map(([model, count]) => ({
      model,
      count,
      percentage: Math.round((count / totalCitations) * 100)
    }));

    // Calculer la tendance (comparer dernière semaine vs semaine précédente)
    const now = new Date();
    const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const twoWeeksAgo = new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000);
    
    const lastWeekCitations = data.filter(c => new Date(c.detected_at) >= oneWeekAgo).length;
    const previousWeekCitations = data.filter(c => {
      const date = new Date(c.detected_at);
      return date >= twoWeeksAgo && date < oneWeekAgo;
    }).length;

    let trend: 'up' | 'down' | 'stable' = 'stable';
    let trendValue = 0;
    
    if (previousWeekCitations > 0) {
      trendValue = Math.round(((lastWeekCitations - previousWeekCitations) / previousWeekCitations) * 100);
      trend = trendValue > 5 ? 'up' : trendValue < -5 ? 'down' : 'stable';
    } else if (lastWeekCitations > 0) {
      trend = 'up';
      trendValue = 100;
    }

    setStats({
      totalCitations,
      newCitations,
      positiveCitations,
      negativeCitations,
      avgPosition,
      avgConfidence,
      byModel,
      trend,
      trendValue
    });
  };

  // Real citation search function using API
  const performRealCitationSearch = async (brandName: string, industry: string, keywords: string[], customQueries: string[]): Promise<Citation[]> => {
    const citations = await searchRealAICitations(brandName, industry, keywords, customQueries);
    
    // Add IDs to citations
    return citations.map((c, index) => ({
      ...c,
      id: `real-${Date.now()}-${index}`
    }));
  };

  const startScan = async () => {
    if (!brandName || !industry) {
      toast({
        title: 'Configuration requise',
        description: 'Veuillez configurer votre marque et secteur d\'activité',
        variant: 'destructive'
      });
      setShowConfig(true);
      return;
    }

    setIsScanning(true);
    setScanProgress(0);
    setScanStep('Initialisation...');

    try {
      // Simuler la progression
      const progressSteps = [
        { progress: 10, step: 'Génération des requêtes sectorielles...' },
        { progress: 25, step: 'Interrogation de ChatGPT...' },
        { progress: 45, step: 'Interrogation de Gemini...' },
        { progress: 65, step: 'Interrogation de Claude...' },
        { progress: 80, step: 'Analyse des réponses...' },
        { progress: 90, step: 'Détection des citations...' },
        { progress: 95, step: 'Sauvegarde des résultats...' }
      ];

      // Démarrer la progression en parallèle
      const progressPromise = (async () => {
        for (const step of progressSteps) {
          await new Promise(resolve => setTimeout(resolve, 2000));
          setScanProgress(step.progress);
          setScanStep(step.step);
        }
      })();

      // Try to call the Edge Function
      let citations: Citation[] = [];
      let useDirectAPI = false;

      try {
        const { data, error } = await supabase.functions.invoke('monitor-ai-citations', {
          body: {
            userId: user?.id,
            brandName,
            brandUrl,
            industry,
            keywords: keywords.split(',').map(k => k.trim()).filter(k => k),
            customQueries: customQueries.split('\n').map(q => q.trim()).filter(q => q)
          }
        });

        if (error) {
          console.log('Edge Function not available, using direct API service');
          useDirectAPI = true;
        } else if (data.success && data.citations) {
          citations = data.citations;
        } else {
          useDirectAPI = true;
        }
      } catch (invokeError) {
        console.log('Edge Function error, using direct API service');
        useDirectAPI = true;
      }

      await progressPromise;
      setScanProgress(100);
      setScanStep('Terminé !');

      // If Edge Function failed, use direct API service
      if (useDirectAPI) {
        const keywordArray = keywords.split(',').map(k => k.trim()).filter(k => k);
        const customQueriesArray = customQueries.split('\n').map(q => q.trim()).filter(q => q);
        citations = await performRealCitationSearch(brandName, industry, keywordArray, customQueriesArray);

        // Try to save to database (will fail gracefully if table doesn't exist)
        if (user && citations.length > 0) {
          try {
            const citationsToInsert = citations.map(c => ({
              user_id: user.id,
              ...c
            }));

            const { error: insertError } = await supabase
              .from('ai_citations')
              .insert(citationsToInsert);

            if (insertError) {
              console.log('Could not save citations to database (table may not exist):', insertError);
            }
          } catch (dbError) {
            console.log('Database error (table may not exist):', dbError);
          }
        }
      }

      toast({
        title: 'Scan terminé',
        description: `${citations.length} citation(s) détectée(s)${useDirectAPI ? ' (via API directe)' : ''}`,
      });
      
      // Recharger les données
      await loadData();
    } catch (error: any) {
      console.error('Scan error:', error);
      toast({
        title: 'Erreur',
        description: error.message || 'Erreur lors du scan',
        variant: 'destructive'
      });
    } finally {
      setTimeout(() => {
        setIsScanning(false);
        setScanProgress(0);
        setScanStep('');
      }, 1500);
    }
  };

  const markAsRead = async (citationId: string) => {
    try {
      await supabase
        .from('ai_citations')
        .update({ is_new: false })
        .eq('id', citationId);
      
      setCitations(prev => prev.map(c => 
        c.id === citationId ? { ...c, is_new: false } : c
      ));
    } catch (error) {
      console.error('Error marking as read:', error);
    }
  };

  const markAllAsRead = async () => {
    try {
      await supabase
        .from('ai_citations')
        .update({ is_new: false })
        .eq('user_id', user?.id)
        .eq('is_new', true);
      
      setCitations(prev => prev.map(c => ({ ...c, is_new: false })));
      
      toast({
        title: 'Succès',
        description: 'Toutes les citations ont été marquées comme lues'
      });
    } catch (error) {
      console.error('Error marking all as read:', error);
    }
  };

  const deleteCitation = async (citationId: string) => {
    try {
      await supabase
        .from('ai_citations')
        .delete()
        .eq('id', citationId);
      
      setCitations(prev => prev.filter(c => c.id !== citationId));
      setSelectedCitation(null);
      
      toast({
        title: 'Supprimé',
        description: 'Citation supprimée avec succès'
      });
    } catch (error) {
      console.error('Error deleting citation:', error);
    }
  };

  const exportCitations = () => {
    const csvContent = [
      ['Date', 'Modèle IA', 'Requête', 'Contexte', 'Sentiment', 'Position', 'Confiance'].join(','),
      ...filteredCitations.map(c => [
        new Date(c.detected_at).toLocaleDateString('fr-FR'),
        c.ai_model,
        `"${c.query_text.replace(/"/g, '""')}"`,
        `"${c.citation_context.replace(/"/g, '""')}"`,
        c.sentiment,
        c.citation_position,
        c.confidence_score
      ].join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `citations-ia-${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
  };

  // Filtrer les citations
  const filteredCitations = citations.filter(c => {
    if (filterModel !== 'all' && c.ai_model !== filterModel) return false;
    if (filterSentiment !== 'all' && c.sentiment !== filterSentiment) return false;
    if (filterNew && !c.is_new) return false;
    if (searchQuery && !c.query_text.toLowerCase().includes(searchQuery.toLowerCase()) && 
        !c.citation_context.toLowerCase().includes(searchQuery.toLowerCase())) return false;
    return true;
  });

  const getModelIcon = (model: string) => {
    switch (model.toLowerCase()) {
      case 'chatgpt': return <Bot className="h-4 w-4 text-emerald-400" />;
      case 'gemini': return <Sparkles className="h-4 w-4 text-blue-400" />;
      case 'claude': return <MessageSquare className="h-4 w-4 text-orange-400" />;
      case 'perplexity': return <Search className="h-4 w-4 text-purple-400" />;
      default: return <Bot className="h-4 w-4 text-gray-400" />;
    }
  };

  const getModelColor = (model: string) => {
    switch (model.toLowerCase()) {
      case 'chatgpt': return 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30';
      case 'gemini': return 'bg-blue-500/20 text-blue-400 border-blue-500/30';
      case 'claude': return 'bg-orange-500/20 text-orange-400 border-orange-500/30';
      case 'perplexity': return 'bg-purple-500/20 text-purple-400 border-purple-500/30';
      default: return 'bg-gray-500/20 text-gray-400 border-gray-500/30';
    }
  };

  const getSentimentIcon = (sentiment: string) => {
    switch (sentiment) {
      case 'positive': return <ThumbsUp className="h-4 w-4 text-emerald-400" />;
      case 'negative': return <ThumbsDown className="h-4 w-4 text-red-400" />;
      default: return <Minus className="h-4 w-4 text-gray-400" />;
    }
  };

  const getSentimentColor = (sentiment: string) => {
    switch (sentiment) {
      case 'positive': return 'text-emerald-400';
      case 'negative': return 'text-red-400';
      default: return 'text-gray-400';
    }
  };

  return (
    <div className="min-h-screen bg-gray-950">
      {/* Navigation */}
      <nav className="bg-gray-900/80 backdrop-blur-md border-b border-gray-800 px-6 py-4 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
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
              <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-cyan-600 rounded-xl flex items-center justify-center">
                <Mic className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-white">Citations IA</h1>
                <p className="text-sm text-gray-400">Surveillance des mentions par les IA</p>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-3">
            {stats && stats.newCitations > 0 && (
              <Badge className="bg-red-500/20 text-red-400 border-red-500/30">
                <Bell className="h-3 w-3 mr-1" />
                {stats.newCitations} nouvelle{stats.newCitations > 1 ? 's' : ''}
              </Badge>
            )}
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowConfig(!showConfig)}
              className="border-gray-700 text-gray-300 hover:bg-gray-800"
            >
              <Settings className="h-4 w-4 mr-2" />
              Configuration
            </Button>
            <Button
              onClick={startScan}
              disabled={isScanning}
              className="bg-gradient-to-r from-blue-500 to-cyan-600 hover:from-blue-600 hover:to-cyan-700"
            >
              {isScanning ? (
                <>
                  <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                  Scan en cours...
                </>
              ) : (
                <>
                  <Search className="h-4 w-4 mr-2" />
                  Lancer un scan
                </>
              )}
            </Button>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto p-6">
        {/* Configuration Panel */}
        {showConfig && (
          <Card className="bg-gray-900/50 border-gray-800 mb-6">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <Settings className="h-5 w-5 text-blue-400" />
                Configuration de la surveillance
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <Label className="text-gray-300">Nom de la marque *</Label>
                    <Input
                      value={brandName}
                      onChange={(e) => setBrandName(e.target.value)}
                      placeholder="Ex: Ai Seen"
                      className="bg-gray-800 border-gray-700 text-white mt-1"
                    />
                  </div>
                  <div>
                    <Label className="text-gray-300">URL du site</Label>
                    <Input
                      value={brandUrl}
                      onChange={(e) => setBrandUrl(e.target.value)}
                      placeholder="Ex: aiseen.fr"
                      className="bg-gray-800 border-gray-700 text-white mt-1"
                    />
                  </div>
                </div>
                <div className="space-y-4">
                  <div>
                    <Label className="text-gray-300">Secteur d'activité *</Label>
                    <Input
                      value={industry}
                      onChange={(e) => setIndustry(e.target.value)}
                      placeholder="Ex: SEO, Marketing digital"
                      className="bg-gray-800 border-gray-700 text-white mt-1"
                    />
                  </div>
                  <div>
                    <Label className="text-gray-300">Mots-clés (séparés par des virgules)</Label>
                    <Input
                      value={keywords}
                      onChange={(e) => setKeywords(e.target.value)}
                      placeholder="Ex: audit SEO, optimisation AEO, visibilité IA"
                      className="bg-gray-800 border-gray-700 text-white mt-1"
                    />
                  </div>
                </div>
                <div className="md:col-span-2">
                  <Label className="text-gray-300">Requêtes personnalisées (une par ligne)</Label>
                  <textarea
                    value={customQueries}
                    onChange={(e) => setCustomQueries(e.target.value)}
                    placeholder="Ex: Quel outil utiliser pour l'optimisation AEO ?&#10;Meilleur logiciel d'audit SEO en France"
                    className="w-full h-24 bg-gray-800 border border-gray-700 text-white rounded-md p-3 mt-1 resize-none"
                  />
                </div>
              </div>
              <div className="flex justify-end mt-4">
                <Button
                  onClick={() => setShowConfig(false)}
                  className="bg-blue-500 hover:bg-blue-600"
                >
                  <CheckCircle2 className="h-4 w-4 mr-2" />
                  Enregistrer
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Scan Progress */}
        {isScanning && (
          <Card className="bg-gradient-to-r from-blue-900/30 to-cyan-900/30 border-blue-500/30 mb-6">
            <CardContent className="p-6">
              <div className="flex items-center gap-4 mb-4">
                <div className="w-12 h-12 bg-blue-500/20 rounded-xl flex items-center justify-center">
                  <RefreshCw className="h-6 w-6 text-blue-400 animate-spin" />
                </div>
                <div className="flex-1">
                  <h3 className="text-white font-semibold">Scan en cours...</h3>
                  <p className="text-sm text-gray-400">{scanStep}</p>
                </div>
                <span className="text-2xl font-bold text-blue-400">{scanProgress}%</span>
              </div>
              <Progress value={scanProgress} className="h-2 bg-gray-800" />
            </CardContent>
          </Card>
        )}

        {/* Stats Cards */}
        {stats && (
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4 mb-6">
            <Card className="bg-gray-900/50 border-gray-800">
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-2">
                  <Mic className="h-5 w-5 text-blue-400" />
                  {stats.trend === 'up' ? (
                    <TrendingUp className="h-4 w-4 text-emerald-400" />
                  ) : stats.trend === 'down' ? (
                    <TrendingDown className="h-4 w-4 text-red-400" />
                  ) : (
                    <Minus className="h-4 w-4 text-gray-400" />
                  )}
                </div>
                <p className="text-2xl font-bold text-white">{stats.totalCitations}</p>
                <p className="text-xs text-gray-400">Citations totales</p>
              </CardContent>
            </Card>

            <Card className="bg-gray-900/50 border-gray-800">
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-2">
                  <Bell className="h-5 w-5 text-red-400" />
                  {stats.newCitations > 0 && (
                    <span className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
                  )}
                </div>
                <p className="text-2xl font-bold text-white">{stats.newCitations}</p>
                <p className="text-xs text-gray-400">Nouvelles</p>
              </CardContent>
            </Card>

            <Card className="bg-gray-900/50 border-gray-800">
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-2">
                  <ThumbsUp className="h-5 w-5 text-emerald-400" />
                </div>
                <p className="text-2xl font-bold text-emerald-400">{stats.positiveCitations}</p>
                <p className="text-xs text-gray-400">Positives</p>
              </CardContent>
            </Card>

            <Card className="bg-gray-900/50 border-gray-800">
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-2">
                  <ThumbsDown className="h-5 w-5 text-red-400" />
                </div>
                <p className="text-2xl font-bold text-red-400">{stats.negativeCitations}</p>
                <p className="text-xs text-gray-400">Négatives</p>
              </CardContent>
            </Card>

            <Card className="bg-gray-900/50 border-gray-800">
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-2">
                  <Target className="h-5 w-5 text-purple-400" />
                </div>
                <p className="text-2xl font-bold text-white">{stats.avgPosition}/10</p>
                <p className="text-xs text-gray-400">Position moy.</p>
              </CardContent>
            </Card>

            <Card className="bg-gray-900/50 border-gray-800">
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-2">
                  <Zap className="h-5 w-5 text-yellow-400" />
                </div>
                <p className="text-2xl font-bold text-white">{stats.avgConfidence}%</p>
                <p className="text-xs text-gray-400">Confiance moy.</p>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Main Content */}
        <div className="grid lg:grid-cols-3 gap-6">
          {/* Citations List */}
          <div className="lg:col-span-2">
            <Card className="bg-gray-900/50 border-gray-800">
              <CardHeader>
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <CardTitle className="text-white flex items-center gap-2">
                    <MessageSquare className="h-5 w-5 text-blue-400" />
                    Historique des citations
                  </CardTitle>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={markAllAsRead}
                      className="border-gray-700 text-gray-300 hover:bg-gray-800"
                    >
                      <CheckCircle2 className="h-4 w-4 mr-1" />
                      Tout marquer lu
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={exportCitations}
                      className="border-gray-700 text-gray-300 hover:bg-gray-800"
                    >
                      <Download className="h-4 w-4 mr-1" />
                      Exporter
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                {/* Filters */}
                <div className="flex flex-wrap items-center gap-3 mb-4 p-3 bg-gray-800/50 rounded-lg">
                  <div className="flex items-center gap-2">
                    <Filter className="h-4 w-4 text-gray-400" />
                    <span className="text-sm text-gray-400">Filtres:</span>
                  </div>
                  <select
                    value={filterModel}
                    onChange={(e) => setFilterModel(e.target.value)}
                    className="bg-gray-700 border-gray-600 text-white text-sm rounded-md px-3 py-1"
                  >
                    <option value="all">Tous les modèles</option>
                    <option value="ChatGPT">ChatGPT</option>
                    <option value="Gemini">Gemini</option>
                    <option value="Claude">Claude</option>
                    <option value="Perplexity">Perplexity</option>
                  </select>
                  <select
                    value={filterSentiment}
                    onChange={(e) => setFilterSentiment(e.target.value)}
                    className="bg-gray-700 border-gray-600 text-white text-sm rounded-md px-3 py-1"
                  >
                    <option value="all">Tous sentiments</option>
                    <option value="positive">Positif</option>
                    <option value="neutral">Neutre</option>
                    <option value="negative">Négatif</option>
                  </select>
                  <label className="flex items-center gap-2 text-sm text-gray-300 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={filterNew}
                      onChange={(e) => setFilterNew(e.target.checked)}
                      className="rounded bg-gray-700 border-gray-600"
                    />
                    Nouvelles uniquement
                  </label>
                  <div className="flex-1">
                    <Input
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="Rechercher..."
                      className="bg-gray-700 border-gray-600 text-white text-sm h-8"
                    />
                  </div>
                </div>

                {/* Citations List */}
                {isLoading ? (
                  <div className="flex items-center justify-center py-12">
                    <RefreshCw className="h-8 w-8 text-blue-400 animate-spin" />
                  </div>
                ) : filteredCitations.length === 0 ? (
                  <div className="text-center py-12">
                    <Mic className="h-12 w-12 text-gray-600 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-white mb-2">Aucune citation détectée</h3>
                    <p className="text-gray-400 mb-4">
                      Configurez votre marque et lancez un scan pour détecter les mentions
                    </p>
                    <Button onClick={() => setShowConfig(true)} className="bg-blue-500 hover:bg-blue-600">
                      <Settings className="h-4 w-4 mr-2" />
                      Configurer
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-3 max-h-[600px] overflow-y-auto">
                    {filteredCitations.map((citation) => (
                      <div
                        key={citation.id}
                        onClick={() => {
                          setSelectedCitation(citation);
                          if (citation.is_new) markAsRead(citation.id);
                        }}
                        className={`p-4 rounded-lg border transition-all cursor-pointer ${
                          selectedCitation?.id === citation.id
                            ? 'bg-blue-900/30 border-blue-500/50'
                            : 'bg-gray-800/50 border-gray-700 hover:border-gray-600'
                        } ${citation.is_new ? 'ring-1 ring-blue-500/50' : ''}`}
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-2">
                              <Badge className={`${getModelColor(citation.ai_model)} text-xs`}>
                                {getModelIcon(citation.ai_model)}
                                <span className="ml-1">{citation.ai_model}</span>
                              </Badge>
                              <Badge variant="outline" className={`${getSentimentColor(citation.sentiment)} border-current text-xs`}>
                                {getSentimentIcon(citation.sentiment)}
                                <span className="ml-1 capitalize">{citation.sentiment}</span>
                              </Badge>
                              {citation.is_new && (
                                <Badge className="bg-blue-500/20 text-blue-400 border-blue-500/30 text-xs">
                                  Nouveau
                                </Badge>
                              )}
                            </div>
                            <p className="text-sm text-gray-300 mb-2 line-clamp-1">
                              <span className="text-gray-500">Requête:</span> {citation.query_text}
                            </p>
                            <p className="text-sm text-white line-clamp-2">
                              "{citation.citation_context}"
                            </p>
                          </div>
                          <div className="text-right shrink-0">
                            <p className="text-xs text-gray-500">
                              {new Date(citation.detected_at).toLocaleDateString('fr-FR', {
                                day: '2-digit',
                                month: 'short',
                                hour: '2-digit',
                                minute: '2-digit'
                              })}
                            </p>
                            <div className="flex items-center gap-1 mt-1 justify-end">
                              <span className="text-xs text-gray-400">Position:</span>
                              <span className="text-sm font-semibold text-white">{citation.citation_position}/10</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Right Sidebar */}
          <div className="space-y-6">
            {/* Citation Details */}
            {selectedCitation ? (
              <Card className="bg-gray-900/50 border-gray-800">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-white text-lg">Détails de la citation</CardTitle>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => setSelectedCitation(null)}
                      className="text-gray-400 hover:text-white"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center gap-2">
                    <Badge className={`${getModelColor(selectedCitation.ai_model)}`}>
                      {getModelIcon(selectedCitation.ai_model)}
                      <span className="ml-1">{selectedCitation.ai_model}</span>
                    </Badge>
                    <Badge variant="outline" className={`${getSentimentColor(selectedCitation.sentiment)} border-current`}>
                      {selectedCitation.sentiment}
                    </Badge>
                  </div>

                  <div>
                    <Label className="text-gray-400 text-xs">Requête</Label>
                    <p className="text-white text-sm mt-1">{selectedCitation.query_text}</p>
                  </div>

                  <div>
                    <Label className="text-gray-400 text-xs">Contexte de la citation</Label>
                    <p className="text-white text-sm mt-1 p-3 bg-gray-800 rounded-lg">
                      "{selectedCitation.citation_context}"
                    </p>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="p-3 bg-gray-800/50 rounded-lg">
                      <p className="text-xs text-gray-400">Position</p>
                      <p className="text-xl font-bold text-white">{selectedCitation.citation_position}/10</p>
                    </div>
                    <div className="p-3 bg-gray-800/50 rounded-lg">
                      <p className="text-xs text-gray-400">Confiance</p>
                      <p className="text-xl font-bold text-white">{selectedCitation.confidence_score}%</p>
                    </div>
                  </div>

                  {selectedCitation.url_mentioned && (
                    <div>
                      <Label className="text-gray-400 text-xs">URL mentionnée</Label>
                      <a 
                        href={`https://${selectedCitation.url_mentioned}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-2 text-blue-400 hover:text-blue-300 text-sm mt-1"
                      >
                        <Globe className="h-4 w-4" />
                        {selectedCitation.url_mentioned}
                        <ExternalLink className="h-3 w-3" />
                      </a>
                    </div>
                  )}

                  <div>
                    <Label className="text-gray-400 text-xs">Réponse complète</Label>
                    <div className="mt-1 p-3 bg-gray-800 rounded-lg max-h-48 overflow-y-auto">
                      <p className="text-sm text-gray-300 whitespace-pre-wrap">
                        {selectedCitation.response_text}
                      </p>
                    </div>
                  </div>

                  <div className="flex gap-2 pt-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => deleteCitation(selectedCitation.id)}
                      className="flex-1 border-red-500/30 text-red-400 hover:bg-red-500/10"
                    >
                      <Trash2 className="h-4 w-4 mr-1" />
                      Supprimer
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ) : (
              <Card className="bg-gray-900/50 border-gray-800">
                <CardContent className="p-6 text-center">
                  <Eye className="h-12 w-12 text-gray-600 mx-auto mb-3" />
                  <p className="text-gray-400">Sélectionnez une citation pour voir les détails</p>
                </CardContent>
              </Card>
            )}

            {/* Model Distribution */}
            {stats && stats.byModel.length > 0 && (
              <Card className="bg-gray-900/50 border-gray-800">
                <CardHeader>
                  <CardTitle className="text-white text-lg flex items-center gap-2">
                    <BarChart3 className="h-5 w-5 text-purple-400" />
                    Répartition par modèle
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {stats.byModel.map((item) => (
                    <div key={item.model}>
                      <div className="flex items-center justify-between mb-1">
                        <div className="flex items-center gap-2">
                          {getModelIcon(item.model)}
                          <span className="text-sm text-white">{item.model}</span>
                        </div>
                        <span className="text-sm text-gray-400">{item.count} ({item.percentage}%)</span>
                      </div>
                      <Progress 
                        value={item.percentage} 
                        className="h-2 bg-gray-800"
                      />
                    </div>
                  ))}
                </CardContent>
              </Card>
            )}

            {/* Tips */}
            <Card className="bg-gradient-to-br from-blue-900/20 to-cyan-900/20 border-blue-500/30">
              <CardHeader>
                <CardTitle className="text-white text-lg flex items-center gap-2">
                  <Sparkles className="h-5 w-5 text-cyan-400" />
                  Conseils AEO
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-start gap-3 p-3 bg-gray-800/50 rounded-lg">
                  <CheckCircle2 className="h-5 w-5 text-emerald-400 shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm text-white font-medium">Structurez votre contenu</p>
                    <p className="text-xs text-gray-400">Utilisez des FAQ et des listes pour faciliter l'extraction par les IA</p>
                  </div>
                </div>
                <div className="flex items-start gap-3 p-3 bg-gray-800/50 rounded-lg">
                  <CheckCircle2 className="h-5 w-5 text-emerald-400 shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm text-white font-medium">Ajoutez des données structurées</p>
                    <p className="text-xs text-gray-400">Schema.org aide les IA à comprendre votre contenu</p>
                  </div>
                </div>
                <div className="flex items-start gap-3 p-3 bg-gray-800/50 rounded-lg">
                  <CheckCircle2 className="h-5 w-5 text-emerald-400 shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm text-white font-medium">Soyez factuel et précis</p>
                    <p className="text-xs text-gray-400">Les IA privilégient les informations vérifiables</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
