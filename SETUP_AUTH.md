# Configuration de l'Authentification Supabase pour AI Focus

## Projet Supabase
- **Project ID**: `qfytjeniqglpkjxddpma`
- **URL**: `https://qfytjeniqglpkjxddpma.supabase.co`
- **Dashboard**: https://supabase.com/dashboard/project/qfytjeniqglpkjxddpma

---

## Étape 1 : Configurer les variables d'environnement

1. Allez sur https://supabase.com/dashboard/project/qfytjeniqglpkjxddpma/settings/api
2. Copiez la clé **anon public**
3. Éditez le fichier `.env` :

```env
VITE_SUPABASE_URL=https://qfytjeniqglpkjxddpma.supabase.co
VITE_SUPABASE_ANON_KEY=votre_cle_anon
```

---

## Étape 2 : Configurer les URLs de redirection

1. Allez sur https://supabase.com/dashboard/project/qfytjeniqglpkjxddpma/auth/url-configuration
2. Ajoutez :
   - `http://localhost:5173/**` (développement)
   - `https://votre-domaine.com/**` (production)

---

## Étape 3 : Configurer Google OAuth (optionnel)

1. [Google Cloud Console](https://console.cloud.google.com) → Créer projet
2. Activez l'API Google+
3. Créez des identifiants OAuth 2.0
4. URI de redirection : `https://qfytjeniqglpkjxddpma.supabase.co/auth/v1/callback`
5. Dans Supabase **Authentication** > **Providers** > **Google**

---

## Fonctionnalités implémentées

### Pages
- ✅ **Login** (`/login`)
- ✅ **Signup** (`/signup`)
- ✅ **Reset Password** (`/reset-password`)
- ✅ **Verify Email** (`/verify-email`)

### Flux utilisateur
1. Inscription → Email → Vérification → Onboarding
2. Connexion → Dashboard
3. Mot de passe oublié → Email → Nouveau mot de passe

---

## Tester

```bash
npm run dev
```

1. http://localhost:5173/signup
2. Créez un compte
3. Vérifiez l'email (ou Authentication > Users)
4. Connectez-vous

---

## Sécurité

- Mots de passe hachés (bcrypt)
- Sessions JWT sécurisées
- Tokens auto-rafraîchis
- Protection CSRF
- Hébergement Europe (RGPD)

📖 [Documentation Supabase Auth](https://supabase.com/docs/guides/auth)
