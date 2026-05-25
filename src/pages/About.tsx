import React from 'react';
import Navigation from '@/components/Navigation';
import Footer from '@/components/Footer';
import { Eye, Target, Zap, Users, Globe, Shield, TrendingUp, Award } from 'lucide-react';

const About = () => {
  const values = [
    {
      icon: Eye,
      title: "Transparence",
      description: "Nous croyons que chaque entreprise mérite de comprendre exactement comment les IA perçoivent sa marque. Pas de boîte noire — des scores clairs et des recommandations actionnables."
    },
    {
      icon: Target,
      title: "Précision",
      description: "Nos algorithmes analysent en profondeur votre présence en ligne pour vous donner des données fiables, pas des estimations approximatives."
    },
    {
      icon: Zap,
      title: "Innovation",
      description: "Nous sommes à la pointe de l'AEO (Answer Engine Optimization), une discipline née avec l'essor de ChatGPT, Gemini, Claude et Perplexity."
    },
    {
      icon: Globe,
      title: "Accessibilité mondiale",
      description: "Nos outils sont conçus pour toutes les entreprises, indépendamment de leur taille ou localisation. La visibilité IA n'a pas de frontières."
    }
  ];

  const stats = [
    { value: "4", label: "Moteurs IA analysés", sub: "ChatGPT, Gemini, Claude, Perplexity" },
    { value: "7", label: "Fonctionnalités clés", sub: "Audit · Citations · Contenu · Rapports" },
    { value: "100%", label: "Axé résultats", sub: "Recommandations concrètes" },
    { value: "24/7", label: "Analyse en temps réel", sub: "Surveillance continue" },
  ];

  const team = [
    {
      name: "Équipe Produit",
      role: "Développement & Innovation",
      description: "Notre équipe technique développe des algorithmes d'analyse SEO/AEO parmi les plus avancés du marché, en intégrant les dernières avancées en intelligence artificielle."
    },
    {
      name: "Équipe Data",
      role: "Analyse & Insights",
      description: "Des experts en data science qui transforment les données brutes de vos audits en insights stratégiques exploitables pour améliorer votre visibilité."
    },
    {
      name: "Équipe Support",
      role: "Accompagnement client",
      description: "Une équipe dédiée pour vous accompagner dans l'adoption de l'AEO et maximiser le retour sur investissement de votre abonnement Zineris."
    }
  ];

  return (
    <div className="min-h-screen bg-gray-950">
      <Navigation />

      {/* Hero */}
      <section className="py-24 px-4 text-center relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/10 via-purple-500/5 to-transparent pointer-events-none" />
        <div className="max-w-4xl mx-auto relative">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 text-sm font-medium mb-6">
            <Award className="w-4 h-4" />
            Notre mission
          </div>
          <h1 className="text-5xl md:text-6xl font-extrabold text-white mb-6 leading-tight">
            Rendre votre marque<br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-purple-500">
              invisible aux IA, c'est fini.
            </span>
          </h1>
          <p className="text-xl text-gray-400 max-w-2xl mx-auto leading-relaxed">
            Zineris est la plateforme qui analyse, optimise et surveille votre visibilité dans les réponses des intelligences artificielles génératives — ChatGPT, Gemini, Claude, Perplexity — et sur Google.
          </p>
        </div>
      </section>

      {/* Notre histoire */}
      <section className="py-20 px-4 bg-gray-900/50">
        <div className="max-w-6xl mx-auto">
          <div className="grid md:grid-cols-2 gap-16 items-center">
            <div>
              <h2 className="text-3xl font-bold text-white mb-6">Notre histoire</h2>
              <div className="space-y-4 text-gray-400 leading-relaxed">
                <p>
                  Zineris est né d'un constat simple : en 2024, des millions d'entreprises ont vu leur trafic organique chuter sans comprendre pourquoi. La réponse ? Les IA génératives captent désormais entre 30 et 50% des intentions de recherche.
                </p>
                <p>
                  Face à cette révolution, les outils SEO traditionnels ne suffisaient plus. Il fallait une nouvelle approche — l'<strong className="text-cyan-400">AEO (Answer Engine Optimization)</strong> — pour optimiser sa présence non plus uniquement sur Google, mais directement dans les réponses des IA.
                </p>
                <p>
                  Zineris est la réponse à ce besoin : une plateforme tout-en-un qui mesure votre score de visibilité IA, identifie vos points faibles, génère du contenu optimisé et surveille vos citations en temps réel.
                </p>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              {stats.map((stat, i) => (
                <div key={i} className="bg-gray-900 border border-gray-800 rounded-2xl p-6 text-center hover:border-cyan-500/30 transition-colors">
                  <div className="text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-purple-500 mb-1">
                    {stat.value}
                  </div>
                  <div className="text-white font-semibold text-sm mb-1">{stat.label}</div>
                  <div className="text-gray-500 text-xs">{stat.sub}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Nos valeurs */}
      <section className="py-20 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-white mb-4">Ce qui nous guide</h2>
            <p className="text-gray-400 max-w-xl mx-auto">Des principes simples qui guident chaque fonctionnalité, chaque mise à jour, chaque décision produit.</p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {values.map((v, i) => (
              <div key={i} className="bg-gray-900 border border-gray-800 rounded-2xl p-6 hover:border-cyan-500/30 transition-all group">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-cyan-500/20 to-purple-500/20 flex items-center justify-center mb-4 group-hover:from-cyan-500/30 group-hover:to-purple-500/30 transition-all">
                  <v.icon className="w-6 h-6 text-cyan-400" />
                </div>
                <h3 className="text-white font-bold text-lg mb-2">{v.title}</h3>
                <p className="text-gray-400 text-sm leading-relaxed">{v.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Équipes */}
      <section className="py-20 px-4 bg-gray-900/50">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-white mb-4">Une équipe dédiée à votre visibilité</h2>
            <p className="text-gray-400 max-w-xl mx-auto">Des experts en SEO, AEO, data science et IA travaillent chaque jour pour que Zineris vous donne un avantage concurrentiel réel.</p>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            {team.map((member, i) => (
              <div key={i} className="bg-gray-900 border border-gray-800 rounded-2xl p-8 text-center hover:border-cyan-500/30 transition-all">
                <div className="w-16 h-16 rounded-full bg-gradient-to-br from-cyan-500 to-purple-600 flex items-center justify-center mx-auto mb-4">
                  <Users className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-white font-bold text-lg mb-1">{member.name}</h3>
                <p className="text-cyan-400 text-sm font-medium mb-4">{member.role}</p>
                <p className="text-gray-400 text-sm leading-relaxed">{member.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 px-4">
        <div className="max-w-3xl mx-auto text-center">
          <div className="bg-gradient-to-r from-cyan-500/10 to-purple-500/10 border border-cyan-500/20 rounded-3xl p-12">
            <TrendingUp className="w-12 h-12 text-cyan-400 mx-auto mb-6" />
            <h2 className="text-3xl font-bold text-white mb-4">Prêt à dominer les IA ?</h2>
            <p className="text-gray-400 mb-8">Lancez un audit gratuit maintenant et découvrez comment les IA voient votre marque.</p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a href="/audit" className="px-8 py-3 bg-gradient-to-r from-cyan-500 to-purple-500 text-white font-semibold rounded-xl hover:shadow-lg hover:shadow-cyan-500/25 transition-all">
                Lancer mon audit gratuit
              </a>
              <a href="mailto:contact@zineris.com" className="px-8 py-3 border border-gray-700 text-gray-300 font-semibold rounded-xl hover:border-cyan-500/50 hover:text-white transition-all">
                Nous contacter
              </a>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default About;
