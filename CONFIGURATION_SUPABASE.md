# 🚀 Configuration Supabase - GEO Audit IA

## ✅ Projet Configuré

| Paramètre | Valeur |
|-----------|--------|
| **Project ID** | `qfytjeniqglpkjxddpma` |
| **URL** | `https://qfytjeniqglpkjxddpma.supabase.co` |
| **Dashboard** | [Ouvrir](https://supabase.com/dashboard/project/qfytjeniqglpkjxddpma) |
| **Anon Key** | `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFmeXRqZW5pcWdscGtqeGRkcG1hIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjQ2ODQwMjIsImV4cCI6MjA4MDI2MDAyMn0.kQVYnhYHAS27hqtOD3-qBpdGH5Qithl0zLhsS5Q4cC8` |

---

## ✅ Configuration Terminée

Les fichiers suivants sont déjà configurés avec vos clés :
- `.env` - Variables d'environnement
- `src/lib/supabase.ts` - Client Supabase

---

## 🗄️ Étape Suivante : Créer les Tables

1. Ouvrez le SQL Editor : https://supabase.com/dashboard/project/qfytjeniqglpkjxddpma/sql/new

2. Exécutez le script SQL de `SETUP_DATABASE.md`

---

## 🔐 Configurer l'Authentification

1. Allez dans **Authentication** > **URL Configuration** :
   https://supabase.com/dashboard/project/qfytjeniqglpkjxddpma/auth/url-configuration

2. Ajoutez ces **Redirect URLs** :
```
http://localhost:5173/**
https://votre-app.vercel.app/**
```

---

## 🚀 Déployer les Edge Functions

```bash
# Se connecter à Supabase
supabase login

# Lier au projet
supabase link --project-ref qfytjeniqglpkjxddpma

# Définir les secrets
supabase secrets set OPENAI_API_KEY=sk-votre-cle
supabase secrets set STRIPE_SECRET_KEY=sk_test_xxx
supabase secrets set STRIPE_WEBHOOK_SECRET=whsec_xxx

# Déployer les fonctions
supabase functions deploy run-audit
supabase functions deploy create-checkout-session
supabase functions deploy stripe-webhook
```

---

## ✅ Tester

```bash
npm run dev
```

1. http://localhost:5173/signup - Créer un compte
2. Vérifier l'email
3. Se connecter !

---

## 🆘 Problèmes ?

| Erreur | Solution |
|--------|----------|
| "Failed to fetch" | Vérifiez `.env` |
| Email non reçu | Voir Authentication > Users |
| Redirection échoue | Vérifiez Redirect URLs |

📖 Guides : `SETUP_AUTH.md`, `SETUP_DATABASE.md`, `DEPLOYMENT.md`
