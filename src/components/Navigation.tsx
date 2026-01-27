import React, { useState } from 'react';
import { Menu, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const Navigation = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const navigate = useNavigate();

  const scrollToSection = (id: string) => {
    setIsMenuOpen(false);
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <nav className="bg-gray-900/80 backdrop-blur-sm border-b border-cyan-500/20 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center cursor-pointer" onClick={() => navigate('/')}>
            <img 
              src="https://d64gsuwffb70l.cloudfront.net/69005c5263848c5dcc7c0aa7_1763614525972_3865b13c.webp" 
              alt="Ai Seen Logo" 
              className="h-10 object-contain"
            />
          </div>

          <div className="hidden md:flex items-center space-x-8">
            <button onClick={() => scrollToSection('features')} className="text-gray-300 hover:text-cyan-400 transition-colors">
              Fonctionnalités
            </button>
            <button onClick={() => navigate('/pricing')} className="text-gray-300 hover:text-cyan-400 transition-colors">
              Tarifs
            </button>
            <button onClick={() => navigate('/blog')} className="text-gray-300 hover:text-cyan-400 transition-colors">
              Blog
            </button>
            <button onClick={() => navigate('/audit')} className="text-gray-300 hover:text-cyan-400 transition-colors">
              Audit gratuit
            </button>
            <button onClick={() => navigate('/login')} className="text-gray-300 hover:text-cyan-400 transition-colors">
              Connexion
            </button>
            <button 
              onClick={() => navigate('/signup')}
              className="px-6 py-2 bg-cyan-500 text-white rounded-lg hover:bg-cyan-600 transition-colors font-semibold"
            >
              Essai gratuit
            </button>
          </div>

          <button className="md:hidden text-white" onClick={() => setIsMenuOpen(!isMenuOpen)}>
            {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        {isMenuOpen && (
          <div className="md:hidden py-4 space-y-4">
            <button onClick={() => scrollToSection('features')} className="block w-full text-left text-gray-300 hover:text-cyan-400">
              Fonctionnalités
            </button>
            <button onClick={() => { setIsMenuOpen(false); navigate('/pricing'); }} className="block w-full text-left text-gray-300 hover:text-cyan-400">
              Tarifs
            </button>
            <button onClick={() => { setIsMenuOpen(false); navigate('/blog'); }} className="block w-full text-left text-gray-300 hover:text-cyan-400">
              Blog
            </button>
            <button onClick={() => { setIsMenuOpen(false); navigate('/audit'); }} className="block w-full text-left text-gray-300 hover:text-cyan-400">
              Audit gratuit
            </button>
            <button onClick={() => { setIsMenuOpen(false); navigate('/login'); }} className="block w-full text-left text-gray-300 hover:text-cyan-400">
              Connexion
            </button>
            <button 
              onClick={() => { setIsMenuOpen(false); navigate('/signup'); }}
              className="block w-full px-6 py-2 bg-cyan-500 text-white rounded-lg hover:bg-cyan-600 font-semibold"
            >
              Essai gratuit
            </button>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navigation;
