import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { 
  Search, ArrowLeft, Globe, Bot, Target, Zap, 
  CheckCircle2, Sparkles, Brain, MessageSquare,
  Shield, Clock, FileText
} from 'lucide-react';

const AuditForm = () => {
  const [url, setUrl] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!url) {
      toast({ title: "Erreur", description: "Veuillez entrer une URL", variant: "destructive" });
      return;
    }

    const urlPattern = /^(https?:\/\/)?([\da-z\.-]+)\.([a-z\.]{2,6})([\/\w \.-]*)*\/?$/;
    if (!urlPattern.test(url)) {
      toast({ title: "Erreur", description: "URL invalide", variant: "destructive" });
      return;
    }

    setIsLoading(true);
    navigate('/audit/running', { state: { url } });
  };

  const features = [
    { icon: Target, text: 'Analyse SEO complète', color: 'text-emerald-400' },
    { icon: Bot, text: 'Score AEO (visibilité IA)', color: 'text-cyan-400' },
    { icon: Sparkles, text: 'Test ChatGPT, Gemini, Claude', color: 'text-purple-400' },
    { icon: FileText, text: 'Recommandations personnalisées', color: 'text-orange-400' },
  ];

  const aiModels = [
    { name: 'ChatGPT', icon: Bot, color: 'bg-emerald-500/20 text-emerald-400' },
    { name: 'Gemini', icon: Sparkles, color: 'bg-blue-500/20 text-blue-400' },
    { name: 'Claude', icon: Brain, color: 'bg-orange-500/20 text-orange-400' },
    { name: 'Perplexity', icon: MessageSquare, color: 'bg-purple-500/20 text-purple-400' },
  ];

  return (
    <div className="min-h-screen bg-gray-950">
      {/* Header */}
      <div className="bg-gray-900/80 backdrop-blur-md border-b border-gray-800 px-6 py-4 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-4">
            <Button 
              variant="ghost" 
              size="icon"
              onClick={() => navigate('/dashboard')}
              className="text-gray-400 hover:text-white hover:bg-gray-800"
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div>
              <h1 className="text-xl font-bold text-white">Nouvel Audit</h1>
              <p className="text-sm text-gray-400">SEO + AEO Analysis</p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto p-6">
        <div className="grid lg:grid-cols-2 gap-8">
          {/* Left: Form */}
          <div>
            <Card className="bg-gray-900/50 border-gray-800">
              <CardContent className="p-8">
                <div className="text-center mb-8">
                  <div className="w-16 h-16 bg-gradient-to-br from-cyan-500 to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
                    <Search className="h-8 w-8 text-white" />
                  </div>
                  <h2 className="text-2xl font-bold text-white mb-2">
                    Audit SEO + <span className="text-cyan-400">AEO</span>
                  </h2>
                  <p className="text-gray-400">
                    Analysez votre visibilité sur Google et les IA génératives
                  </p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                  <div>
                    <label className="text-sm font-medium text-gray-300 mb-2 block">
                      URL du site web à analyser
                    </label>
                    <div className="relative">
                      <Globe className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-500" />
                      <Input
                        type="text"
                        placeholder="https://example.com"
                        value={url}
                        onChange={(e) => setUrl(e.target.value)}
                        className="pl-10 bg-gray-800 border-gray-700 text-white placeholder:text-gray-500 h-12 text-lg"
                      />
                    </div>
                    <p className="text-xs text-gray-500 mt-2">
                      Entrez l'URL complète de votre site (avec https://)
                    </p>
                  </div>

                  <Button 
                    type="submit" 
                    disabled={isLoading} 
                    className="w-full h-12 text-lg bg-gradient-to-r from-cyan-500 to-purple-600 hover:from-cyan-600 hover:to-purple-700"
                  >
                    {isLoading ? (
                      <>
                        <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-white mr-2"></div>
                        Lancement...
                      </>
                    ) : (
                      <>
                        <Search className="mr-2 h-5 w-5" />
                        Lancer l'audit
                      </>
                    )}
                  </Button>
                </form>

                {/* Features List */}
                <div className="mt-8 pt-6 border-t border-gray-800">
                  <p className="text-sm text-gray-400 mb-4">Cet audit inclut :</p>
                  <div className="grid grid-cols-2 gap-3">
                    {features.map((feature, index) => (
                      <div key={index} className="flex items-center gap-2">
                        <feature.icon className={`h-4 w-4 ${feature.color}`} />
                        <span className="text-sm text-gray-300">{feature.text}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Trust Badges */}
            <div className="flex items-center justify-center gap-6 mt-6 text-sm text-gray-500">
              <div className="flex items-center gap-2">
                <Shield className="h-4 w-4" />
                <span>RGPD Compliant</span>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4" />
                <span>~30 secondes</span>
              </div>
              <div className="flex items-center gap-2">
                <Zap className="h-4 w-4" />
                <span>Analyse IA</span>
              </div>
            </div>
          </div>

          {/* Right: Info */}
          <div className="space-y-6">
            {/* AI Models Card */}
            <Card className="bg-gradient-to-br from-gray-900 to-cyan-950/30 border-gray-800">
              <CardContent className="p-6">
                <h3 className="text-lg font-semibold text-white mb-4">
                  Modèles IA analysés
                </h3>
                <div className="grid grid-cols-2 gap-3">
                  {aiModels.map((model, index) => (
                    <div 
                      key={index}
                      className={`flex items-center gap-3 p-3 rounded-lg ${model.color.split(' ')[0]}`}
                    >
                      <model.icon className={`h-5 w-5 ${model.color.split(' ')[1]}`} />
                      <span className="font-medium text-white">{model.name}</span>
                    </div>
                  ))}
                </div>
                <p className="text-sm text-gray-400 mt-4">
                  Nous analysons comment ces IA perçoivent et citent votre site web.
                </p>
              </CardContent>
            </Card>

            {/* What We Analyze */}
            <Card className="bg-gray-900/50 border-gray-800">
              <CardContent className="p-6">
                <h3 className="text-lg font-semibold text-white mb-4">
                  Ce que nous analysons
                </h3>
                <div className="space-y-3">
                  {[
                    'Métadonnées (title, description, h1)',
                    'Données structurées (Schema.org)',
                    'Performance et vitesse de chargement',
                    'Optimisation mobile',
                    'Contenu et sémantique',
                    'Visibilité dans les réponses IA',
                    'Citations et mentions IA',
                    'Positionnement vs concurrents'
                  ].map((item, index) => (
                    <div key={index} className="flex items-center gap-3">
                      <CheckCircle2 className="h-4 w-4 text-emerald-400 flex-shrink-0" />
                      <span className="text-sm text-gray-300">{item}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Pro Tip */}
            <div className="p-4 bg-cyan-500/10 border border-cyan-500/20 rounded-xl">
              <div className="flex items-start gap-3">
                <Sparkles className="h-5 w-5 text-cyan-400 flex-shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-medium text-cyan-400 mb-1">Conseil Pro</h4>
                  <p className="text-sm text-gray-400">
                    Pour de meilleurs résultats, analysez votre page d'accueil et vos pages principales séparément.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AuditForm;
