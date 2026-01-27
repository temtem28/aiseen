import React from 'react';

const Hero = () => {
  const scrollToSection = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className="relative min-h-screen flex items-center justify-center overflow-hidden bg-gradient-to-br from-gray-950 via-gray-900 to-cyan-950">
      <div className="absolute inset-0 opacity-20">
        <div className="absolute top-20 left-10 w-72 h-72 bg-cyan-500 rounded-full filter blur-3xl animate-pulse"></div>
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-purple-500 rounded-full filter blur-3xl animate-pulse delay-700"></div>
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 text-center">
        <h1 className="text-5xl md:text-7xl font-bold text-white mb-6 leading-tight">
          Savoir si Internet<br />
          <span className="bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent">
            et les IA parlent de vous
          </span>
        </h1>
        
        <p className="text-xl md:text-2xl text-gray-300 mb-8 max-w-3xl mx-auto">
          Nous analysons la visibilité de votre site sur Google et dans les intelligences artificielles. Vous savez enfin où vous êtes, qui vous dépasse, et comment progresser.
        </p>
        
        <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-6 mb-8 max-w-2xl mx-auto">
          <p className="text-lg text-gray-200 mb-2">
            🧩 <strong className="text-white">Qu'est-ce que notre produit ?</strong>
          </p>
          <p className="text-gray-300">
            Un outil d'audit de visibilité en ligne qui vous permet de savoir si votre site est visible sur Google (SEO) et si les IA vous citent (AEO).
          </p>
        </div>


        <div className="flex flex-col sm:flex-row gap-4 justify-center mb-16">
          <button 
            onClick={() => scrollToSection('pricing')}
            className="px-8 py-4 bg-cyan-500 text-white rounded-lg font-semibold text-lg hover:bg-cyan-600 transition-all transform hover:scale-105 shadow-lg"
          >
            Essayer gratuitement
          </button>
          <button 
            onClick={() => scrollToSection('features')}
            className="px-8 py-4 bg-white/10 backdrop-blur-sm text-white rounded-lg font-semibold text-lg hover:bg-white/20 transition-all border border-white/20"
          >
            Découvrir les fonctionnalités
          </button>
        </div>

        <div className="relative max-w-5xl mx-auto">
          <div className="absolute inset-0 bg-gradient-to-r from-cyan-500 to-emerald-500 rounded-2xl blur-2xl opacity-30 animate-pulse"></div>
          <img 
            src="https://d64gsuwffb70l.cloudfront.net/69005c5263848c5dcc7c0aa7_1761631373217_6f6545ab.webp"
            alt="AI Focus Dashboard"
            className="relative rounded-2xl shadow-2xl border border-white/10"
          />
        </div>
      </div>
    </div>
  );
};

export default Hero;
