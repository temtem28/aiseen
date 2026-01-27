import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { supabase, isSupabaseConfigured } from '@/lib/supabase';
import { SupabaseConfigChecker } from '@/components/SupabaseConfigChecker';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { Chrome, Sparkles, AlertTriangle, RefreshCw } from 'lucide-react';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [networkError, setNetworkError] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!isSupabaseConfigured) {
      toast({ title: 'Configuration requise', description: 'Veuillez configurer Supabase. Voir SETUP_AUTH.md', variant: 'destructive' });
      return;
    }
    
    if (!email || !password) {
      toast({ title: 'Erreur', description: 'Veuillez remplir tous les champs', variant: 'destructive' });
      return;
    }
    
    setLoading(true);
    setNetworkError(false);

    try {
      const { data, error } = await supabase.auth.signInWithPassword({ 
        email: email.trim(), 
        password 
      });

      if (error) {
        // Handle specific error types
        if (error.message.includes('Invalid login credentials')) {
          toast({ 
            title: 'Identifiants incorrects', 
            description: 'Email ou mot de passe incorrect. Vérifiez vos informations.', 
            variant: 'destructive' 
          });
        } else if (error.message.includes('Email not confirmed')) {
          toast({ 
            title: 'Email non confirmé', 
            description: 'Veuillez vérifier votre boîte mail et confirmer votre adresse email.', 
            variant: 'destructive' 
          });
        } else {
          toast({ 
            title: 'Erreur de connexion', 
            description: error.message, 
            variant: 'destructive' 
          });
        }
      } else if (data?.user) {
        toast({ title: 'Succès', description: 'Connexion réussie !' });
        navigate('/dashboard');
      }
    } catch (err: any) {
      console.error('Login error:', err);
      
      // Check if it's a network error (Failed to fetch)
      if (err?.message?.includes('Failed to fetch') || err?.name === 'TypeError' || err?.message?.includes('ERR_NAME_NOT_RESOLVED')) {
        setNetworkError(true);
        const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'non configuré';
        toast({ 
          title: 'Erreur de connexion au serveur', 
          description: `Impossible de joindre Supabase (${supabaseUrl}). Vérifiez que le projet est actif et que l'URL est correcte dans .env`, 
          variant: 'destructive',
          duration: 10000
        });
      } else {
        toast({ 
          title: 'Erreur', 
          description: err?.message || 'Une erreur inattendue s\'est produite. Veuillez réessayer.', 
          variant: 'destructive' 
        });
      }
    }
    setLoading(false);
  };

  const handleGoogleLogin = async () => {
    if (!isSupabaseConfigured) {
      toast({ title: 'Configuration requise', description: 'Veuillez configurer Supabase. Voir SETUP_AUTH.md', variant: 'destructive' });
      return;
    }
    
    setLoading(true);
    setNetworkError(false);
    
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: { redirectTo: `${window.location.origin}/dashboard` }
      });
      if (error) {
        toast({ title: 'Erreur', description: error.message, variant: 'destructive' });
      }
    } catch (err: any) {
      console.error('Google login error:', err);
      if (err?.message?.includes('Failed to fetch') || err?.name === 'TypeError') {
        setNetworkError(true);
        toast({ 
          title: 'Erreur de connexion au serveur', 
          description: 'Impossible de joindre le serveur.', 
          variant: 'destructive' 
        });
      } else {
        toast({ title: 'Erreur', description: 'Erreur de connexion', variant: 'destructive' });
      }
    }
    setLoading(false);
  };

  const handleRetry = () => {
    setNetworkError(false);
    window.location.reload();
  };

  if (!isSupabaseConfigured) {
    return <SupabaseConfigChecker />;
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-950 via-cyan-950 to-gray-950 p-4">
      <div className="w-full max-w-md bg-gray-900 border border-cyan-500/20 rounded-2xl shadow-2xl p-8">
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <Sparkles className="h-12 w-12 text-cyan-400" />
          </div>
          <h1 className="text-3xl font-bold text-white">Bon retour !</h1>
          <p className="text-gray-400 mt-2">Connectez-vous à votre compte AI Focus</p>
        </div>

        {/* Network Error Alert */}
        {networkError && (
          <div className="mb-6 p-4 bg-amber-500/10 border border-amber-500/30 rounded-lg">
            <div className="flex items-start gap-3">
              <AlertTriangle className="h-5 w-5 text-amber-400 flex-shrink-0 mt-0.5" />
              <div className="flex-1">
                <h3 className="text-amber-400 font-medium text-sm">Problème de connexion au serveur</h3>
                <p className="text-amber-300/80 text-xs mt-1">
                  Le serveur Supabase semble inaccessible. Cela peut arriver si le projet est en pause (inactivité sur le plan gratuit).
                </p>
                <div className="mt-3 space-y-2">
                  <p className="text-amber-300/70 text-xs">Solutions possibles :</p>
                  <ul className="text-amber-300/70 text-xs list-disc list-inside space-y-1">
                    <li>Vérifiez votre connexion internet</li>
                    <li>Réactivez le projet dans le dashboard Supabase</li>
                    <li>Attendez quelques minutes et réessayez</li>
                  </ul>
                </div>
                <Button 
                  onClick={handleRetry}
                  variant="outline" 
                  size="sm"
                  className="mt-3 border-amber-500/30 text-amber-400 hover:bg-amber-500/10"
                >
                  <RefreshCw className="h-3 w-3 mr-2" />
                  Réessayer
                </Button>
              </div>
            </div>
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <Label htmlFor="email" className="text-gray-200">Email</Label>
            <Input 
              id="email" 
              type="email" 
              value={email} 
              onChange={(e) => setEmail(e.target.value)} 
              required 
              placeholder="votre@email.com"
              className="bg-gray-800 border-gray-700 text-white placeholder:text-gray-500" 
              disabled={loading}
            />
          </div>
          <div>
            <Label htmlFor="password" className="text-gray-200">Mot de passe</Label>
            <Input 
              id="password" 
              type="password" 
              value={password} 
              onChange={(e) => setPassword(e.target.value)} 
              required 
              placeholder="••••••••"
              className="bg-gray-800 border-gray-700 text-white placeholder:text-gray-500" 
              disabled={loading}
            />
          </div>
          <Button 
            type="submit" 
            className="w-full bg-gradient-to-r from-cyan-500 to-purple-500 hover:from-cyan-600 hover:to-purple-600" 
            disabled={loading}
          >
            {loading ? (
              <>
                <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                Connexion...
              </>
            ) : (
              'Se connecter'
            )}
          </Button>
        </form>

        <div className="relative my-6">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-gray-700"></div>
          </div>
          <div className="relative flex justify-center text-xs">
            <span className="bg-gray-900 px-2 text-gray-500">ou</span>
          </div>
        </div>

        <div>
          <Button 
            onClick={handleGoogleLogin} 
            variant="outline" 
            className="w-full border-gray-700 text-gray-200 hover:bg-gray-800"
            disabled={loading}
          >
            <Chrome className="mr-2 h-4 w-4" /> Continuer avec Google
          </Button>
        </div>

        <div className="mt-6 text-center text-sm">
          <Link to="/reset-password" className="text-cyan-400 hover:underline">Mot de passe oublié ?</Link>
          <p className="mt-2 text-gray-400">
            Pas encore de compte ? <Link to="/signup" className="text-cyan-400 hover:underline">Créer un compte</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
