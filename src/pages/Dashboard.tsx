import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { useNavigate } from 'react-router-dom';
import { 
  Search, LogOut, Bell, Settings, ChevronRight,
  Globe, Bot, Sparkles, Brain, MessageSquare,
  TrendingUp, TrendingDown, Calendar, User,
  FileText, Trophy, Telescope, Mic, Zap,
  ExternalLink, Clock, Plus, X,
  LayoutDashboard, BarChart3, HelpCircle,
  Shield, Lock, Save, Loader2,
  Play, RefreshCw, Download, Target, ThumbsUp, ThumbsDown,
  ChevronUp
} from 'lucide-react';
import { useEffect, useState, useRef } from 'react';
import { supabase } from '@/lib/supabase';
import CircularGauge from '@/components/dashboard/CircularGauge';
import { useToast } from '@/hooks/use-toast';

// Types
interface Stats {
  auditsCount: number;
  latestScore: number | null;
  avgSeoScore: number | null;
  avgAeoScore: number | null;
  avgPerformance: number | null;
  latestAudit: any | null;
  previousScore: number | null;
}

type ViewType = 'dashboard' | 'audit' | 'citations' | 'perception' | 'competitors' | 'content' | 'reports';
type SettingsTab = 'profile' | 'notifications' | 'security';

export default function Dashboard() {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  // États principaux
  const [activeView, setActiveView] = useState<ViewType>('dashboard');
  const [stats, setStats] = useState<Stats>({ 
    auditsCount: 0, 
    latestScore: null, 
    avgSeoScore: null, 
    avgAeoScore: null,
    avgPerformance: null,
    latestAudit: null,
    previousScore: null
  });
  const [recentAudits, setRecentAudits] = useState<any[]>([]);
  const [aiVisibility, setAiVisibility] = useState({
    chatgpt: 72,
    gemini: 58,
    claude: 65,
    perplexity: 45
  });
  
  // États pour les différentes vues
  const [auditUrl, setAuditUrl] = useState('');
  const [isAuditing, setIsAuditing] = useState(false);
  const [auditProgress, setAuditProgress] = useState(0);
  
  // États Settings
  const [settingsTab, setSettingsTab] = useState<SettingsTab>('profile');
  const [showSettings, setShowSettings] = useState(false);
  const [loading, setLoading] = useState(false);
  const [profile, setProfile] = useState({
    fullName: '',
    company: '',
    website: '',
    phone: ''
  });
  const [notifications, setNotifications] = useState({
    emailNotifications: true,
    pushNotifications: false,
    weeklyReport: true,
    scoreChanges: true
  });

  // État pour le menu profil
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const profileMenuRef = useRef<HTMLDivElement>(null);

  // Fermer le menu profil quand on clique ailleurs
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (profileMenuRef.current && !profileMenuRef.current.contains(event.target as Node)) {
        setShowProfileMenu(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Menu items
  const menuItems = [
    { id: 'dashboard' as ViewType, icon: LayoutDashboard, label: 'Vue d\'ensemble' },
    { id: 'audit' as ViewType, icon: Search, label: 'Nouvel Audit' },
    { id: 'citations' as ViewType, icon: Mic, label: 'Citations IA' },
    { id: 'perception' as ViewType, icon: Telescope, label: 'Perception IA' },
    { id: 'competitors' as ViewType, icon: Trophy, label: 'Concurrents' },
    { id: 'content' as ViewType, icon: FileText, label: 'Contenu IA' },
    { id: 'reports' as ViewType, icon: Calendar, label: 'Rapports' },
  ];

  const aiModels = [
    { name: 'ChatGPT', icon: Bot, value: aiVisibility.chatgpt, color: '#10b981', trend: '+5%' },
    { name: 'Gemini', icon: Sparkles, value: aiVisibility.gemini, color: '#3b82f6', trend: '+3%' },
    { name: 'Claude', icon: Brain, value: aiVisibility.claude, color: '#f97316', trend: '+8%' },
    { name: 'Perplexity', icon: MessageSquare, value: aiVisibility.perplexity, color: '#a855f7', trend: '-2%' },
  ];

  useEffect(() => {
    loadUserStats();
    loadUserProfile();
  }, [user]);

  const loadUserStats = async () => {
    if (!user) return;
    
    const { data: audits } = await supabase
      .from('audits')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    if (audits && audits.length > 0) {
      const avgSeo = Math.round(audits.reduce((acc, a) => acc + (a.seo_score || 0), 0) / audits.length);
      const avgAeo = Math.round(audits.reduce((acc, a) => acc + (a.aeo_score || a.performance_score || 0), 0) / audits.length);
      
      setStats({
        auditsCount: audits.length,
        latestScore: audits[0]?.overall_score || null,
        avgSeoScore: avgSeo || 72,
        avgAeoScore: avgAeo || 65,
        avgPerformance: Math.round((avgSeo + avgAeo) / 2) || 68,
        latestAudit: audits[0],
        previousScore: audits[1]?.overall_score || null
      });

      if (audits[0]?.ai_visibility) {
        setAiVisibility(audits[0].ai_visibility);
      }

      setRecentAudits(audits.slice(0, 5));
    }
  };

  const loadUserProfile = async () => {
    if (!user) return;
    
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      if (error) {
        // If profile doesn't exist, create one
        if (error.code === 'PGRST116' || error.message?.includes('not found')) {
          console.log('Profile not found, creating one...');
          const { error: insertError } = await supabase
            .from('profiles')
            .upsert({
              id: user.id,
              email: user.email,
              plan: 'free',
              credits: 3,
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString()
            });
          
          if (insertError) {
            console.error('Error creating profile:', insertError);
          }
        } else {
          console.error('Error loading profile:', error);
        }
        return;
      }

      if (data) {
        setProfile({
          fullName: data.full_name || '',
          company: data.company || '',
          website: data.website || '',
          phone: data.phone || ''
        });
      }
    } catch (err) {
      console.error('Error in loadUserProfile:', err);
    }
  };


  const handleSignOut = async () => {
    setShowProfileMenu(false);
    await signOut();
    navigate('/');
  };

  const startAudit = async () => {
    if (!auditUrl) {
      toast({ title: "Erreur", description: "Veuillez entrer une URL", variant: "destructive" });
      return;
    }

    setIsAuditing(true);
    setAuditProgress(0);

    const interval = setInterval(() => {
      setAuditProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          return 100;
        }
        return prev + 10;
      });
    }, 500);

    setTimeout(() => {
      navigate('/audit/running', { state: { url: auditUrl } });
    }, 500);
  };

  const saveProfile = async () => {
    if (!user) return;
    setLoading(true);

    try {
      await supabase.from('profiles').upsert({
        id: user.id,
        full_name: profile.fullName,
        company: profile.company,
        website: profile.website,
        phone: profile.phone,
        updated_at: new Date().toISOString()
      });

      toast({ title: "Succès", description: "Profil mis à jour" });
    } catch (error: any) {
      toast({ title: "Erreur", description: error.message, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  // Render des différentes vues
  const renderDashboardView = () => (
    <div className="space-y-6">
      {/* Score Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-[#0d1321] rounded-2xl p-6 border border-[#1a2332]">
          <div className="flex items-center justify-between mb-4">
            <span className="text-gray-400 text-sm">Score SEO</span>
            <TrendingUp className="w-4 h-4 text-emerald-400" />
          </div>
          <CircularGauge value={stats.avgSeoScore || 72} label="" color="#22d3ee" size="sm" />
        </div>
        
        <div className="bg-[#0d1321] rounded-2xl p-6 border border-[#1a2332]">
          <div className="flex items-center justify-between mb-4">
            <span className="text-gray-400 text-sm">Score AEO</span>
            <TrendingUp className="w-4 h-4 text-emerald-400" />
          </div>
          <CircularGauge value={stats.avgAeoScore || 65} label="" color="#a855f7" size="sm" />
        </div>

        <div className="bg-[#0d1321] rounded-2xl p-6 border border-[#1a2332]">
          <div className="flex items-center justify-between mb-4">
            <span className="text-gray-400 text-sm">Audits</span>
            <BarChart3 className="w-4 h-4 text-blue-400" />
          </div>
          <p className="text-4xl font-bold text-white">{stats.auditsCount || 0}</p>
          <p className="text-xs text-gray-500 mt-1">ce mois</p>
        </div>

        <div className="bg-[#0d1321] rounded-2xl p-6 border border-[#1a2332]">
          <div className="flex items-center justify-between mb-4">
            <span className="text-gray-400 text-sm">Citations IA</span>
            <Mic className="w-4 h-4 text-purple-400" />
          </div>
          <p className="text-4xl font-bold text-white">24</p>
          <p className="text-xs text-emerald-400 mt-1">+8% cette semaine</p>
        </div>
      </div>

      {/* Visibilité IA */}
      <div className="bg-[#0d1321] rounded-2xl p-6 border border-[#1a2332]">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-white font-semibold flex items-center gap-2">
            <Bot className="w-5 h-5 text-cyan-400" />
            Visibilité par IA
          </h3>
          <button 
            onClick={() => setActiveView('citations')}
            className="text-sm text-cyan-400 hover:text-cyan-300 flex items-center gap-1"
          >
            Voir détails <ChevronRight className="w-4 h-4" />
          </button>
        </div>
        
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {aiModels.map((model) => (
            <div 
              key={model.name}
              onClick={() => setActiveView('citations')}
              className="bg-[#070b14] rounded-xl p-4 border border-[#1a2332] hover:border-cyan-500/30 transition-colors cursor-pointer"
            >
              <div className="flex items-center gap-2 mb-3">
                <model.icon className="w-5 h-5" style={{ color: model.color }} />
                <span className="text-sm text-gray-400">{model.name}</span>
              </div>
              <div className="flex items-end justify-between">
                <span className="text-2xl font-bold text-white">{model.value}%</span>
                <span className={`text-xs flex items-center gap-1 ${model.trend.startsWith('+') ? 'text-emerald-400' : 'text-red-400'}`}>
                  {model.trend.startsWith('+') ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                  {model.trend}
                </span>
              </div>
              <div className="mt-3 h-1.5 bg-[#1a2332] rounded-full overflow-hidden">
                <div 
                  className="h-full rounded-full transition-all duration-1000"
                  style={{ width: `${model.value}%`, backgroundColor: model.color }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Audits récents */}
      <div className="bg-[#0d1321] rounded-2xl p-6 border border-[#1a2332]">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-white font-semibold flex items-center gap-2">
            <Clock className="w-5 h-5 text-cyan-400" />
            Audits Récents
          </h3>
          <button 
            onClick={() => setActiveView('audit')}
            className="text-sm text-cyan-400 hover:text-cyan-300 flex items-center gap-1"
          >
            Nouvel audit <Plus className="w-4 h-4" />
          </button>
        </div>

        {recentAudits.length > 0 ? (
          <div className="space-y-3">
            {recentAudits.map((audit, index) => (
              <div 
                key={audit.id || index}
                onClick={() => navigate('/audit/results', { state: { results: audit } })}
                className="flex items-center justify-between p-4 bg-[#070b14] rounded-xl border border-[#1a2332] hover:border-cyan-500/30 transition-colors cursor-pointer"
              >
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-lg bg-[#1a2332] flex items-center justify-center">
                    <Globe className="w-5 h-5 text-gray-400" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-white truncate max-w-[200px]">
                      {audit.url || audit.site_url || 'Site analysé'}
                    </p>
                    <p className="text-xs text-gray-500">
                      {new Date(audit.created_at).toLocaleDateString('fr-FR')}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <span className={`text-lg font-bold ${
                    (audit.overall_score || 0) >= 70 ? 'text-emerald-400' :
                    (audit.overall_score || 0) >= 50 ? 'text-yellow-400' : 'text-red-400'
                  }`}>
                    {audit.overall_score || 0}
                  </span>
                  <ExternalLink className="w-4 h-4 text-gray-500" />
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8">
            <Search className="w-12 h-12 text-gray-600 mx-auto mb-3" />
            <p className="text-gray-400">Aucun audit réalisé</p>
            <Button 
              onClick={() => setActiveView('audit')}
              className="mt-4 bg-cyan-500 hover:bg-cyan-600"
            >
              <Plus className="w-4 h-4 mr-2" />
              Lancer un audit
            </Button>
          </div>
        )}
      </div>
    </div>
  );

  const renderAuditView = () => (
    <div className="max-w-2xl mx-auto">
      <div className="bg-[#0d1321] rounded-2xl p-8 border border-[#1a2332]">
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-gradient-to-br from-cyan-500 to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <Search className="h-8 w-8 text-white" />
          </div>
          <h2 className="text-2xl font-bold text-white mb-2">
            Audit SEO + <span className="text-cyan-400">AEO</span>
          </h2>
          <p className="text-gray-400">
            Analysez votre visibilité sur Google et les IA génératives
          </p>
        </div>

        <div className="space-y-6">
          <div>
            <label className="text-sm font-medium text-gray-300 mb-2 block">
              URL du site web à analyser
            </label>
            <div className="relative">
              <Globe className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-500" />
              <Input
                type="text"
                placeholder="https://example.com"
                value={auditUrl}
                onChange={(e) => setAuditUrl(e.target.value)}
                className="pl-10 bg-[#070b14] border-[#1a2332] text-white h-12"
              />
            </div>
          </div>

          <Button 
            onClick={startAudit}
            disabled={isAuditing}
            className="w-full h-12 bg-gradient-to-r from-cyan-500 to-purple-600 hover:from-cyan-600 hover:to-purple-700"
          >
            {isAuditing ? (
              <>
                <RefreshCw className="w-5 h-5 mr-2 animate-spin" />
                Analyse en cours... {auditProgress}%
              </>
            ) : (
              <>
                <Play className="w-5 h-5 mr-2" />
                Lancer l'audit
              </>
            )}
          </Button>
        </div>

        <div className="mt-8 pt-6 border-t border-[#1a2332]">
          <p className="text-sm text-gray-400 mb-4">Modèles IA analysés :</p>
          <div className="grid grid-cols-4 gap-3">
            {aiModels.map((model) => (
              <div key={model.name} className="flex flex-col items-center p-3 bg-[#070b14] rounded-lg">
                <model.icon className="w-6 h-6 mb-2" style={{ color: model.color }} />
                <span className="text-xs text-gray-400">{model.name}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );

  const renderCitationsView = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-white">Citations IA</h2>
          <p className="text-sm text-gray-400">Suivez vos mentions dans les réponses des IA</p>
        </div>
        <Button className="bg-cyan-500 hover:bg-cyan-600">
          <RefreshCw className="w-4 h-4 mr-2" />
          Scanner maintenant
        </Button>
      </div>

      <div className="grid grid-cols-4 gap-4">
        <div className="bg-[#0d1321] rounded-xl p-4 border border-[#1a2332]">
          <Mic className="w-5 h-5 text-cyan-400 mb-2" />
          <p className="text-2xl font-bold text-white">47</p>
          <p className="text-xs text-gray-500">Total citations</p>
        </div>
        <div className="bg-[#0d1321] rounded-xl p-4 border border-[#1a2332]">
          <ThumbsUp className="w-5 h-5 text-emerald-400 mb-2" />
          <p className="text-2xl font-bold text-white">32</p>
          <p className="text-xs text-gray-500">Positives</p>
        </div>
        <div className="bg-[#0d1321] rounded-xl p-4 border border-[#1a2332]">
          <ThumbsDown className="w-5 h-5 text-red-400 mb-2" />
          <p className="text-2xl font-bold text-white">5</p>
          <p className="text-xs text-gray-500">Négatives</p>
        </div>
        <div className="bg-[#0d1321] rounded-xl p-4 border border-[#1a2332]">
          <Target className="w-5 h-5 text-purple-400 mb-2" />
          <p className="text-2xl font-bold text-white">3.2</p>
          <p className="text-xs text-gray-500">Position moy.</p>
        </div>
      </div>

      <div className="bg-[#0d1321] rounded-2xl p-6 border border-[#1a2332]">
        <h3 className="text-white font-semibold mb-4">Dernières citations détectées</h3>
        <div className="space-y-3">
          {[
            { model: 'ChatGPT', query: 'Meilleur outil SEO en France', sentiment: 'positive', date: 'Il y a 2h' },
            { model: 'Gemini', query: 'Comment optimiser son site pour les IA', sentiment: 'positive', date: 'Il y a 5h' },
            { model: 'Claude', query: 'Audit SEO gratuit', sentiment: 'neutral', date: 'Hier' },
            { model: 'Perplexity', query: 'Outils AEO recommandés', sentiment: 'positive', date: 'Hier' },
          ].map((citation, i) => (
            <div key={i} className="flex items-center justify-between p-4 bg-[#070b14] rounded-xl border border-[#1a2332]">
              <div className="flex items-center gap-4">
                <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                  citation.model === 'ChatGPT' ? 'bg-emerald-500/20' :
                  citation.model === 'Gemini' ? 'bg-blue-500/20' :
                  citation.model === 'Claude' ? 'bg-orange-500/20' : 'bg-purple-500/20'
                }`}>
                  <Bot className={`w-5 h-5 ${
                    citation.model === 'ChatGPT' ? 'text-emerald-400' :
                    citation.model === 'Gemini' ? 'text-blue-400' :
                    citation.model === 'Claude' ? 'text-orange-400' : 'text-purple-400'
                  }`} />
                </div>
                <div>
                  <p className="text-sm font-medium text-white">{citation.query}</p>
                  <p className="text-xs text-gray-500">{citation.model} • {citation.date}</p>
                </div>
              </div>
              <span className={`px-2 py-1 rounded text-xs ${
                citation.sentiment === 'positive' ? 'bg-emerald-500/20 text-emerald-400' :
                citation.sentiment === 'negative' ? 'bg-red-500/20 text-red-400' : 'bg-gray-500/20 text-gray-400'
              }`}>
                {citation.sentiment}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  const renderPerceptionView = () => (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-white">Perception IA</h2>
        <p className="text-sm text-gray-400">Découvrez comment les IA perçoivent votre marque</p>
      </div>

      <div className="grid grid-cols-2 gap-6">
        {aiModels.map((model) => (
          <div key={model.name} className="bg-[#0d1321] rounded-2xl p-6 border border-[#1a2332]">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 rounded-xl flex items-center justify-center" style={{ backgroundColor: `${model.color}20` }}>
                <model.icon className="w-6 h-6" style={{ color: model.color }} />
              </div>
              <div>
                <h3 className="text-white font-semibold">{model.name}</h3>
                <p className="text-xs text-gray-500">Score de perception</p>
              </div>
            </div>
            <div className="flex items-end justify-between mb-4">
              <span className="text-4xl font-bold text-white">{model.value}%</span>
              <span className={`text-sm ${model.trend.startsWith('+') ? 'text-emerald-400' : 'text-red-400'}`}>
                {model.trend}
              </span>
            </div>
            <div className="h-2 bg-[#1a2332] rounded-full overflow-hidden">
              <div className="h-full rounded-full" style={{ width: `${model.value}%`, backgroundColor: model.color }} />
            </div>
            <Button variant="outline" className="w-full mt-4 border-[#1a2332] text-gray-400 hover:text-white hover:border-cyan-500/50">
              Tester maintenant
            </Button>
          </div>
        ))}
      </div>
    </div>
  );

  const renderCompetitorsView = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-white">Analyse Concurrentielle</h2>
          <p className="text-sm text-gray-400">Comparez votre visibilité IA avec vos concurrents</p>
        </div>
        <Button className="bg-cyan-500 hover:bg-cyan-600">
          <Plus className="w-4 h-4 mr-2" />
          Ajouter un concurrent
        </Button>
      </div>

      <div className="bg-[#0d1321] rounded-2xl p-6 border border-[#1a2332]">
        <h3 className="text-white font-semibold mb-4">Classement par visibilité IA</h3>
        <div className="space-y-4">
          {[
            { name: 'Votre site', score: 72, isYou: true },
            { name: 'concurrent1.com', score: 68, isYou: false },
            { name: 'concurrent2.com', score: 54, isYou: false },
            { name: 'concurrent3.com', score: 45, isYou: false },
          ].map((competitor, i) => (
            <div key={i} className={`flex items-center gap-4 p-4 rounded-xl ${competitor.isYou ? 'bg-cyan-500/10 border border-cyan-500/30' : 'bg-[#070b14] border border-[#1a2332]'}`}>
              <span className="text-lg font-bold text-gray-500 w-6">#{i + 1}</span>
              <div className="flex-1">
                <p className={`font-medium ${competitor.isYou ? 'text-cyan-400' : 'text-white'}`}>
                  {competitor.name} {competitor.isYou && '(vous)'}
                </p>
                <div className="h-2 bg-[#1a2332] rounded-full mt-2 overflow-hidden">
                  <div className="h-full rounded-full" style={{ width: `${competitor.score}%`, backgroundColor: competitor.isYou ? '#22d3ee' : '#6b7280' }} />
                </div>
              </div>
              <span className={`text-xl font-bold ${competitor.isYou ? 'text-cyan-400' : 'text-white'}`}>{competitor.score}%</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  const renderContentView = () => (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-white">Générateur de Contenu IA</h2>
        <p className="text-sm text-gray-400">Créez du contenu optimisé pour être cité par les IA</p>
      </div>

      <div className="bg-[#0d1321] rounded-2xl p-6 border border-[#1a2332]">
        <div className="space-y-4">
          <div>
            <label className="text-sm text-gray-400 mb-2 block">Sujet du contenu</label>
            <Input placeholder="Ex: Les meilleures pratiques SEO en 2024" className="bg-[#070b14] border-[#1a2332] text-white" />
          </div>
          <div>
            <label className="text-sm text-gray-400 mb-2 block">Mots-clés cibles</label>
            <Input placeholder="Ex: SEO, AEO, visibilité IA" className="bg-[#070b14] border-[#1a2332] text-white" />
          </div>
          <Button className="w-full bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700">
            <Sparkles className="w-4 h-4 mr-2" />
            Générer le contenu
          </Button>
        </div>
      </div>
    </div>
  );

  const renderReportsView = () => {
    const [isGenerating, setIsGenerating] = useState(false);
    const [reports, setReports] = useState<any[]>([]);
    const [selectedReport, setSelectedReport] = useState<any>(null);

    const generateReport = async () => {
      setIsGenerating(true);
      try {
        const { data, error } = await supabase.functions.invoke('generate-weekly-report', {
          body: { 
            user_id: user?.id,
            user_email: user?.email,
            force_generate: true,
            send_email: notifications.weeklyReport
          }
        });
        
        if (error) throw error;
        
        toast({ 
          title: "Rapport généré", 
          description: notifications.weeklyReport ? "Le rapport a été envoyé par email" : "Rapport disponible"
        });
        
        if (data?.report) {
          setReports(prev => [data.report, ...prev]);
          setSelectedReport(data.report);
        }
      } catch (err: any) {
        toast({ title: "Erreur", description: err.message, variant: "destructive" });
      } finally {
        setIsGenerating(false);
      }
    };

    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-white">Rapports Hebdomadaires</h2>
            <p className="text-sm text-gray-400">Votre visibilité, livrée chaque semaine</p>
          </div>
          <div className="flex gap-3">
            <Button 
              onClick={generateReport}
              disabled={isGenerating}
              className="bg-gradient-to-r from-cyan-500 to-purple-600 hover:from-cyan-600 hover:to-purple-700"
            >
              {isGenerating ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Génération...
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4 mr-2" />
                  Générer maintenant
                </>
              )}
            </Button>
            <Button variant="outline" className="border-[#1a2332] text-gray-400 hover:text-white">
              <Download className="w-4 h-4 mr-2" />
              Télécharger
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-4">
          {[
            { date: '9-15 Déc 2024', score: 72, trend: '+5%' },
            { date: '2-8 Déc 2024', score: 68, trend: '+3%' },
            { date: '25 Nov - 1 Déc 2024', score: 65, trend: '-2%' },
          ].map((report, i) => (
            <div key={i} className="bg-[#0d1321] rounded-xl p-4 border border-[#1a2332] hover:border-cyan-500/30 cursor-pointer transition-colors">
              <div className="flex items-center justify-between mb-3">
                <Calendar className="w-5 h-5 text-indigo-400" />
                <span className={`text-xs ${report.trend.startsWith('+') ? 'text-emerald-400' : 'text-red-400'}`}>{report.trend}</span>
              </div>
              <p className="text-sm text-white font-medium">{report.date}</p>
              <p className="text-2xl font-bold text-white mt-2">{report.score}</p>
              <p className="text-xs text-gray-500">Score global</p>
            </div>
          ))}
        </div>

        {notifications.weeklyReport && (
          <div className="bg-emerald-500/10 border border-emerald-500/30 rounded-xl p-4 flex items-center gap-3">
            <Bell className="w-5 h-5 text-emerald-400" />
            <p className="text-sm text-emerald-400">
              Les rapports hebdomadaires sont envoyés automatiquement à <span className="font-medium">{user?.email}</span>
            </p>
          </div>
        )}
      </div>
    );
  };


  const renderSettingsPanel = () => (
    <div className={`fixed right-0 top-0 h-screen w-96 bg-[#0a0f1a] border-l border-[#1a2332] transform transition-transform duration-300 z-50 ${showSettings ? 'translate-x-0' : 'translate-x-full'}`}>
      <div className="p-6 h-full overflow-y-auto">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-bold text-white">Paramètres</h2>
          <button onClick={() => setShowSettings(false)} className="text-gray-400 hover:text-white">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex gap-2 mb-6">
          {[
            { id: 'profile' as SettingsTab, label: 'Profil', icon: User },
            { id: 'notifications' as SettingsTab, label: 'Notifs', icon: Bell },
            { id: 'security' as SettingsTab, label: 'Sécurité', icon: Shield },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setSettingsTab(tab.id)}
              className={`flex-1 py-2 px-3 rounded-lg text-xs font-medium transition-colors ${
                settingsTab === tab.id ? 'bg-cyan-500/20 text-cyan-400' : 'text-gray-400 hover:text-white hover:bg-[#1a2332]'
              }`}
            >
              <tab.icon className="w-4 h-4 mx-auto mb-1" />
              {tab.label}
            </button>
          ))}
        </div>

        {settingsTab === 'profile' && (
          <div className="space-y-4">
            <div>
              <label className="text-xs text-gray-400 mb-1 block">Nom complet</label>
              <Input value={profile.fullName} onChange={(e) => setProfile(p => ({ ...p, fullName: e.target.value }))} className="bg-[#070b14] border-[#1a2332] text-white" />
            </div>
            <div>
              <label className="text-xs text-gray-400 mb-1 block">Entreprise</label>
              <Input value={profile.company} onChange={(e) => setProfile(p => ({ ...p, company: e.target.value }))} className="bg-[#070b14] border-[#1a2332] text-white" />
            </div>
            <div>
              <label className="text-xs text-gray-400 mb-1 block">Site web</label>
              <Input value={profile.website} onChange={(e) => setProfile(p => ({ ...p, website: e.target.value }))} className="bg-[#070b14] border-[#1a2332] text-white" />
            </div>
            <Button onClick={saveProfile} disabled={loading} className="w-full bg-cyan-500 hover:bg-cyan-600">
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4 mr-2" />}
              Enregistrer
            </Button>
          </div>
        )}

        {settingsTab === 'notifications' && (
          <div className="space-y-4">
            {[
              { key: 'emailNotifications', label: 'Notifications email' },
              { key: 'pushNotifications', label: 'Notifications push' },
              { key: 'weeklyReport', label: 'Rapport hebdomadaire' },
              { key: 'scoreChanges', label: 'Alertes de score' },
            ].map((item) => (
              <div key={item.key} className="flex items-center justify-between p-3 bg-[#070b14] rounded-lg">
                <span className="text-sm text-white">{item.label}</span>
                <Switch checked={notifications[item.key as keyof typeof notifications]} onCheckedChange={(checked) => setNotifications(n => ({ ...n, [item.key]: checked }))} />
              </div>
            ))}
          </div>
        )}

        {settingsTab === 'security' && (
          <div className="space-y-4">
            <div className="p-4 bg-[#070b14] rounded-lg">
              <div className="flex items-center gap-3 mb-3">
                <Lock className="w-5 h-5 text-cyan-400" />
                <span className="text-white font-medium">Mot de passe</span>
              </div>
              <Button variant="outline" className="w-full border-[#1a2332] text-gray-400">Modifier le mot de passe</Button>
            </div>
            <div className="p-4 bg-[#070b14] rounded-lg">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Shield className="w-5 h-5 text-purple-400" />
                  <span className="text-white font-medium">2FA</span>
                </div>
                <Switch />
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );

  const renderCurrentView = () => {
    switch (activeView) {
      case 'dashboard': return renderDashboardView();
      case 'audit': return renderAuditView();
      case 'citations': return renderCitationsView();
      case 'perception': return renderPerceptionView();
      case 'competitors': return renderCompetitorsView();
      case 'content': return renderContentView();
      case 'reports': return renderReportsView();
      default: return renderDashboardView();
    }
  };

  return (
    <div className="min-h-screen bg-[#070b14] flex">
      {/* Sidebar */}
      <div className="fixed left-0 top-0 h-screen w-64 bg-[#0a0f1a] border-r border-[#1a2332] flex flex-col z-50">
        {/* Logo */}
        <div className="p-6 border-b border-[#1a2332]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-400 to-cyan-600 flex items-center justify-center">
              <Zap className="w-6 h-6 text-white" />
            </div>
            <div>
              <span className="text-xl font-bold text-white">SEAS</span>
              <p className="text-xs text-gray-500">AI Visibility Platform</p>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
          {menuItems.map((item) => {
            const isActive = activeView === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveView(item.id)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all relative ${
                  isActive ? 'bg-cyan-500/20 text-cyan-400' : 'text-gray-400 hover:text-white hover:bg-[#1a2332]'
                }`}
              >
                {isActive && <div className="absolute left-0 w-1 h-8 bg-cyan-400 rounded-r-full" />}
                <item.icon className="w-5 h-5" />
                <span className="font-medium">{item.label}</span>
              </button>
            );
          })}
        </nav>

        {/* User Profile with Dropdown Menu */}
        <div className="p-4 border-t border-[#1a2332] relative" ref={profileMenuRef}>
          {/* Profile Menu Dropdown - Appears above the profile */}
          {showProfileMenu && (
            <div className="absolute bottom-full left-4 right-4 mb-2 bg-[#0d1321] border border-[#1a2332] rounded-xl shadow-xl overflow-hidden animate-in slide-in-from-bottom-2 duration-200">
              <button 
                onClick={() => {
                  setShowProfileMenu(false);
                  setShowSettings(true);
                }}
                className="w-full flex items-center gap-3 px-4 py-3 text-gray-400 hover:text-white hover:bg-[#1a2332] transition-colors"
              >
                <Settings className="w-5 h-5" />
                <span className="font-medium">Paramètres</span>
              </button>
              <button 
                onClick={() => {
                  setShowProfileMenu(false);
                  window.open('/help', '_blank');
                }}
                className="w-full flex items-center gap-3 px-4 py-3 text-gray-400 hover:text-white hover:bg-[#1a2332] transition-colors"
              >
                <HelpCircle className="w-5 h-5" />
                <span className="font-medium">Aide</span>
              </button>
              <div className="border-t border-[#1a2332]">
                <button 
                  onClick={handleSignOut}
                  className="w-full flex items-center gap-3 px-4 py-3 text-red-400 hover:text-red-300 hover:bg-red-500/10 transition-colors"
                >
                  <LogOut className="w-5 h-5" />
                  <span className="font-medium">Déconnexion</span>
                </button>
              </div>
            </div>
          )}

          {/* Clickable Profile Card */}
          <button 
            onClick={() => setShowProfileMenu(!showProfileMenu)}
            className="w-full flex items-center gap-3 p-3 bg-[#070b14] rounded-xl hover:bg-[#0d1321] transition-colors group"
          >
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-cyan-500 to-purple-600 flex items-center justify-center text-white font-bold flex-shrink-0">
              {user?.email?.charAt(0).toUpperCase() || 'U'}
            </div>
            <div className="flex-1 min-w-0 text-left">
              <p className="text-sm font-medium text-white truncate">{profile.fullName || user?.email?.split('@')[0] || 'Utilisateur'}</p>
              <p className="text-xs text-gray-500 truncate">{user?.email}</p>
            </div>
            <ChevronUp className={`w-4 h-4 text-gray-500 transition-transform duration-200 ${showProfileMenu ? 'rotate-180' : ''}`} />
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 ml-64">
        {/* Header */}
        <header className="sticky top-0 z-40 bg-[#070b14]/80 backdrop-blur-xl border-b border-[#1a2332]">
          <div className="flex items-center justify-between px-6 py-4">
            <div>
              <h1 className="text-xl font-bold text-white">{menuItems.find(m => m.id === activeView)?.label || 'Dashboard'}</h1>
              <p className="text-sm text-gray-500">{new Date().toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' })}</p>
            </div>
            <div className="flex items-center gap-3">
              <button className="relative p-2 rounded-lg bg-[#0d1321] border border-[#1a2332] text-gray-400 hover:text-white transition-colors">
                <Bell className="w-5 h-5" />
                <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full" />
              </button>
              <Button onClick={() => setActiveView('audit')} className="bg-gradient-to-r from-cyan-500 to-cyan-600 hover:from-cyan-600 hover:to-cyan-700">
                <Plus className="w-4 h-4 mr-2" />
                Nouvel Audit
              </Button>
            </div>
          </div>
        </header>

        {/* Content */}
        <main className="p-6">{renderCurrentView()}</main>
      </div>

      {/* Settings Panel */}
      {renderSettingsPanel()}
      
      {/* Overlay */}
      {showSettings && <div className="fixed inset-0 bg-black/50 z-40" onClick={() => setShowSettings(false)} />}
    </div>
  );
}
