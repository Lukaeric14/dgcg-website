import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { getUserInitials } from '../lib/utils';
import david from '../assets/david.png';
import quillbotLogo from '../assets/quillbot.png';
import './ArticlePage.css';

interface Article {
  id: string;
  title: string;
  body: string;
  image: string | null;
  created_at: string;
  abstract: string;
  ai_generated_percent: number;
  ai_generated_ai_refined_percent: number;
  human_written_ai_refined_percent: number;
  human_written_percent: number;
  author_id: string;
  author?: {
    id: string;
    email: string;
    full_name: string;
    avatar_url: string;
  };
}

// Mobile-specific component
const ArticlePageMobile: React.FC<{ article: Article }> = ({ article }) => {
  const formattedDate = new Date(article.created_at).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  return (
    <div className="article-page-mobile">
      <div className="mobile-main-container">
        {/* Title First */}
        <h1 className="mobile-article-title">{article.title}</h1>
        
        {/* Image */}
        {article.image && (
          <img src={article.image} alt={article.title} className="mobile-article-image" />
        )}
        
        {/* Sidebar Content */}
        <div className="mobile-sidebar-content">
          {/* Abstract */}
          <div className="mobile-abstract-section">
            <h3 className="mobile-abstract-title">Abstract</h3>
            <p className="mobile-abstract-text">{article.abstract}</p>
          </div>
          
          {/* Attribution */}
          <div className="mobile-attribution-section">
            <div className="mobile-generation-stats">
              <div className="mobile-stat-item">
                <span>AI-generated</span>
                <div className="mobile-stat-value">
                  <div className="mobile-stat-color-box orange"></div>
                  <span>{article.ai_generated_percent}%</span>
                </div>
              </div>
              <div className="mobile-stat-item">
                <span>AI-generated & AI-refined</span>
                <div className="mobile-stat-value">
                  <div className="mobile-stat-color-box light-orange"></div>
                  <span>{article.ai_generated_ai_refined_percent}%</span>
                </div>
              </div>
              <div className="mobile-stat-item">
                <span>Human-written & AI-refined</span>
                <div className="mobile-stat-value">
                  <div className="mobile-stat-color-box light-blue"></div>
                  <span>{article.human_written_ai_refined_percent}%</span>
                </div>
              </div>
              <div className="mobile-stat-item">
                <span>Human-written</span>
                <div className="mobile-stat-value">
                  <div className="mobile-stat-color-box white"></div>
                  <span>{article.human_written_percent}%</span>
                </div>
              </div>
            </div>
            
            {/* Author and Quillbot */}
            <div className="mobile-author-quillbot">
              <div className="mobile-author-info">
                <Avatar className="mobile-author-avatar">
                  <AvatarImage 
                    src={article.author?.avatar_url || david} 
                    alt={article.author?.full_name || article.author?.email || "Author"} 
                  />
                  <AvatarFallback>
                    {getUserInitials(article.author?.full_name || article.author?.email || "Author")}
                  </AvatarFallback>
                </Avatar>
                <div className="mobile-author-details">
                  <div className="mobile-author-name">
                    {article.author?.full_name || article.author?.email || "Author"}
                  </div>
                  <div className="mobile-publication-date">{formattedDate}</div>
                </div>
              </div>
              <div className="mobile-quillbot-attribution">
                <span className="mobile-quillbot-text">By Quillbot</span>
                <img src={quillbotLogo} alt="Quillbot Logo" className="mobile-quillbot-logo" />
              </div>
            </div>
          </div>
        </div>
        
        {/* Article Body */}
        <div 
          className="mobile-article-body"
          dangerouslySetInnerHTML={{ __html: article.body }}
        />
      </div>
    </div>
  );
};

const ArticlePage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [article, setArticle] = useState<Article | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth <= 600);
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);

    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  useEffect(() => {
    const fetchArticle = async () => {
      if (!id) return;

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
    return <div>Loading...</div>;
  }

  if (error) {
    return <div>Error: {error}</div>;
  }

  if (!article) {
    return <div>Article not found.</div>;
  }

  // Render mobile component if on mobile
  if (isMobile) {
    return <ArticlePageMobile article={article} />;
  }

  // Debug: Log article body content
  console.log('Article body length:', article.body?.length);
  console.log('Article body preview:', article.body?.substring(0, 200));
  console.log('Article body full:', article.body);

  const formattedDate = new Date(article.created_at).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  return (
    
    <div className="article-page-container">
      <div className="article-sidebar-left">
        <div className="author-info-left">
          <Avatar className="author-avatar-left">
            <AvatarImage 
              src={article.author?.avatar_url || david} 
              alt={article.author?.full_name || article.author?.email || "Author"} 
            />
            <AvatarFallback>
              {getUserInitials(article.author?.full_name || article.author?.email || "Author")}
            </AvatarFallback>
          </Avatar>
          <div className="author-details-left">
            <div className="author-name-left text-cormorant-h2 text-white-full">
              {article.author?.full_name || article.author?.email || "Author"}
            </div>
            <div className="publication-date-left text-cormorant-body text-white letter-spacing-normal">{formattedDate}</div>
          </div>
        </div>
        <div className="abstract-section">
          <h3 className="abstract-title text-cormorant-body text-white text-center letter-spacing-tight">Abstract</h3>
          <p className="abstract-text text-cormorant-body text-white text-justify letter-spacing-tight">{article.abstract}</p>
        </div>
        <div className="generation-stats">
          <div className="article-stat-item">
            <span className="text-palatino-body text-white letter-spacing-tight">AI-generated</span>
            <div className="stat-value">
              <div className="stat-color-box orange"></div>
              <span className="text-palatino-body text-white letter-spacing-tight">{article.ai_generated_percent}%</span>
            </div>
          </div>
          <div className="article-stat-item">
            <span className="text-palatino-body text-white letter-spacing-tight">AI-generated & AI-refined</span>
            <div className="stat-value">
              <div className="stat-color-box light-orange"></div>
              <span className="text-palatino-body text-white letter-spacing-tight">{article.ai_generated_ai_refined_percent}%</span>
            </div>
          </div>
          <div className="article-stat-item">
            <span className="text-palatino-body text-white letter-spacing-tight">Human-written & AI-refined</span>
            <div className="stat-value">
              <div className="stat-color-box light-blue"></div>
              <span className="text-palatino-body text-white letter-spacing-tight">{article.human_written_ai_refined_percent}%</span>
            </div>
          </div>
          <div className="article-stat-item">
            <span className="text-palatino-body text-white letter-spacing-tight">Human-written</span>
            <div className="stat-value">
              <div className="stat-color-box white"></div>
              <span className="text-palatino-body text-white letter-spacing-tight">{article.human_written_percent}%</span>
            </div>
          </div>
        </div>
        <div className="quillbot-attribution">
          <span className="quillbot-text text-cormorant-body text-white letter-spacing-normal">By Quillbot</span>
          <img src={quillbotLogo} alt="Quillbot Logo" className="quillbot-logo" />
        </div>
      </div>
      <div className="article-main-content">
        {article.image && <img src={article.image} alt={article.title} className="article-main-image" />}
        <h1 className="article-title-main text-cormorant-h1 text-white-full letter-spacing-wide">{article.title}</h1>
        <div 
          className="article-body-main article-page-body text-cormorant-body text-white letter-spacing-tight"
          dangerouslySetInnerHTML={{ __html: article.body }}
          style={{ 
            overflow: 'visible', 
            display: 'block',
            height: 'auto',
            maxHeight: 'none',
            whiteSpace: 'normal',
            wordWrap: 'break-word'
          }}
        />
      </div>
    </div>
  );
};

export default ArticlePage;
