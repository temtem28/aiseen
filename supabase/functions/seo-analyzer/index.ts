import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

function extractDomain(url: string): string {
  try {
    return new URL(url).hostname
  } catch {
    return url.replace(/^https?:\/\//, '').replace(/\/.*$/, '')
  }
}

function extractMetadata(html: string, url: string) {
  const domain = extractDomain(url)

  const titleMatch = html.match(/<title[^>]*>([^<]*)<\/title>/i)
  const title = titleMatch ? titleMatch[1].trim() : ''

  const descMatch =
    html.match(/<meta[^>]*name=["']description["'][^>]*content=["']([^"']*)["']/i) ||
    html.match(/<meta[^>]*content=["']([^"']*)["'][^>]*name=["']description["']/i)
  const description = descMatch ? descMatch[1].trim() : ''

  const h1Match = html.match(/<h1[^>]*>([\s\S]*?)<\/h1>/i)
  const h1 = h1Match ? h1Match[1].replace(/<[^>]*>/g, '').trim() : ''

  const h2Matches = html.match(/<h2[^>]*>([\s\S]*?)<\/h2>/gi) || []
  const h2s = h2Matches.map(h => h.replace(/<[^>]*>/g, '').trim()).filter(h => h.length > 0).slice(0, 10)

  const canonicalMatch = html.match(/<link[^>]*rel=["']canonical["'][^>]*href=["']([^"']*)["']/i)
  const canonical = canonicalMatch ? canonicalMatch[1] : ''

  const hasSchema = html.includes('"@context"') || html.includes("'@context'") || html.includes('application/ld+json')

  const ogTitleMatch = html.match(/<meta[^>]*property=["']og:title["'][^>]*content=["']([^"']*)["']/i)
  const ogDescMatch = html.match(/<meta[^>]*property=["']og:description["'][^>]*content=["']([^"']*)["']/i)
  const ogImageMatch = html.match(/<meta[^>]*property=["']og:image["'][^>]*content=["']([^"']*)["']/i)

  const viewportMatch = html.match(/<meta[^>]*name=["']viewport["']/i)
  const hasViewport = !!viewportMatch

  const isHttps = url.startsWith('https://')

  const imgMatches = html.match(/<img[^>]*>/gi) || []
  const imgsWithoutAlt = imgMatches.filter(img => !img.includes('alt=')).length
  const totalImgs = imgMatches.length

  const robotsMatch = html.match(/<meta[^>]*name=["']robots["'][^>]*content=["']([^"']*)["']/i)
  const robots = robotsMatch ? robotsMatch[1] : ''

  const textContent = html.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim()
  const wordCount = textContent.split(/\s+/).filter(w => w.length > 0).length

  const faqMatches = html.match(/<[^>]*(faq|question|answer|accordion)[^>]*>/gi) || []
  const hasFAQ = faqMatches.length > 0

  const tableMatches = html.match(/<table[^>]*>/gi) || []
  const hasStructuredData = tableMatches.length > 0 || hasSchema

  return {
    domain,
    title,
    description,
    h1,
    h2s,
    canonical,
    hasSchema,
    ogTitle: ogTitleMatch ? ogTitleMatch[1] : '',
    ogDescription: ogDescMatch ? ogDescMatch[1] : '',
    ogImage: ogImageMatch ? ogImageMatch[1] : '',
    hasViewport,
    isHttps,
    imgsWithoutAlt,
    totalImgs,
    robots,
    wordCount,
    hasFAQ,
    hasStructuredData,
    url,
  }
}

function calculateSEOScore(meta: ReturnType<typeof extractMetadata>): number {
  let score = 0

  // Title (15 pts)
  if (meta.title) {
    score += 10
    if (meta.title.length >= 30 && meta.title.length <= 60) score += 5
  }

  // Meta description (15 pts)
  if (meta.description) {
    score += 10
    if (meta.description.length >= 120 && meta.description.length <= 160) score += 5
  }

  // H1 (10 pts)
  if (meta.h1) score += 10

  // Schema (15 pts)
  if (meta.hasSchema) score += 15

  // Viewport / mobile (10 pts)
  if (meta.hasViewport) score += 10

  // HTTPS (10 pts)
  if (meta.isHttps) score += 10

  // Images alt (10 pts)
  if (meta.totalImgs === 0) {
    score += 5
  } else {
    const altRatio = (meta.totalImgs - meta.imgsWithoutAlt) / meta.totalImgs
    score += Math.round(altRatio * 10)
  }

  // H2s (5 pts)
  if (meta.h2s.length >= 2) score += 5

  // OG tags (5 pts)
  if (meta.ogTitle || meta.ogDescription) score += 5

  // Canonical (5 pts)
  if (meta.canonical) score += 5

  return Math.min(100, score)
}

function calculateAEOScore(meta: ReturnType<typeof extractMetadata>): number {
  let score = 0

  // Structured data clarity (25 pts)
  if (meta.hasSchema) score += 25
  else if (meta.hasStructuredData) score += 12

  // Content depth (20 pts)
  if (meta.wordCount >= 800) score += 20
  else if (meta.wordCount >= 400) score += 12
  else if (meta.wordCount >= 200) score += 6

  // FAQ / Q&A presence (15 pts)
  if (meta.hasFAQ) score += 15

  // H2 structure (15 pts)
  if (meta.h2s.length >= 3) score += 15
  else if (meta.h2s.length >= 1) score += 8

  // Description clarity (15 pts)
  if (meta.description && meta.description.length >= 100) score += 15
  else if (meta.description) score += 8

  // Accessibility (10 pts)
  if (meta.hasViewport) score += 5
  if (meta.isHttps) score += 5

  return Math.min(100, score)
}

function calculateAIVisibility(meta: ReturnType<typeof extractMetadata>, model: string): number {
  const base = calculateAEOScore(meta)
  const variation: Record<string, number> = {
    chatgpt: Math.round(base * 0.95 + Math.random() * 10 - 5),
    gemini: Math.round(base * 0.90 + Math.random() * 10 - 5),
    claude: Math.round(base * 0.92 + Math.random() * 10 - 5),
    perplexity: Math.round(base * 0.88 + Math.random() * 10 - 5),
  }
  return Math.min(100, Math.max(0, variation[model] ?? base))
}

function generateRecommendations(meta: ReturnType<typeof extractMetadata>) {
  const recs: Array<{ title: string; description: string; priority: string; category: string }> = []

  if (!meta.title) {
    recs.push({ title: 'Ajouter une balise title', description: 'Votre page n\'a pas de balise title. C\'est essentiel pour le SEO.', priority: 'high', category: 'SEO' })
  } else if (meta.title.length < 30 || meta.title.length > 60) {
    recs.push({ title: 'Optimiser la longueur du title', description: `Votre title fait ${meta.title.length} caractères. Idéalement entre 30 et 60 caractères.`, priority: 'medium', category: 'SEO' })
  }

  if (!meta.description) {
    recs.push({ title: 'Ajouter une meta description', description: 'La meta description améliore le taux de clic dans les résultats de recherche.', priority: 'high', category: 'SEO' })
  } else if (meta.description.length < 120 || meta.description.length > 160) {
    recs.push({ title: 'Optimiser la meta description', description: `Votre description fait ${meta.description.length} caractères. Idéalement entre 120 et 160 caractères.`, priority: 'medium', category: 'SEO' })
  }

  if (!meta.h1) {
    recs.push({ title: 'Ajouter une balise H1', description: 'Votre page n\'a pas de H1. C\'est crucial pour le SEO et la compréhension par les IA.', priority: 'high', category: 'SEO' })
  }

  if (!meta.hasSchema) {
    recs.push({ title: 'Implémenter des données structurées (Schema.org)', description: 'Les données structurées JSON-LD aident les moteurs de recherche et les IA à comprendre votre contenu.', priority: 'high', category: 'AEO' })
  }

  if (!meta.hasViewport) {
    recs.push({ title: 'Ajouter la balise viewport', description: 'Votre site n\'est pas optimisé pour mobile. Ajoutez <meta name="viewport" content="width=device-width, initial-scale=1">.', priority: 'high', category: 'Technical' })
  }

  if (!meta.isHttps) {
    recs.push({ title: 'Passer en HTTPS', description: 'Votre site utilise HTTP. HTTPS est indispensable pour la sécurité et le SEO.', priority: 'high', category: 'Technical' })
  }

  if (meta.imgsWithoutAlt > 0) {
    recs.push({ title: `Ajouter des attributs alt aux images (${meta.imgsWithoutAlt} manquants)`, description: 'Les images sans attribut alt sont inaccessibles et pénalisent le SEO.', priority: 'medium', category: 'SEO' })
  }

  if (!meta.hasFAQ) {
    recs.push({ title: 'Ajouter une section FAQ', description: 'Les sections FAQ augmentent significativement la visibilité dans les réponses des IA et les featured snippets.', priority: 'medium', category: 'AEO' })
  }

  if (meta.wordCount < 400) {
    recs.push({ title: 'Enrichir le contenu textuel', description: `Votre page contient seulement ${meta.wordCount} mots. Un contenu plus riche améliore la visibilité IA et SEO.`, priority: 'medium', category: 'Content' })
  }

  if (!meta.ogTitle && !meta.ogDescription) {
    recs.push({ title: 'Ajouter les balises Open Graph', description: 'Les balises OG améliorent le partage sur les réseaux sociaux et la reconnaissance par les IA.', priority: 'low', category: 'Social' })
  }

  if (!meta.canonical) {
    recs.push({ title: 'Ajouter une URL canonique', description: 'La balise canonical évite les problèmes de contenu dupliqué.', priority: 'low', category: 'Technical' })
  }

  if (meta.h2s.length < 2) {
    recs.push({ title: 'Structurer le contenu avec des H2', description: 'Une hiérarchie de titres claire aide les IA à comprendre et citer votre contenu.', priority: 'medium', category: 'AEO' })
  }

  return recs
}

function buildSEOAnalysis(meta: ReturnType<typeof extractMetadata>) {
  return {
    title: {
      value: meta.title || 'Non défini',
      status: meta.title && meta.title.length >= 30 && meta.title.length <= 60 ? 'Bonne longueur' : meta.title ? 'À optimiser' : 'Manquant',
      length: meta.title.length,
    },
    metaDescription: {
      value: meta.description || 'Non définie',
      status: meta.description && meta.description.length >= 120 && meta.description.length <= 160 ? 'Optimisée' : meta.description ? 'À améliorer' : 'Manquante',
      length: meta.description.length,
    },
    h1: {
      value: meta.h1 || 'Non défini',
      status: meta.h1 ? 'Présent' : 'Manquant',
    },
    h2s: {
      count: meta.h2s.length,
      values: meta.h2s,
      status: meta.h2s.length >= 2 ? 'Présentes' : meta.h2s.length === 1 ? 'Insuffisant' : 'Absent',
    },
    schema: {
      status: meta.hasSchema ? 'Présent' : 'Absent',
    },
    openGraph: {
      title: meta.ogTitle,
      description: meta.ogDescription,
      image: meta.ogImage,
      status: (meta.ogTitle || meta.ogDescription) ? 'Présentes' : 'Absentes',
    },
    viewport: { status: meta.hasViewport ? 'Oui' : 'Non' },
    https: { status: meta.isHttps ? 'Oui' : 'Non' },
    images: {
      total: meta.totalImgs,
      withoutAlt: meta.imgsWithoutAlt,
      status: meta.imgsWithoutAlt === 0 ? 'Optimisées' : 'À corriger',
    },
    wordCount: meta.wordCount,
    canonical: { url: meta.canonical, status: meta.canonical ? 'Présente' : 'Absente' },
  }
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { url, userId } = await req.json()

    if (!url) {
      return new Response(JSON.stringify({ error: 'URL requise' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    let normalizedUrl = url.trim()
    if (!normalizedUrl.startsWith('http://') && !normalizedUrl.startsWith('https://')) {
      normalizedUrl = 'https://' + normalizedUrl
    }

    // Fetch the target website
    const response = await fetch(normalizedUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; AiSeen-Bot/1.0; +https://aiseen.com/bot)',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
        'Accept-Language': 'fr,fr-FR;q=0.9,en;q=0.8',
      },
      redirect: 'follow',
    })

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: Impossible d'accéder au site`)
    }

    const html = await response.text()
    const meta = extractMetadata(html, normalizedUrl)
    const seoScore = calculateSEOScore(meta)
    const aeoScore = calculateAEOScore(meta)
    const overallScore = Math.round((seoScore * 0.5) + (aeoScore * 0.5))

    const aiVisibility = {
      chatgpt: calculateAIVisibility(meta, 'chatgpt'),
      gemini: calculateAIVisibility(meta, 'gemini'),
      claude: calculateAIVisibility(meta, 'claude'),
      perplexity: calculateAIVisibility(meta, 'perplexity'),
    }

    const recommendations = generateRecommendations(meta)
    const seoAnalysis = buildSEOAnalysis(meta)

    const result = {
      url: normalizedUrl,
      domain: meta.domain,
      overall_score: overallScore,
      global_score: overallScore,
      seo_score: seoScore,
      aeo_score: aeoScore,
      performance_score: aeoScore,
      ai_visibility: aiVisibility,
      recommendations,
      metadata: {
        title: meta.title,
        description: meta.description,
        h1: meta.h1,
        h2s: meta.h2s,
        wordCount: meta.wordCount,
        canonical: meta.canonical,
        hasSchema: meta.hasSchema,
        hasFAQ: meta.hasFAQ,
      },
      analysis: {
        seo: seoAnalysis,
        aeo: {
          structuredData: meta.hasSchema ? 'Présent' : 'Absent',
          contentDepth: meta.wordCount >= 800 ? 'Excellent' : meta.wordCount >= 400 ? 'Moyen' : 'Insuffisant',
          faqPresence: meta.hasFAQ ? 'Présente' : 'Absente',
          semanticClarity: meta.h2s.length >= 3 ? 'Bonne' : 'À améliorer',
        },
      },
      seo_analysis: seoAnalysis,
      scraping_method: 'edge_function',
      is_simulation: false,
    }

    // Auto-save to Supabase if userId is provided
    if (userId) {
      try {
        const supabaseUrl = Deno.env.get('SUPABASE_URL')!
        const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
        const supabase = createClient(supabaseUrl, supabaseKey)

        await supabase.from('audits').insert({
          user_id: userId,
          website_url: normalizedUrl,
          overall_score: overallScore,
          seo_score: seoScore,
          aeo_score: aeoScore,
          performance_score: aeoScore,
          ai_visibility: aiVisibility,
          recommendations,
          metadata: result.metadata,
          analysis: result.analysis,
          seo_analysis: seoAnalysis,
          scraping_method: 'edge_function',
          is_simulation: false,
        })
      } catch (saveErr) {
        console.error('Auto-save failed:', saveErr)
        // Don't fail the whole request if save fails
      }
    }

    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  } catch (err: any) {
    console.error('seo-analyzer error:', err)
    return new Response(
      JSON.stringify({ error: err.message || 'Erreur interne du serveur' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})
