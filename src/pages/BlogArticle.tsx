import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Calendar, Clock, User, ArrowLeft, Share2 } from 'lucide-react';
import Navigation from '@/components/Navigation';
import Footer from '@/components/Footer';
import RelatedArticles from '@/components/blog/RelatedArticles';
import { supabase } from '@/lib/supabase';
import { blogPosts } from '@/data/blogPosts';

const BlogArticle = () => {
  const { slug } = useParams();
  const navigate = useNavigate();
  const [post, setPost] = useState<any>(null);
  const [allPosts, setAllPosts] = useState(blogPosts);

  useEffect(() => {
    loadPost();
    loadAllPosts();
  }, [slug]);

  const loadPost = async () => {
    try {
      const { data } = await supabase
        .from('blog_posts')
        .select('*')
        .eq('slug', slug)
        .single();

      if (data) {
        setPost(data);
      } else {
        const localPost = blogPosts.find(p => p.slug === slug);
        setPost(localPost);
      }
    } catch (err) {
      const localPost = blogPosts.find(p => p.slug === slug);
      setPost(localPost);
    }
  };

  const loadAllPosts = async () => {
    try {
      const { data } = await supabase.from('blog_posts').select('*');
      if (data && data.length > 0) setAllPosts(data);
    } catch (err) {
      console.log('Using local posts');
    }
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('fr-FR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  if (!post) {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center">
        <div className="text-white text-xl">Chargement...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-950">
      <Navigation />
      
      <article className="max-w-4xl mx-auto px-4 py-12">
        <button
          onClick={() => navigate('/blog')}
          className="flex items-center text-cyan-400 hover:text-cyan-300 mb-8 transition-colors"
        >
          <ArrowLeft className="w-5 h-5 mr-2" />
          Retour au blog
        </button>

        <div className="mb-8">
          <span className="text-cyan-400 font-semibold uppercase text-sm tracking-wide">
            {post.category}
          </span>
          <h1 className="text-4xl md:text-5xl font-bold text-white mt-4 mb-6">
            {post.title}
          </h1>
          
          <div className="flex flex-wrap items-center gap-6 text-gray-400 text-sm mb-8">
            <span className="flex items-center gap-2">
              <User className="w-4 h-4" />
              {post.author_name}
            </span>
            <span className="flex items-center gap-2">
              <Calendar className="w-4 h-4" />
              {formatDate(post.published_at)}
            </span>
            <span className="flex items-center gap-2">
              <Clock className="w-4 h-4" />
              {post.read_time} min de lecture
            </span>
          </div>
        </div>

        <img
          src={post.image_url}
          alt={post.title}
          className="w-full h-96 object-cover rounded-xl mb-12"
        />

        <div className="prose prose-invert prose-lg max-w-none">
          <div
            className="text-gray-300 leading-relaxed"
            dangerouslySetInnerHTML={{ __html: post.content.replace(/\n/g, '<br/>') }}
          />
        </div>

        <div className="mt-12 pt-8 border-t border-gray-800 flex items-center justify-between">
          <div className="flex gap-2">
            {post.tags?.map((tag: string) => (
              <span
                key={tag}
                className="px-3 py-1 bg-gray-800 text-cyan-400 rounded-full text-sm"
              >
                #{tag}
              </span>
            ))}
          </div>
          <button className="flex items-center gap-2 text-gray-400 hover:text-cyan-400 transition-colors">
            <Share2 className="w-5 h-5" />
            Partager
          </button>
        </div>

        <RelatedArticles articles={allPosts} currentSlug={slug || ''} />
      </article>

      <Footer />
    </div>
  );
};

export default BlogArticle;
