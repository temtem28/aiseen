import React, { useState } from 'react';
import { Check, Loader2, ArrowLeft, Sparkles, Zap, Crown } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabase';
import { useToast } from '@/hooks/use-toast';
import Navigation from '@/components/Navigation';
import Footer from '@/components/Footer';

const plans = [
  {
    id: 'starter',
    name: 'Starter',
    tagline: 'Pour tester, mesurer, avancer.',
    price: '19 €',
    period: 'mois',
    icon: Sparkles,
    target: 'Entrepreneur · Freelance',
    features: [
      '1 site',
      '100 topics / entités IA suivis',
      '15 requêtes IA/mois',
      'AI Visibility Checker (ChatGPT, Gemini, Claude, Perplexity)',
      'Audit SEO & AEO complet',
      'Support par e-mail',
    ],
    cta: 'Commencer pour 19€/mois',
    popular: false,
    color: 'gray',
  },
  {
    id: 'decouverte',
    name: 'Découverte',
    tagline: 'Soyez visible avant vos concurrents.',
    price: '49 €',
    period: 'mois',
    icon: Zap,
    target: 'Indépendants · TPE',
    features: [
      '1 site',
      '300 topics / entités IA suivis',
      '30 requêtes IA/mois',
      'Accès complet aux 7 fonctionnalités',
      'Citations IA — surveillance & alertes',
      'Weekly Report automatisé',
    ],
    cta: 'Choisir Découverte',
    popular: false,
    color: 'cyan',
  },
  {
    id: 'croissance',
    name: 'Croissance',
    tagline: 'La suite complète pour les agences qui reportent la visibilité IA.',
    price: '279 €',
    period: 'mois',
    icon: Crown,
    target: 'Agences · PME multi-sites',
    features: [
      '10 sites',
      '1 200 topics / entités IA suivis',
      '250 requêtes IA/mois',
      'Comparaison concurrentielle multi-domaines',
      'Content Optimizer — 25 contenus/mois',
      'Intégrations Analytics & Slack',
    ],
    cta: 'Choisir Croissance',
    popular: true,
    color: 'purple',
  },
];

const PricingPage = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();
  const [loadingPlan, setLoadingPlan] = useState<string | null>(null);

  const handleSubscribe = async (planId: string) => {
    if (!user) {
      toast({ title: 'Connexion requise', description: 'Veuillez vous connecter pour vous abonner.', variant: 'destructive' });
      navigate('/login');
      return;
    }

    setLoadingPlan(planId);
    try {
      const { data, error } = await supabase.functions.invoke('create-checkout-session', {
        body: {
          planId,
          userId: user.id,
          userEmail: user.email,
          successUrl: `${window.location.origin}/dashboard?success=true`,
          cancelUrl: `${window.location.origin}/pricing?canceled=true`,
        },
      });

      if (error) throw error;
      if (data.checkoutUrl) {
        window.location.href = data.checkoutUrl;
      } else if (data.mockCheckoutUrl) {
        toast({ title: 'Mode démo', description: 'Stripe non configuré. Configurez STRIPE_SECRET_KEY.' });
      }
    } catch (err: any) {
      toast({ title: 'Erreur', description: err.message, variant: 'destructive' });
    } finally {
      setLoadingPlan(null);
    }
  };

  return (
    <div className="min-h-screen bg-gray-950">
      <Navigation />
      <div className="max-w-5xl mx-auto px-4 py-16">
        <button onClick={() => navigate(-1)} className="flex items-center text-gray-400 hover:text-white mb-8">
          <ArrowLeft className="w-5 h-5 mr-2" /> Retour
        </button>

        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">Choisissez votre plan</h1>
          <p className="text-xl text-gray-400">Boostez votre visibilité IA et SEO</p>
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
                <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-gradient-to-r from-cyan-500 to-purple-500 text-white px-4 py-1 rounded-full text-sm font-semibold">
                  Populaire
                </div>
              )}

              <div className="text-center mb-6">
                <plan.icon className={`w-10 h-10 mx-auto mb-3 ${plan.popular ? 'text-cyan-400' : 'text-gray-400'}`} />
                <h3 className="text-2xl font-bold text-white">{plan.name}</h3>
                <p className="text-cyan-400 text-xs italic mt-1 mb-1">{plan.tagline}</p>
                <p className="text-gray-500 text-xs mb-4">{plan.target}</p>
                <div className="mt-2">
                  <span className="text-4xl font-bold text-white">{plan.price}</span>
                  <span className="text-gray-400 text-sm">/{plan.period}</span>
                </div>
              </div>

              <ul className="space-y-3 mb-6 flex-1">
                {plan.features.map((f, i) => (
                  <li key={i} className="flex items-start text-sm">
                    <Check className="w-4 h-4 text-cyan-400 mr-2 mt-0.5 flex-shrink-0" />
                    <span className="text-gray-300">{f}</span>
                  </li>
                ))}
              </ul>

              <button
                onClick={() => handleSubscribe(plan.id)}
                disabled={loadingPlan === plan.id}
                className={`w-full py-3 rounded-lg font-semibold transition-all flex items-center justify-center ${
                  plan.popular
                    ? 'bg-gradient-to-r from-cyan-500 to-purple-500 text-white hover:shadow-lg'
                    : 'bg-gray-800 text-white hover:bg-gray-700'
                }`}
              >
                {loadingPlan === plan.id ? <Loader2 className="w-5 h-5 animate-spin" /> : plan.cta}
              </button>
            </div>
          ))}
        </div>

        <div className="mt-10 text-center space-y-2 text-sm text-gray-500">
          <p>Facturation annuelle disponible avec -15%</p>
          <p>
            Vous gérez plus de 10 sites ou avez des besoins spécifiques ?{' '}
            <a href="mailto:contact@zineris.com" className="text-cyan-400 hover:text-cyan-300 transition-colors">
              Parlons-en →
            </a>
          </p>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default PricingPage;
