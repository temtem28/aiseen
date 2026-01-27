import React from 'react';
import { Telescope, BarChart3, Trophy, Bot, FileText, Mic, Calendar } from 'lucide-react';

const Features = () => {
  const features = [
    {
      icon: Telescope,
      title: "Voyez comment les IA vous voient",
      description: "Identifiez à quelles réponses de modèles LLM (ChatGPT, Gemini, Claude, Perplexity) votre marque apparaît et dans quel contexte.",
      color: "text-cyan-400"
    },
    {
      icon: BarChart3,
      title: "Le meilleur du SEO… et de l'AEO réunis",
      description: "Un score combiné SEO + AEO (IA-oriented) pour prioriser les optimisations techniques et sémantiques.",
      color: "text-purple-400"
    },
    {
      icon: Trophy,
      title: "Comparez votre influence à celle de vos concurrents",
      description: "Mesurez la part-de-voix IA et les positions SEO ; repérez les opportunités non exploitées.",
      color: "text-emerald-400"
    },
    {
      icon: Bot,
      title: "Testez la perception des grands modèles",
      description: "Simulez comment GPT-4, Gemini, Claude et Perplexity décrivent votre marque et recevez des suggestions d'amélioration.",
      color: "text-cyan-400"
    },
    {
      icon: FileText,
      title: "Créez du contenu optimisé pour les IA",
      description: "Générateur + recommandations sémantiques pour augmenter les chances d'être cité par les IA (crédits par plan).",
      color: "text-purple-400"
    },
    {
      icon: Mic,
      title: "Suivez vos citations dans l'univers IA",
      description: "Alertes et tableaux de bord sur la fréquence et le contexte des mentions dans les réponses générées par les modèles.",
      color: "text-emerald-400"
    },
    {
      icon: Calendar,
      title: "Votre visibilité, livrée chaque semaine",
      description: "Rapport hebdomadaire clair, priorisé, et actionnable pour vos équipes marketing/SEO.",
      color: "text-cyan-400"
    }
  ];


  return (
    <section id="features" className="py-20 bg-gray-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">
            📊 Ce que notre plateforme analyse pour vous
          </h2>
          <p className="text-xl text-gray-400 max-w-3xl mx-auto">
            Une analyse complète de votre visibilité en ligne, sur Google et dans les intelligences artificielles
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          <div className="bg-gray-800/50 backdrop-blur-sm p-8 rounded-xl border border-gray-700 hover:border-cyan-500/50 transition-all hover:transform hover:scale-105">
            <Telescope className="w-12 h-12 text-cyan-400 mb-4" />
            <h3 className="text-xl font-semibold text-white mb-3">1️⃣ Votre visibilité sur Google (SEO)</h3>
            <ul className="text-gray-400 space-y-2">
              <li>• Score SEO global</li>
              <li>• Qualité du contenu</li>
              <li>• Capacité à être trouvé par les internautes</li>
            </ul>
          </div>

          <div className="bg-gray-800/50 backdrop-blur-sm p-8 rounded-xl border border-gray-700 hover:border-purple-500/50 transition-all hover:transform hover:scale-105">
            <Bot className="w-12 h-12 text-purple-400 mb-4" />
            <h3 className="text-xl font-semibold text-white mb-3">2️⃣ Votre visibilité sur les IA (AEO)</h3>
            <ul className="text-gray-400 space-y-2">
              <li>• Présence sur ChatGPT, Gemini, Claude, Perplexity</li>
              <li>• Capacité à être compris par les IA</li>
              <li>• Capacité à être recommandé</li>
            </ul>
          </div>

          <div className="bg-gray-800/50 backdrop-blur-sm p-8 rounded-xl border border-gray-700 hover:border-emerald-500/50 transition-all hover:transform hover:scale-105">
            <Mic className="w-12 h-12 text-emerald-400 mb-4" />
            <h3 className="text-xl font-semibold text-white mb-3">3️⃣ Les citations IA</h3>
            <ul className="text-gray-400 space-y-2">
              <li>• Combien de fois votre site est cité</li>
              <li>• Par quelle IA</li>
              <li>• Sur quels sujets</li>
            </ul>
          </div>

          <div className="bg-gray-800/50 backdrop-blur-sm p-8 rounded-xl border border-gray-700 hover:border-cyan-500/50 transition-all hover:transform hover:scale-105">
            <Trophy className="w-12 h-12 text-cyan-400 mb-4" />
            <h3 className="text-xl font-semibold text-white mb-3">4️⃣ La perception de l'IA</h3>
            <ul className="text-gray-400 space-y-2">
              <li>• Est-ce que l'IA vous considère comme fiable ?</li>
              <li>• Est-ce que votre message est clair ?</li>
              <li>• Est-ce que votre expertise est reconnue ?</li>
            </ul>
          </div>

          <div className="bg-gray-800/50 backdrop-blur-sm p-8 rounded-xl border border-gray-700 hover:border-purple-500/50 transition-all hover:transform hover:scale-105">
            <BarChart3 className="w-12 h-12 text-purple-400 mb-4" />
            <h3 className="text-xl font-semibold text-white mb-3">5️⃣ Vos concurrents</h3>
            <ul className="text-gray-400 space-y-2">
              <li>• Qui est plus visible que vous ?</li>
              <li>• Qui est cité à votre place ?</li>
              <li>• Pourquoi ils apparaissent et pas vous ?</li>
            </ul>
          </div>

          <div className="bg-gray-800/50 backdrop-blur-sm p-8 rounded-xl border border-gray-700 hover:border-emerald-500/50 transition-all hover:transform hover:scale-105">
            <FileText className="w-12 h-12 text-emerald-400 mb-4" />
            <h3 className="text-xl font-semibold text-white mb-3">📈 Rapports et historique</h3>
            <ul className="text-gray-400 space-y-2">
              <li>• Suivi de votre évolution dans le temps</li>
              <li>• Comparaison avant / après</li>
              <li>• Mesure de vos progrès</li>
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Features;
