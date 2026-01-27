import React, { useState, useEffect } from 'react';
import { Search } from 'lucide-react';
import Navigation from '@/components/Navigation';
import Footer from '@/components/Footer';
import BlogCard from '@/components/blog/BlogCard';
import CategoryFilter from '@/components/blog/CategoryFilter';
import { supabase } from '@/lib/supabase';
import { blogPosts } from '@/data/blogPosts';

const BlogListing = () => {
  const [posts, setPosts] = useState(blogPosts);
  const [filteredPosts, setFilteredPosts] = useState(blogPosts);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('Tous');
  const [categories, setCategories] = useState<string[]>([]);

  useEffect(() => {
    loadBlogPosts();
  }, []);

  useEffect(() => {
    filterPosts();
  }, [searchQuery, selectedCategory, posts]);

  const loadBlogPosts = async () => {
    try {
      const { data, error } = await supabase
        .from('blog_posts')
        .select('*')
        .order('published_at', { ascending: false });

      if (data && data.length > 0) {
        setPosts(data);
        extractCategories(data);
      } else {
        extractCategories(blogPosts);
      }
    } catch (err) {
      console.log('Using local blog data');
      extractCategories(blogPosts);
    }
  };

  const extractCategories = (postsData: any[]) => {
    const cats = Array.from(new Set(postsData.map(p => p.category)));
    setCategories(cats);
  };

  const filterPosts = () => {
    let filtered = posts;

    if (selectedCategory !== 'Tous') {
      filtered = filtered.filter(p => p.category === selectedCategory);
    }

    if (searchQuery) {
      filtered = filtered.filter(p =>
        p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.excerpt.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    setFilteredPosts(filtered);
  };

  return (
    <div className="min-h-screen bg-gray-950">
      <Navigation />
      
      <div className="relative py-20 px-4 bg-gradient-to-br from-cyan-900/20 to-purple-900/20">
        <div className="max-w-7xl mx-auto text-center">
          <h1 className="text-5xl font-bold text-white mb-6">Blog AI Focus</h1>
          <p className="text-xl text-gray-300 max-w-3xl mx-auto">
            Découvrez nos articles sur l'AEO, le SEO et l'optimisation pour les IA
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="mb-8">
          <div className="relative mb-6">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Rechercher un article..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-12 pr-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-cyan-500"
            />
          </div>
          <CategoryFilter
            categories={categories}
            selectedCategory={selectedCategory}
            onSelectCategory={setSelectedCategory}
          />
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredPosts.map((post) => (
            <BlogCard key={post.id} {...post} />
          ))}
        </div>

        {filteredPosts.length === 0 && (
          <div className="text-center py-20">
            <p className="text-gray-400 text-lg">Aucun article trouvé</p>
          </div>
        )}
      </div>

      <Footer />
    </div>
  );
};

export default BlogListing;
