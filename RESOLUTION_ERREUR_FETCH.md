# 🔧 Résolution de l'erreur "Failed to fetch"

## ✅ Problème résolu

L'erreur `ERR_NAME_NOT_RESOLVED` était due à une **URL Supabase incorrecte** dans le fichier `.env`.

### ❌ URL incorrecte (avant)
```
VITE_SUPABASE_URL=https://qfytjeniqqlpkjxddpma.supabase.co
```
(Notez la faute : "qlp" au lieu de "glp")

### ✅ URL correcte (maintenant)
```
VITE_SUPABASE_URL=https://qfytjeniqglpkjxddpma.supabase.co
```

## 🔄 Actions effectuées

1. ✅ **Correction de l'URL Supabase** dans `.env`
2. ✅ **Ajout de la clé anon complète** dans `.env`
3. ✅ **Ajout de la clé OpenAI** dans `.env`
4. ✅ **Amélioration des messages d'erreur** dans Login.tsx et Signup.tsx
5. ✅ **Ajout de `.env` dans `.gitignore`** pour protéger les clés API

## 🚀 Prochaines étapes

### 1. Redémarrer l'application

**IMPORTANT** : Vous devez redémarrer le serveur de développement pour que les changements dans `.env` prennent effet.

```bash
# Arrêtez le serveur actuel (Ctrl+C)
# Puis redémarrez :
npm run dev
```

### 2. Vérifier la configuration Supabase

Assurez-vous que votre projet Supabase est **actif** :

👉 [Dashboard Supabase](https://supabase.com/dashboard/project/qfytjeniqglpkjxddpma)

Si le projet est en pause, vous devez le réactiver.

### 3. Configurer les Redirect URLs

Pour que l'authentification fonctionne, ajoutez ces URLs dans Supabase :

👉 [URL Configuration](https://supabase.com/dashboard/project/qfytjeniqglpkjxddpma/auth/url-configuration)

Ajoutez :
```
http://localhost:5173/**
https://visibility-seo-optimize-2.vercel.app/**
```

### 4. Tester la connexion

1. Allez sur : `http://localhost:5173/signup`
2. Créez un compte
3. Vérifiez votre email (ou dans Authentication > Users)
4. Connectez-vous !

## 🔍 Vérification

Pour vérifier que tout fonctionne, ouvrez la console du navigateur (F12) et vérifiez :

- ✅ Pas d'erreur `ERR_NAME_NOT_RESOLVED`
- ✅ Les requêtes vers `qfytjeniqglpkjxddpma.supabase.co` fonctionnent
- ✅ Les réponses HTTP sont 200 ou 201 (pas 404)

## 🆘 Si l'erreur persiste

1. **Vérifiez que le projet Supabase est actif**
   - Allez sur le dashboard
   - Si le projet est en pause, réactivez-le

2. **Vérifiez les variables d'environnement**
   ```bash
   # Dans la console du navigateur (F12)
   console.log(import.meta.env.VITE_SUPABASE_URL)
   ```
   Doit afficher : `https://qfytjeniqglpkjxddpma.supabase.co`

3. **Vérifiez la connexion réseau**
   - Testez l'URL directement : https://qfytjeniqglpkjxddpma.supabase.co/rest/v1/
   - Doit retourner une réponse (même si c'est une erreur 400)

4. **Vérifiez les Redirect URLs**
   - Dans Supabase > Authentication > URL Configuration
   - Assurez-vous que votre domaine est ajouté

## 📝 Configuration actuelle

```env
VITE_SUPABASE_URL=https://qfytjeniqglpkjxddpma.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
VITE_OPENAI_API_KEY=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
```
