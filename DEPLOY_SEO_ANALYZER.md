# 🚀 Déploiement de l'Edge Function seo-analyzer

## Le problème

L'erreur "L'Edge Function d'analyse n'est pas encore déployée ou le serveur est inaccessible" signifie que la fonction `seo-analyzer` n'existe pas encore sur votre projet Supabase.

## Solution rapide (Script automatique)

Ouvrez un terminal dans le dossier du projet et exécutez :

```bash
chmod +x deploy-edge-function.sh && ./deploy-edge-function.sh
```

## Solution manuelle (étape par étape)

### Étape 1 : Installer Supabase CLI

```bash
npm install -g supabase
```

### Étape 2 : Se connecter à Supabase

```bash
supabase login
```

Cela ouvrira un navigateur pour vous authentifier.

### Étape 3 : Lier le projet

```bash
supabase link --project-ref qfytjeniqglpkjxddpma
```

Entrez le mot de passe de la base de données si demandé (ou appuyez sur Entrée pour ignorer).

### Étape 4 : Créer le dossier de la fonction

```bash
mkdir -p supabase/functions/seo-analyzer
```

### Étape 5 : Créer le fichier de la fonction

Créez le fichier `supabase/functions/seo-analyzer/index.ts` avec le contenu du fichier `EDGE_FUNCTIONS.md` (section "seo-analyzer/index.ts").

Ou copiez simplement le fichier généré par le script.

### Étape 6 : Déployer la fonction

```bash
supabase functions deploy seo-analyzer
```

### Étape 7 : Vérifier le déploiement

```bash
curl -X POST https://qfytjeniqglpkjxddpma.supabase.co/functions/v1/seo-analyzer \
  -H "Content-Type: application/json" \
  -d '{"url": "https://example.com"}'
```

Vous devriez recevoir une réponse JSON avec les scores SEO/AEO.

## Vérification dans Supabase Dashboard

1. Allez sur https://supabase.com/dashboard/project/qfytjeniqglpkjxddpma
2. Cliquez sur "Edge Functions" dans le menu de gauche
3. Vous devriez voir la fonction `seo-analyzer` listée

## Dépannage

### Erreur "supabase: command not found"

```bash
npm install -g supabase
```

### Erreur "Not logged in"

```bash
supabase login
```

### Erreur "Project not linked"

```bash
supabase link --project-ref qfytjeniqglpkjxddpma
```

### Erreur de déploiement

Vérifiez que le fichier `index.ts` ne contient pas d'erreurs de syntaxe :

```bash
deno check supabase/functions/seo-analyzer/index.ts
```

### La fonction est déployée mais retourne une erreur

Consultez les logs :

```bash
supabase functions logs seo-analyzer
```

## Alternative : Mode Simulation

Si vous ne pouvez pas déployer l'Edge Function, l'application propose un **mode simulation** qui génère des résultats d'exemple réalistes. Cliquez sur "Lancer la simulation" dans l'interface pour tester les fonctionnalités.

## URLs de référence

- **Edge Function URL** : `https://qfytjeniqglpkjxddpma.supabase.co/functions/v1/seo-analyzer`
- **Supabase Dashboard** : https://supabase.com/dashboard/project/qfytjeniqglpkjxddpma/functions
- **Documentation Supabase Edge Functions** : https://supabase.com/docs/guides/functions
