import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/lib/supabase';
import {
  User, Bell, Shield, CreditCard, AlertTriangle,
  Camera, Mail, Smartphone, Clock, Globe, Bot,
  Lock, Key, Eye, EyeOff, Check, X, Loader2,
  ChevronRight, Settings as SettingsIcon, LogOut,
  LayoutDashboard, Search, BarChart3, Users, FileText,
  HelpCircle, Zap, Crown, Download, Trash2, Save
} from 'lucide-react';

interface SidebarItem {
  icon: React.ElementType;
  label: string;
  path: string;
}

interface UserProfile {
  fullName: string;
  email: string;
  company: string;
  website: string;
  phone: string;
  avatarUrl: string;
}

interface NotificationSettings {
  emailNotifications: boolean;
  pushNotifications: boolean;
  weeklyReport: boolean;
  monthlyReport: boolean;
  newCitations: boolean;
  scoreChanges: boolean;
  competitorAlerts: boolean;
  frequency: string;
}

interface AlertSettings {
  scoreDropAlert: boolean;
  scoreDropThreshold: number;
  newCitationAlert: boolean;
  competitorMentionAlert: boolean;
  aiVisibilityAlert: boolean;
  aiVisibilityThreshold: number;
  customKeywords: string[];
}

interface SecuritySettings {
  twoFactorEnabled: boolean;
  sessionTimeout: string;
  loginNotifications: boolean;
}

export default function Settings() {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState('profile');
  const [loading, setLoading] = useState(false);
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [activeSidebarItem, setActiveSidebarItem] = useState('/settings');

  // Profile state
  const [profile, setProfile] = useState<UserProfile>({
    fullName: '',
    email: user?.email || '',
    company: '',
    website: '',
    phone: '',
    avatarUrl: ''
  });

  // Notification settings state
  const [notifications, setNotifications] = useState<NotificationSettings>({
    emailNotifications: true,
    pushNotifications: false,
    weeklyReport: true,
    monthlyReport: true,
    newCitations: true,
    scoreChanges: true,
    competitorAlerts: false,
    frequency: 'daily'
  });

  // Alert settings state
  const [alerts, setAlerts] = useState<AlertSettings>({
    scoreDropAlert: true,
    scoreDropThreshold: 10,
    newCitationAlert: true,
    competitorMentionAlert: false,
    aiVisibilityAlert: true,
    aiVisibilityThreshold: 20,
    customKeywords: []
  });

  // Security state
  const [security, setSecurity] = useState<SecuritySettings>({
    twoFactorEnabled: false,
    sessionTimeout: '24h',
    loginNotifications: true
  });

  // Password change state
  const [passwords, setPasswords] = useState({
    current: '',
    new: '',
    confirm: ''
  });

  // New keyword input
  const [newKeyword, setNewKeyword] = useState('');

  // Sidebar menu items
  const menuItems: SidebarItem[] = [
    { icon: LayoutDashboard, label: 'Dashboard', path: '/dashboard' },
    { icon: Search, label: 'Audit', path: '/audit' },
    { icon: BarChart3, label: 'Historique', path: '/audit/history' },
    { icon: Bot, label: 'Citations IA', path: '/ai-citations' },
    { icon: Users, label: 'Concurrents', path: '/competitive-analysis' },
    { icon: FileText, label: 'Rapports', path: '/weekly-reports' },
  ];

  const bottomItems: SidebarItem[] = [
    { icon: SettingsIcon, label: 'Paramètres', path: '/settings' },
    { icon: HelpCircle, label: 'Aide', path: '/help' },
  ];

  useEffect(() => {
    loadUserProfile();
  }, [user]);

  const loadUserProfile = async () => {
    if (!user) return;
    
    try {
      const { data } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      if (data) {
        setProfile({
          fullName: data.full_name || '',
          email: user.email || '',
          company: data.company || '',
          website: data.website || '',
          phone: data.phone || '',
          avatarUrl: data.avatar_url || ''
        });

        if (data.notification_settings) {
          setNotifications(prev => ({ ...prev, ...data.notification_settings }));
        }
        if (data.alert_settings) {
          setAlerts(prev => ({ ...prev, ...data.alert_settings }));
        }
        if (data.security_settings) {
          setSecurity(prev => ({ ...prev, ...data.security_settings }));
        }
      }
    } catch (error) {
      console.error('Error loading profile:', error);
    }
  };

  const handleSidebarClick = (path: string) => {
    setActiveSidebarItem(path);
    navigate(path);
  };

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };

  const saveProfile = async () => {
    if (!user) return;
    setLoading(true);

    try {
      const { error } = await supabase
        .from('profiles')
        .upsert({
          id: user.id,
          full_name: profile.fullName,
          company: profile.company,
          website: profile.website,
          phone: profile.phone,
          avatar_url: profile.avatarUrl,
          updated_at: new Date().toISOString()
        });

      if (error) throw error;

      toast({
        title: "Profil mis à jour",
        description: "Vos informations ont été enregistrées avec succès.",
      });
    } catch (error: any) {
      toast({
        title: "Erreur",
        description: error.message || "Une erreur est survenue.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const saveNotifications = async () => {
    if (!user) return;
    setLoading(true);

    try {
      const { error } = await supabase
        .from('profiles')
        .upsert({
          id: user.id,
          notification_settings: notifications,
          updated_at: new Date().toISOString()
        });

      if (error) throw error;

      toast({
        title: "Préférences enregistrées",
        description: "Vos préférences de notification ont été mises à jour.",
      });
    } catch (error: any) {
      toast({
        title: "Erreur",
        description: error.message || "Une erreur est survenue.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const saveAlerts = async () => {
    if (!user) return;
    setLoading(true);

    try {
      const { error } = await supabase
        .from('profiles')
        .upsert({
          id: user.id,
          alert_settings: alerts,
          updated_at: new Date().toISOString()
        });

      if (error) throw error;

      toast({
        title: "Alertes configurées",
        description: "Vos paramètres d'alerte ont été enregistrés.",
      });
    } catch (error: any) {
      toast({
        title: "Erreur",
        description: error.message || "Une erreur est survenue.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const changePassword = async () => {
    if (passwords.new !== passwords.confirm) {
      toast({
        title: "Erreur",
        description: "Les mots de passe ne correspondent pas.",
        variant: "destructive"
      });
      return;
    }

    if (passwords.new.length < 8) {
      toast({
        title: "Erreur",
        description: "Le mot de passe doit contenir au moins 8 caractères.",
        variant: "destructive"
      });
      return;
    }

    setLoading(true);

    try {
      const { error } = await supabase.auth.updateUser({
        password: passwords.new
      });

      if (error) throw error;

      toast({
        title: "Mot de passe modifié",
        description: "Votre mot de passe a été mis à jour avec succès.",
      });

      setPasswords({ current: '', new: '', confirm: '' });
    } catch (error: any) {
      toast({
        title: "Erreur",
        description: error.message || "Une erreur est survenue.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const addKeyword = () => {
    if (newKeyword.trim() && !alerts.customKeywords.includes(newKeyword.trim())) {
      setAlerts(prev => ({
        ...prev,
        customKeywords: [...prev.customKeywords, newKeyword.trim()]
      }));
      setNewKeyword('');
    }
  };

  const removeKeyword = (keyword: string) => {
    setAlerts(prev => ({
      ...prev,
      customKeywords: prev.customKeywords.filter(k => k !== keyword)
    }));
  };

  const toggle2FA = async () => {
    setLoading(true);
    // Simulate 2FA setup
    setTimeout(() => {
      setSecurity(prev => ({ ...prev, twoFactorEnabled: !prev.twoFactorEnabled }));
      toast({
        title: security.twoFactorEnabled ? "2FA désactivé" : "2FA activé",
        description: security.twoFactorEnabled 
          ? "L'authentification à deux facteurs a été désactivée."
          : "L'authentification à deux facteurs est maintenant active.",
      });
      setLoading(false);
    }, 1000);
  };

  // Subscription data (mock)
  const subscription = {
    plan: 'Pro',
    status: 'active',
    nextBilling: '15 janvier 2025',
    amount: '49€/mois',
    auditsUsed: 45,
    auditsLimit: 100,
    features: ['Audits illimités', 'Citations IA', 'Rapports hebdomadaires', 'Support prioritaire']
  };

  return (
    <div className="min-h-screen bg-[#070b14] flex">
      {/* Sidebar */}
      <div className="fixed left-0 top-0 h-screen w-16 bg-[#0a0f1a] border-r border-[#1a2332] flex flex-col items-center py-4 z-50">
        {/* Logo */}
        <div className="mb-8">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-400 to-cyan-600 flex items-center justify-center">
            <svg viewBox="0 0 24 24" className="w-6 h-6 text-white" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="10" />
              <path d="M12 6v6l4 2" />
            </svg>
          </div>
        </div>

        {/* Main Menu */}
        <nav className="flex-1 flex flex-col items-center gap-2">
          {menuItems.map((item) => {
            const isActive = activeSidebarItem === item.path;
            return (
              <button
                key={item.path}
                onClick={() => handleSidebarClick(item.path)}
                className={`relative w-10 h-10 rounded-xl flex items-center justify-center transition-all duration-200 group ${
                  isActive 
                    ? 'bg-cyan-500/20 text-cyan-400' 
                    : 'text-gray-500 hover:text-cyan-400 hover:bg-[#1a2332]'
                }`}
              >
                {isActive && (
                  <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 bg-cyan-400 rounded-r-full" />
                )}
                <item.icon className="w-5 h-5" />
                
                {/* Tooltip */}
                <div className="absolute left-14 px-2 py-1 bg-[#1a2332] text-white text-xs rounded opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all whitespace-nowrap z-50 border border-[#2a3444]">
                  {item.label}
                </div>
              </button>
            );
          })}
        </nav>

        {/* Bottom Menu */}
        <div className="flex flex-col items-center gap-2 pt-4 border-t border-[#1a2332]">
          {bottomItems.map((item) => {
            const isActive = activeSidebarItem === item.path;
            return (
              <button
                key={item.path}
                onClick={() => handleSidebarClick(item.path)}
                className={`relative w-10 h-10 rounded-xl flex items-center justify-center transition-all duration-200 group ${
                  isActive 
                    ? 'bg-cyan-500/20 text-cyan-400' 
                    : 'text-gray-500 hover:text-cyan-400 hover:bg-[#1a2332]'
                }`}
              >
                {isActive && (
                  <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 bg-cyan-400 rounded-r-full" />
                )}
                <item.icon className="w-5 h-5" />
                
                {/* Tooltip */}
                <div className="absolute left-14 px-2 py-1 bg-[#1a2332] text-white text-xs rounded opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all whitespace-nowrap border border-[#2a3444]">
                  {item.label}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 ml-16">
        {/* Top Navigation */}
        <header className="sticky top-0 z-40 bg-[#070b14]/80 backdrop-blur-xl border-b border-[#1a2332]">
          <div className="flex items-center justify-between px-6 py-4">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-cyan-400 to-cyan-600 flex items-center justify-center">
                  <SettingsIcon className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h1 className="text-xl font-bold text-white">Paramètres</h1>
                  <p className="text-xs text-gray-500">Gérez votre compte et vos préférences</p>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <Button 
                onClick={() => navigate('/dashboard')}
                variant="outline"
                className="bg-transparent border-[#1a2332] text-gray-400 hover:text-white hover:border-cyan-500/50"
              >
                <LayoutDashboard className="w-4 h-4 mr-2" />
                Dashboard
              </Button>
              <Button 
                onClick={handleSignOut}
                variant="outline"
                className="bg-transparent border-red-500/30 text-red-400 hover:bg-red-500/10 hover:border-red-500/50"
              >
                <LogOut className="w-4 h-4 mr-2" />
                Déconnexion
              </Button>
            </div>
          </div>
        </header>

        {/* Settings Content */}
        <main className="p-6 max-w-6xl mx-auto">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
            {/* Tabs Navigation */}
            <TabsList className="bg-[#0d1321] border border-[#1a2332] p-1 rounded-xl grid grid-cols-5 gap-1">
              <TabsTrigger 
                value="profile" 
                className="data-[state=active]:bg-cyan-500/20 data-[state=active]:text-cyan-400 rounded-lg text-gray-400 hover:text-white transition-colors"
              >
                <User className="w-4 h-4 mr-2" />
                Profil
              </TabsTrigger>
              <TabsTrigger 
                value="notifications"
                className="data-[state=active]:bg-cyan-500/20 data-[state=active]:text-cyan-400 rounded-lg text-gray-400 hover:text-white transition-colors"
              >
                <Bell className="w-4 h-4 mr-2" />
                Notifications
              </TabsTrigger>
              <TabsTrigger 
                value="alerts"
                className="data-[state=active]:bg-cyan-500/20 data-[state=active]:text-cyan-400 rounded-lg text-gray-400 hover:text-white transition-colors"
              >
                <AlertTriangle className="w-4 h-4 mr-2" />
                Alertes
              </TabsTrigger>
              <TabsTrigger 
                value="billing"
                className="data-[state=active]:bg-cyan-500/20 data-[state=active]:text-cyan-400 rounded-lg text-gray-400 hover:text-white transition-colors"
              >
                <CreditCard className="w-4 h-4 mr-2" />
                Abonnement
              </TabsTrigger>
              <TabsTrigger 
                value="security"
                className="data-[state=active]:bg-cyan-500/20 data-[state=active]:text-cyan-400 rounded-lg text-gray-400 hover:text-white transition-colors"
              >
                <Shield className="w-4 h-4 mr-2" />
                Sécurité
              </TabsTrigger>
            </TabsList>

            {/* Profile Tab */}
            <TabsContent value="profile" className="space-y-6">
              <div className="bg-[#0d1321] rounded-2xl border border-[#1a2332] p-6">
                <h2 className="text-lg font-semibold text-white mb-6 flex items-center gap-2">
                  <User className="w-5 h-5 text-cyan-400" />
                  Informations du profil
                </h2>

                {/* Avatar Section */}
                <div className="flex items-center gap-6 mb-8 pb-6 border-b border-[#1a2332]">
                  <div className="relative">
                    <div className="w-24 h-24 rounded-2xl bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center text-white text-3xl font-bold overflow-hidden">
                      {profile.avatarUrl ? (
                        <img src={profile.avatarUrl} alt="Avatar" className="w-full h-full object-cover" />
                      ) : (
                        profile.fullName?.charAt(0)?.toUpperCase() || user?.email?.charAt(0)?.toUpperCase() || 'U'
                      )}
                    </div>
                    <button className="absolute -bottom-2 -right-2 w-8 h-8 rounded-lg bg-cyan-500 hover:bg-cyan-600 flex items-center justify-center text-white transition-colors">
                      <Camera className="w-4 h-4" />
                    </button>
                  </div>
                  <div>
                    <h3 className="text-white font-medium">{profile.fullName || 'Utilisateur'}</h3>
                    <p className="text-gray-500 text-sm">{profile.email}</p>
                    <p className="text-xs text-cyan-400 mt-1">Plan Pro actif</p>
                  </div>
                </div>

                {/* Profile Form */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="fullName" className="text-gray-400">Nom complet</Label>
                    <Input
                      id="fullName"
                      value={profile.fullName}
                      onChange={(e) => setProfile(prev => ({ ...prev, fullName: e.target.value }))}
                      className="bg-[#070b14] border-[#1a2332] text-white focus:border-cyan-500/50"
                      placeholder="John Doe"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="email" className="text-gray-400">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      value={profile.email}
                      disabled
                      className="bg-[#070b14] border-[#1a2332] text-gray-500 cursor-not-allowed"
                    />
                    <p className="text-xs text-gray-600">L'email ne peut pas être modifié</p>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="company" className="text-gray-400">Entreprise</Label>
                    <Input
                      id="company"
                      value={profile.company}
                      onChange={(e) => setProfile(prev => ({ ...prev, company: e.target.value }))}
                      className="bg-[#070b14] border-[#1a2332] text-white focus:border-cyan-500/50"
                      placeholder="Nom de l'entreprise"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="website" className="text-gray-400">Site web</Label>
                    <Input
                      id="website"
                      value={profile.website}
                      onChange={(e) => setProfile(prev => ({ ...prev, website: e.target.value }))}
                      className="bg-[#070b14] border-[#1a2332] text-white focus:border-cyan-500/50"
                      placeholder="https://example.com"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="phone" className="text-gray-400">Téléphone</Label>
                    <Input
                      id="phone"
                      value={profile.phone}
                      onChange={(e) => setProfile(prev => ({ ...prev, phone: e.target.value }))}
                      className="bg-[#070b14] border-[#1a2332] text-white focus:border-cyan-500/50"
                      placeholder="+33 6 12 34 56 78"
                    />
                  </div>
                </div>

                <div className="flex justify-end mt-6 pt-6 border-t border-[#1a2332]">
                  <Button 
                    onClick={saveProfile}
                    disabled={loading}
                    className="bg-cyan-500 hover:bg-cyan-600 text-white"
                  >
                    {loading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2" />}
                    Enregistrer les modifications
                  </Button>
                </div>
              </div>
            </TabsContent>

            {/* Notifications Tab */}
            <TabsContent value="notifications" className="space-y-6">
              <div className="bg-[#0d1321] rounded-2xl border border-[#1a2332] p-6">
                <h2 className="text-lg font-semibold text-white mb-6 flex items-center gap-2">
                  <Bell className="w-5 h-5 text-cyan-400" />
                  Préférences de notification
                </h2>

                <div className="space-y-6">
                  {/* Email Notifications */}
                  <div className="flex items-center justify-between p-4 bg-[#070b14] rounded-xl border border-[#1a2332]">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-lg bg-cyan-500/10 flex items-center justify-center">
                        <Mail className="w-5 h-5 text-cyan-400" />
                      </div>
                      <div>
                        <p className="text-white font-medium">Notifications par email</p>
                        <p className="text-sm text-gray-500">Recevez des alertes par email</p>
                      </div>
                    </div>
                    <Switch
                      checked={notifications.emailNotifications}
                      onCheckedChange={(checked) => setNotifications(prev => ({ ...prev, emailNotifications: checked }))}
                    />
                  </div>

                  {/* Push Notifications */}
                  <div className="flex items-center justify-between p-4 bg-[#070b14] rounded-xl border border-[#1a2332]">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-lg bg-purple-500/10 flex items-center justify-center">
                        <Smartphone className="w-5 h-5 text-purple-400" />
                      </div>
                      <div>
                        <p className="text-white font-medium">Notifications push</p>
                        <p className="text-sm text-gray-500">Notifications dans le navigateur</p>
                      </div>
                    </div>
                    <Switch
                      checked={notifications.pushNotifications}
                      onCheckedChange={(checked) => setNotifications(prev => ({ ...prev, pushNotifications: checked }))}
                    />
                  </div>

                  {/* Frequency */}
                  <div className="p-4 bg-[#070b14] rounded-xl border border-[#1a2332]">
                    <div className="flex items-center gap-4 mb-4">
                      <div className="w-10 h-10 rounded-lg bg-blue-500/10 flex items-center justify-center">
                        <Clock className="w-5 h-5 text-blue-400" />
                      </div>
                      <div>
                        <p className="text-white font-medium">Fréquence des notifications</p>
                        <p className="text-sm text-gray-500">Choisissez quand recevoir les résumés</p>
                      </div>
                    </div>
                    <Select
                      value={notifications.frequency}
                      onValueChange={(value) => setNotifications(prev => ({ ...prev, frequency: value }))}
                    >
                      <SelectTrigger className="bg-[#0d1321] border-[#1a2332] text-white">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-[#0d1321] border-[#1a2332]">
                        <SelectItem value="realtime" className="text-white hover:bg-[#1a2332]">Temps réel</SelectItem>
                        <SelectItem value="daily" className="text-white hover:bg-[#1a2332]">Quotidien</SelectItem>
                        <SelectItem value="weekly" className="text-white hover:bg-[#1a2332]">Hebdomadaire</SelectItem>
                        <SelectItem value="monthly" className="text-white hover:bg-[#1a2332]">Mensuel</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Report Types */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="flex items-center justify-between p-4 bg-[#070b14] rounded-xl border border-[#1a2332]">
                      <div>
                        <p className="text-white font-medium">Rapport hebdomadaire</p>
                        <p className="text-sm text-gray-500">Résumé chaque semaine</p>
                      </div>
                      <Switch
                        checked={notifications.weeklyReport}
                        onCheckedChange={(checked) => setNotifications(prev => ({ ...prev, weeklyReport: checked }))}
                      />
                    </div>

                    <div className="flex items-center justify-between p-4 bg-[#070b14] rounded-xl border border-[#1a2332]">
                      <div>
                        <p className="text-white font-medium">Rapport mensuel</p>
                        <p className="text-sm text-gray-500">Analyse complète mensuelle</p>
                      </div>
                      <Switch
                        checked={notifications.monthlyReport}
                        onCheckedChange={(checked) => setNotifications(prev => ({ ...prev, monthlyReport: checked }))}
                      />
                    </div>

                    <div className="flex items-center justify-between p-4 bg-[#070b14] rounded-xl border border-[#1a2332]">
                      <div>
                        <p className="text-white font-medium">Nouvelles citations</p>
                        <p className="text-sm text-gray-500">Alertes citations IA</p>
                      </div>
                      <Switch
                        checked={notifications.newCitations}
                        onCheckedChange={(checked) => setNotifications(prev => ({ ...prev, newCitations: checked }))}
                      />
                    </div>

                    <div className="flex items-center justify-between p-4 bg-[#070b14] rounded-xl border border-[#1a2332]">
                      <div>
                        <p className="text-white font-medium">Changements de score</p>
                        <p className="text-sm text-gray-500">Variations significatives</p>
                      </div>
                      <Switch
                        checked={notifications.scoreChanges}
                        onCheckedChange={(checked) => setNotifications(prev => ({ ...prev, scoreChanges: checked }))}
                      />
                    </div>
                  </div>
                </div>

                <div className="flex justify-end mt-6 pt-6 border-t border-[#1a2332]">
                  <Button 
                    onClick={saveNotifications}
                    disabled={loading}
                    className="bg-cyan-500 hover:bg-cyan-600 text-white"
                  >
                    {loading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2" />}
                    Enregistrer les préférences
                  </Button>
                </div>
              </div>
            </TabsContent>

            {/* Alerts Tab */}
            <TabsContent value="alerts" className="space-y-6">
              <div className="bg-[#0d1321] rounded-2xl border border-[#1a2332] p-6">
                <h2 className="text-lg font-semibold text-white mb-6 flex items-center gap-2">
                  <AlertTriangle className="w-5 h-5 text-cyan-400" />
                  Configuration des alertes de monitoring
                </h2>

                <div className="space-y-6">
                  {/* Score Drop Alert */}
                  <div className="p-4 bg-[#070b14] rounded-xl border border-[#1a2332]">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-lg bg-red-500/10 flex items-center justify-center">
                          <AlertTriangle className="w-5 h-5 text-red-400" />
                        </div>
                        <div>
                          <p className="text-white font-medium">Alerte baisse de score</p>
                          <p className="text-sm text-gray-500">Notification si le score baisse significativement</p>
                        </div>
                      </div>
                      <Switch
                        checked={alerts.scoreDropAlert}
                        onCheckedChange={(checked) => setAlerts(prev => ({ ...prev, scoreDropAlert: checked }))}
                      />
                    </div>
                    {alerts.scoreDropAlert && (
                      <div className="mt-4 pt-4 border-t border-[#1a2332]">
                        <Label className="text-gray-400 mb-2 block">Seuil de déclenchement (%)</Label>
                        <div className="flex items-center gap-4">
                          <Input
                            type="number"
                            value={alerts.scoreDropThreshold}
                            onChange={(e) => setAlerts(prev => ({ ...prev, scoreDropThreshold: parseInt(e.target.value) || 0 }))}
                            className="w-24 bg-[#0d1321] border-[#1a2332] text-white"
                            min={1}
                            max={50}
                          />
                          <span className="text-gray-500 text-sm">Alerte si le score baisse de plus de {alerts.scoreDropThreshold}%</span>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* New Citation Alert */}
                  <div className="flex items-center justify-between p-4 bg-[#070b14] rounded-xl border border-[#1a2332]">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-lg bg-green-500/10 flex items-center justify-center">
                        <Bot className="w-5 h-5 text-green-400" />
                      </div>
                      <div>
                        <p className="text-white font-medium">Nouvelle citation IA</p>
                        <p className="text-sm text-gray-500">Alerte quand une IA mentionne votre marque</p>
                      </div>
                    </div>
                    <Switch
                      checked={alerts.newCitationAlert}
                      onCheckedChange={(checked) => setAlerts(prev => ({ ...prev, newCitationAlert: checked }))}
                    />
                  </div>

                  {/* Competitor Mention Alert */}
                  <div className="flex items-center justify-between p-4 bg-[#070b14] rounded-xl border border-[#1a2332]">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-lg bg-orange-500/10 flex items-center justify-center">
                        <Users className="w-5 h-5 text-orange-400" />
                      </div>
                      <div>
                        <p className="text-white font-medium">Mention de concurrent</p>
                        <p className="text-sm text-gray-500">Alerte quand un concurrent est cité</p>
                      </div>
                    </div>
                    <Switch
                      checked={alerts.competitorMentionAlert}
                      onCheckedChange={(checked) => setAlerts(prev => ({ ...prev, competitorMentionAlert: checked }))}
                    />
                  </div>

                  {/* AI Visibility Alert */}
                  <div className="p-4 bg-[#070b14] rounded-xl border border-[#1a2332]">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-lg bg-purple-500/10 flex items-center justify-center">
                          <Globe className="w-5 h-5 text-purple-400" />
                        </div>
                        <div>
                          <p className="text-white font-medium">Visibilité IA</p>
                          <p className="text-sm text-gray-500">Alerte si la visibilité change</p>
                        </div>
                      </div>
                      <Switch
                        checked={alerts.aiVisibilityAlert}
                        onCheckedChange={(checked) => setAlerts(prev => ({ ...prev, aiVisibilityAlert: checked }))}
                      />
                    </div>
                    {alerts.aiVisibilityAlert && (
                      <div className="mt-4 pt-4 border-t border-[#1a2332]">
                        <Label className="text-gray-400 mb-2 block">Variation minimale (%)</Label>
                        <div className="flex items-center gap-4">
                          <Input
                            type="number"
                            value={alerts.aiVisibilityThreshold}
                            onChange={(e) => setAlerts(prev => ({ ...prev, aiVisibilityThreshold: parseInt(e.target.value) || 0 }))}
                            className="w-24 bg-[#0d1321] border-[#1a2332] text-white"
                            min={5}
                            max={50}
                          />
                          <span className="text-gray-500 text-sm">Alerte si la visibilité varie de plus de {alerts.aiVisibilityThreshold}%</span>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Custom Keywords */}
                  <div className="p-4 bg-[#070b14] rounded-xl border border-[#1a2332]">
                    <div className="flex items-center gap-4 mb-4">
                      <div className="w-10 h-10 rounded-lg bg-cyan-500/10 flex items-center justify-center">
                        <Key className="w-5 h-5 text-cyan-400" />
                      </div>
                      <div>
                        <p className="text-white font-medium">Mots-clés personnalisés</p>
                        <p className="text-sm text-gray-500">Surveillez des termes spécifiques</p>
                      </div>
                    </div>
                    
                    <div className="flex gap-2 mb-4">
                      <Input
                        value={newKeyword}
                        onChange={(e) => setNewKeyword(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && addKeyword()}
                        className="bg-[#0d1321] border-[#1a2332] text-white"
                        placeholder="Ajouter un mot-clé..."
                      />
                      <Button onClick={addKeyword} className="bg-cyan-500 hover:bg-cyan-600">
                        Ajouter
                      </Button>
                    </div>

                    <div className="flex flex-wrap gap-2">
                      {alerts.customKeywords.map((keyword) => (
                        <span 
                          key={keyword}
                          className="px-3 py-1 bg-[#1a2332] text-gray-300 rounded-lg text-sm flex items-center gap-2"
                        >
                          {keyword}
                          <button 
                            onClick={() => removeKeyword(keyword)}
                            className="text-gray-500 hover:text-red-400"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </span>
                      ))}
                      {alerts.customKeywords.length === 0 && (
                        <span className="text-gray-600 text-sm">Aucun mot-clé configuré</span>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex justify-end mt-6 pt-6 border-t border-[#1a2332]">
                  <Button 
                    onClick={saveAlerts}
                    disabled={loading}
                    className="bg-cyan-500 hover:bg-cyan-600 text-white"
                  >
                    {loading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2" />}
                    Enregistrer les alertes
                  </Button>
                </div>
              </div>
            </TabsContent>

            {/* Billing Tab */}
            <TabsContent value="billing" className="space-y-6">
              {/* Current Plan */}
              <div className="bg-[#0d1321] rounded-2xl border border-[#1a2332] p-6">
                <h2 className="text-lg font-semibold text-white mb-6 flex items-center gap-2">
                  <Crown className="w-5 h-5 text-yellow-400" />
                  Votre abonnement
                </h2>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  {/* Plan Info */}
                  <div className="lg:col-span-2 p-6 bg-gradient-to-br from-cyan-500/10 to-blue-500/10 rounded-xl border border-cyan-500/20">
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-2xl font-bold text-white">Plan {subscription.plan}</span>
                          <span className="px-2 py-0.5 bg-green-500/20 text-green-400 text-xs rounded-full">Actif</span>
                        </div>
                        <p className="text-gray-400">{subscription.amount}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm text-gray-500">Prochain paiement</p>
                        <p className="text-white font-medium">{subscription.nextBilling}</p>
                      </div>
                    </div>

                    {/* Usage */}
                    <div className="mt-6">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm text-gray-400">Audits utilisés ce mois</span>
                        <span className="text-white font-medium">{subscription.auditsUsed} / {subscription.auditsLimit}</span>
                      </div>
                      <div className="h-2 bg-[#1a2332] rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-gradient-to-r from-cyan-500 to-blue-500 rounded-full transition-all"
                          style={{ width: `${(subscription.auditsUsed / subscription.auditsLimit) * 100}%` }}
                        />
                      </div>
                    </div>

                    {/* Features */}
                    <div className="mt-6 pt-6 border-t border-[#1a2332]">
                      <p className="text-sm text-gray-400 mb-3">Fonctionnalités incluses</p>
                      <div className="grid grid-cols-2 gap-2">
                        {subscription.features.map((feature) => (
                          <div key={feature} className="flex items-center gap-2 text-sm text-gray-300">
                            <Check className="w-4 h-4 text-green-400" />
                            {feature}
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="space-y-4">
                    <Button 
                      onClick={() => navigate('/pricing')}
                      className="w-full bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600 text-white"
                    >
                      <Zap className="w-4 h-4 mr-2" />
                      Changer de plan
                    </Button>
                    <Button 
                      variant="outline"
                      className="w-full bg-transparent border-[#1a2332] text-gray-400 hover:text-white hover:border-cyan-500/50"
                    >
                      <Download className="w-4 h-4 mr-2" />
                      Télécharger les factures
                    </Button>
                    <Button 
                      variant="outline"
                      className="w-full bg-transparent border-[#1a2332] text-gray-400 hover:text-white hover:border-cyan-500/50"
                    >
                      <CreditCard className="w-4 h-4 mr-2" />
                      Modifier le paiement
                    </Button>
                    <Button 
                      variant="outline"
                      className="w-full bg-transparent border-red-500/30 text-red-400 hover:bg-red-500/10 hover:border-red-500/50"
                    >
                      <X className="w-4 h-4 mr-2" />
                      Annuler l'abonnement
                    </Button>
                  </div>
                </div>
              </div>

              {/* Billing History */}
              <div className="bg-[#0d1321] rounded-2xl border border-[#1a2332] p-6">
                <h2 className="text-lg font-semibold text-white mb-6 flex items-center gap-2">
                  <FileText className="w-5 h-5 text-cyan-400" />
                  Historique de facturation
                </h2>

                <div className="space-y-3">
                  {[
                    { date: '15 décembre 2024', amount: '49€', status: 'Payé', invoice: 'INV-2024-012' },
                    { date: '15 novembre 2024', amount: '49€', status: 'Payé', invoice: 'INV-2024-011' },
                    { date: '15 octobre 2024', amount: '49€', status: 'Payé', invoice: 'INV-2024-010' },
                  ].map((item) => (
                    <div 
                      key={item.invoice}
                      className="flex items-center justify-between p-4 bg-[#070b14] rounded-xl border border-[#1a2332]"
                    >
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-lg bg-[#1a2332] flex items-center justify-center">
                          <FileText className="w-5 h-5 text-gray-400" />
                        </div>
                        <div>
                          <p className="text-white font-medium">{item.invoice}</p>
                          <p className="text-sm text-gray-500">{item.date}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        <span className="text-white font-medium">{item.amount}</span>
                        <span className="px-2 py-0.5 bg-green-500/20 text-green-400 text-xs rounded-full">{item.status}</span>
                        <Button variant="ghost" size="sm" className="text-gray-400 hover:text-white">
                          <Download className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </TabsContent>

            {/* Security Tab */}
            <TabsContent value="security" className="space-y-6">
              {/* Password Change */}
              <div className="bg-[#0d1321] rounded-2xl border border-[#1a2332] p-6">
                <h2 className="text-lg font-semibold text-white mb-6 flex items-center gap-2">
                  <Lock className="w-5 h-5 text-cyan-400" />
                  Changer le mot de passe
                </h2>

                <div className="space-y-4 max-w-md">
                  <div className="space-y-2">
                    <Label htmlFor="currentPassword" className="text-gray-400">Mot de passe actuel</Label>
                    <div className="relative">
                      <Input
                        id="currentPassword"
                        type={showCurrentPassword ? 'text' : 'password'}
                        value={passwords.current}
                        onChange={(e) => setPasswords(prev => ({ ...prev, current: e.target.value }))}
                        className="bg-[#070b14] border-[#1a2332] text-white pr-10"
                      />
                      <button
                        type="button"
                        onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-white"
                      >
                        {showCurrentPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="newPassword" className="text-gray-400">Nouveau mot de passe</Label>
                    <div className="relative">
                      <Input
                        id="newPassword"
                        type={showNewPassword ? 'text' : 'password'}
                        value={passwords.new}
                        onChange={(e) => setPasswords(prev => ({ ...prev, new: e.target.value }))}
                        className="bg-[#070b14] border-[#1a2332] text-white pr-10"
                      />
                      <button
                        type="button"
                        onClick={() => setShowNewPassword(!showNewPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-white"
                      >
                        {showNewPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="confirmPassword" className="text-gray-400">Confirmer le mot de passe</Label>
                    <Input
                      id="confirmPassword"
                      type="password"
                      value={passwords.confirm}
                      onChange={(e) => setPasswords(prev => ({ ...prev, confirm: e.target.value }))}
                      className="bg-[#070b14] border-[#1a2332] text-white"
                    />
                  </div>

                  <Button 
                    onClick={changePassword}
                    disabled={loading || !passwords.current || !passwords.new || !passwords.confirm}
                    className="bg-cyan-500 hover:bg-cyan-600 text-white mt-4"
                  >
                    {loading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Lock className="w-4 h-4 mr-2" />}
                    Modifier le mot de passe
                  </Button>
                </div>
              </div>

              {/* Two-Factor Authentication */}
              <div className="bg-[#0d1321] rounded-2xl border border-[#1a2332] p-6">
                <h2 className="text-lg font-semibold text-white mb-6 flex items-center gap-2">
                  <Shield className="w-5 h-5 text-cyan-400" />
                  Authentification à deux facteurs (2FA)
                </h2>

                <div className="flex items-center justify-between p-4 bg-[#070b14] rounded-xl border border-[#1a2332]">
                  <div className="flex items-center gap-4">
                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                      security.twoFactorEnabled ? 'bg-green-500/20' : 'bg-gray-500/20'
                    }`}>
                      <Shield className={`w-6 h-6 ${security.twoFactorEnabled ? 'text-green-400' : 'text-gray-400'}`} />
                    </div>
                    <div>
                      <p className="text-white font-medium">
                        {security.twoFactorEnabled ? '2FA activé' : '2FA désactivé'}
                      </p>
                      <p className="text-sm text-gray-500">
                        {security.twoFactorEnabled 
                          ? 'Votre compte est protégé par l\'authentification à deux facteurs'
                          : 'Ajoutez une couche de sécurité supplémentaire à votre compte'
                        }
                      </p>
                    </div>
                  </div>
                  <Button 
                    onClick={toggle2FA}
                    disabled={loading}
                    variant={security.twoFactorEnabled ? 'outline' : 'default'}
                    className={security.twoFactorEnabled 
                      ? 'bg-transparent border-red-500/30 text-red-400 hover:bg-red-500/10'
                      : 'bg-cyan-500 hover:bg-cyan-600 text-white'
                    }
                  >
                    {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : security.twoFactorEnabled ? 'Désactiver' : 'Activer'}
                  </Button>
                </div>
              </div>

              {/* Session Settings */}
              <div className="bg-[#0d1321] rounded-2xl border border-[#1a2332] p-6">
                <h2 className="text-lg font-semibold text-white mb-6 flex items-center gap-2">
                  <Clock className="w-5 h-5 text-cyan-400" />
                  Paramètres de session
                </h2>

                <div className="space-y-4">
                  <div className="p-4 bg-[#070b14] rounded-xl border border-[#1a2332]">
                    <div className="flex items-center gap-4 mb-4">
                      <div className="w-10 h-10 rounded-lg bg-blue-500/10 flex items-center justify-center">
                        <Clock className="w-5 h-5 text-blue-400" />
                      </div>
                      <div>
                        <p className="text-white font-medium">Expiration de session</p>
                        <p className="text-sm text-gray-500">Durée avant déconnexion automatique</p>
                      </div>
                    </div>
                    <Select
                      value={security.sessionTimeout}
                      onValueChange={(value) => setSecurity(prev => ({ ...prev, sessionTimeout: value }))}
                    >
                      <SelectTrigger className="bg-[#0d1321] border-[#1a2332] text-white">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-[#0d1321] border-[#1a2332]">
                        <SelectItem value="1h" className="text-white hover:bg-[#1a2332]">1 heure</SelectItem>
                        <SelectItem value="8h" className="text-white hover:bg-[#1a2332]">8 heures</SelectItem>
                        <SelectItem value="24h" className="text-white hover:bg-[#1a2332]">24 heures</SelectItem>
                        <SelectItem value="7d" className="text-white hover:bg-[#1a2332]">7 jours</SelectItem>
                        <SelectItem value="30d" className="text-white hover:bg-[#1a2332]">30 jours</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="flex items-center justify-between p-4 bg-[#070b14] rounded-xl border border-[#1a2332]">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-lg bg-purple-500/10 flex items-center justify-center">
                        <Bell className="w-5 h-5 text-purple-400" />
                      </div>
                      <div>
                        <p className="text-white font-medium">Alertes de connexion</p>
                        <p className="text-sm text-gray-500">Notification lors d'une nouvelle connexion</p>
                      </div>
                    </div>
                    <Switch
                      checked={security.loginNotifications}
                      onCheckedChange={(checked) => setSecurity(prev => ({ ...prev, loginNotifications: checked }))}
                    />
                  </div>
                </div>
              </div>

              {/* Danger Zone */}
              <div className="bg-[#0d1321] rounded-2xl border border-red-500/30 p-6">
                <h2 className="text-lg font-semibold text-red-400 mb-6 flex items-center gap-2">
                  <AlertTriangle className="w-5 h-5" />
                  Zone de danger
                </h2>

                <div className="flex items-center justify-between p-4 bg-red-500/5 rounded-xl border border-red-500/20">
                  <div>
                    <p className="text-white font-medium">Supprimer le compte</p>
                    <p className="text-sm text-gray-500">Cette action est irréversible. Toutes vos données seront supprimées.</p>
                  </div>
                  <Button 
                    variant="outline"
                    className="bg-transparent border-red-500 text-red-400 hover:bg-red-500/10"
                  >
                    <Trash2 className="w-4 h-4 mr-2" />
                    Supprimer
                  </Button>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </main>

        {/* Footer */}
        <footer className="px-6 py-4 border-t border-[#1a2332]">
          <div className="flex items-center justify-between text-xs text-gray-500">
            <div className="flex items-center gap-4">
              <span>© 2024 SEAS - Ai Seen</span>
              <span className="flex items-center gap-1">
                <Globe className="w-3 h-3" /> Hébergé en Europe
              </span>
            </div>
            <div className="flex items-center gap-4">
              <button onClick={() => navigate('/pricing')} className="hover:text-gray-300">Tarifs</button>
              <button onClick={() => navigate('/blog')} className="hover:text-gray-300">Blog</button>
              <button className="hover:text-gray-300">Support</button>
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
}
