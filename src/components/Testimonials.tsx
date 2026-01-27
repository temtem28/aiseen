import React from 'react';
import { Star } from 'lucide-react';

const Testimonials = () => {
  const testimonials = [
    {
      name: "Sophie Martin",
      role: "Directrice Marketing, TechStart",
      content: "AI Focus nous a permis d'augmenter notre visibilité dans les réponses de ChatGPT de 300% en 3 mois. Un outil indispensable à l'ère de l'IA.",
      rating: 5
    },
    {
      name: "Thomas Dubois",
      role: "Fondateur, Agence Digital+",
      content: "Enfin un outil qui combine SEO et AEO ! Nos clients adorent les rapports hebdomadaires qui montrent leur progression sur les deux fronts.",
      rating: 5
    },
    {
      name: "Marie Lefebvre",
      role: "CEO, E-commerce Pro",
      content: "Le retour sur investissement est impressionnant. Nous sommes maintenant cités dans 40% des réponses IA liées à notre secteur.",
      rating: 5
    }
  ];

  return (
    <section className="py-20 bg-gray-950">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">
            Ce que disent nos clients
          </h2>
          <p className="text-xl text-gray-400">
            Des résultats concrets pour des entreprises comme la vôtre
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {testimonials.map((testimonial, index) => (
            <div 
              key={index}
              className="bg-gray-900/50 backdrop-blur-sm p-8 rounded-xl border border-gray-800 hover:border-cyan-500/50 transition-all"
            >
              <div className="flex mb-4">
                {[...Array(testimonial.rating)].map((_, i) => (
                  <Star key={i} className="w-5 h-5 text-yellow-400 fill-current" />
                ))}
              </div>
              <p className="text-gray-300 mb-6 leading-relaxed">{testimonial.content}</p>
              <div>
                <p className="text-white font-semibold">{testimonial.name}</p>
                <p className="text-gray-400 text-sm">{testimonial.role}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Testimonials;
