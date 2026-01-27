# Configuration de la Base de Données Supabase

## Projet Supabase
- **Project ID**: `qfytjeniqglpkjxddpma`
- **SQL Editor**: https://supabase.com/dashboard/project/qfytjeniqglpkjxddpma/sql/new

---

## Étape 1: Créer les Tables

Allez dans SQL Editor et exécutez ce script:

```sql
-- Table des profils utilisateurs
CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  full_name TEXT,
  company_name TEXT,
  website_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Table des audits
CREATE TABLE audits (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  website_url TEXT NOT NULL,
  overall_score INTEGER,
  seo_score INTEGER,
  performance_score INTEGER,
  accessibility_score INTEGER,
  ai_visibility_score INTEGER,
  recommendations JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Table des subscriptions
CREATE TABLE subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  stripe_customer_id TEXT,
  stripe_subscription_id TEXT,
  plan TEXT DEFAULT 'free',
  status TEXT DEFAULT 'active',
  current_period_end TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index pour performances
CREATE INDEX idx_audits_user_id ON audits(user_id);
CREATE INDEX idx_audits_created_at ON audits(created_at DESC);
CREATE INDEX idx_subscriptions_user_id ON subscriptions(user_id);
```

---

## Étape 2: Activer Row Level Security (RLS)

```sql
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE audits ENABLE ROW LEVEL SECURITY;
ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;

-- Politiques profiles
CREATE POLICY "Users can view own profile" ON profiles
  FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can insert own profile" ON profiles
  FOR INSERT WITH CHECK (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON profiles
  FOR UPDATE USING (auth.uid() = id);

-- Politiques audits
CREATE POLICY "Users can view own audits" ON audits
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own audits" ON audits
  FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own audits" ON audits
  FOR UPDATE USING (auth.uid() = user_id);

-- Politiques subscriptions
CREATE POLICY "Users can view own subscription" ON subscriptions
  FOR SELECT USING (auth.uid() = user_id);
```

---

## Étape 3: Vérification

Vérifiez dans Table Editor que les tables sont créées:
https://supabase.com/dashboard/project/qfytjeniqglpkjxddpma/editor

✅ Base de données configurée!
