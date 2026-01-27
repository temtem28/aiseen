import React from 'react';
import { Search, Bot, TrendingUp } from 'lucide-react';

const HowItWorks = () => {
  return (
    <section id="how-it-works" className="py-20 bg-gray-950">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">
            🔍 Comprendre le SEO et l'AEO
          </h2>
          <p className="text-xl text-gray-400 max-w-3xl mx-auto">
            Deux types de visibilité essentiels pour votre présence en ligne
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-12 mb-16">
          {/* SEO Section */}
          <div className="bg-gray-900/50 backdrop-blur-sm p-8 rounded-xl border border-gray-800">
            <div className="flex items-center gap-4 mb-6">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-cyan-500/10 rounded-full">
                <Search className="w-8 h-8 text-cyan-400" />
              </div>
              <h3 className="text-2xl font-bold text-white">🔍 Qu'est-ce que le SEO ?</h3>
            </div>
            <p className="text-gray-300 mb-4 text-lg">
              <strong className="text-white">Définition simple :</strong> Le SEO, c'est ce qui permet à votre site web d'apparaître dans Google quand quelqu'un cherche un service ou un produit comme le vôtre.
            </p>
            <div className="bg-gray-800/50 p-4 rounded-lg mb-4">
              <p className="text-gray-200 font-semibold mb-2">Exemple concret :</p>
              <p className="text-gray-300 mb-2">
                Un artisan, un coach ou une entreprise cherche :
              </p>
              <ul className="text-gray-400 space-y-1 ml-4">
                <li>• "plombier Lyon"</li>
                <li>• "fleuriste mariage Paris"</li>
                <li>• "logiciel de facturation"</li>
              </ul>
            </div>
            <div className="bg-cyan-500/10 border border-cyan-500/20 p-4 rounded-lg">
              <p className="text-cyan-300">
                <strong>👉 Si votre site est bien optimisé en SEO, Google vous montre.</strong><br />
                <span className="text-gray-300">Sinon, vous êtes invisible, même avec un bon site.</span>
              </p>
            </div>
          </div>

          {/* AEO Section */}
          <div className="bg-gray-900/50 backdrop-blur-sm p-8 rounded-xl border border-gray-800">
            <div className="flex items-center gap-4 mb-6">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-purple-500/10 rounded-full">
                <Bot className="w-8 h-8 text-purple-400" />
              </div>
              <h3 className="text-2xl font-bold text-white">🤖 Qu'est-ce que l'AEO ?</h3>
            </div>
            <p className="text-gray-300 mb-4 text-lg">
              <strong className="text-white">Définition simple :</strong> L'AEO, c'est la visibilité dans les réponses des intelligences artificielles.
            </p>
            <div className="bg-gray-800/50 p-4 rounded-lg mb-4">
              <p className="text-gray-200 font-semibold mb-2">Aujourd'hui, les gens demandent directement à :</p>
              <ul className="text-gray-300 space-y-1 ml-4">
                <li>• ChatGPT</li>
                <li>• Gemini</li>
                <li>• Claude</li>
                <li>• Perplexity</li>
              </ul>
            </div>
            <div className="bg-purple-500/10 border border-purple-500/20 p-4 rounded-lg">
              <p className="text-purple-300">
                <strong>👉 L'IA répond directement, sans montrer Google.</strong><br />
                <span className="text-gray-300">Soit elle vous cite, soit elle parle de vos concurrents.</span>
              </p>
            </div>
          </div>
        </div>

        {/* Why Both Section */}
        <div className="bg-gradient-to-r from-cyan-500/10 to-purple-500/10 border border-cyan-500/20 rounded-xl p-8">
          <div className="flex items-center gap-4 mb-6">
            <TrendingUp className="w-8 h-8 text-cyan-400" />
            <h3 className="text-2xl font-bold text-white">🌐 Pourquoi SEO + AEO sont indispensables aujourd'hui</h3>
          </div>
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <p className="text-gray-300 mb-2"><strong className="text-white">Avant :</strong></p>
              <p className="text-gray-400">Google = visibilité</p>
            </div>
            <div>
              <p className="text-gray-300 mb-2"><strong className="text-white">Aujourd'hui :</strong></p>
              <p className="text-gray-400">Google + IA = visibilité réelle</p>
            </div>
          </div>
          <div className="mt-6 bg-gray-900/50 p-4 rounded-lg">
            <p className="text-gray-200">
              <strong>👉 Un site peut être bien positionné sur Google mais totalement absent des réponses IA.</strong><br />
              <span className="text-gray-300">Notre plateforme analyse les deux.</span>
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HowItWorks;
