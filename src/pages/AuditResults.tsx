import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { generateAuditPDF } from '@/lib/pdfGenerator';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { 
  Download, RefreshCw, Loader2, ArrowLeft, Globe, Target, Bot, 
  Zap, CheckCircle2, AlertTriangle, XCircle, ChevronRight,
  Sparkles, Brain, MessageSquare, ExternalLink, TrendingUp,
  FileText, Share2, BookmarkPlus, Info, Code, Smartphone, 
  Share, Settings, Image, Link2, Save, History, Check
} from 'lucide-react';
import ScoreGauge from '@/components/dashboard/ScoreGauge';

const AuditResults = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const results = location.state?.results;
  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  const [activeTab, setActiveTab] = useState<'overview' | 'seo' | 'aeo' | 'recommendations'>('overview');
  const { user } = useAuth();
  const { toast } = useToast();

  if (!results) {
    navigate('/audit');
    return null;
  }

  // Helper function to get AI visibility scores - handles both array and object formats
  const getAIVisibility = () => {
    if (Array.isArray(results.ai_visibility)) {
      // New format: array of objects
      return {
        chatgpt: results.ai_visibility.find((m: any) => m.name === 'ChatGPT')?.score || 0,
        gemini: results.ai_visibility.find((m: any) => m.name === 'Gemini')?.score || 0,
        claude: results.ai_visibility.find((m: any) => m.name === 'Claude')?.score || 0,
        perplexity: results.ai_visibility.find((m: any) => m.name === 'Perplexity')?.score || 0,
      };
    }
    // Old format: object with named properties
    return {
      chatgpt: results.ai_visibility?.chatgpt || 0,
      gemini: results.ai_visibility?.gemini || 0,
      claude: results.ai_visibility?.claude || 0,
      perplexity: results.ai_visibility?.perplexity || 0,
    };
  };

  const aiVisibility = getAIVisibility();

  const getScoreColor = (score: number) => {
    if (score >= 70) return 'text-emerald-400';
    if (score >= 40) return 'text-yellow-400';
    return 'text-red-400';
  };

  const getScoreBg = (score: number) => {
    if (score >= 70) return 'bg-emerald-500/10';
    if (score >= 40) return 'bg-yellow-500/10';
    return 'bg-red-500/10';
  };

  const getStatusColor = (status: string) => {
    const positiveStatuses = ['Bonne', 'Optimisées', 'Présentes', 'Excellent', 'Oui', 'true', 'Présent'];
    const neutralStatuses = ['Moyenne', 'À améliorer', 'Partielles', 'Bon'];
    
    if (positiveStatuses.some(s => status?.includes(s))) return 'text-emerald-400';
    if (neutralStatuses.some(s => status?.includes(s))) return 'text-yellow-400';
    return 'text-red-400';
  };

  const getStatusBg = (status: string) => {
    const positiveStatuses = ['Bonne', 'Optimisées', 'Présentes', 'Excellent', 'Oui', 'true', 'Présent'];
    const neutralStatuses = ['Moyenne', 'À améliorer', 'Partielles', 'Bon'];
    
    if (positiveStatuses.some(s => status?.includes(s))) return 'bg-emerald-500/10';
    if (neutralStatuses.some(s => status?.includes(s))) return 'bg-yellow-500/10';
    return 'bg-red-500/10';
  };

  const getPriorityIcon = (priority: string) => {
    switch (priority) {
      case 'high': return <AlertTriangle className="h-4 w-4 text-red-400" />;
      case 'medium': return <AlertTriangle className="h-4 w-4 text-yellow-400" />;
      default: return <CheckCircle2 className="h-4 w-4 text-emerald-400" />;
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category?.toLowerCase()) {
      case 'seo': return <Globe className="h-4 w-4" />;
      case 'aeo': return <Bot className="h-4 w-4" />;
      case 'technical': return <Settings className="h-4 w-4" />;
      case 'content': return <FileText className="h-4 w-4" />;
      case 'social': return <Share className="h-4 w-4" />;
      default: return <Zap className="h-4 w-4" />;
    }
  };

  const downloadPDF = async () => {
    setIsGeneratingPDF(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 500));
      generateAuditPDF(results);
    } catch (error) {
      console.error('Erreur génération PDF:', error);
      toast({
        title: "Erreur",
        description: "Erreur lors de la génération du PDF",
        variant: "destructive"
      });
    } finally {
      setIsGeneratingPDF(false);
    }
  };

  const saveAudit = async () => {
    if (!user) {
      toast({
        title: "Connexion requise",
        description: "Veuillez vous connecter pour sauvegarder cet audit",
        variant: "destructive"
      });
      navigate('/login', { state: { from: '/audit/results', results } });
      return;
    }

    setIsSaving(true);
    try {
      const { data, error } = await supabase.functions.invoke('save-audit', {
        body: {
          userId: user.id,
          results: results
        }
      });

      if (error) {
        throw new Error(error.message);
      }

      if (data?.success) {
        setIsSaved(true);
        toast({
          title: "Audit sauvegardé",
          description: "Votre audit a été sauvegardé avec succès dans votre historique",
        });
      } else {
        throw new Error(data?.error || 'Erreur lors de la sauvegarde');
      }
    } catch (error: any) {
      console.error('Erreur sauvegarde:', error);
      toast({
        title: "Erreur de sauvegarde",
        description: error.message || "Impossible de sauvegarder l'audit",
        variant: "destructive"
      });
    } finally {
      setIsSaving(false);
    }
  };

  const aiModels = [
    { name: 'ChatGPT', icon: Bot, value: aiVisibility.chatgpt, color: 'from-emerald-500 to-emerald-600' },
    { name: 'Gemini', icon: Sparkles, value: aiVisibility.gemini, color: 'from-blue-500 to-blue-600' },
    { name: 'Claude', icon: Brain, value: aiVisibility.claude, color: 'from-orange-500 to-orange-600' },
    { name: 'Perplexity', icon: MessageSquare, value: aiVisibility.perplexity, color: 'from-purple-500 to-purple-600' },
  ];

  const tabs = [
    { id: 'overview', label: 'Vue d\'ensemble', icon: Target },
    { id: 'seo', label: 'SEO', icon: Globe },
    { id: 'aeo', label: 'AEO', icon: Bot },
    { id: 'recommendations', label: 'Recommandations', icon: FileText },
  ];

  // Build analysis items from new format or fallback to old format
  const buildAnalysisItems = () => {
    const analysis = results.analysis || {};
    
    // Check if it's the new detailed format (with title, description, structure, etc.)
    if (analysis.title || analysis.description || analysis.structure) {
      return [
        { 
          label: 'Balise Title', 
          icon: FileText,
          value: analysis.title ? (analysis.title.length > 100 ? analysis.title.substring(0, 100) + '...' : analysis.title) : 'Non analysé',
          isDetailed: true
        },
        { 
          label: 'Meta Description', 
          icon: Info,
          value: analysis.description ? (analysis.description.length > 100 ? analysis.description.substring(0, 100) + '...' : analysis.description) : 'Non analysée',
          isDetailed: true
        },
        { 
          label: 'Structure (H1/H2)', 
          icon: Code,
          value: analysis.structure ? (analysis.structure.length > 100 ? analysis.structure.substring(0, 100) + '...' : analysis.structure) : 'Non analysée',
          isDetailed: true
        },
        { 
          label: 'Schema.org', 
          icon: Code,
          value: analysis.schema ? (analysis.schema.length > 100 ? analysis.schema.substring(0, 100) + '...' : analysis.schema) : 'Non analysé',
          isDetailed: true
        },
        { 
          label: 'Mobile / Viewport', 
          icon: Smartphone,
          value: analysis.mobile ? (analysis.mobile.length > 100 ? analysis.mobile.substring(0, 100) + '...' : analysis.mobile) : 'Non analysé',
          isDetailed: true
        },
        { 
          label: 'Open Graph / Réseaux sociaux', 
          icon: Share,
          value: analysis.social ? (analysis.social.length > 100 ? analysis.social.substring(0, 100) + '...' : analysis.social) : 'Non analysé',
          isDetailed: true
        },
        { 
          label: 'Technique', 
          icon: Settings,
          value: analysis.technical ? (analysis.technical.length > 100 ? analysis.technical.substring(0, 100) + '...' : analysis.technical) : 'Non analysé',
          isDetailed: true
        },
      ];
    }
    
    // Old format fallback
    return [
      { label: 'Vitesse de chargement', icon: Zap, value: analysis.speed || 'Moyenne', isDetailed: false },
      { label: 'Métadonnées', icon: FileText, value: analysis.metadata || 'À améliorer', isDetailed: false },
      { label: 'Données structurées', icon: Code, value: analysis.structured_data || 'Manquantes', isDetailed: false },
      { label: 'Mobile-friendly', icon: Smartphone, value: analysis.mobile || 'Oui', isDetailed: false },
      { label: 'HTTPS', icon: Globe, value: analysis.https || 'Oui', isDetailed: false },
    ];
  };

  const analysisItems = buildAnalysisItems();
  const isDetailedAnalysis = analysisItems[0]?.isDetailed;

  // Build SEO strengths and weaknesses from recommendations
  const buildSEOAnalysis = () => {
    const recommendations = results.recommendations || [];
    const metadata = results.metadata || {};
    
    const strengths: string[] = [];
    const weaknesses: string[] = [];
    
    // Check metadata for strengths/weaknesses
    if (metadata.title) strengths.push('Title tag présent');
    else weaknesses.push('Title tag manquant');
    
    if (metadata.description) strengths.push('Meta description présente');
    else weaknesses.push('Meta description manquante');
    
    if (metadata.h1) strengths.push('Balise H1 présente');
    else weaknesses.push('Balise H1 manquante');
    
    if (metadata.hasSchema) strengths.push('Données structurées Schema.org présentes');
    else weaknesses.push('Données structurées Schema.org absentes');
    
    if (metadata.ogTitle || metadata.ogDescription) strengths.push('Balises Open Graph présentes');
    else weaknesses.push('Balises Open Graph manquantes');
    
    if (metadata.viewport) strengths.push('Viewport mobile configuré');
    
    if (metadata.lang) strengths.push(`Langue définie (${metadata.lang})`);
    else weaknesses.push('Attribut lang non défini');
    
    if (!metadata.hasMixedContent) strengths.push('Pas de contenu mixte HTTP/HTTPS');
    else weaknesses.push('Contenu mixte HTTP détecté');
    
    // Add from recommendations (high priority = weakness)
    recommendations.forEach((rec: any) => {
      if (rec.priority === 'high' && !weaknesses.includes(rec.title)) {
        weaknesses.push(rec.title);
      }
    });
    
    return {
      strengths: strengths.length > 0 ? strengths : results.seo_analysis?.strengths || ['Analyse en cours...'],
      weaknesses: weaknesses.length > 0 ? weaknesses : results.seo_analysis?.weaknesses || ['Analyse en cours...']
    };
  };

  const seoAnalysis = buildSEOAnalysis();

  return (
    <div className="min-h-screen bg-gray-950">
      {/* Header */}
      <div className="bg-gray-900/80 backdrop-blur-md border-b border-gray-800 px-6 py-4 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
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
                <div className="flex items-center gap-2">
                  <h1 className="text-xl font-bold text-white">Résultats de l'audit</h1>
                  {results.is_simulation && (
                    <span className="px-2 py-0.5 text-xs bg-yellow-500/20 text-yellow-400 rounded-full">
                      Simulation
                    </span>
                  )}
                  {results.scraping_method && (
                    <span className="px-2 py-0.5 text-xs bg-cyan-500/20 text-cyan-400 rounded-full">
                      {results.scraping_method === 'direct' ? 'Analyse directe' : 'Via API'}
                    </span>
                  )}
                  {isSaved && (
                    <span className="px-2 py-0.5 text-xs bg-emerald-500/20 text-emerald-400 rounded-full flex items-center gap-1">
                      <Check className="h-3 w-3" />
                      Sauvegardé
                    </span>
                  )}
                </div>
                <p className="text-sm text-gray-400 flex items-center gap-2">
                  <Globe className="h-3.5 w-3.5" />
                  {results.url}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3 flex-wrap">
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => navigate('/audit/history')}
                className="border-gray-700 text-gray-300 hover:bg-gray-800"
              >
                <History className="h-4 w-4 mr-2" />
                Historique
              </Button>
              <Button 
                variant="outline" 
                size="sm"
                onClick={saveAudit}
                disabled={isSaving || isSaved}
                className={`border-gray-700 text-gray-300 hover:bg-gray-800 ${isSaved ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400' : ''}`}
              >
                {isSaving ? (
                  <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Sauvegarde...</>
                ) : isSaved ? (
                  <><Check className="w-4 h-4 mr-2" />Sauvegardé</>
                ) : (
                  <><Save className="h-4 w-4 mr-2" />Sauvegarder</>
                )}
              </Button>
              <Button 
                onClick={downloadPDF} 
                variant="outline" 
                size="sm"
                className="border-gray-700 text-gray-300 hover:bg-gray-800"
                disabled={isGeneratingPDF}
              >
                {isGeneratingPDF ? (
                  <><Loader2 className="w-4 h-4 mr-2 animate-spin" />PDF...</>
                ) : (
                  <><Download className="w-4 h-4 mr-2" />PDF</>
                )}
              </Button>
              <Button 
                onClick={() => navigate('/audit')} 
                className="bg-gradient-to-r from-cyan-500 to-purple-600 hover:from-cyan-600 hover:to-purple-700"
              >
                <RefreshCw className="w-4 h-4 mr-2" />
                Nouvel audit
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto p-6">
        {/* Score Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card className="bg-gradient-to-br from-gray-900 to-emerald-950/30 border-gray-800">
            <CardContent className="p-6 flex flex-col items-center">
              <ScoreGauge 
                score={results.seo_score || 0} 
                label="Score SEO"
                color="#10B981"
                size="md"
              />
              <p className="text-sm text-gray-400 mt-2">Optimisation moteurs de recherche</p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-gray-900 to-cyan-950/30 border-gray-800">
            <CardContent className="p-6 flex flex-col items-center">
              <ScoreGauge 
                score={results.aeo_score || 0} 
                label="Score AEO"
                color="#06B6D4"
                size="md"
              />
              <p className="text-sm text-gray-400 mt-2">Visibilité IA génératives</p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-gray-900 to-purple-950/30 border-gray-800">
            <CardContent className="p-6 flex flex-col items-center">
              <ScoreGauge 
                score={results.global_score || results.overall_score || 0} 
                label="Score Global"
                color="#8B5CF6"
                size="md"
              />
              <p className="text-sm text-gray-400 mt-2">Performance combinée</p>
            </CardContent>
          </Card>
        </div>

        {/* Tabs */}
        <div className="flex items-center gap-2 mb-6 overflow-x-auto pb-2">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all whitespace-nowrap ${
                activeTab === tab.id 
                  ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/30' 
                  : 'text-gray-400 hover:text-white hover:bg-gray-800'
              }`}
            >
              <tab.icon className="h-4 w-4" />
              {tab.label}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        {activeTab === 'overview' && (
          <div className="grid lg:grid-cols-2 gap-6">
            {/* AI Visibility */}
            <Card className="bg-gray-900/50 border-gray-800">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <Bot className="h-5 w-5 text-cyan-400" />
                  Visibilité IA par Modèle
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {aiModels.map((model) => (
                  <div key={model.name}>
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <model.icon className="h-4 w-4 text-gray-400" />
                        <span className="text-sm font-medium text-white">{model.name}</span>
                      </div>
                      <span className={`text-sm font-medium ${getScoreColor(model.value)}`}>{model.value}%</span>
                    </div>
                    <div className="h-2 bg-gray-800 rounded-full overflow-hidden">
                      <div 
                        className={`h-full bg-gradient-to-r ${model.color} rounded-full transition-all duration-500`}
                        style={{ width: `${model.value}%` }}
                      />
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Analysis Details */}
            <Card className="bg-gray-900/50 border-gray-800">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <Target className="h-5 w-5 text-emerald-400" />
                  Analyse Détaillée
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {isDetailedAnalysis ? (
                  // New detailed format - show as expandable items
                  analysisItems.slice(0, 5).map((item, index) => (
                    <div key={index} className="p-3 bg-gray-800/30 rounded-lg">
                      <div className="flex items-center gap-2 mb-1">
                        <item.icon className="h-4 w-4 text-cyan-400" />
                        <span className="text-sm font-medium text-white">{item.label}</span>
                      </div>
                      <p className="text-xs text-gray-400 line-clamp-2">{item.value}</p>
                    </div>
                  ))
                ) : (
                  // Old simple format
                  analysisItems.map((item, index) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-gray-800/30 rounded-lg">
                      <div className="flex items-center gap-2">
                        <item.icon className="h-4 w-4 text-gray-400" />
                        <span className="text-gray-300">{item.label}</span>
                      </div>
                      <span className={`px-3 py-1 rounded-full text-sm ${getStatusBg(item.value)} ${getStatusColor(item.value)}`}>
                        {item.value}
                      </span>
                    </div>
                  ))
                )}
              </CardContent>
            </Card>

            {/* Metadata Preview */}
            {results.metadata && (
              <Card className="bg-gray-900/50 border-gray-800 lg:col-span-2">
                <CardHeader>
                  <CardTitle className="text-white flex items-center gap-2">
                    <FileText className="h-5 w-5 text-purple-400" />
                    Métadonnées Extraites
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="p-4 bg-gray-800/30 rounded-lg">
                      <p className="text-xs text-gray-500 mb-1 flex items-center gap-1">
                        <FileText className="h-3 w-3" /> Title
                      </p>
                      <p className="text-white">{results.metadata.title || 'Non défini'}</p>
                      {results.metadata.title && (
                        <p className="text-xs text-gray-500 mt-1">
                          {results.metadata.title.length} caractères
                          {results.metadata.title.length < 30 && ' (trop court)'}
                          {results.metadata.title.length > 60 && ' (trop long)'}
                        </p>
                      )}
                    </div>
                    <div className="p-4 bg-gray-800/30 rounded-lg">
                      <p className="text-xs text-gray-500 mb-1 flex items-center gap-1">
                        <Info className="h-3 w-3" /> Meta Description
                      </p>
                      <p className="text-gray-300">{results.metadata.description || 'Non définie'}</p>
                      {results.metadata.description && (
                        <p className="text-xs text-gray-500 mt-1">
                          {results.metadata.description.length} caractères
                          {results.metadata.description.length < 120 && ' (trop court)'}
                          {results.metadata.description.length > 160 && ' (trop long)'}
                        </p>
                      )}
                    </div>
                    {results.metadata.h1 && (
                      <div className="p-4 bg-gray-800/30 rounded-lg">
                        <p className="text-xs text-gray-500 mb-1 flex items-center gap-1">
                          <Code className="h-3 w-3" /> H1
                        </p>
                        <p className="text-gray-300">{results.metadata.h1}</p>
                      </div>
                    )}
                    {results.metadata.h2s && (
                      <div className="p-4 bg-gray-800/30 rounded-lg">
                        <p className="text-xs text-gray-500 mb-1 flex items-center gap-1">
                          <Code className="h-3 w-3" /> H2s
                        </p>
                        <p className="text-gray-300 text-sm">{results.metadata.h2s}</p>
                      </div>
                    )}
                    <div className="p-4 bg-gray-800/30 rounded-lg">
                      <p className="text-xs text-gray-500 mb-1 flex items-center gap-1">
                        <Code className="h-3 w-3" /> Schema.org
                      </p>
                      <p className={`${results.metadata.hasSchema ? 'text-emerald-400' : 'text-red-400'}`}>
                        {results.metadata.hasSchema ? `Présent (${results.metadata.schemaTypes || 'types détectés'})` : 'Absent'}
                      </p>
                    </div>
                    <div className="p-4 bg-gray-800/30 rounded-lg">
                      <p className="text-xs text-gray-500 mb-1 flex items-center gap-1">
                        <Image className="h-3 w-3" /> Images
                      </p>
                      <p className="text-gray-300">
                        {results.metadata.imageCount || 0} images 
                        ({results.metadata.imagesWithAlt || 0} avec alt)
                      </p>
                    </div>
                    <div className="p-4 bg-gray-800/30 rounded-lg">
                      <p className="text-xs text-gray-500 mb-1 flex items-center gap-1">
                        <Link2 className="h-3 w-3" /> Liens
                      </p>
                      <p className="text-gray-300">{results.metadata.linkCount || 0} liens détectés</p>
                    </div>
                    <div className="p-4 bg-gray-800/30 rounded-lg">
                      <p className="text-xs text-gray-500 mb-1 flex items-center gap-1">
                        <Globe className="h-3 w-3" /> Langue
                      </p>
                      <p className="text-gray-300">{results.metadata.lang || 'Non spécifiée'}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        )}

        {activeTab === 'seo' && (
          <div className="space-y-6">
            <Card className="bg-gray-900/50 border-gray-800">
              <CardHeader>
                <CardTitle className="text-white">Analyse SEO Complète</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <h4 className="font-semibold text-emerald-400 flex items-center gap-2">
                      <CheckCircle2 className="h-5 w-5" />
                      Points Forts ({seoAnalysis.strengths.length})
                    </h4>
                    {seoAnalysis.strengths.map((item: string, i: number) => (
                      <div key={i} className="flex items-center gap-3 p-3 bg-emerald-500/10 rounded-lg">
                        <CheckCircle2 className="h-5 w-5 text-emerald-400 flex-shrink-0" />
                        <span className="text-gray-300 text-sm">{item}</span>
                      </div>
                    ))}
                  </div>
                  <div className="space-y-4">
                    <h4 className="font-semibold text-red-400 flex items-center gap-2">
                      <XCircle className="h-5 w-5" />
                      Points à Améliorer ({seoAnalysis.weaknesses.length})
                    </h4>
                    {seoAnalysis.weaknesses.map((item: string, i: number) => (
                      <div key={i} className="flex items-center gap-3 p-3 bg-red-500/10 rounded-lg">
                        <XCircle className="h-5 w-5 text-red-400 flex-shrink-0" />
                        <span className="text-gray-300 text-sm">{item}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Detailed Analysis Sections */}
            {isDetailedAnalysis && (
              <Card className="bg-gray-900/50 border-gray-800">
                <CardHeader>
                  <CardTitle className="text-white">Analyse Détaillée par Critère</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {analysisItems.map((item, index) => (
                    <div key={index} className="p-4 bg-gray-800/30 rounded-xl border border-gray-700/50">
                      <div className="flex items-center gap-2 mb-2">
                        <item.icon className="h-5 w-5 text-cyan-400" />
                        <h4 className="font-semibold text-white">{item.label}</h4>
                      </div>
                      <p className="text-gray-400 text-sm">{item.value}</p>
                    </div>
                  ))}
                </CardContent>
              </Card>
            )}
          </div>
        )}

        {activeTab === 'aeo' && (
          <div className="space-y-6">
            <Card className="bg-gray-900/50 border-gray-800">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <Bot className="h-5 w-5 text-cyan-400" />
                  Visibilité dans les IA Génératives
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
                  {aiModels.map((model) => (
                    <div key={model.name} className="p-4 bg-gray-800/30 rounded-xl text-center">
                      <model.icon className="h-8 w-8 mx-auto mb-3 text-gray-400" />
                      <p className={`text-2xl font-bold mb-1 ${getScoreColor(model.value)}`}>{model.value}%</p>
                      <p className="text-sm text-gray-400">{model.name}</p>
                      <div className="mt-2 h-1 bg-gray-700 rounded-full overflow-hidden">
                        <div 
                          className={`h-full bg-gradient-to-r ${model.color} rounded-full`}
                          style={{ width: `${model.value}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-gray-900 to-cyan-950/20 border-gray-800">
              <CardContent className="p-6">
                <div className="flex items-start gap-4">
                  <div className="p-3 bg-cyan-500/10 rounded-xl">
                    <Sparkles className="h-6 w-6 text-cyan-400" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-white mb-2">Qu'est-ce que le score AEO ?</h4>
                    <p className="text-gray-400 text-sm">
                      Le score AEO (Answer Engine Optimization) mesure la probabilité que votre site soit cité 
                      dans les réponses des IA génératives comme ChatGPT, Gemini, Claude et Perplexity. 
                      Un score élevé indique que votre contenu est bien structuré pour être compris et cité par ces modèles.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gray-900/50 border-gray-800">
              <CardHeader>
                <CardTitle className="text-white">Facteurs clés pour l'AEO</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-2 gap-4">
                  {[
                    { 
                      title: 'Données structurées', 
                      description: 'Schema.org aide les IA à comprendre le contexte',
                      status: results.metadata?.hasSchema ? 'Présent' : 'Absent',
                      icon: Code
                    },
                    { 
                      title: 'Contenu clair et structuré', 
                      description: 'Hiérarchie H1/H2/H3 bien définie',
                      status: results.metadata?.h1 ? 'Bon' : 'À améliorer',
                      icon: FileText
                    },
                    { 
                      title: 'Questions/Réponses', 
                      description: 'Format FAQ favorisé par les IA',
                      status: results.metadata?.schemaTypes?.includes('FAQ') ? 'Présent' : 'Absent',
                      icon: MessageSquare
                    },
                    { 
                      title: 'Autorité du domaine', 
                      description: 'Backlinks et réputation du site',
                      status: 'À évaluer',
                      icon: Globe
                    },
                  ].map((factor, index) => (
                    <div key={index} className="p-4 bg-gray-800/30 rounded-xl">
                      <div className="flex items-start gap-3">
                        <div className="p-2 bg-gray-700/50 rounded-lg">
                          <factor.icon className="h-5 w-5 text-cyan-400" />
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center justify-between mb-1">
                            <h5 className="font-medium text-white">{factor.title}</h5>
                            <span className={`text-xs px-2 py-0.5 rounded-full ${getStatusBg(factor.status)} ${getStatusColor(factor.status)}`}>
                              {factor.status}
                            </span>
                          </div>
                          <p className="text-xs text-gray-400">{factor.description}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {activeTab === 'recommendations' && (
          <Card className="bg-gray-900/50 border-gray-800">
            <CardHeader>
              <CardTitle className="text-white flex items-center justify-between">
                <span>Recommandations Personnalisées</span>
                <span className="text-sm font-normal text-gray-400">
                  {(results.recommendations || []).length} recommandation(s)
                </span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {(results.recommendations || []).length > 0 ? (
                  results.recommendations.map((rec: any, index: number) => (
                    <div 
                      key={index}
                      className="p-4 bg-gray-800/30 rounded-xl border border-gray-700/50 hover:border-cyan-500/30 transition-all"
                    >
                      <div className="flex items-start gap-4">
                        <div className={`p-2 rounded-lg flex-shrink-0 ${
                          rec.priority === 'high' ? 'bg-red-500/10' :
                          rec.priority === 'medium' ? 'bg-yellow-500/10' :
                          'bg-emerald-500/10'
                        }`}>
                          {getPriorityIcon(rec.priority)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex flex-wrap items-center gap-2 mb-2">
                            <h4 className="font-semibold text-white">{rec.title}</h4>
                            <span className={`text-xs px-2 py-1 rounded-full ${
                              rec.priority === 'high' ? 'bg-red-500/20 text-red-400' :
                              rec.priority === 'medium' ? 'bg-yellow-500/20 text-yellow-400' :
                              'bg-emerald-500/20 text-emerald-400'
                            }`}>
                              {rec.priority === 'high' ? 'Priorité haute' :
                               rec.priority === 'medium' ? 'Priorité moyenne' :
                               'Priorité basse'}
                            </span>
                            {rec.category && (
                              <span className="text-xs px-2 py-1 rounded-full bg-gray-700 text-gray-300 flex items-center gap-1">
                                {getCategoryIcon(rec.category)}
                                {rec.category}
                              </span>
                            )}
                          </div>
                          <p className="text-gray-400 text-sm">{rec.description}</p>
                          {rec.impact && (
                            <div className="flex items-center gap-2 mt-3">
                              <TrendingUp className="h-4 w-4 text-cyan-400" />
                              <span className="text-sm text-cyan-400">Impact: {rec.impact}</span>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8">
                    <CheckCircle2 className="h-12 w-12 text-emerald-400 mx-auto mb-4" />
                    <p className="text-white font-semibold">Excellent travail !</p>
                    <p className="text-gray-400">Aucune recommandation critique pour le moment.</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Save CTA for non-saved audits */}
        {!isSaved && (
          <div className="mt-8 rounded-2xl border border-cyan-500/40 bg-gradient-to-r from-cyan-600/25 to-purple-600/25 p-px shadow-lg shadow-cyan-500/10">
            <div className="rounded-2xl bg-gray-900/90 p-6">
              <div className="flex flex-col md:flex-row items-center justify-between gap-6">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-xl bg-cyan-500/20 border border-cyan-500/30 flex items-center justify-center flex-shrink-0">
                    <Save className="w-6 h-6 text-cyan-400" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-white mb-1">
                      Sauvegardez cet audit
                    </h3>
                    <p className="text-gray-300 text-sm leading-relaxed">
                      Enregistrez cet audit dans votre historique pour suivre l'évolution de votre site au fil du temps.
                    </p>
                  </div>
                </div>
                <Button
                  onClick={saveAudit}
                  disabled={isSaving}
                  className="bg-gradient-to-r from-cyan-500 to-purple-600 hover:from-cyan-400 hover:to-purple-500 text-white font-semibold px-6 py-2.5 rounded-xl shadow-lg shadow-cyan-500/20 whitespace-nowrap flex-shrink-0"
                >
                  {isSaving ? (
                    <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Sauvegarde...</>
                  ) : (
                    <><Save className="h-4 w-4 mr-2" />Sauvegarder l'audit</>
                  )}
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* CTA Upgrade */}
        <div className="mt-6 rounded-2xl border border-purple-500/40 bg-gradient-to-r from-purple-600/25 to-cyan-600/25 p-px shadow-lg shadow-purple-500/10">
          <div className="rounded-2xl bg-gray-900/90 p-6">
            <div className="flex flex-col md:flex-row items-center justify-between gap-6">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-xl bg-purple-500/20 border border-purple-500/30 flex items-center justify-center flex-shrink-0">
                  <ChevronRight className="w-6 h-6 text-purple-400" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-white mb-1">
                    Améliorez votre visibilité IA
                  </h3>
                  <p className="text-gray-300 text-sm leading-relaxed">
                    Passez au plan Pro pour accéder à des analyses plus détaillées et des recommandations avancées.
                  </p>
                </div>
              </div>
              <Button
                onClick={() => navigate('/pricing')}
                className="bg-gradient-to-r from-purple-500 to-cyan-500 hover:from-purple-400 hover:to-cyan-400 text-white font-semibold px-6 py-2.5 rounded-xl shadow-lg shadow-purple-500/20 whitespace-nowrap flex-shrink-0"
              >
                Voir les plans
                <ChevronRight className="h-4 w-4 ml-2" />
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AuditResults;
