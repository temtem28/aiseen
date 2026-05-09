#!/bin/bash
# ============================================================
# AI-SEEN — Script de déploiement complet
# Usage: bash deploy.sh
# ============================================================

set -e

PROJECT_REF="qfytjeniqglpkjxddpma"

echo ""
echo "========================================"
echo "  AI-SEEN — Déploiement"
echo "========================================"
echo ""

# ── 1. Vérifications préalables ──────────────────────────────
command -v supabase >/dev/null 2>&1 || { echo "❌ Supabase CLI non installé. Installez-le: https://supabase.com/docs/guides/cli"; exit 1; }
command -v npm >/dev/null 2>&1 || { echo "❌ npm non installé."; exit 1; }

# ── 2. Connexion et liaison Supabase ─────────────────────────
echo "📡 Connexion à Supabase..."
supabase login
supabase link --project-ref $PROJECT_REF

# ── 3. Secrets Supabase (Edge Functions) ─────────────────────
echo ""
echo "🔑 Configuration des secrets..."
echo "Entrez vos clés API (appuyez sur Entrée pour ignorer):"
echo ""

read -p "  OpenAI API Key (sk-...): " OPENAI_KEY
if [ -n "$OPENAI_KEY" ]; then
  supabase secrets set OPENAI_API_KEY="$OPENAI_KEY"
fi

read -p "  Stripe Secret Key (sk_test_... ou sk_live_...): " STRIPE_SECRET
if [ -n "$STRIPE_SECRET" ]; then
  supabase secrets set STRIPE_SECRET_KEY="$STRIPE_SECRET"
fi

read -p "  Stripe Webhook Secret (whsec_...): " STRIPE_WEBHOOK
if [ -n "$STRIPE_WEBHOOK" ]; then
  supabase secrets set STRIPE_WEBHOOK_SECRET="$STRIPE_WEBHOOK"
fi

read -p "  Stripe Price ID — Plan Découverte: " PRICE_DECOUVERTE
if [ -n "$PRICE_DECOUVERTE" ]; then
  supabase secrets set STRIPE_PRICE_DECOUVERTE="$PRICE_DECOUVERTE"
fi

read -p "  Stripe Price ID — Plan Croissance: " PRICE_CROISSANCE
if [ -n "$PRICE_CROISSANCE" ]; then
  supabase secrets set STRIPE_PRICE_CROISSANCE="$PRICE_CROISSANCE"
fi

read -p "  URL de l'application (ex: https://aiseen.vercel.app): " APP_URL
if [ -n "$APP_URL" ]; then
  supabase secrets set APP_URL="$APP_URL"
fi

# ── 4. Déploiement des Edge Functions ────────────────────────
echo ""
echo "🚀 Déploiement des Edge Functions..."
supabase functions deploy seo-analyzer --no-verify-jwt
supabase functions deploy save-audit
supabase functions deploy create-checkout-session
supabase functions deploy stripe-webhook --no-verify-jwt
supabase functions deploy ai-operations

echo "✅ Edge Functions déployées!"

# ── 5. Instructions base de données ──────────────────────────
echo ""
echo "========================================"
echo "📦 BASE DE DONNÉES"
echo "========================================"
echo ""
echo "Exécutez le script SQL dans le SQL Editor Supabase:"
echo "👉 https://supabase.com/dashboard/project/$PROJECT_REF/sql/new"
echo ""
echo "Copiez-collez le contenu de: supabase/database.sql"
echo ""

# ── 6. Build frontend ─────────────────────────────────────────
echo "========================================"
echo "🏗️  BUILD FRONTEND"
echo "========================================"
echo ""
echo "Assurez-vous que votre .env est configuré avec:"
echo "  VITE_SUPABASE_URL=https://$PROJECT_REF.supabase.co"
echo "  VITE_SUPABASE_ANON_KEY=..."
echo "  VITE_STRIPE_PUBLISHABLE_KEY=pk_..."
echo ""

read -p "Lancer le build? (o/N): " BUILD_CONFIRM
if [ "$BUILD_CONFIRM" = "o" ] || [ "$BUILD_CONFIRM" = "O" ]; then
  npm install
  npm run build
  echo "✅ Build terminé! Dossier: dist/"
fi

# ── 7. Déploiement Vercel ────────────────────────────────────
echo ""
echo "========================================"
echo "☁️  DÉPLOIEMENT VERCEL"
echo "========================================"
echo ""
echo "Options de déploiement:"
echo ""
echo "Option A — Vercel CLI:"
echo "  npm i -g vercel"
echo "  vercel --prod"
echo ""
echo "Option B — Git push (si connecté à Vercel):"
echo "  git push origin main"
echo ""

# ── 8. Stripe Webhook ────────────────────────────────────────
echo "========================================"
echo "💳 STRIPE WEBHOOK"
echo "========================================"
echo ""
echo "Dans le Dashboard Stripe, ajoutez un webhook:"
echo "URL: https://$PROJECT_REF.supabase.co/functions/v1/stripe-webhook"
echo ""
echo "Événements à écouter:"
echo "  - checkout.session.completed"
echo "  - customer.subscription.updated"
echo "  - customer.subscription.deleted"
echo "  - invoice.payment_failed"
echo ""
echo "👉 https://dashboard.stripe.com/webhooks"
echo ""

echo "========================================"
echo "✅ DÉPLOIEMENT TERMINÉ!"
echo "========================================"
echo ""
echo "Vérifications post-déploiement:"
echo "  1. Testez l'inscription: /signup"
echo "  2. Testez un audit: /audit"
echo "  3. Testez le paiement (mode test Stripe)"
echo "  4. Vérifiez les logs: supabase functions logs"
echo ""
