# 🔧 Configuration des APIs Réelles

## 📋 Variables d'Environnement Requises

Pour utiliser les fonctionnalités avec de vraies données, vous devez configurer les clés API suivantes dans votre fichier `.env` :

```env
# OpenAI API (requis pour génération de contenu et perception IA)
VITE_OPENAI_API_KEY=sk-votre-cle-openai-ici

# Anthropic API (optionnel - pour Claude)
VITE_ANTHROPIC_API_KEY=votre-cle-anthropic-ici

# Google API (optionnel - pour Gemini)
VITE_GOOGLE_API_KEY=votre-cle-google-ici
```

## 🔑 Obtenir les Clés API

### OpenAI API Key
1. Allez sur https://platform.openai.com/api-keys
2. Créez un compte ou connectez-vous
3. Cliquez sur "Create new secret key"
4. Copiez la clé (commence par `sk-`)
5. Ajoutez-la dans `.env` comme `VITE_OPENAI_API_KEY`

**Note**: OpenAI facture à l'usage. Consultez leurs tarifs sur https://openai.com/pricing

### Anthropic API Key (Optionnel)
1. Allez sur https://console.anthropic.com/
2. Créez un compte
3. Générez une clé API
4. Ajoutez-la dans `.env` comme `VITE_ANTHROPIC_API_KEY`

### Google API Key (Optionnel)
1. Allez sur https://console.cloud.google.com/
2. Créez un projet
3. Activez l'API Gemini
4. Créez une clé API
5. Ajoutez-la dans `.env` comme `VITE_GOOGLE_API_KEY`

## ✅ Fonctionnalités Utilisant les APIs Réelles

### 1. **Audit SEO/AEO** ✅
- **API utilisée**: Fetch direct du site web
- **Pas de clé API requise** - fonctionne directement
- Fait un vrai scraping HTML et analyse les métadonnées
- Calcule les scores SEO/AEO basés sur de vraies données

### 2. **Générateur de Contenu** ✅
- **API utilisée**: OpenAI GPT-4
- **Clé requise**: `VITE_OPENAI_API_KEY`
- Génère du vrai contenu optimisé AEO avec OpenAI
- Crée des Schema.org JSON-LD réels

### 3. **Perception IA** ✅
- **API utilisée**: OpenAI GPT-4
- **Clé requise**: `VITE_OPENAI_API_KEY`
- Fait de vraies requêtes à ChatGPT pour analyser la perception
- Analyse réelle du sentiment et des forces/faiblesses

### 4. **Citations IA** ✅
- **API utilisée**: OpenAI GPT-4
- **Clé requise**: `VITE_OPENAI_API_KEY`
- Recherche réelle de mentions de votre marque dans les réponses IA
- Détecte les vraies citations avec contexte et position

### 5. **Analyse Concurrentielle** ✅
- **API utilisée**: Fetch direct + analyse SEO/AEO
- **Pas de clé API requise** - utilise l'audit SEO/AEO réel
- Analyse vraiment chaque site concurrent
- Compare les vraies métriques

### 6. **Rapports Hebdomadaires** ✅
- **API utilisée**: OpenAI GPT-4 (optionnel) + données réelles
- **Clé requise**: `VITE_OPENAI_API_KEY` (pour le résumé exécutif)
- Génère des rapports basés sur de vraies données d'audits
- Utilise OpenAI pour générer le résumé exécutif si disponible

## 🚀 Démarrage Rapide

1. **Créez un compte OpenAI** (si pas déjà fait)
   - https://platform.openai.com/signup
   - Ajoutez des crédits si nécessaire

2. **Configurez `.env`**
   ```env
   VITE_OPENAI_API_KEY=sk-votre-cle-ici
   ```

3. **Redémarrez l'application**
   ```bash
   npm run dev
   ```

4. **Testez une fonctionnalité**
   - Allez sur "Générateur de Contenu"
   - Entrez un sujet
   - Cliquez sur "Générer"
   - Le contenu sera généré avec OpenAI !

## ⚠️ Important

- **Coûts**: Les APIs OpenAI sont payantes. Consultez les tarifs avant d'utiliser en production.
- **Limites de taux**: Respectez les limites de votre plan OpenAI.
- **Sécurité**: Ne commitez JAMAIS votre fichier `.env` avec les clés API.
- **Fallback**: Si une clé API n'est pas configurée, l'application affichera une erreur claire.

## 🔒 Sécurité

Les clés API sont exposées côté client (préfixe `VITE_`). Pour la production, considérez :
- Utiliser les Edge Functions Supabase pour garder les clés secrètes
- Implémenter un proxy backend pour les appels API
- Utiliser des variables d'environnement serveur uniquement

## 📊 Coûts Estimés (OpenAI)

- **GPT-4**: ~$0.03 par 1K tokens d'entrée, ~$0.06 par 1K tokens de sortie
- **Génération de contenu**: ~$0.10-0.50 par génération (selon longueur)
- **Perception IA**: ~$0.05-0.15 par analyse
- **Citations IA**: ~$0.05-0.20 par scan (10 requêtes)

**Recommandation**: Commencez avec un plan pay-as-you-go et surveillez l'usage.
