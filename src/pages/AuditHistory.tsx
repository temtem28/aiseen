import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { 
  Search, Globe, Calendar, TrendingUp, ArrowLeft, 
  Bot, Target, Zap, ExternalLink, Trash2, Filter,
  ChevronDown, BarChart3, RefreshCw, Loader2, Clock,
  AlertCircle, CheckCircle2
} from 'lucide-react';

interface Audit {
  id: string;
  user_id: string;
  website_url: string;
  overall_score: number;
  seo_score: number;
  aeo_score: number;
  performance_score: number;
  ai_visibility: Record<string, number>;
  metadata: any;
  analysis: any;
  recommendations: any[];
  seo_analysis: any;
  scraping_method: string;
  is_simulation: boolean;
  created_at: string;
}

const AuditHistory = () => {
  const [audits, setAudits] = useState<Audit[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState<'date' | 'score'>('date');
  const [filterOpen, setFilterOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    loadAudits();
  }, [user]);

  const loadAudits = async () => {
    if (!user) {
      setLoading(false);
      return;
    }
    
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('audits')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error loading audits:', error);
        toast({
          title: "Erreur",
          description: "Impossible de charger l'historique des audits",
          variant: "destructive"
        });
      } else if (data) {
        setAudits(data);
      }
    } catch (error) {
      console.error('Could not load audits:', error);
    }
    
    setLoading(false);
  };

  const viewAudit = (audit: Audit) => {
    navigate('/audit/results', { 
      state: { 
        results: {
          url: audit.website_url,
          overall_score: audit.overall_score,
          seo_score: audit.seo_score,
          aeo_score: audit.aeo_score,
          global_score: audit.overall_score,
          performance_score: audit.performance_score,
          ai_visibility: audit.ai_visibility || {},
          recommendations: audit.recommendations || [],
          analysis: audit.analysis || {},
          metadata: audit.metadata || {},
          seo_analysis: audit.seo_analysis || {},
          scraping_method: audit.scraping_method,
          is_simulation: audit.is_simulation
        }
      } 
    });
  };

  const deleteAudit = async (e: React.MouseEvent, auditId: string) => {
    e.stopPropagation();
    if (!confirm('Êtes-vous sûr de vouloir supprimer cet audit ?')) return;
    
    setDeleting(auditId);
    try {
      const { error } = await supabase
        .from('audits')
        .delete()
        .eq('id', auditId);
      
      if (error) {
        throw error;
      }
      
      setAudits(audits.filter(a => a.id !== auditId));
      toast({
        title: "Audit supprimé",
        description: "L'audit a été supprimé de votre historique",
      });
    } catch (error: any) {
      console.error('Error deleting audit:', error);
      toast({
        title: "Erreur",
        description: "Impossible de supprimer l'audit",
        variant: "destructive"
      });
    }
    setDeleting(null);
  };

  const getScoreColor = (score: number | null) => {
    if (!score) return 'text-gray-400';
    if (score >= 80) return 'text-emerald-400';
    if (score >= 60) return 'text-yellow-400';
    if (score >= 40) return 'text-orange-400';
    return 'text-red-400';
  };

  const getScoreBg = (score: number | null) => {
    if (!score) return 'bg-gray-500/10';
    if (score >= 80) return 'bg-emerald-500/10';
    if (score >= 60) return 'bg-yellow-500/10';
    if (score >= 40) return 'bg-orange-500/10';
    return 'bg-red-500/10';
  };

  const getScoreRing = (score: number | null) => {
    if (!score) return 'ring-gray-500/30';
    if (score >= 80) return 'ring-emerald-500/30';
    if (score >= 60) return 'ring-yellow-500/30';
    if (score >= 40) return 'ring-orange-500/30';
    return 'ring-red-500/30';
  };

  // Filter and sort audits
  const filteredAudits = audits.filter(audit => 
    audit.website_url?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const sortedAudits = [...filteredAudits].sort((a, b) => {
    if (sortBy === 'score') {
      return (b.overall_score || 0) - (a.overall_score || 0);
    }
    return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
  });

  // Calculate stats
  const avgScore = audits.length > 0 
    ? Math.round(audits.reduce((acc, a) => acc + (a.overall_score || 0), 0) / audits.length)
    : 0;
  
  const avgSEO = audits.length > 0 
    ? Math.round(audits.reduce((acc, a) => acc + (a.seo_score || 0), 0) / audits.length)
    : 0;
  
  const avgAEO = audits.length > 0 
    ? Math.round(audits.reduce((acc, a) => acc + (a.aeo_score || 0), 0) / audits.length)
    : 0;
  
  const bestScore = audits.length > 0 
    ? Math.max(...audits.map(a => a.overall_score || 0))
    : 0;

  return (
    <div className="min-h-screen bg-gray-950">
      {/* Header */}
      <div className="bg-gray-900/80 backdrop-blur-md border-b border-gray-800 px-6 py-4 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div className="flex items-center gap-4">
            <Button 
              variant="ghost" 
              size="icon"
              onClick={() => navigate('/dashboard')}
              className="text-gray-400 hover:text-white hover:bg-gray-800"
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div>
              <h1 className="text-xl font-bold text-white">Historique des Audits</h1>
              <p className="text-sm text-gray-400">
                {audits.length} audit{audits.length > 1 ? 's' : ''} sauvegardé{audits.length > 1 ? 's' : ''}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3 w-full md:w-auto">
            <Button 
              variant="outline"
              size="sm"
              onClick={loadAudits}
              className="border-gray-700 text-gray-300 hover:bg-gray-800"
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              Actualiser
            </Button>
            <Button 
              onClick={() => navigate('/audit')} 
              className="bg-gradient-to-r from-cyan-500 to-purple-600 hover:from-cyan-600 hover:to-purple-700"
            >
              <Search className="mr-2 h-4 w-4" />
              Nouvel Audit
            </Button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto p-6">
        {/* Stats Summary */}
        {audits.length > 0 && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            <Card className="bg-gray-900/50 border-gray-800">
              <CardContent className="p-4 text-center">
                <TrendingUp className="h-6 w-6 text-emerald-400 mx-auto mb-2" />
                <p className="text-2xl font-bold text-white">{bestScore}</p>
                <p className="text-xs text-gray-400">Meilleur score</p>
              </CardContent>
            </Card>
            
            <Card className="bg-gray-900/50 border-gray-800">
              <CardContent className="p-4 text-center">
                <Target className="h-6 w-6 text-cyan-400 mx-auto mb-2" />
                <p className="text-2xl font-bold text-white">{avgSEO}</p>
                <p className="text-xs text-gray-400">SEO moyen</p>
              </CardContent>
            </Card>
            
            <Card className="bg-gray-900/50 border-gray-800">
              <CardContent className="p-4 text-center">
                <Bot className="h-6 w-6 text-purple-400 mx-auto mb-2" />
                <p className="text-2xl font-bold text-white">{avgAEO}</p>
                <p className="text-xs text-gray-400">AEO moyen</p>
              </CardContent>
            </Card>
            
            <Card className="bg-gray-900/50 border-gray-800">
              <CardContent className="p-4 text-center">
                <Calendar className="h-6 w-6 text-orange-400 mx-auto mb-2" />
                <p className="text-2xl font-bold text-white">{audits.length}</p>
                <p className="text-xs text-gray-400">Total audits</p>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Filters Bar */}
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-6">
          <div className="flex items-center gap-3 w-full md:w-auto">
            {/* Search */}
            <div className="relative flex-1 md:w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
              <Input 
                placeholder="Rechercher un site..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 bg-gray-800/50 border-gray-700 text-white placeholder:text-gray-500"
              />
            </div>

            {/* Sort dropdown */}
            <div className="relative">
              <Button 
                variant="outline" 
                className="border-gray-700 text-gray-300 hover:bg-gray-800"
                onClick={() => setFilterOpen(!filterOpen)}
              >
                <Filter className="h-4 w-4 mr-2" />
                Trier par
                <ChevronDown className="h-4 w-4 ml-2" />
              </Button>
              {filterOpen && (
                <div className="absolute top-full left-0 mt-2 bg-gray-800 border border-gray-700 rounded-lg shadow-xl z-10 min-w-[150px]">
                  <button 
                    className={`w-full px-4 py-2 text-left text-sm hover:bg-gray-700 rounded-t-lg ${sortBy === 'date' ? 'text-cyan-400' : 'text-gray-300'}`}
                    onClick={() => { setSortBy('date'); setFilterOpen(false); }}
                  >
                    Date (récent)
                  </button>
                  <button 
                    className={`w-full px-4 py-2 text-left text-sm hover:bg-gray-700 rounded-b-lg ${sortBy === 'score' ? 'text-cyan-400' : 'text-gray-300'}`}
                    onClick={() => { setSortBy('score'); setFilterOpen(false); }}
                  >
                    Score (meilleur)
                  </button>
                </div>
              )}
            </div>
          </div>
          
          <div className="flex items-center gap-2 text-sm text-gray-400">
            <BarChart3 className="h-4 w-4" />
            <span>Score moyen: </span>
            <span className={`font-semibold ${getScoreColor(avgScore)}`}>
              {avgScore}/100
            </span>
          </div>
        </div>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-20">
            <Loader2 className="h-12 w-12 text-cyan-500 animate-spin mb-4" />
            <p className="text-gray-400">Chargement de votre historique...</p>
          </div>
        ) : !user ? (
          <Card className="bg-gray-900/50 border-gray-800">
            <CardContent className="text-center py-16">
              <div className="w-16 h-16 bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-4">
                <AlertCircle className="h-8 w-8 text-yellow-500" />
              </div>
              <h3 className="text-xl font-semibold text-white mb-2">Connexion requise</h3>
              <p className="text-gray-400 mb-6">Connectez-vous pour accéder à votre historique d'audits</p>
              <Button 
                onClick={() => navigate('/login')}
                className="bg-gradient-to-r from-cyan-500 to-purple-600 hover:from-cyan-600 hover:to-purple-700"
              >
                Se connecter
              </Button>
            </CardContent>
          </Card>
        ) : audits.length === 0 ? (
          <Card className="bg-gray-900/50 border-gray-800">
            <CardContent className="text-center py-16">
              <div className="w-16 h-16 bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-4">
                <Search className="h-8 w-8 text-gray-600" />
              </div>
              <h3 className="text-xl font-semibold text-white mb-2">Aucun audit sauvegardé</h3>
              <p className="text-gray-400 mb-6">Lancez votre premier audit SEO/AEO et sauvegardez-le pour le retrouver ici</p>
              <Button 
                onClick={() => navigate('/audit')}
                className="bg-gradient-to-r from-cyan-500 to-purple-600 hover:from-cyan-600 hover:to-purple-700"
              >
                <Search className="mr-2 h-4 w-4" />
                Lancer mon premier audit
              </Button>
            </CardContent>
          </Card>
        ) : sortedAudits.length === 0 ? (
          <Card className="bg-gray-900/50 border-gray-800">
            <CardContent className="text-center py-16">
              <div className="w-16 h-16 bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-4">
                <Search className="h-8 w-8 text-gray-600" />
              </div>
              <h3 className="text-xl font-semibold text-white mb-2">Aucun résultat</h3>
              <p className="text-gray-400 mb-6">Aucun audit ne correspond à votre recherche "{searchQuery}"</p>
              <Button 
                variant="outline"
                onClick={() => setSearchQuery('')}
                className="border-gray-700 text-gray-300 hover:bg-gray-800"
              >
                Effacer la recherche
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {sortedAudits.map((audit) => (
              <Card 
                key={audit.id} 
                className="bg-gray-900/50 border-gray-800 hover:border-cyan-500/50 transition-all cursor-pointer group"
                onClick={() => viewAudit(audit)}
              >
                <CardContent className="p-0">
                  <div className="flex flex-col md:flex-row">
                    {/* Left: Score */}
                    <div className={`p-6 flex flex-col items-center justify-center min-w-[140px] ${getScoreBg(audit.overall_score)} border-b md:border-b-0 md:border-r border-gray-800`}>
                      <div className={`w-20 h-20 rounded-full flex items-center justify-center ring-4 ${getScoreRing(audit.overall_score)} ${getScoreBg(audit.overall_score)}`}>
                        <span className={`text-3xl font-bold ${getScoreColor(audit.overall_score)}`}>
                          {audit.overall_score || 0}
                        </span>
                      </div>
                      <span className="text-xs text-gray-400 mt-2">Score Global</span>
                    </div>

                    {/* Middle: Info */}
                    <div className="flex-1 p-6">
                      <div className="flex items-start justify-between">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-2 flex-wrap">
                            <Globe className="h-4 w-4 text-gray-500 flex-shrink-0" />
                            <h3 className="text-lg font-semibold text-white group-hover:text-cyan-400 transition-colors truncate">
                              {audit.website_url || 'Site analysé'}
                            </h3>
                            {audit.is_simulation && (
                              <span className="px-2 py-0.5 text-xs bg-yellow-500/20 text-yellow-400 rounded-full">
                                Simulation
                              </span>
                            )}
                          </div>
                          <div className="flex items-center gap-4 text-sm text-gray-400 flex-wrap">
                            <span className="flex items-center gap-1">
                              <Calendar className="h-3.5 w-3.5" />
                              {new Date(audit.created_at).toLocaleDateString('fr-FR', {
                                day: '2-digit',
                                month: 'long',
                                year: 'numeric'
                              })}
                            </span>
                            <span className="flex items-center gap-1">
                              <Clock className="h-3.5 w-3.5" />
                              {new Date(audit.created_at).toLocaleTimeString('fr-FR', {
                                hour: '2-digit',
                                minute: '2-digit'
                              })}
                            </span>
                          </div>
                        </div>
                        
                        <div className="flex items-center gap-2 ml-4">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="text-gray-500 hover:text-red-400 hover:bg-red-500/10 opacity-0 group-hover:opacity-100 transition-opacity"
                            onClick={(e) => deleteAudit(e, audit.id)}
                            disabled={deleting === audit.id}
                          >
                            {deleting === audit.id ? (
                              <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                              <Trash2 className="h-4 w-4" />
                            )}
                          </Button>
                          <ExternalLink className="h-5 w-5 text-gray-500 group-hover:text-cyan-400 transition-colors" />
                        </div>
                      </div>

                      {/* Scores Row */}
                      <div className="flex items-center gap-4 md:gap-6 mt-4 flex-wrap">
                        <div className="flex items-center gap-2">
                          <div className="p-1.5 bg-emerald-500/10 rounded">
                            <Target className="h-4 w-4 text-emerald-400" />
                          </div>
                          <div>
                            <span className={`text-sm font-medium ${getScoreColor(audit.seo_score)}`}>
                              {audit.seo_score || 0}
                            </span>
                            <span className="text-xs text-gray-500 ml-1">SEO</span>
                          </div>
                        </div>
                        
                        <div className="flex items-center gap-2">
                          <div className="p-1.5 bg-cyan-500/10 rounded">
                            <Bot className="h-4 w-4 text-cyan-400" />
                          </div>
                          <div>
                            <span className={`text-sm font-medium ${getScoreColor(audit.aeo_score)}`}>
                              {audit.aeo_score || 0}
                            </span>
                            <span className="text-xs text-gray-500 ml-1">AEO</span>
                          </div>
                        </div>
                        
                        <div className="flex items-center gap-2">
                          <div className="p-1.5 bg-purple-500/10 rounded">
                            <Zap className="h-4 w-4 text-purple-400" />
                          </div>
                          <div>
                            <span className={`text-sm font-medium ${getScoreColor(audit.performance_score)}`}>
                              {audit.performance_score || 0}
                            </span>
                            <span className="text-xs text-gray-500 ml-1">Perf.</span>
                          </div>
                        </div>

                        {/* AI Visibility mini badges */}
                        {audit.ai_visibility && Object.keys(audit.ai_visibility).length > 0 && (
                          <div className="flex items-center gap-2 ml-auto">
                            <span className="text-xs text-gray-500 hidden md:inline">Visibilité IA:</span>
                            <div className="flex items-center gap-1">
                              {Object.entries(audit.ai_visibility).slice(0, 4).map(([key, value]: [string, any]) => (
                                <div 
                                  key={key}
                                  className={`w-7 h-7 rounded ${getScoreBg(value)} flex items-center justify-center`}
                                  title={`${key}: ${value}%`}
                                >
                                  <span className={`text-[10px] font-medium ${getScoreColor(value)}`}>{value}</span>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Recommendations count */}
                      {audit.recommendations && audit.recommendations.length > 0 && (
                        <div className="mt-4 pt-4 border-t border-gray-800">
                          <div className="flex items-center gap-2 text-sm">
                            <CheckCircle2 className="h-4 w-4 text-cyan-400" />
                            <span className="text-gray-400">
                              {audit.recommendations.length} recommandation{audit.recommendations.length > 1 ? 's' : ''}
                            </span>
                            {audit.recommendations.filter((r: any) => r.priority === 'high').length > 0 && (
                              <span className="px-2 py-0.5 text-xs bg-red-500/20 text-red-400 rounded-full">
                                {audit.recommendations.filter((r: any) => r.priority === 'high').length} priorité haute
                              </span>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Bottom CTA */}
        {audits.length > 0 && (
          <Card className="bg-gradient-to-r from-cyan-500/10 to-purple-500/10 border-cyan-500/20 mt-8">
            <CardContent className="p-6">
              <div className="flex flex-col md:flex-row items-center justify-between gap-4">
                <div>
                  <h3 className="text-xl font-semibold text-white mb-2">
                    Suivez l'évolution de vos scores
                  </h3>
                  <p className="text-gray-400">
                    Lancez régulièrement des audits pour mesurer l'impact de vos optimisations SEO et AEO.
                  </p>
                </div>
                <Button 
                  onClick={() => navigate('/audit')}
                  className="bg-gradient-to-r from-cyan-500 to-purple-600 hover:from-cyan-600 hover:to-purple-700 whitespace-nowrap"
                >
                  <Search className="mr-2 h-4 w-4" />
                  Nouvel audit
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default AuditHistory;
