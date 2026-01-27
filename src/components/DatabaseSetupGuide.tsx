import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CheckCircle2, Database, ExternalLink, Key, Shield, Table } from 'lucide-react';

export default function DatabaseSetupGuide() {
  const projectId = 'pghixonkhzfafkuqvhai';
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-12 px-4">
      <div className="max-w-4xl mx-auto">
        <Card className="shadow-2xl">
          <CardHeader className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white">
            <CardTitle className="text-3xl">Configuration Supabase</CardTitle>
            <CardDescription className="text-blue-100">
              Projet: {projectId}
            </CardDescription>
          </CardHeader>
          <CardContent className="p-8 space-y-8">
            
            {/* Étape 1 */}
            <div className="flex gap-4">
              <div className="flex-shrink-0 w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                <Key className="w-6 h-6 text-blue-600" />
              </div>
              <div className="flex-1">
                <h3 className="text-xl font-bold mb-2">Étape 1: Clé API</h3>
                <p className="text-gray-600 mb-3">
                  Récupérez votre clé API anon et ajoutez-la au fichier .env
                </p>
                <Button asChild>
                  <a 
                    href={`https://supabase.com/dashboard/project/${projectId}/settings/api`}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    Ouvrir API Settings <ExternalLink className="ml-2 w-4 h-4" />
                  </a>
                </Button>
              </div>
            </div>

            {/* Étape 2 */}
            <div className="flex gap-4">
              <div className="flex-shrink-0 w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                <Shield className="w-6 h-6 text-green-600" />
              </div>
              <div className="flex-1">
                <h3 className="text-xl font-bold mb-2">Étape 2: Authentification</h3>
                <p className="text-gray-600 mb-3">
                  Activez Email Provider dans les paramètres d'authentification
                </p>
                <Button asChild variant="outline">
                  <a 
                    href={`https://supabase.com/dashboard/project/${projectId}/auth/providers`}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    Configurer Auth <ExternalLink className="ml-2 w-4 h-4" />
                  </a>
                </Button>
              </div>
            </div>

            {/* Étape 3 */}
            <div className="flex gap-4">
              <div className="flex-shrink-0 w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
                <Database className="w-6 h-6 text-purple-600" />
              </div>
              <div className="flex-1">
                <h3 className="text-xl font-bold mb-2">Étape 3: Base de Données</h3>
                <p className="text-gray-600 mb-3">
                  Exécutez le script SQL pour créer les tables
                </p>
                <Button asChild variant="outline">
                  <a 
                    href={`https://supabase.com/dashboard/project/${projectId}/editor`}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    Ouvrir SQL Editor <ExternalLink className="ml-2 w-4 h-4" />
                  </a>
                </Button>
              </div>
            </div>

            {/* Étape 4 */}
            <div className="flex gap-4">
              <div className="flex-shrink-0 w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center">
                <Table className="w-6 h-6 text-orange-600" />
              </div>
              <div className="flex-1">
                <h3 className="text-xl font-bold mb-2">Étape 4: Vérification</h3>
                <p className="text-gray-600 mb-3">
                  Vérifiez que les tables profiles et audits sont créées
                </p>
                <Button asChild variant="outline">
                  <a 
                    href={`https://supabase.com/dashboard/project/${projectId}/editor`}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    Voir les Tables <ExternalLink className="ml-2 w-4 h-4" />
                  </a>
                </Button>
              </div>
            </div>

            <div className="bg-green-50 border border-green-200 rounded-lg p-6 flex gap-4">
              <CheckCircle2 className="w-6 h-6 text-green-600 flex-shrink-0" />
              <div>
                <h4 className="font-bold text-green-900 mb-2">Guide Complet</h4>
                <p className="text-green-800 text-sm">
                  Consultez le fichier CONFIGURATION_COMPLETE.md pour les instructions détaillées avec le script SQL complet.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
