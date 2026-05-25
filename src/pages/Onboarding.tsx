import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';

export default function Onboarding() {
  const [step, setStep] = useState(1);
  const [fullName, setFullName] = useState('');
  const [company, setCompany] = useState('');
  const [website, setWebsite] = useState('');
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleComplete = async () => {
    if (!user) return;
    setLoading(true);

    const { error } = await supabase.from('profiles').upsert({
      id: user.id,
      email: user.email,
      full_name: fullName,
      company,
      website,
      updated_at: new Date().toISOString(),
    });

    if (error) {
      toast({ title: 'Erreur', description: error.message, variant: 'destructive' });
    } else {
      toast({ title: 'Succès', description: 'Configuration du profil terminée !' });
      navigate('/dashboard');
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 p-4">
      <div className="w-full max-w-2xl bg-white rounded-2xl shadow-2xl p-8">
        <div className="mb-8">
          <div className="flex justify-between mb-4">
            {[1, 2].map((s) => (
              <div key={s} className={`h-2 flex-1 mx-1 rounded ${s <= step ? 'bg-blue-600' : 'bg-slate-200'}`} />
            ))}
          </div>
          <h1 className="text-3xl font-bold text-slate-900">Bienvenue sur Zineris</h1>
          <p className="text-slate-600 mt-2">Configurons votre profil</p>
        </div>

        {step === 1 && (
          <div className="space-y-4">
            <div>
              <Label htmlFor="fullName">Nom complet</Label>
              <Input id="fullName" value={fullName} onChange={(e) => setFullName(e.target.value)} required />
            </div>
            <div>
              <Label htmlFor="company">Nom de l'entreprise</Label>
              <Input id="company" value={company} onChange={(e) => setCompany(e.target.value)} />
            </div>
            <Button onClick={() => setStep(2)} className="w-full" disabled={!fullName}>
              Continuer
            </Button>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-4">
            <div>
              <Label htmlFor="website">URL du site web</Label>
              <Input id="website" type="url" value={website} onChange={(e) => setWebsite(e.target.value)} placeholder="https://exemple.com" />
            </div>
            <div className="flex gap-4">
              <Button onClick={() => setStep(1)} variant="outline" className="flex-1">Retour</Button>
              <Button onClick={handleComplete} className="flex-1" disabled={loading}>
                {loading ? 'Finalisation...' : 'Terminer la configuration'}
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
