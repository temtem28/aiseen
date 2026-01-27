import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabase';
import { generateRealWeeklyReport } from '@/lib/apiServices';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import {
  Calendar,
  ArrowLeft,
  Download,
  RefreshCw,
  TrendingUp,
  TrendingDown,
  Minus,
  Bot,
  FileText,
  CheckCircle2,
  Clock,
  Target,
  Zap,
  MessageSquare,
  AlertCircle,
  ChevronRight,
  Mail,
  BarChart3,
  PieChart,
  ListChecks,
  Sparkles,
  Eye,
  Search
} from 'lucide-react';
import jsPDF from 'jspdf';

interface WeeklyReport {
  id: string;
  report_date: string;
  week_number: number;
  year: number;
  current_seo_score: number;
  current_aeo_score: number;
  current_global_score: number;
  previous_seo_score: number;
  previous_aeo_score: number;
  previous_global_score: number;
  seo_change: number;
  aeo_change: number;
  global_change: number;
  ai_visibility: {
    chatgpt: number;
    gemini: number;
    claude: number;
    perplexity: number;
  };
  ai_visibility_previous: {
    chatgpt: number;
    gemini: number;
    claude: number;
    perplexity: number;
  };
  ai_citations: Array<{
    model: string;
    query: string;
    mentioned: boolean;
    position: number;
    context: string;
    detected_at: string;
  }>;
  new_citations_count: number;
  key_metrics: {
    total_audits: number;
    audits_this_week: number;
    avg_response_time: string;
    pages_analyzed: number;
    recommendations_generated: number;
    recommendations_implemented: number;
    ai_mentions_total: number;
    top_performing_page: string;
  };
  priority_recommendations: Array<{
    title: string;
    description: string;
    priority: string;
    impact: string;
    effort: string;
  }>;
  executive_summary: string;
  detailed_analysis: string;
  action_items: Array<{
    task: string;
    deadline: string;
    responsible: string;
  }>;
  status: string;
  email_sent: boolean;
  created_at: string;
}

export default function WeeklyReports() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [reports, setReports] = useState<WeeklyReport[]>([]);
  const [selectedReport, setSelectedReport] = useState<WeeklyReport | null>(null);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    if (user) {
      loadReports();
    }
  }, [user]);

  const loadReports = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('weekly_reports')
        .select('*')
        .eq('user_id', user?.id)
        .order('report_date', { ascending: false });

      if (error) {
        // Table doesn't exist - this is OK, just use empty array
        if (error.code === 'PGRST116' || error.message?.includes('does not exist')) {
          console.log('Weekly reports table not available');
          setReports([]);
          return;
        }
        throw error;
      }

      setReports(data || []);
      if (data && data.length > 0) {
        setSelectedReport(data[0]);
      }
    } catch (error) {
      console.error('Error loading reports:', error);
      // Gracefully handle missing table
      setReports([]);
    } finally {
      setLoading(false);
    }
  };


  const generateNewReport = async () => {
    setGenerating(true);
    try {
      const { data, error } = await supabase.functions.invoke('generate-weekly-report', {
        body: { user_id: user?.id, force_generate: true }
      });

      if (error) {
        // If Edge Function fails, use direct API service
        console.log('Edge Function not available, using direct API service');
        const realReport = await generateRealWeeklyReport(user?.id);
        
        // Add ID and save to database
        const reportWithId = {
          id: `real-${Date.now()}`,
          ...realReport,
          created_at: new Date().toISOString()
        };
        
        // Try to save to database
        try {
          const { error: insertError } = await supabase
            .from('weekly_reports')
            .insert({
              user_id: user?.id,
              ...reportWithId
            });

          if (insertError) {
            console.log('Could not save report to database (table may not exist):', insertError);
          }
        } catch (dbError) {
          console.log('Database error (table may not exist):', dbError);
        }

        setReports(prev => [reportWithId as WeeklyReport, ...prev.filter(r => r.id !== reportWithId.id)]);
        setSelectedReport(reportWithId as WeeklyReport);
        return;
      }

      if (data?.report) {
        setReports(prev => [data.report, ...prev.filter(r => r.id !== data.report.id)]);
        setSelectedReport(data.report);
      }
    } catch (error: any) {
      console.error('Error generating report:', error);
      // Try direct API service as fallback
      try {
        const realReport = await generateRealWeeklyReport(user?.id);
        const reportWithId = {
          id: `real-${Date.now()}`,
          ...realReport,
          created_at: new Date().toISOString()
        };
        setReports(prev => [reportWithId as WeeklyReport, ...prev.filter(r => r.id !== reportWithId.id)]);
        setSelectedReport(reportWithId as WeeklyReport);
      } catch (apiError: any) {
        console.error('API error:', apiError);
        // Show error to user
        alert(`Erreur: ${apiError.message || 'Impossible de générer le rapport. Vérifiez que vous avez des audits sauvegardés.'}`);
      }
    } finally {
      setGenerating(false);
    }
  };

  const downloadPDF = () => {
    if (!selectedReport) return;

    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();
    let y = 20;

    // Header
    doc.setFillColor(10, 22, 40);
    doc.rect(0, 0, pageWidth, 50, 'F');
    
    doc.setTextColor(6, 182, 212);
    doc.setFontSize(28);
    doc.setFont('helvetica', 'bold');
    doc.text('Ai Seen', 20, 28);
    
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(14);
    doc.text('Rapport Hebdomadaire', 20, 40);
    
    doc.setFontSize(10);
    doc.text(`Semaine ${selectedReport.week_number} - ${selectedReport.year}`, pageWidth - 60, 40);
    
    y = 65;

    // Scores Section
    doc.setTextColor(30, 30, 30);
    doc.setFontSize(16);
    doc.setFont('helvetica', 'bold');
    doc.text('Scores de la Semaine', 20, y);
    y += 15;

    const scores = [
      { label: 'SEO', value: selectedReport.current_seo_score, change: selectedReport.seo_change },
      { label: 'AEO', value: selectedReport.current_aeo_score, change: selectedReport.aeo_change },
      { label: 'Global', value: selectedReport.current_global_score, change: selectedReport.global_change }
    ];

    scores.forEach((score, i) => {
      const x = 20 + (i * 60);
      const color = score.value >= 70 ? [16, 185, 129] : score.value >= 40 ? [245, 158, 11] : [239, 68, 68];
      doc.setFillColor(color[0], color[1], color[2]);
      doc.roundedRect(x, y, 50, 35, 3, 3, 'F');
      doc.setTextColor(255, 255, 255);
      doc.setFontSize(22);
      doc.text(`${score.value}`, x + 25, y + 18, { align: 'center' });
      doc.setFontSize(9);
      doc.text(`${score.label} (${score.change >= 0 ? '+' : ''}${score.change})`, x + 25, y + 28, { align: 'center' });
    });

    y += 50;

    // Executive Summary
    doc.setTextColor(30, 30, 30);
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text('Résumé Exécutif', 20, y);
    y += 10;
    
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(10);
    doc.setTextColor(60, 60, 60);
    const summaryLines = doc.splitTextToSize(selectedReport.executive_summary, pageWidth - 40);
    doc.text(summaryLines, 20, y);
    y += summaryLines.length * 5 + 15;

    // AI Visibility
    doc.setTextColor(30, 30, 30);
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text('Visibilité IA', 20, y);
    y += 10;

    const aiModels = [
      { name: 'ChatGPT', score: selectedReport.ai_visibility.chatgpt },
      { name: 'Gemini', score: selectedReport.ai_visibility.gemini },
      { name: 'Claude', score: selectedReport.ai_visibility.claude },
      { name: 'Perplexity', score: selectedReport.ai_visibility.perplexity }
    ];

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(10);
    aiModels.forEach(model => {
      doc.setTextColor(80, 80, 80);
      doc.text(`${model.name}:`, 25, y);
      const color = model.score >= 70 ? [16, 185, 129] : model.score >= 40 ? [245, 158, 11] : [239, 68, 68];
      doc.setTextColor(color[0], color[1], color[2]);
      doc.text(`${model.score}%`, 80, y);
      y += 7;
    });

    y += 10;

    // Recommendations
    if (y > 200) {
      doc.addPage();
      y = 20;
    }

    doc.setTextColor(30, 30, 30);
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text('Recommandations Prioritaires', 20, y);
    y += 12;

    selectedReport.priority_recommendations.slice(0, 4).forEach((rec, i) => {
      if (y > 260) {
        doc.addPage();
        y = 20;
      }
      doc.setFillColor(245, 245, 245);
      doc.roundedRect(20, y, pageWidth - 40, 22, 2, 2, 'F');
      doc.setTextColor(30, 30, 30);
      doc.setFontSize(11);
      doc.setFont('helvetica', 'bold');
      doc.text(`${i + 1}. ${rec.title}`, 25, y + 8);
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(9);
      doc.setTextColor(80, 80, 80);
      const desc = doc.splitTextToSize(rec.description, pageWidth - 50);
      doc.text(desc[0], 25, y + 16);
      y += 27;
    });

    // Footer
    doc.setTextColor(150, 150, 150);
    doc.setFontSize(8);
    doc.text(`Généré le ${new Date().toLocaleDateString('fr-FR')} - © Ai Seen`, pageWidth / 2, 285, { align: 'center' });

    doc.save(`rapport-semaine-${selectedReport.week_number}-${selectedReport.year}.pdf`);
  };

  const getTrendIcon = (change: number) => {
    if (change > 0) return <TrendingUp className="h-4 w-4 text-emerald-400" />;
    if (change < 0) return <TrendingDown className="h-4 w-4 text-red-400" />;
    return <Minus className="h-4 w-4 text-gray-400" />;
  };

  const getScoreColor = (score: number) => {
    if (score >= 70) return 'text-emerald-400';
    if (score >= 40) return 'text-yellow-400';
    return 'text-red-400';
  };

  const getPriorityColor = (priority: string) => {
    switch (priority.toLowerCase()) {
      case 'high': return 'bg-red-500/20 text-red-400 border-red-500/30';
      case 'medium': return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30';
      case 'low': return 'bg-green-500/20 text-green-400 border-green-500/30';
      default: return 'bg-gray-500/20 text-gray-400 border-gray-500/30';
    }
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('fr-FR', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-cyan-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-400">Chargement des rapports...</p>
        </div>
      </div>
    );
  }

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
              <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center">
                <Calendar className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-white">Rapports Hebdomadaires</h1>
                <p className="text-sm text-gray-400">Suivi de votre visibilité SEO & AEO</p>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Button
              onClick={generateNewReport}
              disabled={generating}
              className="bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700"
            >
              {generating ? (
                <>
                  <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                  Génération...
                </>
              ) : (
                <>
                  <Sparkles className="h-4 w-4 mr-2" />
                  Générer un rapport
                </>
              )}
            </Button>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto p-6">
        {reports.length === 0 ? (
          <Card className="bg-gray-900/50 border-gray-800">
            <CardContent className="p-12 text-center">
              <div className="w-20 h-20 bg-indigo-500/10 rounded-full flex items-center justify-center mx-auto mb-6">
                <FileText className="h-10 w-10 text-indigo-400" />
              </div>
              <h2 className="text-2xl font-bold text-white mb-3">Aucun rapport disponible</h2>
              <p className="text-gray-400 mb-6 max-w-md mx-auto">
                Générez votre premier rapport hebdomadaire pour suivre l'évolution de votre visibilité SEO et AEO.
              </p>
              <Button
                onClick={generateNewReport}
                disabled={generating}
                className="bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700"
              >
                {generating ? (
                  <>
                    <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                    Génération en cours...
                  </>
                ) : (
                  <>
                    <Sparkles className="h-4 w-4 mr-2" />
                    Générer mon premier rapport
                  </>
                )}
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid lg:grid-cols-4 gap-6">
            {/* Reports List Sidebar */}
            <div className="lg:col-span-1">
              <Card className="bg-gray-900/50 border-gray-800">
                <CardHeader className="pb-3">
                  <CardTitle className="text-white text-lg flex items-center gap-2">
                    <Clock className="h-5 w-5 text-indigo-400" />
                    Historique
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-2">
                  <div className="space-y-2 max-h-[600px] overflow-y-auto">
                    {reports.map((report) => (
                      <button
                        key={report.id}
                        onClick={() => setSelectedReport(report)}
                        className={`w-full p-3 rounded-lg text-left transition-all ${
                          selectedReport?.id === report.id
                            ? 'bg-indigo-500/20 border border-indigo-500/50'
                            : 'bg-gray-800/50 hover:bg-gray-800 border border-transparent'
                        }`}
                      >
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-sm font-medium text-white">
                            Semaine {report.week_number}
                          </span>
                          <span className={`text-lg font-bold ${getScoreColor(report.current_global_score)}`}>
                            {report.current_global_score}
                          </span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-xs text-gray-500">{formatDate(report.report_date)}</span>
                          <div className="flex items-center gap-1">
                            {getTrendIcon(report.global_change)}
                            <span className={`text-xs ${report.global_change >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                              {report.global_change >= 0 ? '+' : ''}{report.global_change}
                            </span>
                          </div>
                        </div>
                      </button>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Report Content */}
            {selectedReport && (
              <div className="lg:col-span-3 space-y-6">
                {/* Report Header */}
                <Card className="bg-gradient-to-br from-gray-900 to-indigo-950/30 border-gray-800">
                  <CardContent className="p-6">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
                      <div>
                        <h2 className="text-2xl font-bold text-white mb-1">
                          Rapport Semaine {selectedReport.week_number}, {selectedReport.year}
                        </h2>
                        <p className="text-gray-400">
                          Généré le {formatDate(selectedReport.created_at)}
                        </p>
                      </div>
                      <div className="flex items-center gap-3">
                        {selectedReport.email_sent && (
                          <Badge className="bg-emerald-500/20 text-emerald-400 border-emerald-500/30">
                            <Mail className="h-3 w-3 mr-1" />
                            Envoyé par email
                          </Badge>
                        )}
                        <Button
                          onClick={downloadPDF}
                          variant="outline"
                          className="border-gray-700 text-gray-300 hover:bg-gray-800"
                        >
                          <Download className="h-4 w-4 mr-2" />
                          Télécharger PDF
                        </Button>
                      </div>
                    </div>

                    {/* Score Cards */}
                    <div className="grid grid-cols-3 gap-4">
                      <div className="bg-gray-800/50 rounded-xl p-4 text-center">
                        <div className="flex items-center justify-center gap-2 mb-2">
                          <Search className="h-5 w-5 text-cyan-400" />
                          <span className="text-sm text-gray-400">Score SEO</span>
                        </div>
                        <p className={`text-3xl font-bold ${getScoreColor(selectedReport.current_seo_score)}`}>
                          {selectedReport.current_seo_score}
                        </p>
                        <div className="flex items-center justify-center gap-1 mt-1">
                          {getTrendIcon(selectedReport.seo_change)}
                          <span className={`text-sm ${selectedReport.seo_change >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                            {selectedReport.seo_change >= 0 ? '+' : ''}{selectedReport.seo_change} pts
                          </span>
                        </div>
                      </div>

                      <div className="bg-gray-800/50 rounded-xl p-4 text-center">
                        <div className="flex items-center justify-center gap-2 mb-2">
                          <Bot className="h-5 w-5 text-purple-400" />
                          <span className="text-sm text-gray-400">Score AEO</span>
                        </div>
                        <p className={`text-3xl font-bold ${getScoreColor(selectedReport.current_aeo_score)}`}>
                          {selectedReport.current_aeo_score}
                        </p>
                        <div className="flex items-center justify-center gap-1 mt-1">
                          {getTrendIcon(selectedReport.aeo_change)}
                          <span className={`text-sm ${selectedReport.aeo_change >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                            {selectedReport.aeo_change >= 0 ? '+' : ''}{selectedReport.aeo_change} pts
                          </span>
                        </div>
                      </div>

                      <div className="bg-gray-800/50 rounded-xl p-4 text-center">
                        <div className="flex items-center justify-center gap-2 mb-2">
                          <Target className="h-5 w-5 text-emerald-400" />
                          <span className="text-sm text-gray-400">Score Global</span>
                        </div>
                        <p className={`text-3xl font-bold ${getScoreColor(selectedReport.current_global_score)}`}>
                          {selectedReport.current_global_score}
                        </p>
                        <div className="flex items-center justify-center gap-1 mt-1">
                          {getTrendIcon(selectedReport.global_change)}
                          <span className={`text-sm ${selectedReport.global_change >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                            {selectedReport.global_change >= 0 ? '+' : ''}{selectedReport.global_change} pts
                          </span>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Tabs */}
                <Tabs value={activeTab} onValueChange={setActiveTab}>
                  <TabsList className="bg-gray-900 border border-gray-800 p-1">
                    <TabsTrigger value="overview" className="data-[state=active]:bg-indigo-500">
                      <BarChart3 className="h-4 w-4 mr-2" />
                      Vue d'ensemble
                    </TabsTrigger>
                    <TabsTrigger value="ai-visibility" className="data-[state=active]:bg-indigo-500">
                      <Eye className="h-4 w-4 mr-2" />
                      Visibilité IA
                    </TabsTrigger>
                    <TabsTrigger value="recommendations" className="data-[state=active]:bg-indigo-500">
                      <ListChecks className="h-4 w-4 mr-2" />
                      Recommandations
                    </TabsTrigger>
                    <TabsTrigger value="actions" className="data-[state=active]:bg-indigo-500">
                      <Zap className="h-4 w-4 mr-2" />
                      Actions
                    </TabsTrigger>
                  </TabsList>

                  {/* Overview Tab */}
                  <TabsContent value="overview" className="space-y-6 mt-6">
                    {/* Executive Summary */}
                    <Card className="bg-gray-900/50 border-gray-800">
                      <CardHeader>
                        <CardTitle className="text-white flex items-center gap-2">
                          <FileText className="h-5 w-5 text-indigo-400" />
                          Résumé Exécutif
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <p className="text-gray-300 leading-relaxed">
                          {selectedReport.executive_summary}
                        </p>
                      </CardContent>
                    </Card>

                    {/* Key Metrics */}
                    <Card className="bg-gray-900/50 border-gray-800">
                      <CardHeader>
                        <CardTitle className="text-white flex items-center gap-2">
                          <PieChart className="h-5 w-5 text-cyan-400" />
                          Métriques Clés
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                          <div className="bg-gray-800/50 rounded-lg p-4 text-center">
                            <p className="text-2xl font-bold text-cyan-400">
                              {selectedReport.key_metrics.total_audits}
                            </p>
                            <p className="text-sm text-gray-400">Audits totaux</p>
                          </div>
                          <div className="bg-gray-800/50 rounded-lg p-4 text-center">
                            <p className="text-2xl font-bold text-purple-400">
                              {selectedReport.key_metrics.audits_this_week}
                            </p>
                            <p className="text-sm text-gray-400">Cette semaine</p>
                          </div>
                          <div className="bg-gray-800/50 rounded-lg p-4 text-center">
                            <p className="text-2xl font-bold text-emerald-400">
                              {selectedReport.new_citations_count}
                            </p>
                            <p className="text-sm text-gray-400">Citations IA</p>
                          </div>
                          <div className="bg-gray-800/50 rounded-lg p-4 text-center">
                            <p className="text-2xl font-bold text-orange-400">
                              {selectedReport.key_metrics.recommendations_implemented}
                            </p>
                            <p className="text-sm text-gray-400">Recos appliquées</p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>

                    {/* Detailed Analysis */}
                    <Card className="bg-gray-900/50 border-gray-800">
                      <CardHeader>
                        <CardTitle className="text-white flex items-center gap-2">
                          <MessageSquare className="h-5 w-5 text-purple-400" />
                          Analyse Détaillée
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="prose prose-invert max-w-none">
                          {selectedReport.detailed_analysis.split('\n\n').map((paragraph, i) => (
                            <p key={i} className="text-gray-300 leading-relaxed mb-4">
                              {paragraph}
                            </p>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  </TabsContent>

                  {/* AI Visibility Tab */}
                  <TabsContent value="ai-visibility" className="space-y-6 mt-6">
                    {/* AI Models Visibility */}
                    <Card className="bg-gray-900/50 border-gray-800">
                      <CardHeader>
                        <CardTitle className="text-white flex items-center gap-2">
                          <Bot className="h-5 w-5 text-cyan-400" />
                          Visibilité par Modèle IA
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-6">
                          {[
                            { name: 'ChatGPT', key: 'chatgpt', color: 'bg-emerald-500', icon: '🤖' },
                            { name: 'Gemini', key: 'gemini', color: 'bg-blue-500', icon: '💎' },
                            { name: 'Claude', key: 'claude', color: 'bg-orange-500', icon: '🧠' },
                            { name: 'Perplexity', key: 'perplexity', color: 'bg-purple-500', icon: '🔍' }
                          ].map((model) => {
                            const current = selectedReport.ai_visibility[model.key as keyof typeof selectedReport.ai_visibility];
                            const previous = selectedReport.ai_visibility_previous[model.key as keyof typeof selectedReport.ai_visibility_previous];
                            const change = current - previous;
                            
                            return (
                              <div key={model.key} className="space-y-2">
                                <div className="flex items-center justify-between">
                                  <div className="flex items-center gap-2">
                                    <span className="text-lg">{model.icon}</span>
                                    <span className="text-white font-medium">{model.name}</span>
                                  </div>
                                  <div className="flex items-center gap-3">
                                    <span className={`text-lg font-bold ${getScoreColor(current)}`}>
                                      {current}%
                                    </span>
                                    <div className="flex items-center gap-1">
                                      {getTrendIcon(change)}
                                      <span className={`text-sm ${change >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                                        {change >= 0 ? '+' : ''}{change}%
                                      </span>
                                    </div>
                                  </div>
                                </div>
                                <div className="relative">
                                  <Progress value={current} className="h-3 bg-gray-800" />
                                  {previous !== current && (
                                    <div 
                                      className="absolute top-0 h-3 w-0.5 bg-white/50"
                                      style={{ left: `${previous}%` }}
                                    />
                                  )}
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </CardContent>
                    </Card>

                    {/* AI Citations */}
                    <Card className="bg-gray-900/50 border-gray-800">
                      <CardHeader>
                        <CardTitle className="text-white flex items-center gap-2">
                          <MessageSquare className="h-5 w-5 text-emerald-400" />
                          Citations IA Détectées
                          <Badge className="ml-2 bg-emerald-500/20 text-emerald-400">
                            {selectedReport.ai_citations.length} nouvelles
                          </Badge>
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-4">
                          {selectedReport.ai_citations.map((citation, i) => (
                            <div key={i} className="bg-gray-800/50 rounded-lg p-4">
                              <div className="flex items-start justify-between mb-2">
                                <div className="flex items-center gap-2">
                                  <Badge className="bg-cyan-500/20 text-cyan-400 border-cyan-500/30">
                                    {citation.model}
                                  </Badge>
                                  <Badge className="bg-purple-500/20 text-purple-400 border-purple-500/30">
                                    Position #{citation.position}
                                  </Badge>
                                </div>
                                <span className="text-xs text-gray-500">
                                  {new Date(citation.detected_at).toLocaleDateString('fr-FR')}
                                </span>
                              </div>
                              <p className="text-white font-medium mb-1">"{citation.query}"</p>
                              <p className="text-sm text-gray-400">{citation.context}</p>
                            </div>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  </TabsContent>

                  {/* Recommendations Tab */}
                  <TabsContent value="recommendations" className="space-y-6 mt-6">
                    <Card className="bg-gray-900/50 border-gray-800">
                      <CardHeader>
                        <CardTitle className="text-white flex items-center gap-2">
                          <Target className="h-5 w-5 text-orange-400" />
                          Recommandations Prioritaires
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-4">
                          {selectedReport.priority_recommendations.map((rec, i) => (
                            <div key={i} className="bg-gray-800/50 rounded-lg p-4 border-l-4 border-l-indigo-500">
                              <div className="flex items-start justify-between mb-3">
                                <div className="flex items-center gap-3">
                                  <span className="w-8 h-8 bg-indigo-500/20 rounded-full flex items-center justify-center text-indigo-400 font-bold">
                                    {i + 1}
                                  </span>
                                  <h4 className="text-white font-semibold">{rec.title}</h4>
                                </div>
                                <Badge className={getPriorityColor(rec.priority)}>
                                  {rec.priority === 'high' ? 'Haute' : rec.priority === 'medium' ? 'Moyenne' : 'Basse'}
                                </Badge>
                              </div>
                              <p className="text-gray-400 mb-3 ml-11">{rec.description}</p>
                              <div className="flex items-center gap-4 ml-11">
                                <div className="flex items-center gap-2 text-sm">
                                  <TrendingUp className="h-4 w-4 text-emerald-400" />
                                  <span className="text-gray-400">Impact:</span>
                                  <span className="text-emerald-400">{rec.impact}</span>
                                </div>
                                <div className="flex items-center gap-2 text-sm">
                                  <Zap className="h-4 w-4 text-yellow-400" />
                                  <span className="text-gray-400">Effort:</span>
                                  <span className="text-yellow-400">{rec.effort}</span>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  </TabsContent>

                  {/* Actions Tab */}
                  <TabsContent value="actions" className="space-y-6 mt-6">
                    <Card className="bg-gray-900/50 border-gray-800">
                      <CardHeader>
                        <CardTitle className="text-white flex items-center gap-2">
                          <ListChecks className="h-5 w-5 text-cyan-400" />
                          Plan d'Actions
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-3">
                          {selectedReport.action_items.map((action, i) => (
                            <div key={i} className="flex items-center gap-4 p-4 bg-gray-800/50 rounded-lg">
                              <div className="w-6 h-6 rounded-full border-2 border-gray-600 flex items-center justify-center">
                                <span className="text-xs text-gray-400">{i + 1}</span>
                              </div>
                              <div className="flex-1">
                                <p className="text-white font-medium">{action.task}</p>
                                <div className="flex items-center gap-4 mt-1">
                                  <span className="text-xs text-gray-500 flex items-center gap-1">
                                    <Clock className="h-3 w-3" />
                                    {action.deadline}
                                  </span>
                                  <Badge variant="outline" className="text-xs border-gray-700 text-gray-400">
                                    {action.responsible}
                                  </Badge>
                                </div>
                              </div>
                              <ChevronRight className="h-5 w-5 text-gray-600" />
                            </div>
                          ))}
                        </div>
                      </CardContent>
                    </Card>

                    {/* Quick Stats */}
                    <div className="grid md:grid-cols-3 gap-4">
                      <Card className="bg-gray-900/50 border-gray-800">
                        <CardContent className="p-4 text-center">
                          <div className="w-12 h-12 bg-emerald-500/10 rounded-full flex items-center justify-center mx-auto mb-3">
                            <CheckCircle2 className="h-6 w-6 text-emerald-400" />
                          </div>
                          <p className="text-2xl font-bold text-white">
                            {selectedReport.key_metrics.recommendations_implemented}
                          </p>
                          <p className="text-sm text-gray-400">Actions complétées</p>
                        </CardContent>
                      </Card>

                      <Card className="bg-gray-900/50 border-gray-800">
                        <CardContent className="p-4 text-center">
                          <div className="w-12 h-12 bg-yellow-500/10 rounded-full flex items-center justify-center mx-auto mb-3">
                            <Clock className="h-6 w-6 text-yellow-400" />
                          </div>
                          <p className="text-2xl font-bold text-white">
                            {selectedReport.action_items.length}
                          </p>
                          <p className="text-sm text-gray-400">Actions en cours</p>
                        </CardContent>
                      </Card>

                      <Card className="bg-gray-900/50 border-gray-800">
                        <CardContent className="p-4 text-center">
                          <div className="w-12 h-12 bg-cyan-500/10 rounded-full flex items-center justify-center mx-auto mb-3">
                            <Target className="h-6 w-6 text-cyan-400" />
                          </div>
                          <p className="text-2xl font-bold text-white">
                            {selectedReport.priority_recommendations.length}
                          </p>
                          <p className="text-sm text-gray-400">Recommandations</p>
                        </CardContent>
                      </Card>
                    </div>
                  </TabsContent>
                </Tabs>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
