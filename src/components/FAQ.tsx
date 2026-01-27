import React, { useState } from 'react';
import { ChevronDown } from 'lucide-react';

const FAQ = () => {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const faqs = [
    {
      question: "Qu'est-ce que votre produit exactement ?",
      answer: "Notre plateforme est un outil d'audit de visibilité en ligne. Elle permet de savoir si votre site est visible sur Google (SEO), si votre site est visible et cité par les intelligences artificielles (AEO / IA), et comment vous êtes perçu par rapport à vos concurrents. En clair : vous savez enfin si Internet et les IA parlent de vous… ou pas."
    },
    {
      question: "Qu'est-ce que le SEO ?",
      answer: "Le SEO, c'est ce qui permet à votre site web d'apparaître dans Google quand quelqu'un cherche un service ou un produit comme le vôtre. Si votre site est bien optimisé en SEO, Google vous montre. Sinon, vous êtes invisible, même avec un bon site."
    },
    {
      question: "Qu'est-ce que l'AEO ?",
      answer: "L'AEO, c'est la visibilité dans les réponses des intelligences artificielles. Aujourd'hui, les gens ne cherchent plus seulement sur Google. Ils demandent directement à ChatGPT, Gemini, Claude ou Perplexity. L'IA répond directement, sans montrer Google. Soit elle vous cite, soit elle parle de vos concurrents."
    },
    {
      question: "Pourquoi SEO + AEO sont-ils indispensables ?",
      answer: "Avant, Google = visibilité. Aujourd'hui, Google + IA = visibilité réelle. Un site peut être bien positionné sur Google mais totalement absent des réponses IA. Notre plateforme analyse les deux pour vous donner une vue complète de votre visibilité."
    },
    {
      question: "À qui s'adresse ce produit ?",
      answer: "Notre produit s'adresse aux entrepreneurs, artisans, indépendants, PME, startups, agences et toute entreprise avec un site web. Aucune connaissance technique n'est requise. Le rapport est clair et compréhensible, sans jargon technique."
    },
    {
      question: "Qu'est-ce que je reçois concrètement ?",
      answer: "Vous recevez un rapport clair avec votre score SEO, votre score AEO, votre visibilité IA, vos citations, vos concurrents et vos axes d'amélioration. Vous avez aussi un historique pour suivre votre évolution dans le temps, et des recommandations exploitables pour améliorer votre visibilité."
    }
  ];

  return (
    <section className="py-20 bg-gray-900">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">
            Questions fréquentes
          </h2>
          <p className="text-xl text-gray-400">
            Réponses aux questions les plus fréquentes
          </p>
        </div>

        <div className="space-y-4">
          {faqs.map((faq, index) => (
            <div 
              key={index}
              className="bg-gray-800/50 backdrop-blur-sm rounded-xl border border-gray-700 overflow-hidden"
            >
              <button
                onClick={() => setOpenIndex(openIndex === index ? null : index)}
                className="w-full px-6 py-4 flex items-center justify-between text-left hover:bg-gray-800/80 transition-colors"
              >
                <span className="text-lg font-semibold text-white">{faq.question}</span>
                <ChevronDown 
                  className={`w-5 h-5 text-cyan-400 transition-transform ${
                    openIndex === index ? 'transform rotate-180' : ''
                  }`}
                />
              </button>
              {openIndex === index && (
                <div className="px-6 pb-4 text-gray-300">
                  {faq.answer}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default FAQ;
