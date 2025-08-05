import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import david from '../assets/david.png';
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
}

const ArticlePage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [article, setArticle] = useState<Article | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchArticle = async () => {
      if (!id) return;

      try {
        setLoading(true);
        const { data, error } = await supabase
          .from('articles')
          .select('*')
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
            <AvatarImage src={david} alt="Luka Erić" />
            <AvatarFallback>LE</AvatarFallback>
          </Avatar>
          <div className="author-details-left">
            <div className="author-name-left">Luka Erić</div>
            <div className="publication-date-left">{formattedDate}</div>
          </div>
        </div>
        <div className="abstract-section">
          <h3 className="abstract-title">Abstract</h3>
          <p className="abstract-text">{article.abstract}</p>
        </div>
        <div className="generation-stats">
          <div className="stat-item">
            <span>AI-generated</span>
            <div className="stat-value">
              <div className="stat-color-box orange"></div>
              <span>{article.ai_generated_percent}%</span>
            </div>
          </div>
          <div className="stat-item">
            <span>AI-generated & AI-refined</span>
            <div className="stat-value">
              <div className="stat-color-box light-orange"></div>
              <span>{article.ai_generated_ai_refined_percent}%</span>
            </div>
          </div>
          <div className="stat-item">
            <span>Human-written & AI-refined</span>
            <div className="stat-value">
              <div className="stat-color-box light-blue"></div>
              <span>{article.human_written_ai_refined_percent}%</span>
            </div>
          </div>
          <div className="stat-item">
            <span>Human-written</span>
            <div className="stat-value">
              <div className="stat-color-box white"></div>
              <span>{article.human_written_percent}%</span>
            </div>
          </div>
        </div>
        <div className="quillbot-attribution">
          <span className="quillbot-text">By Quillbot</span>
          <img src="/src/assets/quillbot.png" alt="Quillbot Logo" className="quillbot-logo" />
        </div>
      </div>
      <div className="article-main-content">
        {article.image && <img src={article.image} alt={article.title} className="article-main-image" />}
        <h1 className="article-title-main">{article.title}</h1>
        <p className="article-body-main">{article.body}</p>
      </div>
    </div>
  );
};

export default ArticlePage;
