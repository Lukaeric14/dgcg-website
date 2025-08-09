import * as React from 'react';
import './Home.css';
import Footer from '../../Footer';
import FeaturedArticle from '../sections/FeaturedArticle';
import ArticleSidebar from '../shared/ArticleSidebar';
import { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';

// Types
type ArticleAccessType = 'free' | 'paid';

interface Article {
  id: string;
  title: string;
  abstract: string;
  image: string | null;
  author_id: string;
  created_at: string;
  access_type: ArticleAccessType;
  author?: {
    id: string;
    email: string;
    full_name: string;
    avatar_url: string;
  };
}

const Home = () => {
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchArticles = async () => {
      try {
        setLoading(true);
        
        const { data, error } = await supabase
          .from('articles')
          .select(`
            *,
            author:authors(
              id,
              email,
              full_name,
              avatar_url
            )
          `)
          .order('created_at', { ascending: false })
          .limit(10);
          
        if (error) throw error;
        const articlesData = data || [];
        console.log('Fetched articles with author data:', articlesData);
        setArticles(articlesData);
      } catch (err) {
        console.error('Error fetching articles:', err);
        setError('Failed to load articles. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchArticles();
  }, []);

  if (loading) {
    return (
      <div className="home-container">
        <div className="home-main">
          <div className="loading-message">Loading...</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="home-container">
        <div className="home-main">
          <div className="error-message">{error}</div>
        </div>
      </div>
    );
  }

  return (
    <div className="home-container">
      <main className="home-main">
        
        {articles.length === 0 ? (
          <div className="centered-message">No articles found.</div>
        ) : (
          <>
            {/* Featured Article and Sidebar Layout */}
            <div className="featured-section">
              <div className="featured-main">
                <FeaturedArticle article={articles[0]} />
              </div>
              <div className="featured-sidebar">
                <ArticleSidebar articles={articles.slice(1, 4)} />
              </div>
            </div>
          </>
        )}
      </main>
      <Footer />
    </div>
  );
};

export default Home;
