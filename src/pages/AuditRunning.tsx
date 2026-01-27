import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabase';
import { performRealSEOAudit } from '@/lib/apiServices';
import { 
  AlertCircle, CheckCircle2, Globe, Target, Bot, 
  Sparkles, FileText, Zap, Brain, MessageSquare,
  ArrowLeft, WifiOff, RefreshCw, AlertTriangle
} from 'lucide-react';

interface Step {
  label: string;
  icon: React.ElementType;
  color: string;
}

const AuditRunning = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useAuth();
  const url = location.state?.url;
  const [currentStep, setCurrentStep] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [errorDetails, setErrorDetails] = useState<string | null>(null);
  const [errorCode, setErrorCode] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [completedSteps, setCompletedSteps] = useState<number[]>([]);

  const steps: Step[] = [
    { label: 'Connexion au site web', icon: Globe, color: 'text-blue-400' },
    { label: 'Extraction des métadonnées', icon: Target, color: 'text-emerald-400' },
    { label: 'Analyse ChatGPT', icon: Bot, color: 'text-green-400' },
    { label: 'Analyse Gemini', icon: Sparkles, color: 'text-blue-400' },
    { label: 'Analyse Claude', icon: Brain, color: 'text-orange-400' },
    { label: 'Calcul du score AEO', icon: Zap, color: 'text-cyan-400' },
    { label: 'Génération des recommandations', icon: FileText, color: 'text-purple-400' },
  ];

  useEffect(() => {
    if (!url) {
      navigate('/audit');
      return;
    }
    runAnalysis();
  }, [url]);

  const runAnalysis = async () => {
    if (isAnalyzing) return;
    setIsAnalyzing(true);
    setError(null);
    setErrorDetails(null);
    setErrorCode(null);
    setCompletedSteps([]);
    setCurrentStep(0);

    // Real step progression
    const progressInterval = setInterval(() => {
      setCurrentStep(prev => {
        if (prev < steps.length - 1) {
          setCompletedSteps(completed => [...completed, prev]);
          return prev + 1;
        }
        return prev;
      });
    }, 2000);

    try {
      let data;

      // Try Edge Function first
      try {
        console.log('Calling seo-analyzer Edge Function for URL:', url);
        const { data: responseData, error: functionError } = await supabase.functions.invoke('seo-analyzer', {
          body: { url, userId: user?.id },
        });

        if (functionError) {
          throw functionError;
        }

        if (responseData && !responseData.error) {
          data = responseData;
        } else {
          throw new Error('Edge Function returned error');
        }
      } catch (edgeFunctionError: any) {
        // If Edge Function fails, use direct API service
        console.log('Edge Function not available, using direct API service');
        clearInterval(progressInterval);
        
        // Update progress for direct analysis
        setCurrentStep(1);
        setCompletedSteps([0]);
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        setCurrentStep(2);
        setCompletedSteps([0, 1]);
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // Perform real audit
        data = await performRealSEOAudit(url);
        
        setCurrentStep(steps.length - 1);
        setCompletedSteps(steps.map((_, i) => i));
      }

      clearInterval(progressInterval);

      // Complete all steps
      setCompletedSteps(steps.map((_, i) => i));
      setCurrentStep(steps.length);

      setTimeout(() => {
        navigate('/audit/results', { state: { results: data } });
      }, 800);

    } catch (err: any) {
      if (progressInterval) {
        clearInterval(progressInterval);
      }
      console.error('Analysis error:', err);
      
      const code = err.code || 'UNKNOWN';
      setErrorCode(code);
      
      // Handle specific error types
      switch (code) {
        case 'NETWORK_ERROR':
          setError('Erreur de connexion réseau');
          setErrorDetails('Impossible de joindre le serveur. Vérifiez votre connexion internet ou réessayez dans quelques instants.');
          break;
        case 'FUNCTION_NOT_DEPLOYED':
          setError('Edge Function non déployée');
          setErrorDetails('L\'Edge Function "seo-analyzer" n\'est pas encore déployée. L\'analyse directe a également échoué. Vérifiez que le site est accessible.');
          break;
        case 'UNAUTHORIZED':
          setError('Non autorisé');
          setErrorDetails('Vous devez être connecté pour effectuer une analyse. Veuillez vous connecter et réessayer.');
          break;
        case 'TIMEOUT':
          setError('Délai d\'attente dépassé');
          setErrorDetails('L\'analyse prend plus de temps que prévu. Le site analysé peut être lent ou inaccessible.');
          break;
        default:
          setError('Erreur d\'analyse');
          setErrorDetails(err.message || 'Une erreur s\'est produite lors de l\'analyse du site. Vérifiez que l\'URL est correcte et accessible.');
      }
      
      setIsAnalyzing(false);
    }
  };

  const retryAnalysis = () => {
    setCurrentStep(0);
    setCompletedSteps([]);
    setIsAnalyzing(false);
    setError(null);
    setErrorDetails(null);
    setErrorCode(null);
    runAnalysis();
  };

  const progress = ((completedSteps.length) / steps.length) * 100;

  return (
    <div className="min-h-screen bg-gray-950">
      {/* Header */}
      <div className="bg-gray-900/80 backdrop-blur-md border-b border-gray-800 px-6 py-4 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto flex items-center gap-4">
          <Button 
            variant="ghost" 
            size="icon"
            onClick={() => navigate('/audit')}
            className="text-gray-400 hover:text-white hover:bg-gray-800"
            disabled={isAnalyzing && !error}
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-xl font-bold text-white">Audit en cours</h1>
            <p className="text-sm text-gray-400 truncate max-w-md">{url}</p>
          </div>
        </div>
      </div>

      <div className="max-w-3xl mx-auto p-6">
        <Card className="bg-gray-900/50 border-gray-800 overflow-hidden">
          {/* Progress Bar */}
          <div className="h-1 bg-gray-800">
            <div 
              className="h-full bg-gradient-to-r from-cyan-500 to-purple-600 transition-all duration-500"
              style={{ width: `${progress}%` }}
            />
          </div>

          <CardContent className="p-8">
            {error ? (
              <div className="text-center space-y-6">
                <div className={`w-20 h-20 rounded-full flex items-center justify-center mx-auto ${
                  errorCode === 'FUNCTION_NOT_DEPLOYED' || errorCode === 'FUNCTION_NOT_FOUND' 
                    ? 'bg-yellow-500/10' 
                    : 'bg-orange-500/10'
                }`}>
                  {errorCode === 'FUNCTION_NOT_DEPLOYED' || errorCode === 'FUNCTION_NOT_FOUND' ? (
                    <AlertTriangle className="h-10 w-10 text-yellow-500" />
                  ) : (
                    <WifiOff className="h-10 w-10 text-orange-500" />
                  )}
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-white mb-2">{error}</h2>
                  {errorDetails && (
                    <p className="text-gray-400 max-w-md mx-auto">{errorDetails}</p>
                  )}
                  {errorCode && (
                    <p className="text-xs text-gray-600 mt-2">Code: {errorCode}</p>
                  )}
                </div>
                
                <div className="flex flex-col sm:flex-row justify-center gap-3">
                  <Button 
                    onClick={retryAnalysis} 
                    variant="outline"
                    className="border-gray-700 text-gray-300 hover:bg-gray-800"
                  >
                    <RefreshCw className="h-4 w-4 mr-2" />
                    Réessayer
                  </Button>
                  <Button 
                    onClick={() => navigate('/audit')} 
                    variant="outline" 
                    className="border-gray-700 text-gray-300 hover:bg-gray-800"
                  >
                    Nouvel audit
                  </Button>
                </div>
              </div>
            ) : (
              <>
                {/* Main Animation */}
                <div className="text-center mb-8">
                  <div className="relative w-32 h-32 mx-auto mb-6">
                    {/* Outer ring */}
                    <div className="absolute inset-0 rounded-full border-4 border-gray-800" />
                    {/* Animated ring */}
                    <svg className="absolute inset-0 w-full h-full -rotate-90">
                      <circle
                        cx="64"
                        cy="64"
                        r="60"
                        fill="none"
                        stroke="url(#gradient)"
                        strokeWidth="4"
                        strokeLinecap="round"
                        strokeDasharray={`${progress * 3.77} 377`}
                        className="transition-all duration-500"
                      />
                      <defs>
                        <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="0%">
                          <stop offset="0%" stopColor="#06B6D4" />
                          <stop offset="100%" stopColor="#8B5CF6" />
                        </linearGradient>
                      </defs>
                    </svg>
                    {/* Center content */}
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="text-center">
                        <span className="text-3xl font-bold text-white">{Math.round(progress)}%</span>
                      </div>
                    </div>
                  </div>
                  <h2 className="text-xl font-semibold text-white mb-2">
                    Analyse SEO + AEO
                  </h2>
                  <p className="text-gray-400">
                    {steps[currentStep]?.label || 'Finalisation...'}
                  </p>
                </div>

                {/* Steps List */}
                <div className="space-y-3">
                  {steps.map((step, index) => {
                    const isCompleted = completedSteps.includes(index);
                    const isCurrent = index === currentStep;

                    return (
                      <div 
                        key={index}
                        className={`flex items-center gap-4 p-3 rounded-lg transition-all duration-300 ${
                          isCompleted ? 'bg-emerald-500/10' : 
                          isCurrent ? 'bg-cyan-500/10' : 
                          'bg-gray-800/30'
                        }`}
                      >
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center transition-all ${
                          isCompleted ? 'bg-emerald-500/20' :
                          isCurrent ? 'bg-cyan-500/20 animate-pulse' :
                          'bg-gray-800'
                        }`}>
                          {isCompleted ? (
                            <CheckCircle2 className="h-5 w-5 text-emerald-400" />
                          ) : (
                            <step.icon className={`h-5 w-5 ${isCurrent ? step.color : 'text-gray-600'}`} />
                          )}
                        </div>
                        <span className={`flex-1 ${
                          isCompleted ? 'text-emerald-400' :
                          isCurrent ? 'text-white' :
                          'text-gray-500'
                        }`}>
                          {step.label}
                        </span>
                        {isCurrent && (
                          <div className="flex gap-1">
                            <div className="w-2 h-2 bg-cyan-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                            <div className="w-2 h-2 bg-cyan-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                            <div className="w-2 h-2 bg-cyan-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>

                {/* Info */}
                <div className="mt-8 p-4 bg-gray-800/30 rounded-lg border border-gray-700/50">
                  <div className="flex items-start gap-3">
                    <Bot className="h-5 w-5 text-cyan-400 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="text-sm text-gray-300">
                        Notre IA analyse votre site sur plusieurs dimensions : SEO technique, 
                        contenu sémantique, et visibilité dans les réponses des modèles IA (ChatGPT, Gemini, Claude, Perplexity).
                      </p>
                    </div>
                  </div>
                </div>
              </>
            )}
          </CardContent>
        </Card>

        {/* AI Models Being Tested */}
        {!error && (
          <div className="mt-6 flex items-center justify-center gap-4">
            <span className="text-sm text-gray-500">Modèles testés :</span>
            <div className="flex items-center gap-2">
              {[
                { icon: Bot, name: 'GPT-4', color: 'text-emerald-400' },
                { icon: Sparkles, name: 'Gemini', color: 'text-blue-400' },
                { icon: Brain, name: 'Claude', color: 'text-orange-400' },
                { icon: MessageSquare, name: 'Perplexity', color: 'text-purple-400' },
              ].map((model, index) => (
                <div 
                  key={index}
                  className="flex items-center gap-1 px-2 py-1 bg-gray-800/50 rounded-full"
                  title={model.name}
                >
                  <model.icon className={`h-3.5 w-3.5 ${model.color}`} />
                  <span className="text-xs text-gray-400">{model.name}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AuditRunning;
