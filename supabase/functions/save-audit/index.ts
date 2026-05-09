import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    const supabase = createClient(supabaseUrl, supabaseKey)

    const { userId, results } = await req.json()

    if (!userId || !results) {
      return new Response(
        JSON.stringify({ error: 'userId et results sont requis' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const { data, error } = await supabase.from('audits').insert({
      user_id: userId,
      website_url: results.url || results.domain,
      overall_score: results.overall_score ?? results.global_score ?? 0,
      seo_score: results.seo_score ?? 0,
      aeo_score: results.aeo_score ?? results.performance_score ?? 0,
      performance_score: results.performance_score ?? results.aeo_score ?? 0,
      ai_visibility: results.ai_visibility ?? {},
      recommendations: results.recommendations ?? [],
      metadata: results.metadata ?? {},
      analysis: results.analysis ?? {},
      seo_analysis: results.seo_analysis ?? {},
      scraping_method: results.scraping_method ?? 'direct',
      is_simulation: results.is_simulation ?? false,
    }).select().single()

    if (error) {
      console.error('Save audit error:', error)
      return new Response(
        JSON.stringify({ error: error.message }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    return new Response(
      JSON.stringify({ success: true, audit: data }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  } catch (err: any) {
    console.error('save-audit error:', err)
    return new Response(
      JSON.stringify({ error: err.message || 'Erreur interne' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})
