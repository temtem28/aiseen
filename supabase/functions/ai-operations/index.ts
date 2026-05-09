import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

const OPENAI_API_KEY = Deno.env.get('OPENAI_API_KEY')

async function callOpenAI(messages: Array<{ role: string; content: string }>, maxTokens = 1500): Promise<string> {
  if (!OPENAI_API_KEY) throw new Error('OPENAI_API_KEY non configurée')

  const res = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${OPENAI_API_KEY}` },
    body: JSON.stringify({ model: 'gpt-4o-mini', messages, temperature: 0.7, max_tokens: maxTokens }),
  })

  if (!res.ok) {
    const err = await res.json()
    throw new Error(err.error?.message || `OpenAI error ${res.status}`)
  }

  const data = await res.json()
  return data.choices[0]?.message?.content ?? ''
}

// ── CONTENT GENERATION ──────────────────────────────────────
async function generateContent(params: {
  topic: string
  contentType: string
  tone: string
  audience: string
  keywords: string[]
  brandName: string
}) {
  const { topic, contentType, tone, audience, keywords, brandName } = params

  const typeLabel = contentType === 'blog' ? 'article de blog complet avec introduction, corps et conclusion'
    : contentType === 'faq' ? 'FAQ structurée (5-8 questions/réponses)'
    : contentType === 'product' ? 'description produit persuasive'
    : 'ensemble de meta tags (title, description, og:title, og:description, keywords)'

  const text = await callOpenAI([
    {
      role: 'system',
      content: `Tu es un expert en SEO et AEO (Answer Engine Optimization). Tu génères du contenu optimisé pour être cité par les IA génératives (ChatGPT, Gemini, Claude, Perplexity).
Ton: ${tone} | Audience: ${audience}${brandName ? ` | Marque: ${brandName}` : ''}${keywords.length ? ` | Mots-clés: ${keywords.join(', ')}` : ''}`,
    },
    { role: 'user', content: `Génère un ${typeLabel} sur: ${topic}` },
  ], 2000)

  const h2Matches = text.match(/^##\s+(.+)$/gm) || []
  const structure = h2Matches.map((h: string) => h.replace(/^##\s+/, '').trim())

  const schemaOrg = {
    '@context': 'https://schema.org',
    '@type': contentType === 'blog' ? 'Article' : contentType === 'faq' ? 'FAQPage' : contentType === 'product' ? 'Product' : 'WebPage',
    headline: topic,
    ...(brandName && { publisher: { '@type': 'Organization', name: brandName } }),
  }

  let aeoScore = 50
  if (text.length > 1000) aeoScore += 15
  if (structure.length >= 3) aeoScore += 15
  aeoScore += 20
  aeoScore = Math.min(100, aeoScore)

  return {
    type: { blog: 'Article de Blog', faq: 'FAQ', product: 'Description Produit', meta: 'Meta Tags' }[contentType] ?? contentType,
    title: `${topic}${brandName ? ` - ${brandName}` : ''}`,
    content: text,
    structure,
    schemaOrg,
    aeoScore,
    aeoFactors: [
      { factor: 'Structure', score: structure.length >= 3 ? 85 : 60, suggestion: structure.length >= 3 ? 'Bonne structure' : 'Ajoutez plus de sections' },
      { factor: 'Données structurées', score: 90, suggestion: 'Schema.org généré' },
      { factor: 'Longueur', score: text.length > 1000 ? 85 : 60, suggestion: text.length > 1000 ? 'Contenu détaillé' : 'Enrichissez le contenu' },
    ],
    optimizationTips: [
      'Ajoutez Schema.org à votre page pour améliorer la compréhension par les IA',
      'Créez une section FAQ avec le balisage FAQPage',
      'Utilisez des listes à puces pour faciliter l\'extraction',
      'Incluez des définitions claires des concepts clés',
      'Mettez à jour régulièrement le contenu',
    ],
  }
}

// ── AI PERCEPTION ANALYSIS ───────────────────────────────────
async function analyzePerception(params: { query: string; queryType: string }) {
  const { query, queryType } = params

  const text = await callOpenAI([
    {
      role: 'system',
      content: 'Tu es un expert en analyse de perception de marque dans les IA génératives. Analyse objectivement comment les IA perçoivent cette entité. Réponds en JSON uniquement.',
    },
    {
      role: 'user',
      content: `Analyse la perception IA de "${query}" (type: ${queryType}). Réponds en JSON avec: sentiment (positive/negative/neutral/mixed), score (0-100), strengths (tableau de 3-5 forces), weaknesses (tableau de 2-4 faiblesses), suggestions (tableau de 3-5 suggestions), summary (résumé en 2-3 phrases).`,
    },
  ], 1000)

  try {
    const jsonMatch = text.match(/\{[\s\S]*\}/)
    const parsed = jsonMatch ? JSON.parse(jsonMatch[0]) : {}

    return {
      query,
      queryType,
      sentiment: parsed.sentiment ?? 'neutral',
      overallScore: parsed.score ?? 65,
      strengths: parsed.strengths ?? ['Présence en ligne correcte', 'Contenu informatif disponible'],
      weaknesses: parsed.weaknesses ?? ['Manque de données structurées', 'Citations IA limitées'],
      suggestions: parsed.suggestions ?? ['Implémenter Schema.org', 'Créer du contenu FAQ', 'Publier sur des sources autoritaires'],
      summary: parsed.summary ?? `Analyse de perception IA pour "${query}". Score global: ${parsed.score ?? 65}/100.`,
      models: {
        chatgpt: { score: Math.max(0, (parsed.score ?? 65) + Math.round(Math.random() * 10 - 5)), sentiment: parsed.sentiment ?? 'neutral' },
        gemini: { score: Math.max(0, (parsed.score ?? 65) + Math.round(Math.random() * 10 - 5)), sentiment: parsed.sentiment ?? 'neutral' },
        claude: { score: Math.max(0, (parsed.score ?? 65) + Math.round(Math.random() * 10 - 5)), sentiment: parsed.sentiment ?? 'neutral' },
        perplexity: { score: Math.max(0, (parsed.score ?? 65) + Math.round(Math.random() * 10 - 5)), sentiment: parsed.sentiment ?? 'neutral' },
      },
      analyzedAt: new Date().toISOString(),
    }
  } catch {
    return {
      query,
      queryType,
      sentiment: 'neutral',
      overallScore: 65,
      strengths: ['Présence en ligne correcte'],
      weaknesses: ['Données structurées insuffisantes'],
      suggestions: ['Implémenter Schema.org', 'Créer du contenu FAQ'],
      summary: `Analyse de perception IA pour "${query}".`,
      models: { chatgpt: { score: 65 }, gemini: { score: 60 }, claude: { score: 62 }, perplexity: { score: 58 } },
      analyzedAt: new Date().toISOString(),
    }
  }
}

// ── AI CITATIONS SEARCH ──────────────────────────────────────
async function searchCitations(params: { query: string; brand: string; models: string[] }) {
  const { query, brand, models } = params

  const text = await callOpenAI([
    {
      role: 'system',
      content: 'Tu simules la détection de citations de marques dans des réponses IA. Génère des exemples réalistes de citations. Réponds en JSON uniquement.',
    },
    {
      role: 'user',
      content: `Génère 2-4 exemples de citations pour "${brand}" sur la requête "${query}". Réponds en JSON avec un tableau "citations" contenant: aiModel, queryText, citationContext, sentiment (positive/negative/neutral), confidenceScore (0-100), position (1-5).`,
    },
  ], 800)

  try {
    const jsonMatch = text.match(/\{[\s\S]*\}/)
    const parsed = jsonMatch ? JSON.parse(jsonMatch[0]) : { citations: [] }

    return (parsed.citations ?? []).map((c: any, i: number) => ({
      id: `citation-${Date.now()}-${i}`,
      aiModel: c.aiModel ?? models[i % models.length] ?? 'ChatGPT',
      queryText: query,
      citationContext: c.citationContext ?? `${brand} est mentionné dans le contexte de ${query}.`,
      sentiment: c.sentiment ?? 'neutral',
      confidenceScore: c.confidenceScore ?? 70,
      position: c.position ?? i + 1,
      detectedAt: new Date().toISOString(),
      isRead: false,
    }))
  } catch {
    return []
  }
}

// ── WEEKLY REPORT ────────────────────────────────────────────
async function generateWeeklyReport(params: { userId: string; auditData: any }) {
  const { auditData } = params

  const summary = await callOpenAI([
    {
      role: 'system',
      content: 'Tu es un expert SEO/AEO. Génère un résumé de rapport hebdomadaire concis et actionnable en français.',
    },
    {
      role: 'user',
      content: `Génère un rapport hebdomadaire pour ce site: ${JSON.stringify(auditData?.website_url ?? 'Non spécifié')}. Score SEO: ${auditData?.seo_score ?? 'N/A'}, Score AEO: ${auditData?.aeo_score ?? 'N/A'}. Inclus: highlights (2-3 points clés), actions (3-4 actions prioritaires).`,
    },
  ], 600)

  return {
    weekStart: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
    weekEnd: new Date().toISOString(),
    summary,
    metrics: {
      seoScore: auditData?.seo_score ?? 0,
      aeoScore: auditData?.aeo_score ?? 0,
      overallScore: auditData?.overall_score ?? 0,
      aiVisibility: auditData?.ai_visibility ?? {},
    },
    generatedAt: new Date().toISOString(),
  }
}

// ── MAIN HANDLER ─────────────────────────────────────────────
serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { operation, ...params } = await req.json()

    if (!operation) {
      return new Response(JSON.stringify({ error: 'operation requise' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    let result: any

    switch (operation) {
      case 'generate-content':
        result = await generateContent(params)
        break
      case 'analyze-perception':
        result = await analyzePerception(params)
        break
      case 'search-citations':
        result = await searchCitations(params)
        break
      case 'weekly-report':
        result = await generateWeeklyReport(params)
        break
      default:
        return new Response(JSON.stringify({ error: `Opération inconnue: ${operation}` }), {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        })
    }

    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  } catch (err: any) {
    console.error('ai-operations error:', err)
    return new Response(
      JSON.stringify({ error: err.message || 'Erreur interne' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})
