# ⚡ CONFIGURATION SUPABASE - GUIDE RAPIDE

## 🎯 Projet AI Focus déjà configuré !

- **Project ID**: `qfytjeniqglpkjxddpma`
- **URL**: `https://qfytjeniqglpkjxddpma.supabase.co`
- **Dashboard**: https://supabase.com/dashboard/project/qfytjeniqglpkjxddpma

---

## ✅ ÉTAPE 1 : Récupérer la clé API (30 sec)

1. Allez sur : https://supabase.com/dashboard/project/qfytjeniqglpkjxddpma/settings/api
2. Copiez la clé **"anon public"** : `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...`

---

## ✅ ÉTAPE 2 : Configurer .env (30 sec)

Le fichier `.env` existe déjà. Ouvrez-le et remplacez `YOUR_ANON_KEY_HERE` :

```env
VITE_SUPABASE_URL=https://qfytjeniqglpkjxddpma.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.votre_cle_complete
```

Sauvegardez le fichier (Ctrl+S).

---

## ✅ ÉTAPE 3 : Configurer les URLs de redirection (30 sec)

1. Allez sur : https://supabase.com/dashboard/project/qfytjeniqglpkjxddpma/auth/url-configuration
2. Dans **"Redirect URLs"**, ajoutez :
```
http://localhost:5173/**
https://votre-app.vercel.app/**
```
3. Cliquez **"Save"**

---

## ✅ ÉTAPE 4 : Créer les tables (1 min)

1. Allez sur : https://supabase.com/dashboard/project/qfytjeniqglpkjxddpma/sql/new
2. Copiez le script SQL de `SETUP_DATABASE.md`
3. Cliquez **"Run"**

---

## ✅ ÉTAPE 5 : Redémarrer l'application

```bash
npm run dev
```

Ouvrez : **http://localhost:5173**

---

## 🎉 TESTER

1. Allez sur : http://localhost:5173/signup
2. Créez un compte
3. Vérifiez l'email (ou dans Authentication > Users)
4. Connectez-vous sur http://localhost:5173/login
5. ✅ Accédez au dashboard !

---

## 🆘 PROBLÈMES ?

| Erreur | Solution |
|--------|----------|
| "Failed to fetch" | Vérifiez `.env` et redémarrez |
| "Email not confirmed" | Authentication > Users > Verify |
| Redirection échoue | Vérifiez Redirect URLs |

📖 Guide détaillé : `SETUP_AUTH.md`
