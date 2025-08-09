import { Link } from 'react-router-dom';
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import { Button } from "../ui/button";
import { Card, CardContent } from "../ui/card";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { getUserInitials } from '../../lib/utils';
import david from '../../assets/david.png';
import PremiumBadge from '../shared/PremiumBadge';
import FreeBadge from '../shared/FreeBadge';
import ImageWithSkeleton from '../shared/ImageWithSkeleton';
import './FeaturedArticle.css';

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

interface FeaturedArticleProps {
  article: Article;
}

const FeaturedArticle: React.FC<FeaturedArticleProps> = ({ article }) => {
  const formattedDate = new Date(article.created_at).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  return (
    <Link to={`/article/${article.id}`} className="featured-article-link">
      <Card className="featured-article-card">
        <CardContent className="featured-card-content">
          <ImageWithSkeleton
            className="featured-article-image"
            alt={article.title}
            src={article.image || ''}
          />

          <div className="featured-article-body">
            <h1 className="featured-article-title-text text-cormorant-h2 text-white-full">
              {article.title}
            </h1>
            <p className="featured-article-abstract text-cormorant-body text-white">
              {article.abstract}
            </p>
          </div>

          <div className="featured-article-footer">
            <div className="author-info">
              <Avatar className="author-avatar">
                <AvatarImage 
                  src={article.author?.avatar_url || david} 
                  alt={article.author?.full_name || article.author?.email || "Author"} 
                />
                <AvatarFallback>
                  {getUserInitials(article.author?.full_name || article.author?.email || "Author")}
                </AvatarFallback>
              </Avatar>
              <div className="author-details">
                <div className="author-name text-cormorant-body text-white letter-spacing-normal">
                  {article.author?.full_name || article.author?.email || "Author"}
                </div>
                <div className="publication-date text-cormorant-body text-white letter-spacing-normal">
                  {formattedDate}
                </div>
              </div>
            </div>

            <div className="featured-article-right-section">
              {article.access_type === 'paid' && (
                <PremiumBadge />
              )}
              {article.access_type === 'free' && (
                <FreeBadge />
              )}
              <div className="navigation-buttons">
                <Button className="navigation-button">
                  <ChevronLeft className="navigation-icon" />
                </Button>
                <Button className="navigation-button">
                  <ChevronRight className="navigation-icon" />
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
};

export default FeaturedArticle;
