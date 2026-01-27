import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import { Mail, CheckCircle } from 'lucide-react';

export default function VerifyEmail() {
  const [verified, setVerified] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const checkVerification = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user?.email_confirmed_at) {
        setVerified(true);
        setTimeout(() => navigate('/onboarding'), 2000);
      }
    };

    checkVerification();
    const interval = setInterval(checkVerification, 3000);
    return () => clearInterval(interval);
  }, [navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-950 via-cyan-950 to-gray-950 p-4">
      <div className="w-full max-w-md bg-gray-900 border border-cyan-500/20 rounded-2xl shadow-2xl p-8 text-center">
        {!verified ? (
          <>
            <Mail className="mx-auto h-16 w-16 text-cyan-400 mb-4" />
            <h1 className="text-3xl font-bold text-white mb-4">Vérifiez votre email</h1>
            <p className="text-gray-400 mb-6">
              Nous avons envoyé un lien de vérification à votre email. Veuillez consulter votre boîte de réception et cliquer sur le lien pour vérifier votre compte.
            </p>
            <div className="animate-pulse text-sm text-gray-500">
              En attente de vérification...
            </div>
          </>
        ) : (
          <>
            <CheckCircle className="mx-auto h-16 w-16 text-emerald-400 mb-4" />
            <h1 className="text-3xl font-bold text-white mb-4">Email vérifié !</h1>
            <p className="text-gray-400 mb-6">Redirection vers l'onboarding...</p>
          </>
        )}
        <Button onClick={() => navigate('/login')} variant="outline" className="mt-6 border-gray-700 text-gray-200 hover:bg-gray-800">
          Retour à la connexion
        </Button>
      </div>
    </div>
  );
}
