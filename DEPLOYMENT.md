# 🚀 Guide de Déploiement Complet

## Projet Supabase
- **Project ID**: `qfytjeniqglpkjxddpma`
- **URL**: `https://qfytjeniqglpkjxddpma.supabase.co`
- **Dashboard**: https://supabase.com/dashboard/project/qfytjeniqglpkjxddpma

---

## 1. Configuration Supabase CLI

```bash
# Installer Supabase CLI
npm install -g supabase

# Se connecter
supabase login

# Lier au projet
supabase link --project-ref qfytjeniqglpkjxddpma
```

---

## 2. Déployer les Edge Functions

```bash
# Créer la structure
mkdir -p supabase/functions/run-audit
mkdir -p supabase/functions/create-checkout-session
mkdir -p supabase/functions/stripe-webhook

# Déployer toutes les fonctions
supabase functions deploy

# Ou individuellement
supabase functions deploy run-audit
supabase functions deploy create-checkout-session
supabase functions deploy stripe-webhook
```

> Voir `EDGE_FUNCTIONS.md` pour le code source.

---

## 3. Configurer les Secrets

```bash
# OpenAI (audits IA)
supabase secrets set OPENAI_API_KEY=sk-votre-cle-openai

# Stripe (paiements)
supabase secrets set STRIPE_SECRET_KEY=sk_live_votre-cle

# Webhook Stripe
supabase secrets set STRIPE_WEBHOOK_SECRET=whsec_xxx

# URL Frontend
supabase secrets set FRONTEND_URL=https://votre-app.vercel.app

# Vérifier
supabase secrets list
```

---

## 4. Webhook Stripe

1. [Stripe Dashboard > Webhooks](https://dashboard.stripe.com/webhooks)
2. URL: `https://qfytjeniqglpkjxddpma.supabase.co/functions/v1/stripe-webhook`
3. Événements: `checkout.session.completed`, `customer.subscription.updated`, `customer.subscription.deleted`

---

## 5. Déploiement Vercel

```bash
npm install -g vercel
vercel --prod

# Variables
vercel env add VITE_SUPABASE_URL production
# Valeur: https://qfytjeniqglpkjxddpma.supabase.co

vercel env add VITE_SUPABASE_ANON_KEY production
# Valeur: votre anon key
```

---

## Résumé Commandes

```bash
supabase login
supabase link --project-ref qfytjeniqglpkjxddpma
supabase functions deploy
supabase secrets set OPENAI_API_KEY=sk-xxx
supabase secrets set STRIPE_SECRET_KEY=sk_live_xxx
supabase secrets set STRIPE_WEBHOOK_SECRET=whsec_xxx
supabase secrets set FRONTEND_URL=https://xxx.vercel.app
vercel --prod
```
