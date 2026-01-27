import { useState } from 'react';
import { Link } from 'react-router-dom';
import { supabase, isSupabaseConfigured } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { ArrowLeft, Sparkles } from 'lucide-react';


export default function ResetPassword() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const { toast } = useToast();

  const handleReset = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!isSupabaseConfigured) {
      toast({ title: 'Configuration requise', description: 'Veuillez configurer Supabase. Voir SETUP_AUTH.md', variant: 'destructive' });
      return;
    }
    
    setLoading(true);

    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/update-password`,
      });

      if (error) {
        toast({ title: 'Erreur', description: error.message, variant: 'destructive' });
      } else {
        setSent(true);
        toast({ title: 'Succès', description: 'Email de réinitialisation envoyé !' });
      }
    } catch (err) {
      toast({ title: 'Erreur', description: 'Erreur lors de l\'envoi', variant: 'destructive' });
    }
    setLoading(false);
  };


  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-950 via-cyan-950 to-gray-950 p-4">
      <div className="w-full max-w-md bg-gray-900 border border-cyan-500/20 rounded-2xl shadow-2xl p-8">
        <Link to="/login" className="inline-flex items-center text-sm text-gray-400 hover:text-cyan-400 mb-6">
          <ArrowLeft className="mr-2 h-4 w-4" /> Retour à la connexion
        </Link>

        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <Sparkles className="h-12 w-12 text-cyan-400" />
          </div>
          <h1 className="text-3xl font-bold text-white">Réinitialiser le mot de passe</h1>
          <p className="text-gray-400 mt-2">Entrez votre email pour recevoir un lien de réinitialisation</p>
        </div>

        {!sent ? (
          <form onSubmit={handleReset} className="space-y-4">
            <div>
              <Label htmlFor="email" className="text-gray-200">Email</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="bg-gray-800 border-gray-700 text-white"
              />
            </div>
            <Button type="submit" className="w-full bg-gradient-to-r from-cyan-500 to-purple-500 hover:from-cyan-600 hover:to-purple-600" disabled={loading}>
              {loading ? 'Envoi...' : 'Envoyer le lien'}
            </Button>
          </form>
        ) : (
          <div className="text-center p-6 bg-emerald-900/30 border border-emerald-500/30 rounded-lg">
            <p className="text-emerald-400">Vérifiez votre email pour le lien de réinitialisation !</p>
          </div>
        )}
      </div>
    </div>
  );
}
