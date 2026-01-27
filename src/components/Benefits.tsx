import React from 'react';
import { FileText, BarChart3, Lightbulb, Users } from 'lucide-react';

const Benefits = () => {
  return (
    <section className="py-20 bg-gray-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Livrables Section */}
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">
            📦 Ce que vous recevez concrètement
          </h2>
          <p className="text-xl text-gray-400 max-w-3xl mx-auto">
            Des livrables clairs et exploitables, sans jargon technique
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8 mb-20">
          <div className="bg-gray-800/50 backdrop-blur-sm p-8 rounded-xl border border-gray-700 hover:border-cyan-500/50 transition-all">
            <FileText className="w-16 h-16 text-cyan-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-white mb-3 text-center">🧾 Un rapport clair et compréhensible</h3>
            <p className="text-gray-400 mb-4 text-center">Pas de jargon technique. Pas besoin de connaissances en IA.</p>
            <ul className="text-gray-300 space-y-2">
              <li>• Votre score SEO</li>
              <li>• Votre score AEO</li>
              <li>• Votre visibilité IA</li>
              <li>• Vos citations</li>
              <li>• Vos concurrents</li>
              <li>• Vos axes d'amélioration</li>
            </ul>
          </div>

          <div className="bg-gray-800/50 backdrop-blur-sm p-8 rounded-xl border border-gray-700 hover:border-purple-500/50 transition-all">
            <BarChart3 className="w-16 h-16 text-purple-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-white mb-3 text-center">📈 Un historique</h3>
            <ul className="text-gray-300 space-y-2">
              <li>• Suivi de votre évolution dans le temps</li>
              <li>• Comparaison avant / après</li>
              <li>• Mesure de vos progrès</li>
            </ul>
          </div>

          <div className="bg-gray-800/50 backdrop-blur-sm p-8 rounded-xl border border-gray-700 hover:border-emerald-500/50 transition-all">
            <Lightbulb className="w-16 h-16 text-emerald-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-white mb-3 text-center">🧠 Des recommandations exploitables</h3>
            <ul className="text-gray-300 space-y-2">
              <li>• Ce qu'il faut améliorer</li>
              <li>• Ce qu'il faut corriger</li>
              <li>• Ce qu'il faut renforcer dans votre contenu</li>
            </ul>
          </div>
        </div>

        {/* Target Audience Section */}
        <div className="bg-gradient-to-r from-cyan-500/10 to-purple-500/10 border border-cyan-500/20 rounded-xl p-8">
          <div className="flex items-center gap-4 mb-6">
            <Users className="w-8 h-8 text-cyan-400" />
            <h3 className="text-2xl font-bold text-white">🧠 À qui s'adresse ce produit ?</h3>
          </div>
          <div className="grid md:grid-cols-3 lg:grid-cols-4 gap-4">
            <div className="bg-gray-900/50 p-4 rounded-lg text-center">
              <p className="text-white font-semibold">Entrepreneurs</p>
            </div>
            <div className="bg-gray-900/50 p-4 rounded-lg text-center">
              <p className="text-white font-semibold">Artisans</p>
            </div>
            <div className="bg-gray-900/50 p-4 rounded-lg text-center">
              <p className="text-white font-semibold">Indépendants</p>
            </div>
            <div className="bg-gray-900/50 p-4 rounded-lg text-center">
              <p className="text-white font-semibold">PME</p>
            </div>
            <div className="bg-gray-900/50 p-4 rounded-lg text-center">
              <p className="text-white font-semibold">Startups</p>
            </div>
            <div className="bg-gray-900/50 p-4 rounded-lg text-center">
              <p className="text-white font-semibold">Agences</p>
            </div>
            <div className="bg-gray-900/50 p-4 rounded-lg text-center md:col-span-2">
              <p className="text-white font-semibold">Toute entreprise avec un site web</p>
            </div>
          </div>
          <div className="mt-6 bg-gray-900/50 p-4 rounded-lg text-center">
            <p className="text-gray-200">
              <strong className="text-white">👉 Aucune connaissance technique requise.</strong>
            </p>
          </div>
        </div>

        {/* Problem Solved Section */}
        <div className="mt-12 bg-gray-800/50 backdrop-blur-sm p-8 rounded-xl border border-gray-700">
          <h3 className="text-2xl font-bold text-white mb-6 text-center">🎯 Le vrai problème que notre produit résout</h3>
          <div className="space-y-4 max-w-3xl mx-auto">
            <div className="bg-gray-900/50 p-4 rounded-lg">
              <p className="text-gray-300">"J'ai un site web, mais je ne sais pas s'il est vraiment visible."</p>
            </div>
            <div className="bg-gray-900/50 p-4 rounded-lg">
              <p className="text-gray-300">"Je ne sais pas si les IA parlent de moi ou de mes concurrents."</p>
            </div>
            <div className="bg-gray-900/50 p-4 rounded-lg">
              <p className="text-gray-300">"Je n'ai pas le temps ni les compétences pour comprendre l'IA."</p>
            </div>
            <div className="bg-cyan-500/10 border border-cyan-500/20 p-4 rounded-lg text-center">
              <p className="text-cyan-300 font-semibold">
                👉 Notre produit répond à ces questions simplement.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Benefits;
