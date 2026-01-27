import React from 'react';
import { Sparkles, Mail, MapPin, Phone } from 'lucide-react';

const Footer = () => {
  return (
    <footer className="bg-gray-950 border-t border-gray-800 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid md:grid-cols-4 gap-8 mb-8">
          <div>
            <div className="flex items-center mb-4">
              <Sparkles className="w-8 h-8 text-cyan-400 mr-2" />
              <span className="text-xl font-bold text-white">AI Focus</span>
            </div>
            <p className="text-gray-400 text-sm">
              Le 1er SaaS français d'optimisation SEO et AEO pour dominer Google et les IA génératives.
            </p>
          </div>

          <div>
            <h3 className="text-white font-semibold mb-4">Produit</h3>
            <ul className="space-y-2">
              <li><a href="#features" className="text-gray-400 hover:text-cyan-400 transition-colors">Fonctionnalités</a></li>
              <li><a href="#pricing" className="text-gray-400 hover:text-cyan-400 transition-colors">Tarifs</a></li>
              <li><a href="/audit" className="text-gray-400 hover:text-cyan-400 transition-colors">Audit gratuit</a></li>
              <li><a href="/login" className="text-gray-400 hover:text-cyan-400 transition-colors">Connexion</a></li>
            </ul>
          </div>

          <div>
            <h3 className="text-white font-semibold mb-4">Entreprise</h3>
            <ul className="space-y-2">
              <li><a href="#" className="text-gray-400 hover:text-cyan-400 transition-colors">À propos</a></li>
              <li><a href="#" className="text-gray-400 hover:text-cyan-400 transition-colors">Blog</a></li>
              <li><a href="#" className="text-gray-400 hover:text-cyan-400 transition-colors">Carrières</a></li>
              <li><a href="#" className="text-gray-400 hover:text-cyan-400 transition-colors">Contact</a></li>
            </ul>
          </div>

          <div>
            <h3 className="text-white font-semibold mb-4">Contact</h3>
            <ul className="space-y-3">
              <li className="flex items-start text-gray-400 text-sm">
                <Mail className="w-4 h-4 mr-2 mt-0.5 flex-shrink-0" />
                contact@aifocus.fr
              </li>
              <li className="flex items-start text-gray-400 text-sm">
                <Phone className="w-4 h-4 mr-2 mt-0.5 flex-shrink-0" />
                +33 1 23 45 67 89
              </li>
              <li className="flex items-start text-gray-400 text-sm">
                <MapPin className="w-4 h-4 mr-2 mt-0.5 flex-shrink-0" />
                Paris, France
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-gray-800 pt-8 flex flex-col md:flex-row justify-between items-center">
          <p className="text-gray-400 text-sm mb-4 md:mb-0">
            © 2025 AI Focus. Tous droits réservés.
          </p>
          <div className="flex space-x-6">
            <a href="#" className="text-gray-400 hover:text-cyan-400 transition-colors text-sm">Mentions légales</a>
            <a href="#" className="text-gray-400 hover:text-cyan-400 transition-colors text-sm">Confidentialité</a>
            <a href="#" className="text-gray-400 hover:text-cyan-400 transition-colors text-sm">CGU</a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
