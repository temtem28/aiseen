import { AlertCircle, CheckCircle, ExternalLink } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { isSupabaseConfigured } from '@/lib/supabase';

export function SupabaseConfigChecker() {
  if (isSupabaseConfigured) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <Card className="max-w-2xl w-full">
        <CardHeader>
          <div className="flex items-center gap-3">
            <AlertCircle className="h-8 w-8 text-orange-500" />
            <CardTitle className="text-2xl">Configuration Supabase Requise</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Supabase n'est pas configuré</AlertTitle>
            <AlertDescription>
              Pour utiliser l'inscription et la connexion, vous devez configurer Supabase.
            </AlertDescription>
          </Alert>

          <div className="space-y-3">
            <h3 className="font-semibold text-lg">Configuration rapide (5 minutes) :</h3>
            
            <div className="space-y-2 text-sm">
              <div className="flex items-start gap-2">
                <div className="bg-blue-500 text-white rounded-full w-6 h-6 flex items-center justify-center flex-shrink-0 mt-0.5">1</div>
                <div>
                  <p className="font-medium">Créer un compte Supabase</p>
                  <p className="text-gray-600">Allez sur supabase.com et créez un compte gratuit</p>
                </div>
              </div>

              <div className="flex items-start gap-2">
                <div className="bg-blue-500 text-white rounded-full w-6 h-6 flex items-center justify-center flex-shrink-0 mt-0.5">2</div>
                <div>
                  <p className="font-medium">Créer un nouveau projet</p>
                  <p className="text-gray-600">Cliquez sur "New Project" et choisissez Europe West</p>
                </div>
              </div>

              <div className="flex items-start gap-2">
                <div className="bg-blue-500 text-white rounded-full w-6 h-6 flex items-center justify-center flex-shrink-0 mt-0.5">3</div>
                <div>
                  <p className="font-medium">Récupérer vos clés API</p>
                  <p className="text-gray-600">Settings → API → Copiez Project URL et anon key</p>
                </div>
              </div>

              <div className="flex items-start gap-2">
                <div className="bg-blue-500 text-white rounded-full w-6 h-6 flex items-center justify-center flex-shrink-0 mt-0.5">4</div>
                <div>
                  <p className="font-medium">Créer le fichier .env</p>
                  <p className="text-gray-600 font-mono text-xs bg-gray-100 p-2 rounded mt-1">
                    VITE_SUPABASE_URL=votre_url<br/>
                    VITE_SUPABASE_ANON_KEY=votre_cle
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-2">
                <div className="bg-blue-500 text-white rounded-full w-6 h-6 flex items-center justify-center flex-shrink-0 mt-0.5">5</div>
                <div>
                  <p className="font-medium">Redémarrer l'application</p>
                  <p className="text-gray-600 font-mono text-xs">npm run dev</p>
                </div>
              </div>
            </div>
          </div>

          <div className="flex gap-2 pt-4">
            <Button asChild className="flex-1">
              <a href="https://supabase.com" target="_blank" rel="noopener noreferrer">
                <ExternalLink className="mr-2 h-4 w-4" />
                Ouvrir Supabase
              </a>
            </Button>
            <Button variant="outline" asChild className="flex-1">
              <a href="/CONFIGURATION_RAPIDE.md" target="_blank">
                Voir le guide complet
              </a>
            </Button>
          </div>

          <Alert className="bg-blue-50 border-blue-200">
            <CheckCircle className="h-4 w-4 text-blue-600" />
            <AlertDescription className="text-blue-800">
              Une fois configuré, rechargez cette page et vous pourrez vous inscrire et vous connecter !
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    </div>
  );
}
