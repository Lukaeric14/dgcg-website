import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { supabase } from '../lib/supabase';
// import { getUserInitials } from '../lib/utils'; // Future use for fallback avatars
import david from '../assets/david.png';
import quillbotLogo from '../assets/quillbot.png';
import './ArticlePageV2.css';

// SVG Logo Icon (extracted from Figma)
const LogoIcon: React.FC = () => (
  <svg width="27" height="33" viewBox="0 0 27 33" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M13.5 0L0 8.25V24.75L13.5 33L27 24.75V8.25L13.5 0Z" fill="white"/>
    <path d="M13.5 4.125L4.5 9.5625V23.4375L13.5 28.875L22.5 23.4375V9.5625L13.5 4.125Z" fill="#171717"/>
    <text x="13.5" y="19" textAnchor="middle" fill="white" fontSize="8" fontFamily="serif">D</text>
  </svg>
);

interface Article {
  id: string;
  title: string;
  abstract: string;
  body: string;
  image: string | null;
  created_at: string;
  author_id: string;
  author?: {
    id: string;
    email: string;
    full_name: string;
    avatar_url: string;
  };
  ai_generated_percent: number;
  ai_generated_ai_refined_percent: number;
  human_written_ai_refined_percent: number;
  human_written_percent: number;
}

const ArticlePageV2: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [article, setArticle] = useState<Article | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchArticle = async () => {
      // If no ID is provided, use the first article or create sample data
      if (!id) {
        try {
          setLoading(true);
          const { data, error } = await supabase
            .from('articles')
            .select(`
              *,
              author:users_profiles(
                id,
                email,
                full_name,
                avatar_url
              )
            `)
            .order('created_at', { ascending: false })
            .limit(1)
            .single();

          if (error) {
            throw error;
          }

          if (data) {
            setArticle(data);
          }
        } catch (err) {
          // If no articles exist, use sample data
          console.warn('No articles found, using sample data:', err);
          setArticle({
            id: 'sample',
            title: 'The Rise of David: A New Era in AI Innovation',
            abstract: 'In a groundbreaking development, the world of artificial intelligence is witnessing a paradigm shift. Experts at Capital Group have unveiled a new AI model, dubbed "David", designed to tackle complex challenges in various sectors. This innovative technology promises to enhance decision-making processes and improve efficiency across industries.',
            body: `In a groundbreaking development, the world of artificial intelligence is witnessing a paradigm shift. Experts at Capital Group have unveiled a new AI model, dubbed "David", designed to tackle complex challenges in various sectors. This innovative technology promises to enhance decision-making processes and improve efficiency across industries.

Groundbreaking development, the world of artificial intelligence is witnessing a paradigm shift. Experts at Capital Group have unveiled a new AI model, dubbed "David", designed to tackle complex challenges in various sectors. This innovative technology promises to enhance decision-making processes and improve efficiency across industries. In a groundbreaking development, the world of artificial intelligence is witnessing a paradigm shift.

In a groundbreaking development, the world of artificial intelligence is witnessing a paradigm shift. Experts at Capital Group have unveiled a new AI model, dubbed "David", designed to tackle complex challenges in various sectors. This innovative technology promises to enhance decision-making processes and improve efficiency across industries.`,
            image: david,
            created_at: '2025-07-31',
            author_id: 'sample',
            author: {
              id: 'sample',
              email: 'luka@dgcg.com',
              full_name: 'Luka Erić',
              avatar_url: david
            },
            ai_generated_percent: 0,
            ai_generated_ai_refined_percent: 11,
            human_written_ai_refined_percent: 43,
            human_written_percent: 46
          });
        } finally {
          setLoading(false);
        }
        return;
      }

      // Fetch specific article by ID
      try {
        setLoading(true);
        const { data, error } = await supabase
          .from('articles')
          .select(`
            *,
            author:users_profiles(
              id,
              email,
              full_name,
              avatar_url
            )
          `)
          .eq('id', id)
          .single();

        if (error) {
          throw error;
        }

        if (data) {
          setArticle(data);
        }
      } catch (err) {
        setError((err as Error).message);
      } finally {
        setLoading(false);
      }
    };

    fetchArticle();
  }, [id]);

  if (loading) {
    return (
      <div className="article-page-v2">
        <div className="loading-container">
          <div className="loading-text text-cormorant-body text-white">Loading article...</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="article-page-v2">
        <div className="error-container">
          <div className="error-text text-cormorant-body text-white">Error: {error}</div>
        </div>
      </div>
    );
  }

  if (!article) {
    return (
      <div className="article-page-v2">
        <div className="not-found-container">
          <div className="not-found-text text-cormorant-body text-white">Article not found.</div>
        </div>
      </div>
    );
  }
  const formattedDate = new Date(article.created_at).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  return (
    <div className="article-page-v2">
      {/* Navigation */}
      <nav className="article-nav">
        <div className="nav-content">
          {/* Logo */}
          <div className="logo-container">
            <div className="logo-icon">
              <LogoIcon />
            </div>
            <div className="logo-text text-cormorant-h1 text-white-full letter-spacing-wide">
              DGCG
            </div>
          </div>
          
          {/* Navigation Links */}
          <div className="nav-links">
            <a href="/manifesto" className="nav-link text-cormorant-body text-white">Our Manifesto</a>
            <a href="/socials" className="nav-link text-cormorant-body text-white">Socials</a>
            <a href="/login" className="nav-link text-cormorant-body text-white">Login</a>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="article-main">
        <div className="article-container">
          {/* Article Title */}
          <h1 className="article-title text-cormorant-h1 text-white-full text-center letter-spacing-wide">
            {article.title}
          </h1>

          {/* Featured Image */}
          {article.image && (
            <div className="article-image">
              <img src={article.image} alt={article.title} />
            </div>
          )}

          {/* Sidebar Content */}
          <div className="article-sidebar">
            {/* Abstract */}
            <div className="abstract-section">
              <h3 className="abstract-title text-cormorant-body text-white text-center letter-spacing-tight">
                Abstract
              </h3>
              <p className="abstract-text text-palatino-body text-white text-justify letter-spacing-tight">
                {article.abstract}
              </p>
            </div>

            {/* AI Breakdown */}
            <div className="ai-breakdown">
              <div className="ai-breakdown-item">
                <span className="ai-breakdown-label text-palatino-body text-white letter-spacing-tight">
                  AI-generated
                </span>
                <div className="ai-breakdown-value">
                  <div className="ai-breakdown-dot ai-generated"></div>
                  <span className="ai-breakdown-percent text-palatino-body text-white letter-spacing-tight">
                    {article.ai_generated_percent}%
                  </span>
                </div>
              </div>

              <div className="ai-breakdown-item">
                <span className="ai-breakdown-label text-palatino-body text-white letter-spacing-tight">
                  AI-generated & AI-refined
                </span>
                <div className="ai-breakdown-value">
                  <div className="ai-breakdown-dot ai-generated-refined"></div>
                  <span className="ai-breakdown-percent text-palatino-body text-white letter-spacing-tight">
                    {article.ai_generated_ai_refined_percent}%
                  </span>
                </div>
              </div>

              <div className="ai-breakdown-item">
                <span className="ai-breakdown-label text-palatino-body text-white letter-spacing-tight">
                  Human-written & AI-refined
                </span>
                <div className="ai-breakdown-value">
                  <div className="ai-breakdown-dot human-ai-refined"></div>
                  <span className="ai-breakdown-percent text-palatino-body text-white letter-spacing-tight">
                    {article.human_written_ai_refined_percent}%
                  </span>
                </div>
              </div>

              <div className="ai-breakdown-item">
                <span className="ai-breakdown-label text-palatino-body text-white letter-spacing-tight">
                  Human-written
                </span>
                <div className="ai-breakdown-value">
                  <div className="ai-breakdown-dot human-written"></div>
                  <span className="ai-breakdown-percent text-palatino-body text-white letter-spacing-tight">
                    {article.human_written_percent}%
                  </span>
                </div>
              </div>
            </div>

            {/* Attribution */}
            <div className="attribution-section">
              <div className="author-info">
                <div className="author-avatar">
                  <img 
                    src={article.author?.avatar_url || david} 
                    alt={article.author?.full_name || 'Author'} 
                  />
                </div>
                <div className="author-details">
                  <div className="author-name text-cormorant-body text-white-full letter-spacing-normal">
                    {article.author?.full_name || article.author?.email || 'Author'}
                  </div>
                  <div className="publication-date text-cormorant-body text-white letter-spacing-normal">
                    {formattedDate}
                  </div>
                </div>
              </div>
              
              <div className="quillbot-attribution">
                <span className="quillbot-text text-cormorant-body text-white letter-spacing-normal">
                  By Quillbot
                </span>
                <div className="quillbot-logo">
                  <img src={quillbotLogo} alt="Quillbot Logo" />
                </div>
              </div>
            </div>
          </div>

          {/* Article Body */}
          <div className="article-body">
            <div 
              className="article-content text-palatino-body text-white text-justify letter-spacing-tight"
              dangerouslySetInnerHTML={{ __html: article.body }}
            />
          </div>
        </div>
      </main>
    </div>
  );
};

export default ArticlePageV2;