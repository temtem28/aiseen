import React from 'react';
import { Calendar, Clock, ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface BlogCardProps {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  image_url: string;
  category: string;
  read_time: number;
  published_at: string;
  author_name: string;
}

const BlogCard: React.FC<BlogCardProps> = ({
  slug,
  title,
  excerpt,
  image_url,
  category,
  read_time,
  published_at,
  author_name
}) => {
  const navigate = useNavigate();
  
  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('fr-FR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  return (
    <div 
      onClick={() => navigate(`/blog/${slug}`)}
      className="bg-gray-800 rounded-xl overflow-hidden hover:transform hover:scale-105 transition-all duration-300 cursor-pointer border border-gray-700 hover:border-cyan-500"
    >
      <img src={image_url} alt={title} className="w-full h-48 object-cover" />
      <div className="p-6">
        <span className="text-xs font-semibold text-cyan-400 uppercase tracking-wide">{category}</span>
        <h3 className="text-xl font-bold text-white mt-2 mb-3 line-clamp-2">{title}</h3>
        <p className="text-gray-400 text-sm mb-4 line-clamp-3">{excerpt}</p>
        <div className="flex items-center justify-between text-xs text-gray-500">
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1">
              <Calendar className="w-4 h-4" />
              {formatDate(published_at)}
            </span>
            <span className="flex items-center gap-1">
              <Clock className="w-4 h-4" />
              {read_time} min
            </span>
          </div>
          <ArrowRight className="w-5 h-5 text-cyan-400" />
        </div>
      </div>
    </div>
  );
};

export default BlogCard;
