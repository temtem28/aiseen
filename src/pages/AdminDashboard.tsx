import { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import {
  Users, Shield, BarChart3, CreditCard, Search, X,
  ChevronDown, RefreshCw, LogOut, Eye, Pencil, Check,
  TrendingUp, Globe, Calendar, Zap, AlertTriangle,
  ArrowUpRight, Download, Filter, ChevronRight,
} from 'lucide-react';

/* ─── Types ────────────────────────────────────────────────────── */
type Plan = 'free' | 'starter' | 'decouverte' | 'agence_revendeur' | 'croissance' | 'entreprise';

interface UserProfile {
  id: string;
  email: string;
  full_name?: string;
  company?: string;
  website?: string;
  plan: Plan;
  credits_remaining: number;
  created_at: string;
  updated_at: string;
  is_admin?: boolean;
  audits_count?: number;
  last_audit?: string;
}

interface AuditRow {
  id: string;
  website_url: string;
  overall_score: number;
  seo_score: number;
  aeo_score: number;
  created_at: string;
}

/* ─── Helpers ──────────────────────────────────────────────────── */
const PLAN_LABELS: Record<Plan, string> = {
  free: 'Free',
  starter: 'Starter',
  decouverte: 'Découverte',
  agence_revendeur: 'Agence Revendeur',
  croissance: 'Croissance',
  entreprise: 'Entreprise',
};

const PLAN_COLORS: Record<Plan, string> = {
  free: 'bg-gray-700 text-gray-300',
  starter: 'bg-cyan-900/60 text-cyan-300',
  decouverte: 'bg-indigo-900/60 text-indigo-300',
  agence_revendeur: 'bg-emerald-900/60 text-emerald-300',
  croissance: 'bg-amber-900/60 text-amber-300',
  entreprise: 'bg-purple-900/60 text-purple-300',
};

const fmt = (d: string) =>
  new Date(d).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric' });

const initials = (email: string, name?: string) => {
  if (name) return name.split(' ').map((p) => p[0]).join('').toUpperCase().slice(0, 2);
  return email.slice(0, 2).toUpperCase();
};

const avatarColor = (id: string) => {
  const colors = [
    '#6366F1', '#F59E0B', '#34D399', '#06B6D4',
    '#EC4899', '#8B5CF6', '#10B981', '#F97316',
  ];
  let hash = 0;
  for (const c of id) hash = (hash << 5) - hash + c.charCodeAt(0);
  return colors[Math.abs(hash) % colors.length];
};

/* ─── Stat card ─────────────────────────────────────────────────── */
const StatCard = ({
  icon: Icon, label, value, sub, color,
}: {
  icon: React.ElementType; label: string; value: string | number; sub?: string; color: string;
}) => (
  <div className="rounded-xl p-5 flex items-center gap-4" style={{ background: '#13132A', border: '1px solid #1E2038' }}>
    <div className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: `${color}22` }}>
      <Icon className="w-6 h-6" style={{ color }} />
    </div>
    <div>
      <p className="text-2xl font-bold text-white">{value}</p>
      <p className="text-xs text-gray-400">{label}</p>
      {sub && <p className="text-xs mt-0.5" style={{ color }}>{sub}</p>}
    </div>
  </div>
);

/* ─── Plan badge ────────────────────────────────────────────────── */
const PlanBadge = ({ plan }: { plan: Plan }) => (
  <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${PLAN_COLORS[plan]}`}>
    {PLAN_LABELS[plan]}
  </span>
);

/* ─── User Detail Modal ─────────────────────────────────────────── */
const UserModal = ({
  user: u, onClose, onUpdate,
}: {
  user: UserProfile;
  onClose: () => void;
  onUpdate: (id: string, patch: Partial<UserProfile>) => void;
}) => {
  const [audits, setAudits] = useState<AuditRow[]>([]);
  const [loadingAudits, setLoadingAudits] = useState(true);
  const [editPlan, setEditPlan] = useState(false);
  const [editCredits, setEditCredits] = useState(false);
  const [newPlan, setNewPlan] = useState<Plan>(u.plan);
  const [newCredits, setNewCredits] = useState(u.credits_remaining);
  const { toast } = useToast();

  useEffect(() => {
    supabase
      .from('audits')
      .select('id, website_url, overall_score, seo_score, aeo_score, created_at')
      .eq('user_id', u.id)
      .order('created_at', { ascending: false })
      .limit(10)
      .then(({ data }) => { setAudits(data || []); setLoadingAudits(false); });
  }, [u.id]);

  const savePlan = async () => {
    const { error } = await supabase.from('profiles').update({ plan: newPlan }).eq('id', u.id);
    if (error) { toast({ title: 'Erreur', description: error.message, variant: 'destructive' }); return; }
    onUpdate(u.id, { plan: newPlan });
    setEditPlan(false);
    toast({ title: 'Plan mis à jour', description: `${u.email} → ${PLAN_LABELS[newPlan]}` });
  };

  const saveCredits = async () => {
    const { error } = await supabase.from('profiles').update({ credits_remaining: newCredits }).eq('id', u.id);
    if (error) { toast({ title: 'Erreur', description: error.message, variant: 'destructive' }); return; }
    onUpdate(u.id, { credits_remaining: newCredits });
    setEditCredits(false);
    toast({ title: 'Crédits mis à jour' });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(4px)' }}>
      <div className="w-full max-w-2xl rounded-2xl overflow-hidden shadow-2xl" style={{ background: '#0F0F1A', border: '1px solid #1E2038' }}>

        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4" style={{ background: '#13132A', borderBottom: '1px solid #1E2038' }}>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold text-white"
              style={{ background: avatarColor(u.id) }}>
              {initials(u.email, u.full_name)}
            </div>
            <div>
              <p className="text-white font-semibold text-sm">{u.full_name || u.email}</p>
              <p className="text-gray-400 text-xs">{u.email}</p>
            </div>
          </div>
          <button onClick={onClose} className="text-gray-500 hover:text-white transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-5 max-h-[80vh] overflow-y-auto">

          {/* Info cards */}
          <div className="grid grid-cols-2 gap-3">
            {/* Plan */}
            <div className="rounded-xl p-4" style={{ background: '#13132A', border: '1px solid #1E2038' }}>
              <p className="text-[10px] text-gray-500 uppercase tracking-wider mb-2">Plan</p>
              {editPlan ? (
                <div className="flex items-center gap-2">
                  <select
                    value={newPlan}
                    onChange={(e) => setNewPlan(e.target.value as Plan)}
                    className="flex-1 bg-gray-800 border border-gray-700 text-white text-xs rounded-lg px-2 py-1.5"
                  >
                    {(Object.keys(PLAN_LABELS) as Plan[]).map((p) => (
                      <option key={p} value={p}>{PLAN_LABELS[p]}</option>
                    ))}
                  </select>
                  <button onClick={savePlan} className="p-1.5 rounded-lg text-green-400 hover:bg-green-400/10">
                    <Check className="w-4 h-4" />
                  </button>
                  <button onClick={() => setEditPlan(false)} className="p-1.5 rounded-lg text-gray-500 hover:bg-gray-700">
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <div className="flex items-center justify-between">
                  <PlanBadge plan={u.plan} />
                  <button onClick={() => setEditPlan(true)} className="text-gray-500 hover:text-indigo-400 transition-colors">
                    <Pencil className="w-3.5 h-3.5" />
                  </button>
                </div>
              )}
            </div>

            {/* Credits */}
            <div className="rounded-xl p-4" style={{ background: '#13132A', border: '1px solid #1E2038' }}>
              <p className="text-[10px] text-gray-500 uppercase tracking-wider mb-2">Crédits</p>
              {editCredits ? (
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    value={newCredits}
                    onChange={(e) => setNewCredits(Number(e.target.value))}
                    min={0}
                    className="flex-1 bg-gray-800 border border-gray-700 text-white text-xs rounded-lg px-2 py-1.5 w-16"
                  />
                  <button onClick={saveCredits} className="p-1.5 rounded-lg text-green-400 hover:bg-green-400/10">
                    <Check className="w-4 h-4" />
                  </button>
                  <button onClick={() => setEditCredits(false)} className="p-1.5 rounded-lg text-gray-500 hover:bg-gray-700">
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <div className="flex items-center justify-between">
                  <span className="text-lg font-bold text-amber-400">{u.credits_remaining}</span>
                  <button onClick={() => setEditCredits(true)} className="text-gray-500 hover:text-amber-400 transition-colors">
                    <Pencil className="w-3.5 h-3.5" />
                  </button>
                </div>
              )}
            </div>

            {/* Company */}
            {u.company && (
              <div className="rounded-xl p-4" style={{ background: '#13132A', border: '1px solid #1E2038' }}>
                <p className="text-[10px] text-gray-500 uppercase tracking-wider mb-1">Entreprise</p>
                <p className="text-sm text-white">{u.company}</p>
              </div>
            )}

            {/* Website */}
            {u.website && (
              <div className="rounded-xl p-4" style={{ background: '#13132A', border: '1px solid #1E2038' }}>
                <p className="text-[10px] text-gray-500 uppercase tracking-wider mb-1">Site web</p>
                <a href={u.website} target="_blank" rel="noopener noreferrer"
                  className="text-sm text-cyan-400 hover:underline flex items-center gap-1">
                  {u.website.replace(/^https?:\/\//, '')}
                  <ArrowUpRight className="w-3 h-3" />
                </a>
              </div>
            )}

            <div className="rounded-xl p-4" style={{ background: '#13132A', border: '1px solid #1E2038' }}>
              <p className="text-[10px] text-gray-500 uppercase tracking-wider mb-1">Inscrit le</p>
              <p className="text-sm text-white">{fmt(u.created_at)}</p>
            </div>

            <div className="rounded-xl p-4" style={{ background: '#13132A', border: '1px solid #1E2038' }}>
              <p className="text-[10px] text-gray-500 uppercase tracking-wider mb-1">Audits réalisés</p>
              <p className="text-sm text-white font-bold">{u.audits_count ?? 0}</p>
            </div>
          </div>

          {/* Audit history */}
          <div>
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">
              Historique des audits
            </p>
            {loadingAudits ? (
              <div className="flex justify-center py-6">
                <RefreshCw className="w-5 h-5 text-gray-500 animate-spin" />
              </div>
            ) : audits.length === 0 ? (
              <div className="text-center py-6 text-gray-600 text-sm">Aucun audit effectué</div>
            ) : (
              <div className="space-y-2">
                {audits.map((a) => (
                  <div key={a.id} className="flex items-center justify-between rounded-lg px-4 py-3"
                    style={{ background: '#13132A', border: '1px solid #1E2038' }}>
                    <div>
                      <p className="text-sm text-white font-medium truncate max-w-[260px]">
                        {a.website_url}
                      </p>
                      <p className="text-[11px] text-gray-500 mt-0.5">{fmt(a.created_at)}</p>
                    </div>
                    <div className="flex items-center gap-3 text-xs">
                      <span className="text-indigo-400 font-semibold">SEO {a.seo_score}</span>
                      <span className="text-amber-400 font-semibold">AEO {a.aeo_score}</span>
                      <span className="text-white font-bold">{a.overall_score}/100</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

/* ─── Main AdminDashboard ───────────────────────────────────────── */
export default function AdminDashboard() {
  const { signOut } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  const [users, setUsers] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [planFilter, setPlanFilter] = useState<Plan | 'all'>('all');
  const [selectedUser, setSelectedUser] = useState<UserProfile | null>(null);
  const [totalAudits, setTotalAudits] = useState(0);
  const [refreshing, setRefreshing] = useState(false);

  /* Load all profiles + audit counts */
  const load = async () => {
    setRefreshing(true);
    try {
      // Fetch all profiles
      const { data: profiles, error } = await supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        toast({ title: 'Erreur de chargement', description: error.message, variant: 'destructive' });
        return;
      }

      // Fetch audit counts per user
      const { data: auditCounts } = await supabase
        .from('audits')
        .select('user_id, id, created_at');

      const countMap: Record<string, number> = {};
      const lastMap: Record<string, string> = {};
      let total = 0;

      (auditCounts || []).forEach((a) => {
        countMap[a.user_id] = (countMap[a.user_id] || 0) + 1;
        if (!lastMap[a.user_id] || a.created_at > lastMap[a.user_id]) {
          lastMap[a.user_id] = a.created_at;
        }
        total++;
      });

      setTotalAudits(total);
      setUsers(
        (profiles || []).map((p: any) => ({
          ...p,
          audits_count: countMap[p.id] || 0,
          last_audit: lastMap[p.id],
        }))
      );
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => { load(); }, []);

  /* Derived stats */
  const planBreakdown = users.reduce<Record<string, number>>((acc, u) => {
    acc[u.plan] = (acc[u.plan] || 0) + 1;
    return acc;
  }, {});

  const paidUsers = users.filter((u) => u.plan !== 'free').length;

  /* Filtered list */
  const filtered = users.filter((u) => {
    const q = search.toLowerCase();
    const matchSearch =
      !q ||
      u.email.toLowerCase().includes(q) ||
      (u.full_name || '').toLowerCase().includes(q) ||
      (u.company || '').toLowerCase().includes(q);
    const matchPlan = planFilter === 'all' || u.plan === planFilter;
    return matchSearch && matchPlan;
  });

  /* Update local state after edit */
  const handleUpdate = (id: string, patch: Partial<UserProfile>) => {
    setUsers((prev) => prev.map((u) => (u.id === id ? { ...u, ...patch } : u)));
    if (selectedUser?.id === id) setSelectedUser((prev) => prev ? { ...prev, ...patch } : null);
  };

  /* Export CSV */
  const exportCSV = () => {
    const rows = [
      ['Email', 'Nom', 'Entreprise', 'Plan', 'Crédits', 'Audits', 'Inscrit le'].join(','),
      ...filtered.map((u) =>
        [u.email, u.full_name || '', u.company || '', u.plan, u.credits_remaining, u.audits_count, fmt(u.created_at)].join(',')
      ),
    ].join('\n');
    const blob = new Blob([rows], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = 'zineris-users.csv'; a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="min-h-screen" style={{ background: '#0A0A16' }}>

      {/* ── Top bar ─────────────────────────────────────────────── */}
      <div className="flex items-center justify-between px-6 py-4 sticky top-0 z-10"
        style={{ background: '#0F0F1A', borderBottom: '1px solid #1E2038' }}>
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: '#6366F122' }}>
            <Shield className="w-4 h-4 text-indigo-400" />
          </div>
          <div>
            <span className="font-extrabold tracking-widest text-sm" style={{ color: '#6366F1' }}>ZINERIS</span>
            <span className="text-gray-500 text-xs ml-2">/ Admin</span>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={load}
            disabled={refreshing}
            className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs text-gray-400 hover:text-white hover:bg-white/5 transition-all"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? 'animate-spin' : ''}`} />
            Actualiser
          </button>
          <button
            onClick={() => navigate('/dashboard')}
            className="px-3 py-1.5 rounded-lg text-xs text-gray-400 hover:text-white hover:bg-white/5 transition-all"
          >
            ← Dashboard
          </button>
          <button
            onClick={signOut}
            className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs text-red-400 hover:text-red-300 hover:bg-red-400/10 transition-all"
          >
            <LogOut className="w-3.5 h-3.5" />
            Déconnexion
          </button>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8 space-y-8">

        {/* ── Stats ───────────────────────────────────────────────── */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <StatCard icon={Users} label="Utilisateurs total" value={users.length} color="#6366F1" />
          <StatCard icon={CreditCard} label="Comptes payants" value={paidUsers}
            sub={users.length ? `${Math.round((paidUsers / users.length) * 100)}% du total` : undefined}
            color="#F59E0B" />
          <StatCard icon={BarChart3} label="Audits réalisés" value={totalAudits} color="#34D399" />
          <StatCard icon={Zap} label="Plan le plus populaire"
            value={Object.entries(planBreakdown).sort((a, b) => b[1] - a[1])[0]?.[0] || '—'}
            color="#06B6D4" />
        </div>

        {/* ── Plan repartition ─────────────────────────────────────── */}
        <div className="rounded-xl p-5" style={{ background: '#13132A', border: '1px solid #1E2038' }}>
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-4">Répartition par plan</p>
          <div className="flex flex-wrap gap-3">
            {(Object.keys(PLAN_LABELS) as Plan[]).map((p) => (
              <div key={p} className="flex items-center gap-2">
                <PlanBadge plan={p} />
                <span className="text-white font-bold text-sm">{planBreakdown[p] || 0}</span>
                <span className="text-gray-500 text-xs">
                  {users.length ? `(${Math.round(((planBreakdown[p] || 0) / users.length) * 100)}%)` : ''}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* ── Filters + Search ─────────────────────────────────────── */}
        <div className="flex flex-col sm:flex-row gap-3">
          {/* Search */}
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
            <input
              type="text"
              placeholder="Rechercher par email, nom, entreprise…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-gray-800/60 border border-gray-700 text-white text-sm rounded-xl pl-9 pr-4 py-2.5 placeholder:text-gray-500 focus:outline-none focus:border-indigo-500 transition-colors"
            />
            {search && (
              <button onClick={() => setSearch('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-white">
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Plan filter */}
          <div className="relative">
            <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500 pointer-events-none" />
            <select
              value={planFilter}
              onChange={(e) => setPlanFilter(e.target.value as Plan | 'all')}
              className="bg-gray-800/60 border border-gray-700 text-white text-sm rounded-xl pl-9 pr-8 py-2.5 appearance-none focus:outline-none focus:border-indigo-500 cursor-pointer"
            >
              <option value="all">Tous les plans</option>
              {(Object.keys(PLAN_LABELS) as Plan[]).map((p) => (
                <option key={p} value={p}>{PLAN_LABELS[p]}</option>
              ))}
            </select>
          </div>

          {/* Export */}
          <button
            onClick={exportCSV}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium text-gray-300 hover:text-white transition-all"
            style={{ background: '#13132A', border: '1px solid #1E2038' }}
          >
            <Download className="w-4 h-4" />
            Exporter CSV
          </button>
        </div>

        {/* ── Users table ──────────────────────────────────────────── */}
        <div className="rounded-xl overflow-hidden" style={{ border: '1px solid #1E2038' }}>
          {/* Table header */}
          <div className="grid grid-cols-12 px-4 py-3 text-[11px] font-semibold text-gray-500 uppercase tracking-wider"
            style={{ background: '#13132A', borderBottom: '1px solid #1E2038' }}>
            <div className="col-span-4">Utilisateur</div>
            <div className="col-span-2">Plan</div>
            <div className="col-span-1 text-center">Crédits</div>
            <div className="col-span-2 text-center">Audits</div>
            <div className="col-span-2">Inscrit le</div>
            <div className="col-span-1"></div>
          </div>

          {/* Rows */}
          {loading ? (
            <div className="flex items-center justify-center py-16" style={{ background: '#0F0F1A' }}>
              <RefreshCw className="w-6 h-6 text-indigo-400 animate-spin" />
            </div>
          ) : filtered.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 gap-3" style={{ background: '#0F0F1A' }}>
              <AlertTriangle className="w-8 h-8 text-gray-600" />
              <p className="text-gray-500 text-sm">Aucun utilisateur trouvé</p>
            </div>
          ) : (
            filtered.map((u, idx) => (
              <div
                key={u.id}
                className="grid grid-cols-12 px-4 py-3.5 items-center hover:bg-white/3 transition-colors cursor-pointer group"
                style={{
                  background: idx % 2 === 0 ? '#0F0F1A' : '#0D0D18',
                  borderBottom: idx < filtered.length - 1 ? '1px solid #1E2038' : 'none',
                }}
                onClick={() => setSelectedUser(u)}
              >
                {/* Avatar + email */}
                <div className="col-span-4 flex items-center gap-3">
                  <div
                    className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold text-white flex-shrink-0"
                    style={{ background: avatarColor(u.id) }}
                  >
                    {initials(u.email, u.full_name)}
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm text-white font-medium truncate">
                      {u.full_name || <span className="text-gray-400">{u.email}</span>}
                    </p>
                    {u.full_name && (
                      <p className="text-xs text-gray-500 truncate">{u.email}</p>
                    )}
                    {u.company && (
                      <p className="text-xs text-gray-600 truncate">{u.company}</p>
                    )}
                  </div>
                  {u.is_admin && (
                    <Shield className="w-3.5 h-3.5 text-indigo-400 flex-shrink-0" title="Admin" />
                  )}
                </div>

                {/* Plan */}
                <div className="col-span-2">
                  <PlanBadge plan={u.plan as Plan} />
                </div>

                {/* Credits */}
                <div className="col-span-1 text-center">
                  <span className={`text-sm font-bold ${u.credits_remaining === 0 ? 'text-red-400' : 'text-amber-400'}`}>
                    {u.credits_remaining}
                  </span>
                </div>

                {/* Audits */}
                <div className="col-span-2 text-center">
                  <span className="text-sm text-gray-300">{u.audits_count}</span>
                  {u.last_audit && (
                    <p className="text-[10px] text-gray-600">{fmt(u.last_audit)}</p>
                  )}
                </div>

                {/* Inscrit */}
                <div className="col-span-2">
                  <span className="text-xs text-gray-400">{fmt(u.created_at)}</span>
                </div>

                {/* Action */}
                <div className="col-span-1 flex justify-end">
                  <ChevronRight className="w-4 h-4 text-gray-600 group-hover:text-indigo-400 transition-colors" />
                </div>
              </div>
            ))
          )}
        </div>

        {/* Count */}
        {!loading && (
          <p className="text-xs text-gray-600 text-center">
            {filtered.length} utilisateur{filtered.length !== 1 ? 's' : ''} affiché{filtered.length !== 1 ? 's' : ''}
            {planFilter !== 'all' || search ? ` (filtre actif)` : ''}
          </p>
        )}
      </div>

      {/* ── User modal ───────────────────────────────────────────── */}
      {selectedUser && (
        <UserModal
          user={selectedUser}
          onClose={() => setSelectedUser(null)}
          onUpdate={handleUpdate}
        />
      )}
    </div>
  );
}
