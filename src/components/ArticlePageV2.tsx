import React from 'react';
import './ArticlePageV2.css';

// SVG Logo Icon (extracted from Figma)
const LogoIcon: React.FC = () => (
  <svg width="27" height="33" viewBox="0 0 27 33" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M13.5 0L0 8.25V24.75L13.5 33L27 24.75V8.25L13.5 0Z" fill="white"/>
    <path d="M13.5 4.125L4.5 9.5625V23.4375L13.5 28.875L22.5 23.4375V9.5625L13.5 4.125Z" fill="#171717"/>
    <text x="13.5" y="19" textAnchor="middle" fill="white" fontSize="8" fontFamily="serif">D</text>
  </svg>
);

interface ArticleData {
  id: string;
  title: string;
  abstract: string;
  body: string;
  image: string;
  created_at: string;
  author: {
    full_name: string;
    avatar_url: string;
  };
  ai_generated_percent: number;
  ai_generated_ai_refined_percent: number;
  human_written_ai_refined_percent: number;
  human_written_percent: number;
}

interface ArticlePageV2Props {
  article?: ArticleData;
}

const ArticlePageV2: React.FC<ArticlePageV2Props> = ({ 
  article = {
    id: '1',
    title: 'The Rise of David: A New Era in AI Innovation',
    abstract: 'In a groundbreaking development, the world of artificial intelligence is witnessing a paradigm shift. Experts at Capital Group have unveiled a new AI model, dubbed "David", designed to tackle complex challenges in various sectors. This innovative technology promises to enhance decision-making processes and improve efficiency across industries.',
    body: `In a groundbreaking development, the world of artificial intelligence is witnessing a paradigm shift. Experts at Capital Group have unveiled a new AI model, dubbed "David", designed to tackle complex challenges in various sectors. This innovative technology promises to enhance decision-making processes and improve efficiency across industries.

Groundbreaking development, the world of artificial intelligence is witnessing a paradigm shift. Experts at Capital Group have unveiled a new AI model, dubbed "David", designed to tackle complex challenges in various sectors. This innovative technology promises to enhance decision-making processes and improve efficiency across industries. In a groundbreaking development, the world of artificial intelligence is witnessing a paradigm shift.

In a groundbreaking development, the world of artificial intelligence is witnessing a paradigm shift. Experts at Capital Group have unveiled a new AI model, dubbed "David", designed to tackle complex challenges in various sectors. This innovative technology promises to enhance decision-making processes and improve efficiency across industries.`,
    image: '/src/assets/david.png',
    created_at: '2025-07-31',
    author: {
      full_name: 'Luka Erić',
      avatar_url: '/src/assets/david.png'
    },
    ai_generated_percent: 0,
    ai_generated_ai_refined_percent: 11,
    human_written_ai_refined_percent: 43,
    human_written_percent: 46
  }
}) => {
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
          <div className="article-image">
            <img src={article.image} alt={article.title} />
          </div>

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
                  <img src={article.author.avatar_url} alt={article.author.full_name} />
                </div>
                <div className="author-details">
                  <div className="author-name text-cormorant-body text-white-full letter-spacing-normal">
                    {article.author.full_name}
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
                  <img src="/src/assets/quillbot.png" alt="Quillbot Logo" />
                </div>
              </div>
            </div>
          </div>

          {/* Article Body */}
          <div className="article-body">
            <div className="article-content text-palatino-body text-white text-justify letter-spacing-tight">
              {article.body.split('\n').map((paragraph, index) => 
                paragraph.trim() ? (
                  <p key={index}>{paragraph}</p>
                ) : (
                  <br key={index} />
                )
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default ArticlePageV2;