import React from 'react';
import { useNavigate } from 'react-router-dom';

const CTASection = () => {
  const navigate = useNavigate();

  return (
    <section className="py-20 bg-gradient-to-br from-cyan-600 via-purple-600 to-emerald-600">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
          Prêt à booster votre visibilité IA ?
        </h2>
        <p className="text-xl text-white/90 mb-8 max-w-2xl mx-auto">
          Rejoignez les entreprises européennes qui optimisent déjà leur présence sur Google et dans les réponses des IA
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <button 
            onClick={() => navigate('/signup')}
            className="px-8 py-4 bg-white text-cyan-600 rounded-lg font-semibold text-lg hover:bg-gray-100 transition-all transform hover:scale-105 shadow-lg"
          >
            Commencer gratuitement
          </button>
          <button 
            onClick={() => navigate('/audit')}
            className="px-8 py-4 bg-white/10 backdrop-blur-sm text-white rounded-lg font-semibold text-lg hover:bg-white/20 transition-all border border-white/20"
          >
            Tester un audit gratuit
          </button>
        </div>
        <p className="text-white/80 mt-6 text-sm">
          14 jours d'essai gratuit • Sans carte bancaire • Annulation à tout moment
        </p>
      </div>
    </section>
  );
};

export default CTASection;
