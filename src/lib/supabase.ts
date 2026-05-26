import { createClient } from '@supabase/supabase-js';

// Configuration Supabase - Projet GEO Audit IA
// Project ID: qfytjeniqglpkjxddpma
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://qfytjeniqglpkjxddpma.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFmeXRqZW5pcWdscGtqeGRkcG1hIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjQ2ODQwMjIsImV4cCI6MjA4MDI2MDAyMn0.kQVYnhYHAS27hqtOD3-qBpdGH5Qithl0zLhsS5Q4cC8';

// Supabase est maintenant configuré avec les vraies clés
export const isSupabaseConfigured = true;

// Create Supabase client with custom fetch to handle network errors
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true,
  },
  global: {
    headers: {
      'X-Client-Info': 'ai-focus-web',
    },
  },
});

// Helper to get Supabase Functions URL
export const getSupabaseFunctionsUrl = () => {
  return `${supabaseUrl}/functions/v1`;
};

// Helper to check if Supabase is reachable
export const checkSupabaseConnection = async (): Promise<boolean> => {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5000);
    
    const response = await fetch(`${supabaseUrl}/rest/v1/`, {
      method: 'HEAD',
      headers: {
        'apikey': supabaseAnonKey,
      },
      signal: controller.signal,
    });
    
    clearTimeout(timeoutId);
    return response.ok || response.status === 400; // 400 is expected without a table name
  } catch (error) {
    console.error('Supabase connection check failed:', error);
    return false;
  }
};

export type Profile = {
  id: string;
  email: string;
  full_name?: string;
  company?: string;
  website?: string;
  phone?: string;
  avatar_url?: string;
  plan?: 'free' | 'freemium' | 'decouverte' | 'croissance' | 'entreprise';
  credits_remaining?: number;
  created_at: string;
  updated_at: string;
};

export type Audit = {
  id: string;
  user_id: string;
  website_url: string;
  overall_score: number;
  seo_score: number;
  aeo_score: number;
  performance_score: number;
  ai_visibility: Record<string, number>;
  recommendations: Array<{ title: string; description: string; priority: string; category: string }>;
  metadata: Record<string, unknown>;
  analysis: Record<string, unknown>;
  seo_analysis: Record<string, unknown>;
  scraping_method?: string;
  is_simulation?: boolean;
  created_at: string;
  updated_at: string;
};

export type Subscription = {
  id: string;
  user_id: string;
  stripe_customer_id?: string;
  stripe_subscription_id?: string;
  plan: 'free' | 'freemium' | 'decouverte' | 'croissance' | 'entreprise';
  status: 'active' | 'canceled' | 'past_due' | 'trialing';
  current_period_end?: string;
  created_at: string;
  updated_at: string;
};

export type AICitation = {
  id: string;
  user_id: string;
  ai_model: string;
  query_text?: string;
  response_text?: string;
  citation_context?: string;
  sentiment: 'positive' | 'negative' | 'neutral';
  confidence_score: number;
  is_read: boolean;
  detected_at: string;
  created_at: string;
};
