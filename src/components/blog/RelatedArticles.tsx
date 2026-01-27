import React from 'react';
import { ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface Article {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  image_url: string;
  category: string;
}

interface RelatedArticlesProps {
  articles: Article[];
  currentSlug: string;
}

const RelatedArticles: React.FC<RelatedArticlesProps> = ({ articles, currentSlug }) => {
  const navigate = useNavigate();
  const related = articles.filter(a => a.slug !== currentSlug).slice(0, 3);

  if (related.length === 0) return null;

  return (
    <div className="mt-16 pt-16 border-t border-gray-800">
      <h2 className="text-3xl font-bold text-white mb-8">Articles similaires</h2>
      <div className="grid md:grid-cols-3 gap-6">
        {related.map((article) => (
          <div
            key={article.id}
            onClick={() => navigate(`/blog/${article.slug}`)}
            className="bg-gray-800 rounded-lg overflow-hidden hover:transform hover:scale-105 transition-all cursor-pointer border border-gray-700 hover:border-cyan-500"
          >
            <img src={article.image_url} alt={article.title} className="w-full h-40 object-cover" />
            <div className="p-4">
              <span className="text-xs text-cyan-400 font-semibold uppercase">{article.category}</span>
              <h3 className="text-lg font-bold text-white mt-2 mb-2 line-clamp-2">{article.title}</h3>
              <p className="text-gray-400 text-sm line-clamp-2 mb-3">{article.excerpt}</p>
              <div className="flex items-center text-cyan-400 text-sm font-semibold">
                Lire l'article <ArrowRight className="w-4 h-4 ml-2" />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default RelatedArticles;
