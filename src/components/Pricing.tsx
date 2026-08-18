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
    {
      id: 'starter',
      name: 'Starter',
      tagline: 'Pour tester, mesurer, avancer.',
      price: '19 €',
      period: 'mois',
      target: 'Entrepreneur · Freelance',
      sites: '1 site',
      keywords: '100 topics / entités IA suivis',
      aiQueries: '15 requêtes IA/mois',
      features: [
        'AI Visibility Checker (ChatGPT, Gemini, Claude, Perplexity)',
        'Audit SEO & AEO complet',
        'Rapport mensuel automatisé',
        'Historique des audits',
        'Support par e-mail',
      ],
      cta: 'Commencer pour 19€/mois',
      popular: false,
    },
    {
      id: 'decouverte',
      name: 'Découverte',
      tagline: 'Soyez visible avant vos concurrents.',
      price: '49 €',
      period: 'mois',
      target: 'Indépendants · TPE',
      sites: '1 site',
      keywords: '300 topics / entités IA suivis',
      aiQueries: '30 requêtes IA/mois',
      features: [
        'Tout le plan Starter',
        'Accès complet aux 7 fonctionnalités',
        'Citations IA — surveillance & alertes',
        'Weekly Report automatisé',
        'Analyse de perception IA',
        'Support e-mail prioritaire',
      ],
      cta: 'Choisir Découverte',
      popular: false,
    },
    {
      id: 'croissance',
      name: 'Croissance',
      tagline: 'La suite complète pour les agences qui reportent la visibilité IA.',
      price: '279 €',
      period: 'mois',
      target: 'Agences · PME multi-sites',
      sites: '10 sites',
      keywords: '1 200 topics / entités IA suivis',
      aiQueries: '250 requêtes IA/mois',
      features: [
        'Tout le plan Découverte',
        'Comparaison concurrentielle multi-domaines',
        'Content Optimizer — 25 contenus/mois',
        'Audit AEO approfondi offert',
        'Intégrations Analytics & Slack',
        'Support dédié + onboarding',
      ],
      cta: 'Choisir Croissance',
      popular: true,
    },
  ];

  const handleSubscribe = async (planId: string) => {
    if (!user) {
      toast({ title: 'Connexion requise', description: 'Connectez-vous pour vous abonner.', variant: 'destructive' });
      navigate('/login');
      return;
    }

    setLoadingPlan(planId);
    try {
      const { data, error } = await supabase.functions.invoke('create-checkout-session', {
        body: { planId, userId: user.id, userEmail: user.email, successUrl: `${window.location.origin}/dashboard?success=true`, cancelUrl: `${window.location.origin}/pricing?canceled=true` }
      });
      if (error) throw error;
      if (data.checkoutUrl) window.location.href = data.checkoutUrl;
      else if (data.mockCheckoutUrl) toast({ title: 'Mode démo', description: 'Configurez STRIPE_SECRET_KEY pour activer les paiements.' });
    } catch (err: any) {
      toast({ title: 'Erreur', description: err.message, variant: 'destructive' });
    } finally {
      setLoadingPlan(null);
    }
  };

  return (
    <section id="pricing" className="py-20 bg-gray-950">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">Visibilité IA + SEO · Nos Prix</h2>
          <p className="text-xl text-gray-400">Des tarifs adaptés à chaque étape de votre croissance</p>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          {plans.map((plan) => (
            <div
              key={plan.id}
              className={`relative bg-gray-900 rounded-2xl p-6 border-2 flex flex-col ${
                plan.popular ? 'border-cyan-500 shadow-lg shadow-cyan-500/20' : 'border-gray-800'
              } hover:border-cyan-500/50 transition-all`}
            >
              {plan.popular && (
                <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 bg-gradient-to-r from-cyan-500 to-purple-500 text-white px-4 py-1 rounded-full text-sm font-semibold">
                  Le plus populaire
                </div>
              )}

              <div className="mb-6">
                <h3 className="text-2xl font-bold text-white mb-1">{plan.name}</h3>
                <p className="text-cyan-400 text-xs font-medium mb-3 italic">{plan.tagline}</p>
                <p className="text-gray-500 text-xs mb-4">{plan.target}</p>
                <div className="flex items-baseline mb-4">
                  <span className="text-4xl font-bold text-white">{plan.price}</span>
                  <span className="text-gray-400 ml-2 text-sm">/ {plan.period}</span>
                </div>
                <div className="space-y-1 text-sm bg-gray-800/50 rounded-lg p-3">
                  <div className="text-gray-400">{plan.sites}</div>
                  <div className="text-gray-400">{plan.keywords}</div>
                  <div className="text-cyan-400 font-semibold">{plan.aiQueries}</div>
                </div>
              </div>

              <ul className="space-y-2 mb-6 flex-1">
                {plan.features.map((feature, i) => (
                  <li key={i} className="flex items-start text-sm">
                    <Check className="w-4 h-4 text-cyan-400 mr-2 flex-shrink-0 mt-0.5" />
                    <span className="text-gray-300">{feature}</span>
                  </li>
                ))}
              </ul>

              <button
                onClick={() => handleSubscribe(plan.id)}
                disabled={loadingPlan === plan.id}
                className={`w-full py-3 rounded-lg font-semibold transition-all flex items-center justify-center ${
                  plan.popular
                    ? 'bg-gradient-to-r from-cyan-500 to-purple-500 text-white hover:shadow-lg hover:shadow-cyan-500/50'
                    : 'bg-gray-800 text-white hover:bg-gray-700'
                }`}
              >
                {loadingPlan === plan.id ? <Loader2 className="w-5 h-5 animate-spin" /> : plan.cta}
              </button>
            </div>
          ))}
        </div>

        <div className="mt-10 text-center space-y-2 text-sm text-gray-500">
          <p>Facturation annuelle disponible avec remise de 15%</p>
          <p>
            Vous gérez plus de 10 sites ou avez des besoins spécifiques ?{' '}
            <a href="mailto:contact@zineris.com" className="text-cyan-400 hover:text-cyan-300 transition-colors">
              Parlons-en →
            </a>
          </p>
        </div>
      </div>
    </section>
  );
};

export default Pricing;
