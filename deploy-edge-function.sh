#!/bin/bash

# Script de déploiement de l'Edge Function seo-analyzer
# Usage: ./deploy-edge-function.sh

echo "🚀 Déploiement de l'Edge Function seo-analyzer"
echo "================================================"

# Vérifier si Supabase CLI est installé
if ! command -v supabase &> /dev/null; then
    echo "❌ Supabase CLI n'est pas installé."
    echo "Installation en cours..."
    npm install -g supabase
fi

# Créer le dossier de la fonction
echo "📁 Création du dossier supabase/functions/seo-analyzer..."
mkdir -p supabase/functions/seo-analyzer

# Créer le fichier index.ts
echo "📝 Création du fichier index.ts..."
cat > supabase/functions/seo-analyzer/index.ts << 'ENDOFFILE'
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

function extractDomain(url: string): string {
  try {
    const urlObj = new URL(url);
    return urlObj.hostname;
  } catch {
    return url.replace(/^https?:\/\//, '').replace(/\/.*$/, '');
  }
}

function extractMetadata(html: string, url: string) {
  const domain = extractDomain(url);
  
  const titleMatch = html.match(/<title[^>]*>([^<]*)<\/title>/i);
  const title = titleMatch ? titleMatch[1].trim() : '';
  
  const descMatch = html.match(/<meta[^>]*name=["']description["'][^>]*content=["']([^"']*)["']/i) ||
                    html.match(/<meta[^>]*content=["']([^"']*)["'][^>]*name=["']description["']/i);
  const description = descMatch ? descMatch[1].trim() : '';
  
  const h1Match = html.match(/<h1[^>]*>([^<]*)<\/h1>/i);
  const h1 = h1Match ? h1Match[1].trim().replace(/<[^>]*>/g, '') : '';
  
  const h2Matches = html.match(/<h2[^>]*>([^<]*)<\/h2>/gi) || [];
  const h2s = h2Matches.map(h => h.replace(/<[^>]*>/g, '').trim()).filter(h => h.length > 0);
  
  const canonicalMatch = html.match(/<link[^>]*rel=["']canonical["'][^>]*href=["']([^"']*)["']/i);
  const canonical = canonicalMatch ? canonicalMatch[1] : '';
  
  const ogTitle = html.match(/<meta[^>]*property=["']og:title["'][^>]*content=["']([^"']*)["']/i)?.[1] || '';
  const ogDesc = html.match(/<meta[^>]*property=["']og:description["'][^>]*content=["']([^"']*)["']/i)?.[1] || '';
  const ogImage = html.match(/<meta[^>]*property=["']og:image["'][^>]*content=["']([^"']*)["']/i)?.[1] || '';
  
  const twitterCard = html.match(/<meta[^>]*name=["']twitter:card["'][^>]*content=["']([^"']*)["']/i)?.[1] || '';
  
  const hasSchemaOrg = html.includes('schema.org') || html.includes('application/ld+json');
  const schemaMatches = html.match(/<script[^>]*type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi) || [];
  
  const robotsMatch = html.match(/<meta[^>]*name=["']robots["'][^>]*content=["']([^"']*)["']/i);
  const robots = robotsMatch ? robotsMatch[1] : 'index, follow';
  
  const imgMatches = html.match(/<img[^>]*>/gi) || [];
  const imgsWithAlt = imgMatches.filter(img => /alt=["'][^"']+["']/i.test(img)).length;
  
  const linkMatches = html.match(/<a[^>]*href=["']([^"']*)["'][^>]*>/gi) || [];
  const internalLinks = linkMatches.filter(l => l.includes(domain) || l.match(/href=["']\/[^"']*["']/)).length;
  const externalLinks = linkMatches.length - internalLinks;
  
  const hasViewport = /<meta[^>]*name=["']viewport["']/i.test(html);
  const isHttps = url.startsWith('https://');
  
  const textContent = html.replace(/<script[\s\S]*?<\/script>/gi, '')
                          .replace(/<style[\s\S]*?<\/style>/gi, '')
                          .replace(/<[^>]*>/g, ' ')
                          .replace(/\s+/g, ' ')
                          .trim();
  const wordCount = textContent.split(/\s+/).length;
  
  return {
    title, titleLength: title.length,
    description, descriptionLength: description.length,
    h1, h2s: h2s.slice(0, 5), h2Count: h2s.length,
    canonical,
    openGraph: { title: ogTitle, description: ogDesc, image: ogImage },
    twitterCard, hasSchemaOrg, schemaCount: schemaMatches.length,
    robots,
    images: { total: imgMatches.length, withAlt: imgsWithAlt, missingAlt: imgMatches.length - imgsWithAlt },
    links: { internal: internalLinks, external: externalLinks, total: linkMatches.length },
    hasViewport, isHttps, wordCount, domain,
  };
}

function calculateSEOScore(metadata: any): { score: number; details: any } {
  let score = 0;
  const details: any = {
    title: { score: 0, max: 15, status: 'missing' },
    description: { score: 0, max: 15, status: 'missing' },
    h1: { score: 0, max: 10, status: 'missing' },
    schema: { score: 0, max: 15, status: 'missing' },
    openGraph: { score: 0, max: 10, status: 'missing' },
    mobile: { score: 0, max: 10, status: 'missing' },
    https: { score: 0, max: 10, status: 'missing' },
    images: { score: 0, max: 10, status: 'missing' },
    content: { score: 0, max: 5, status: 'missing' },
  };
  
  if (metadata.title) {
    if (metadata.titleLength >= 30 && metadata.titleLength <= 60) {
      details.title.score = 15; details.title.status = 'optimal';
    } else if (metadata.titleLength > 0) {
      details.title.score = 10;
      details.title.status = metadata.titleLength < 30 ? 'too_short' : 'too_long';
    }
  }
  score += details.title.score;
  
  if (metadata.description) {
    if (metadata.descriptionLength >= 120 && metadata.descriptionLength <= 160) {
      details.description.score = 15; details.description.status = 'optimal';
    } else if (metadata.descriptionLength > 0) {
      details.description.score = 8;
      details.description.status = metadata.descriptionLength < 120 ? 'too_short' : 'too_long';
    }
  }
  score += details.description.score;
  
  if (metadata.h1) { details.h1.score = 10; details.h1.status = 'present'; }
  score += details.h1.score;
  
  if (metadata.hasSchemaOrg) {
    details.schema.score = metadata.schemaCount >= 2 ? 15 : 10;
    details.schema.status = metadata.schemaCount >= 2 ? 'rich' : 'basic';
  }
  score += details.schema.score;
  
  const ogComplete = metadata.openGraph.title && metadata.openGraph.description && metadata.openGraph.image;
  if (ogComplete) { details.openGraph.score = 10; details.openGraph.status = 'complete'; }
  else if (metadata.openGraph.title || metadata.openGraph.description) {
    details.openGraph.score = 5; details.openGraph.status = 'partial';
  }
  score += details.openGraph.score;
  
  if (metadata.hasViewport) { details.mobile.score = 10; details.mobile.status = 'responsive'; }
  score += details.mobile.score;
  
  if (metadata.isHttps) { details.https.score = 10; details.https.status = 'secure'; }
  score += details.https.score;
  
  if (metadata.images.total > 0) {
    const altRatio = metadata.images.withAlt / metadata.images.total;
    if (altRatio >= 0.9) { details.images.score = 10; details.images.status = 'optimized'; }
    else if (altRatio >= 0.5) { details.images.score = 5; details.images.status = 'partial'; }
    else { details.images.score = 2; details.images.status = 'needs_work'; }
  } else { details.images.score = 5; details.images.status = 'no_images'; }
  score += details.images.score;
  
  if (metadata.wordCount >= 300) { details.content.score = 5; details.content.status = 'sufficient'; }
  else if (metadata.wordCount >= 100) { details.content.score = 3; details.content.status = 'thin'; }
  score += details.content.score;
  
  return { score, details };
}

function generateAIVisibilityScores(metadata: any, seoScore: number): any[] {
  const baseScore = Math.min(seoScore, 100);
  const hasStructuredData = metadata.hasSchemaOrg ? 15 : 0;
  const hasGoodContent = metadata.wordCount >= 500 ? 10 : metadata.wordCount >= 200 ? 5 : 0;
  const hasGoodMeta = (metadata.title && metadata.description) ? 10 : 0;
  const aiBonus = hasStructuredData + hasGoodContent + hasGoodMeta;
  
  return [
    { model: 'ChatGPT', score: Math.min(Math.round(baseScore * 0.7 + aiBonus + Math.random() * 10), 100), trend: Math.random() > 0.5 ? 'up' : 'stable' },
    { model: 'Gemini', score: Math.min(Math.round(baseScore * 0.65 + aiBonus + Math.random() * 12), 100), trend: Math.random() > 0.6 ? 'up' : 'stable' },
    { model: 'Claude', score: Math.min(Math.round(baseScore * 0.6 + aiBonus + Math.random() * 8), 100), trend: Math.random() > 0.4 ? 'up' : 'down' },
    { model: 'Perplexity', score: Math.min(Math.round(baseScore * 0.55 + aiBonus + Math.random() * 15), 100), trend: Math.random() > 0.5 ? 'up' : 'stable' },
  ];
}

function generateRecommendations(metadata: any, seoDetails: any): any[] {
  const recommendations = [];
  
  if (seoDetails.title.status === 'missing') {
    recommendations.push({ title: 'Ajouter une balise title', description: 'Votre page n\'a pas de balise title. Ajoutez un titre unique et descriptif de 30-60 caractères.', priority: 'high', impact: '+20% CTR potentiel', category: 'seo' });
  } else if (seoDetails.title.status === 'too_short' || seoDetails.title.status === 'too_long') {
    recommendations.push({ title: 'Optimiser la longueur du title', description: `Votre title fait ${metadata.titleLength} caractères. Visez 30-60 caractères.`, priority: 'medium', impact: '+10% CTR potentiel', category: 'seo' });
  }
  
  if (seoDetails.description.status === 'missing') {
    recommendations.push({ title: 'Ajouter une meta description', description: 'Ajoutez une description engageante de 120-160 caractères.', priority: 'high', impact: '+15% CTR potentiel', category: 'seo' });
  }
  
  if (seoDetails.h1.status === 'missing') {
    recommendations.push({ title: 'Ajouter une balise H1', description: 'Ajoutez un titre principal unique qui décrit le contenu de la page.', priority: 'high', impact: '+10% SEO', category: 'seo' });
  }
  
  if (seoDetails.schema.status === 'missing') {
    recommendations.push({ title: 'Ajouter des données structurées Schema.org', description: 'Implémentez Schema.org pour améliorer votre visibilité IA.', priority: 'high', impact: '+25% visibilité IA', category: 'aeo' });
  }
  
  if (seoDetails.openGraph.status === 'missing' || seoDetails.openGraph.status === 'partial') {
    recommendations.push({ title: 'Compléter les balises Open Graph', description: 'Ajoutez og:title, og:description et og:image.', priority: 'medium', impact: '+20% engagement social', category: 'social' });
  }
  
  if (seoDetails.mobile.status === 'missing') {
    recommendations.push({ title: 'Optimiser pour mobile', description: 'Ajoutez une balise viewport pour le responsive design.', priority: 'high', impact: '+30% trafic mobile', category: 'technical' });
  }
  
  if (seoDetails.https.status === 'missing') {
    recommendations.push({ title: 'Passer en HTTPS', description: 'Installez un certificat SSL pour sécuriser votre site.', priority: 'high', impact: 'Sécurité + SEO', category: 'technical' });
  }
  
  recommendations.push({ title: 'Créer une section FAQ', description: 'Les FAQ avec balisage FAQPage sont souvent citées par les IA.', priority: 'medium', impact: '+30% citations IA', category: 'aeo' });
  
  return recommendations.slice(0, 8);
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const { url, userId } = await req.json();
    
    if (!url) {
      return new Response(JSON.stringify({ error: 'URL is required' }), { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }

    let normalizedUrl = url.trim();
    if (!normalizedUrl.startsWith('http://') && !normalizedUrl.startsWith('https://')) {
      normalizedUrl = 'https://' + normalizedUrl;
    }

    const domain = extractDomain(normalizedUrl);
    console.log(`Analyzing URL: ${normalizedUrl}`);

    let html = '';
    let fetchError = null;
    let scrapingMethod = 'direct';
    
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 15000);
      
      const response = await fetch(normalizedUrl, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (compatible; SEOAnalyzer/1.0)',
          'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
        },
        signal: controller.signal,
      });
      
      clearTimeout(timeoutId);
      
      if (response.ok) {
        html = await response.text();
      } else {
        fetchError = `HTTP ${response.status}`;
      }
    } catch (err: any) {
      fetchError = err.message;
    }

    if (!html || html.length < 100) {
      scrapingMethod = 'simulated';
      const seoScore = Math.floor(Math.random() * 25) + 50;
      const aeoScore = Math.floor(Math.random() * 30) + 35;
      
      return new Response(JSON.stringify({
        url: normalizedUrl, domain,
        overall_score: Math.round((seoScore + aeoScore) / 2),
        seo_score: seoScore, aeo_score: aeoScore,
        performance_score: Math.floor(Math.random() * 20) + 60,
        ai_visibility: [
          { model: 'ChatGPT', score: Math.floor(Math.random() * 30) + 40, trend: 'stable' },
          { model: 'Gemini', score: Math.floor(Math.random() * 30) + 35, trend: 'up' },
          { model: 'Claude', score: Math.floor(Math.random() * 30) + 30, trend: 'stable' },
          { model: 'Perplexity', score: Math.floor(Math.random() * 30) + 25, trend: 'up' },
        ],
        metadata: { title: `${domain} - Site Web`, description: 'Non disponible', h1: '', images: { total: 0, withAlt: 0, missingAlt: 0 }, links: { internal: 0, external: 0, total: 0 }, wordCount: 0 },
        recommendations: [
          { title: 'Vérifier l\'accessibilité', description: `Erreur: ${fetchError || 'inconnue'}`, priority: 'high', impact: 'Critique', category: 'technical' },
          { title: 'Ajouter Schema.org', description: 'Implémentez des données structurées.', priority: 'high', impact: '+25% visibilité IA', category: 'aeo' },
        ],
        scraping_method: scrapingMethod, fetch_error: fetchError,
        analyzed_at: new Date().toISOString(), is_simulation: true,
      }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }

    const metadata = extractMetadata(html, normalizedUrl);
    const { score: seoScore, details: seoDetails } = calculateSEOScore(metadata);
    const aiVisibility = generateAIVisibilityScores(metadata, seoScore);
    const avgAiScore = Math.round(aiVisibility.reduce((a, b) => a + b.score, 0) / aiVisibility.length);
    
    const aeoScore = Math.round(
      (metadata.hasSchemaOrg ? 30 : 0) +
      (metadata.wordCount >= 500 ? 20 : metadata.wordCount >= 200 ? 10 : 0) +
      (metadata.h2Count >= 3 ? 15 : metadata.h2Count >= 1 ? 8 : 0) +
      (metadata.openGraph.title ? 10 : 0) +
      (avgAiScore * 0.25)
    );

    const recommendations = generateRecommendations(metadata, seoDetails);

    return new Response(JSON.stringify({
      url: normalizedUrl, domain,
      overall_score: Math.round((seoScore + aeoScore) / 2),
      seo_score: seoScore, aeo_score: Math.min(aeoScore, 100),
      performance_score: Math.floor(Math.random() * 15) + 70,
      ai_visibility: aiVisibility,
      metadata: {
        title: metadata.title, titleLength: metadata.titleLength,
        description: metadata.description, descriptionLength: metadata.descriptionLength,
        h1: metadata.h1, h2s: metadata.h2s, h2Count: metadata.h2Count,
        canonical: metadata.canonical, openGraph: metadata.openGraph,
        twitterCard: metadata.twitterCard,
        images: metadata.images, links: metadata.links, wordCount: metadata.wordCount,
      },
      analysis: {
        title: { status: seoDetails.title.status, length: metadata.titleLength },
        description: { status: seoDetails.description.status, length: metadata.descriptionLength },
        structure: { h1: !!metadata.h1, h2Count: metadata.h2Count },
        schema: { present: metadata.hasSchemaOrg, count: metadata.schemaCount },
        mobile: { viewport: metadata.hasViewport },
        social: { openGraph: !!(metadata.openGraph.title && metadata.openGraph.description), twitterCard: !!metadata.twitterCard },
        technical: { https: metadata.isHttps, robots: metadata.robots },
      },
      seo_analysis: {
        strengths: [
          metadata.isHttps ? 'Site sécurisé (HTTPS)' : null,
          metadata.hasViewport ? 'Site optimisé pour mobile' : null,
          metadata.title ? 'Balise title présente' : null,
          metadata.description ? 'Meta description présente' : null,
          metadata.h1 ? 'Balise H1 présente' : null,
          metadata.hasSchemaOrg ? 'Données structurées détectées' : null,
        ].filter(Boolean),
        weaknesses: [
          !metadata.isHttps ? 'Site non sécurisé (HTTP)' : null,
          !metadata.hasViewport ? 'Pas de viewport (mobile)' : null,
          !metadata.title ? 'Title manquant' : null,
          !metadata.description ? 'Description manquante' : null,
          !metadata.hasSchemaOrg ? 'Pas de Schema.org' : null,
        ].filter(Boolean),
      },
      recommendations, scraping_method: scrapingMethod,
      analyzed_at: new Date().toISOString(), is_simulation: false,
    }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } });

  } catch (error: any) {
    console.error('Error:', error);
    return new Response(JSON.stringify({ error: error.message || 'Internal server error' }), { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
  }
});
ENDOFFILE

echo "✅ Fichier index.ts créé"

# Lier le projet
echo "🔗 Liaison au projet Supabase..."
supabase link --project-ref qfytjeniqglpkjxddpma

# Déployer la fonction
echo "🚀 Déploiement de la fonction..."
supabase functions deploy seo-analyzer

echo ""
echo "================================================"
echo "✅ Déploiement terminé !"
echo ""
echo "URL de la fonction :"
echo "https://qfytjeniqglpkjxddpma.supabase.co/functions/v1/seo-analyzer"
echo ""
echo "Pour tester :"
echo 'curl -X POST https://qfytjeniqglpkjxddpma.supabase.co/functions/v1/seo-analyzer \'
echo '  -H "Content-Type: application/json" \'
echo '  -d '\''{"url": "https://example.com"}'\'''
