import React, { useState } from 'react';
import { Check, Loader2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabase';
import { useToast } from '@/hooks/use-toast';

const Pricing = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();
  const [loadingPlan, setLoadingPlan] = useState<string | null>(null);

  const plans = [
    { id: 'freemium', name: "Freemium", price: "0 €", period: "mois", target: "Découverte rapide", sites: "1 site", keywords: "20 mots-clés", aiQueries: "5 requêtes IA/mois", features: ["Quotas très limités", "AI Visibility Checker", "SEO & AEO Analyzer basique", "Watermark dans exports", "Support communautaire"], cta: "Commencer gratuitement", popular: false },
    { id: 'decouverte', name: "Découverte", price: "49 €", period: "mois", target: "Indépendants · TPE", sites: "1 site", keywords: "300 mots-clés", aiQueries: "30 requêtes IA/mois", features: ["Accès complet aux 7 fonctionnalités", "AI Visibility Checker", "SEO & AEO Analyzer", "Weekly Report automatisé", "Support e-mail"], cta: "S'abonner", popular: false },
    { id: 'croissance', name: "Croissance", price: "249 €", period: "mois", target: "Agences · PME", sites: "10 sites", keywords: "1 200 mots-clés", aiQueries: "150 requêtes IA/mois", features: ["Toutes les 7 fonctionnalités avancées", "Comparaison concurrentielle multi-domaines", "Content Optimizer : 25 contenus/mois", "Audit AEO offert", "Intégrations Analytics & Slack"], cta: "S'abonner", popular: true },
    { id: 'enterprise', name: "Pro-Entreprise", price: "1 199 €", period: "mois", target: "Solutions enterprise", sites: "Jusqu'à 250 sites", keywords: "10 000 mots-clés", aiQueries: "1 000+ requêtes IA/mois", features: ["Dashboards personnalisés", "SLA 99,9%", "Account manager dédié", "Workshops mensuels", "Reporting white-label"], cta: "Contact commercial", popular: false }
  ];

  const handleSubscribe = async (planId: string) => {
    if (planId === 'freemium') { navigate('/signup'); return; }
    if (planId === 'enterprise') { window.location.href = 'mailto:contact@aiseen.com?subject=Demande Enterprise'; return; }
    if (!user) { toast({ title: 'Connexion requise', description: 'Connectez-vous pour vous abonner.', variant: 'destructive' }); navigate('/login'); return; }

    setLoadingPlan(planId);
    try {
      const { data, error } = await supabase.functions.invoke('create-checkout-session', {
        body: { planId, userId: user.id, userEmail: user.email, successUrl: `${window.location.origin}/dashboard?success=true`, cancelUrl: `${window.location.origin}/pricing?canceled=true` }
      });
      if (error) throw error;
      if (data.checkoutUrl) window.location.href = data.checkoutUrl;
      else if (data.mockCheckoutUrl) toast({ title: 'Mode démo', description: 'Configurez STRIPE_SECRET_KEY pour activer les paiements.' });
    } catch (err: any) { toast({ title: 'Erreur', description: err.message, variant: 'destructive' }); }
    finally { setLoadingPlan(null); }
  };

  return (
    <section id="pricing" className="py-20 bg-gray-950">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">Visibilité IA + SEO · Nos Prix</h2>
          <p className="text-xl text-gray-400">Des tarifs adaptés à tous, partout dans le monde</p>
        </div>
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {plans.map((plan) => (
            <div key={plan.id} className={`relative bg-gray-900 rounded-2xl p-6 border-2 ${plan.popular ? 'border-cyan-500 shadow-lg shadow-cyan-500/20' : 'border-gray-800'} hover:border-cyan-500/50 transition-all`}>
              {plan.popular && <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 bg-gradient-to-r from-cyan-500 to-purple-500 text-white px-4 py-1 rounded-full text-sm font-semibold">Le plus populaire</div>}
              <div className="text-center mb-6">
                <h3 className="text-2xl font-bold text-white mb-1">{plan.name}</h3>
                <p className="text-gray-400 text-sm mb-4">{plan.target}</p>
                <div className="flex items-baseline justify-center mb-4"><span className="text-4xl font-bold text-white">{plan.price}</span><span className="text-gray-400 ml-2">/ {plan.period}</span></div>
                <div className="space-y-1 text-sm text-gray-300 mb-4"><div>{plan.sites}</div><div>{plan.keywords}</div><div className="text-cyan-400 font-semibold">{plan.aiQueries}</div></div>
              </div>
              <ul className="space-y-2 mb-6">{plan.features.map((feature, i) => <li key={i} className="flex items-start text-sm"><Check className="w-4 h-4 text-cyan-400 mr-2 flex-shrink-0 mt-0.5" /><span className="text-gray-300">{feature}</span></li>)}</ul>
              <button onClick={() => handleSubscribe(plan.id)} disabled={loadingPlan === plan.id} className={`w-full py-3 rounded-lg font-semibold transition-all flex items-center justify-center ${plan.popular ? 'bg-gradient-to-r from-cyan-500 to-purple-500 text-white hover:shadow-lg hover:shadow-cyan-500/50' : 'bg-gray-800 text-white hover:bg-gray-700'}`}>
                {loadingPlan === plan.id ? <Loader2 className="w-5 h-5 animate-spin" /> : plan.cta}
              </button>
            </div>
          ))}
        </div>
        <div className="mt-12 text-center text-gray-400 text-sm"><p>Dépassement de quotas facturé par packs</p><p className="mt-2">Facturation annuelle disponible avec remise de 15%</p></div>
      </div>
    </section>
  );
};

export default Pricing;
