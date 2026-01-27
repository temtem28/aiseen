import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, 
  FileText, 
  HelpCircle, 
  ShoppingBag, 
  Tag,
  Sparkles,
  Copy,
  Check,
  Download,
  RefreshCw,
  Code,
  Lightbulb,
  BarChart3,
  ChevronDown,
  ChevronUp,
  Plus,
  X
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { supabase } from '@/lib/supabase';
import { generateRealContent } from '@/lib/apiServices';
import { useToast } from '@/hooks/use-toast';

interface AEOFactor {
  factor: string;
  score: number;
  suggestion: string;
}

interface GeneratedContent {
  type: string;
  title: string;
  content: string;
  structure: string[];
  schemaOrg: object;
  aeoScore: number;
  aeoFactors: AEOFactor[];
  optimizationTips: string[];
}

const contentTypes = [
  {
    id: 'blog',
    name: 'Article de Blog',
    description: 'Article complet optimisé pour les moteurs de réponse IA',
    icon: FileText,
    color: 'text-blue-400',
    bgColor: 'bg-blue-500/10'
  },
  {
    id: 'faq',
    name: 'FAQ',
    description: 'Questions fréquentes pour les featured snippets',
    icon: HelpCircle,
    color: 'text-emerald-400',
    bgColor: 'bg-emerald-500/10'
  },
  {
    id: 'product',
    name: 'Description Produit',
    description: 'Fiche produit e-commerce optimisée',
    icon: ShoppingBag,
    color: 'text-purple-400',
    bgColor: 'bg-purple-500/10'
  },
  {
    id: 'meta',
    name: 'Meta Tags',
    description: 'Balises meta et descriptions SEO',
    icon: Tag,
    color: 'text-orange-400',
    bgColor: 'bg-orange-500/10'
  }
];

const toneOptions = [
  'Professionnel',
  'Conversationnel',
  'Technique',
  'Enthousiaste',
  'Formel',
  'Décontracté'
];

const audienceOptions = [
  'Grand public',
  'Professionnels B2B',
  'Développeurs',
  'Entrepreneurs',
  'Étudiants',
  'Seniors'
];

export default function ContentGenerator() {
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [topic, setTopic] = useState('');
  const [selectedType, setSelectedType] = useState<string>('blog');
  const [tone, setTone] = useState('Professionnel');
  const [audience, setAudience] = useState('Grand public');
  const [brandName, setBrandName] = useState('');
  const [keywords, setKeywords] = useState<string[]>([]);
  const [newKeyword, setNewKeyword] = useState('');
  const [showAdvanced, setShowAdvanced] = useState(false);
  
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedContent, setGeneratedContent] = useState<GeneratedContent | null>(null);
  const [copiedSection, setCopiedSection] = useState<string | null>(null);

  const addKeyword = () => {
    if (newKeyword.trim() && keywords.length < 10) {
      setKeywords([...keywords, newKeyword.trim()]);
      setNewKeyword('');
    }
  };

  const removeKeyword = (index: number) => {
    setKeywords(keywords.filter((_, i) => i !== index));
  };


  const handleGenerate = async () => {
    if (!topic.trim()) {
      toast({
        title: "Sujet requis",
        description: "Veuillez entrer un sujet ou mot-clé pour générer du contenu.",
        variant: "destructive"
      });
      return;
    }

    setIsGenerating(true);
    setGeneratedContent(null);

    try {
      // Try Edge Function first
      let generatedContent: GeneratedContent | null = null;
      
      try {
        const { data, error } = await supabase.functions.invoke('content-generator', {
          body: {
            topic: topic.trim(),
            contentType: selectedType,
            tone: tone.toLowerCase(),
            targetAudience: audience.toLowerCase(),
            keywords,
            brandName: brandName.trim()
          }
        });

        if (!error && data?.success && data.generatedContent) {
          generatedContent = data.generatedContent;
        } else {
          throw new Error('Edge Function error');
        }
      } catch (edgeFunctionError: any) {
        // If Edge Function fails, use direct API service
        console.log('Edge Function not available, using direct API service');
        generatedContent = await generateRealContent(
          topic.trim(),
          selectedType,
          tone,
          audience,
          keywords,
          brandName.trim()
        );
      }

      if (generatedContent) {
        setGeneratedContent(generatedContent);
        toast({
          title: "Contenu généré !",
          description: `Votre ${contentTypes.find(t => t.id === selectedType)?.name.toLowerCase()} a été créé avec succès.`
        });
      } else {
        throw new Error('Aucun contenu généré');
      }
    } catch (error: any) {
      console.error('Generation error:', error);
      toast({
        title: "Erreur de génération",
        description: error.message || "Une erreur est survenue lors de la génération du contenu. Vérifiez que VITE_OPENAI_API_KEY est configurée.",
        variant: "destructive"
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const copyToClipboard = async (text: string, section: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedSection(section);
      setTimeout(() => setCopiedSection(null), 2000);
      toast({
        title: "Copié !",
        description: "Le contenu a été copié dans le presse-papiers."
      });
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Impossible de copier le contenu.",
        variant: "destructive"
      });
    }
  };

  const downloadContent = () => {
    if (!generatedContent) return;
    
    const blob = new Blob([generatedContent.content], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${generatedContent.title.replace(/[^a-z0-9]/gi, '_').toLowerCase()}.md`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const downloadSchema = () => {
    if (!generatedContent) return;
    
    const blob = new Blob([JSON.stringify(generatedContent.schemaOrg, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'schema-org.json';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const getScoreColor = (score: number) => {
    if (score >= 85) return 'text-emerald-400';
    if (score >= 70) return 'text-yellow-400';
    return 'text-red-400';
  };

  const getScoreBgColor = (score: number) => {
    if (score >= 85) return 'bg-emerald-500/20';
    if (score >= 70) return 'bg-yellow-500/20';
    return 'bg-red-500/20';
  };

  return (
    <div className="min-h-screen bg-[#0a0a0f] text-white">
      {/* Header */}
      <header className="border-b border-gray-800 bg-[#0d0d14]/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => navigate('/dashboard')}
                className="text-gray-400 hover:text-white"
              >
                <ArrowLeft className="h-5 w-5" />
              </Button>
              <div>
                <h1 className="text-xl font-bold bg-gradient-to-r from-pink-400 to-purple-400 bg-clip-text text-transparent">
                  Générateur de Contenu AEO
                </h1>
                <p className="text-sm text-gray-400">Créez du contenu optimisé pour les moteurs de réponse IA</p>
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Panel - Form */}
          <div className="lg:col-span-1 space-y-6">
            {/* Content Type Selection */}
            <Card className="bg-[#12121a] border-gray-800">
              <CardHeader>
                <CardTitle className="text-lg text-white flex items-center gap-2">
                  <Sparkles className="h-5 w-5 text-pink-400" />
                  Type de Contenu
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {contentTypes.map((type) => (
                  <button
                    key={type.id}
                    onClick={() => setSelectedType(type.id)}
                    className={`w-full p-4 rounded-lg border transition-all text-left ${
                      selectedType === type.id
                        ? 'border-pink-500 bg-pink-500/10'
                        : 'border-gray-700 hover:border-gray-600 bg-gray-800/30'
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <div className={`p-2 rounded-lg ${type.bgColor}`}>
                        <type.icon className={`h-5 w-5 ${type.color}`} />
                      </div>
                      <div>
                        <h3 className="font-medium text-white">{type.name}</h3>
                        <p className="text-sm text-gray-400">{type.description}</p>
                      </div>
                    </div>
                  </button>
                ))}
              </CardContent>
            </Card>

            {/* Topic Input */}
            <Card className="bg-[#12121a] border-gray-800">
              <CardHeader>
                <CardTitle className="text-lg text-white">Sujet / Mot-clé</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <Textarea
                  placeholder="Ex: Comment optimiser son site pour ChatGPT, iPhone 15 Pro Max, Guide du marketing digital..."
                  value={topic}
                  onChange={(e) => setTopic(e.target.value)}
                  className="bg-gray-800/50 border-gray-700 text-white min-h-[100px]"
                />

                {/* Advanced Options Toggle */}
                <button
                  onClick={() => setShowAdvanced(!showAdvanced)}
                  className="flex items-center gap-2 text-sm text-gray-400 hover:text-white transition-colors"
                >
                  {showAdvanced ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                  Options avancées
                </button>

                {showAdvanced && (
                  <div className="space-y-4 pt-2">
                    {/* Brand Name */}
                    <div>
                      <label className="text-sm text-gray-400 mb-2 block">Nom de marque (optionnel)</label>
                      <Input
                        placeholder="Votre marque"
                        value={brandName}
                        onChange={(e) => setBrandName(e.target.value)}
                        className="bg-gray-800/50 border-gray-700 text-white"
                      />
                    </div>

                    {/* Tone */}
                    <div>
                      <label className="text-sm text-gray-400 mb-2 block">Ton</label>
                      <div className="flex flex-wrap gap-2">
                        {toneOptions.map((t) => (
                          <button
                            key={t}
                            onClick={() => setTone(t)}
                            className={`px-3 py-1.5 rounded-full text-sm transition-colors ${
                              tone === t
                                ? 'bg-pink-500 text-white'
                                : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                            }`}
                          >
                            {t}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Audience */}
                    <div>
                      <label className="text-sm text-gray-400 mb-2 block">Audience cible</label>
                      <div className="flex flex-wrap gap-2">
                        {audienceOptions.map((a) => (
                          <button
                            key={a}
                            onClick={() => setAudience(a)}
                            className={`px-3 py-1.5 rounded-full text-sm transition-colors ${
                              audience === a
                                ? 'bg-purple-500 text-white'
                                : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                            }`}
                          >
                            {a}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Keywords */}
                    <div>
                      <label className="text-sm text-gray-400 mb-2 block">Mots-clés à intégrer</label>
                      <div className="flex gap-2 mb-2">
                        <Input
                          placeholder="Ajouter un mot-clé"
                          value={newKeyword}
                          onChange={(e) => setNewKeyword(e.target.value)}
                          onKeyPress={(e) => e.key === 'Enter' && addKeyword()}
                          className="bg-gray-800/50 border-gray-700 text-white flex-1"
                        />
                        <Button
                          onClick={addKeyword}
                          size="icon"
                          variant="outline"
                          className="border-gray-700"
                        >
                          <Plus className="h-4 w-4" />
                        </Button>
                      </div>
                      {keywords.length > 0 && (
                        <div className="flex flex-wrap gap-2">
                          {keywords.map((kw, index) => (
                            <Badge
                              key={index}
                              variant="secondary"
                              className="bg-gray-700 text-gray-200 flex items-center gap-1"
                            >
                              {kw}
                              <button onClick={() => removeKeyword(index)}>
                                <X className="h-3 w-3" />
                              </button>
                            </Badge>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Generate Button */}
            <Button
              onClick={handleGenerate}
              disabled={isGenerating || !topic.trim()}
              className="w-full bg-gradient-to-r from-pink-500 to-purple-500 hover:from-pink-600 hover:to-purple-600 text-white py-6 text-lg"
            >
              {isGenerating ? (
                <>
                  <RefreshCw className="h-5 w-5 mr-2 animate-spin" />
                  Génération en cours...
                </>
              ) : (
                <>
                  <Sparkles className="h-5 w-5 mr-2" />
                  Générer le Contenu
                </>
              )}
            </Button>
          </div>

          {/* Right Panel - Results */}
          <div className="lg:col-span-2">
            {isGenerating ? (
              <Card className="bg-[#12121a] border-gray-800">
                <CardContent className="py-16">
                  <div className="text-center space-y-6">
                    <div className="relative mx-auto w-24 h-24">
                      <div className="absolute inset-0 rounded-full border-4 border-gray-700"></div>
                      <div className="absolute inset-0 rounded-full border-4 border-pink-500 border-t-transparent animate-spin"></div>
                      <Sparkles className="absolute inset-0 m-auto h-10 w-10 text-pink-400" />
                    </div>
                    <div>
                      <h3 className="text-xl font-semibold text-white mb-2">Génération en cours...</h3>
                      <p className="text-gray-400">Notre IA analyse votre sujet et crée du contenu optimisé AEO</p>
                    </div>
                    <div className="max-w-md mx-auto space-y-3">
                      <div className="flex items-center gap-3">
                        <div className="h-2 w-2 rounded-full bg-pink-500 animate-pulse"></div>
                        <span className="text-sm text-gray-400">Analyse du sujet et des mots-clés</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="h-2 w-2 rounded-full bg-purple-500 animate-pulse" style={{ animationDelay: '0.2s' }}></div>
                        <span className="text-sm text-gray-400">Structuration du contenu</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="h-2 w-2 rounded-full bg-blue-500 animate-pulse" style={{ animationDelay: '0.4s' }}></div>
                        <span className="text-sm text-gray-400">Optimisation pour les IA</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" style={{ animationDelay: '0.6s' }}></div>
                        <span className="text-sm text-gray-400">Génération du schema.org</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ) : generatedContent ? (
              <div className="space-y-6">
                {/* Score Card */}
                <Card className="bg-[#12121a] border-gray-800">
                  <CardContent className="py-6">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className={`p-4 rounded-xl ${getScoreBgColor(generatedContent.aeoScore)}`}>
                          <BarChart3 className={`h-8 w-8 ${getScoreColor(generatedContent.aeoScore)}`} />
                        </div>
                        <div>
                          <p className="text-sm text-gray-400">Score de Prédiction AEO</p>
                          <div className="flex items-baseline gap-2">
                            <span className={`text-4xl font-bold ${getScoreColor(generatedContent.aeoScore)}`}>
                              {generatedContent.aeoScore}
                            </span>
                            <span className="text-gray-400">/100</span>
                          </div>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={downloadContent}
                          className="border-gray-700"
                        >
                          <Download className="h-4 w-4 mr-2" />
                          Markdown
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={downloadSchema}
                          className="border-gray-700"
                        >
                          <Code className="h-4 w-4 mr-2" />
                          Schema.org
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Content Tabs */}
                <Tabs defaultValue="content" className="w-full">
                  <TabsList className="bg-gray-800/50 border border-gray-700 p-1 w-full justify-start">
                    <TabsTrigger value="content" className="data-[state=active]:bg-pink-500">
                      <FileText className="h-4 w-4 mr-2" />
                      Contenu
                    </TabsTrigger>
                    <TabsTrigger value="structure" className="data-[state=active]:bg-pink-500">
                      <BarChart3 className="h-4 w-4 mr-2" />
                      Structure
                    </TabsTrigger>
                    <TabsTrigger value="schema" className="data-[state=active]:bg-pink-500">
                      <Code className="h-4 w-4 mr-2" />
                      Schema.org
                    </TabsTrigger>
                    <TabsTrigger value="optimization" className="data-[state=active]:bg-pink-500">
                      <Lightbulb className="h-4 w-4 mr-2" />
                      Optimisation
                    </TabsTrigger>
                  </TabsList>

                  {/* Content Tab */}
                  <TabsContent value="content" className="mt-6">
                    <Card className="bg-[#12121a] border-gray-800">
                      <CardHeader className="flex flex-row items-center justify-between">
                        <div>
                          <Badge className="bg-pink-500/20 text-pink-400 mb-2">{generatedContent.type}</Badge>
                          <CardTitle className="text-xl text-white">{generatedContent.title}</CardTitle>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => copyToClipboard(generatedContent.content, 'content')}
                          className="text-gray-400 hover:text-white"
                        >
                          {copiedSection === 'content' ? (
                            <Check className="h-4 w-4 text-emerald-400" />
                          ) : (
                            <Copy className="h-4 w-4" />
                          )}
                        </Button>
                      </CardHeader>
                      <CardContent>
                        <div className="prose prose-invert max-w-none">
                          <div className="bg-gray-800/30 rounded-lg p-6 border border-gray-700 max-h-[500px] overflow-y-auto">
                            <pre className="whitespace-pre-wrap text-sm text-gray-300 font-sans">
                              {generatedContent.content}
                            </pre>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </TabsContent>

                  {/* Structure Tab */}
                  <TabsContent value="structure" className="mt-6">
                    <Card className="bg-[#12121a] border-gray-800">
                      <CardHeader>
                        <CardTitle className="text-lg text-white">Structure du Contenu</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-3">
                          {generatedContent.structure.map((section, index) => (
                            <div
                              key={index}
                              className="flex items-center gap-3 p-3 bg-gray-800/30 rounded-lg border border-gray-700"
                            >
                              <div className="h-8 w-8 rounded-full bg-pink-500/20 flex items-center justify-center text-pink-400 font-semibold text-sm">
                                {index + 1}
                              </div>
                              <span className="text-gray-200">{section}</span>
                            </div>
                          ))}
                        </div>
                      </CardContent>
                    </Card>

                    {/* AEO Factors */}
                    <Card className="bg-[#12121a] border-gray-800 mt-6">
                      <CardHeader>
                        <CardTitle className="text-lg text-white">Facteurs AEO</CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        {generatedContent.aeoFactors.map((factor, index) => (
                          <div key={index} className="space-y-2">
                            <div className="flex items-center justify-between">
                              <span className="text-gray-300">{factor.factor}</span>
                              <span className={`font-semibold ${getScoreColor(factor.score)}`}>
                                {factor.score}/100
                              </span>
                            </div>
                            <Progress 
                              value={factor.score} 
                              className="h-2 bg-gray-700"
                            />
                            <p className="text-sm text-gray-400">{factor.suggestion}</p>
                          </div>
                        ))}
                      </CardContent>
                    </Card>
                  </TabsContent>

                  {/* Schema.org Tab */}
                  <TabsContent value="schema" className="mt-6">
                    <Card className="bg-[#12121a] border-gray-800">
                      <CardHeader className="flex flex-row items-center justify-between">
                        <div>
                          <CardTitle className="text-lg text-white">Données Structurées Schema.org</CardTitle>
                          <p className="text-sm text-gray-400 mt-1">
                            Ajoutez ce code JSON-LD dans la balise &lt;head&gt; de votre page
                          </p>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => copyToClipboard(JSON.stringify(generatedContent.schemaOrg, null, 2), 'schema')}
                          className="text-gray-400 hover:text-white"
                        >
                          {copiedSection === 'schema' ? (
                            <Check className="h-4 w-4 text-emerald-400" />
                          ) : (
                            <Copy className="h-4 w-4" />
                          )}
                        </Button>
                      </CardHeader>
                      <CardContent>
                        <div className="bg-gray-900 rounded-lg p-4 border border-gray-700 overflow-x-auto">
                          <pre className="text-sm text-emerald-400 font-mono">
                            <code>
                              {`<script type="application/ld+json">\n${JSON.stringify(generatedContent.schemaOrg, null, 2)}\n</script>`}
                            </code>
                          </pre>
                        </div>
                        <div className="mt-4 p-4 bg-blue-500/10 border border-blue-500/30 rounded-lg">
                          <h4 className="text-blue-400 font-medium mb-2 flex items-center gap-2">
                            <Lightbulb className="h-4 w-4" />
                            Pourquoi utiliser Schema.org ?
                          </h4>
                          <ul className="text-sm text-gray-300 space-y-1">
                            <li>• Améliore la compréhension de votre contenu par les moteurs de recherche</li>
                            <li>• Augmente les chances d'apparaître dans les rich snippets</li>
                            <li>• Aide les IA à extraire et citer vos informations</li>
                            <li>• Renforce votre autorité sur le sujet</li>
                          </ul>
                        </div>
                      </CardContent>
                    </Card>
                  </TabsContent>

                  {/* Optimization Tab */}
                  <TabsContent value="optimization" className="mt-6">
                    <Card className="bg-[#12121a] border-gray-800">
                      <CardHeader>
                        <CardTitle className="text-lg text-white flex items-center gap-2">
                          <Lightbulb className="h-5 w-5 text-yellow-400" />
                          Conseils d'Optimisation AEO
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-4">
                          {generatedContent.optimizationTips.map((tip, index) => (
                            <div
                              key={index}
                              className="flex items-start gap-4 p-4 bg-gray-800/30 rounded-lg border border-gray-700"
                            >
                              <div className="h-8 w-8 rounded-full bg-yellow-500/20 flex items-center justify-center text-yellow-400 font-semibold text-sm flex-shrink-0">
                                {index + 1}
                              </div>
                              <p className="text-gray-300">{tip}</p>
                            </div>
                          ))}
                        </div>
                      </CardContent>
                    </Card>

                    {/* Additional Tips */}
                    <Card className="bg-[#12121a] border-gray-800 mt-6">
                      <CardHeader>
                        <CardTitle className="text-lg text-white">Bonnes Pratiques AEO</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="p-4 bg-emerald-500/10 border border-emerald-500/30 rounded-lg">
                            <h4 className="text-emerald-400 font-medium mb-2">À faire</h4>
                            <ul className="text-sm text-gray-300 space-y-2">
                              <li>✓ Utiliser des définitions claires et concises</li>
                              <li>✓ Structurer avec des listes à puces</li>
                              <li>✓ Inclure des données factuelles vérifiables</li>
                              <li>✓ Répondre directement aux questions</li>
                              <li>✓ Mettre à jour régulièrement le contenu</li>
                            </ul>
                          </div>
                          <div className="p-4 bg-red-500/10 border border-red-500/30 rounded-lg">
                            <h4 className="text-red-400 font-medium mb-2">À éviter</h4>
                            <ul className="text-sm text-gray-300 space-y-2">
                              <li>✗ Contenu vague ou ambigu</li>
                              <li>✗ Informations non sourcées</li>
                              <li>✗ Texte trop long sans structure</li>
                              <li>✗ Jargon excessif sans explication</li>
                              <li>✗ Contenu dupliqué ou générique</li>
                            </ul>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </TabsContent>
                </Tabs>
              </div>
            ) : (
              <Card className="bg-[#12121a] border-gray-800">
                <CardContent className="py-16">
                  <div className="text-center space-y-4">
                    <div className="mx-auto w-20 h-20 rounded-full bg-gradient-to-br from-pink-500/20 to-purple-500/20 flex items-center justify-center">
                      <FileText className="h-10 w-10 text-pink-400" />
                    </div>
                    <h3 className="text-xl font-semibold text-white">Prêt à créer du contenu optimisé IA</h3>
                    <p className="text-gray-400 max-w-md mx-auto">
                      Sélectionnez un type de contenu, entrez votre sujet et laissez notre IA générer 
                      du contenu optimisé pour être cité par ChatGPT, Gemini et Claude.
                    </p>
                    <div className="flex flex-wrap justify-center gap-3 pt-4">
                      <Badge variant="outline" className="border-pink-500/50 text-pink-400">
                        Articles de blog
                      </Badge>
                      <Badge variant="outline" className="border-emerald-500/50 text-emerald-400">
                        FAQ optimisées
                      </Badge>
                      <Badge variant="outline" className="border-purple-500/50 text-purple-400">
                        Descriptions produit
                      </Badge>
                      <Badge variant="outline" className="border-orange-500/50 text-orange-400">
                        Meta tags SEO
                      </Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
