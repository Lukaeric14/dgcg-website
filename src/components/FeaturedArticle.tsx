import { Link } from 'react-router-dom';
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { Button } from "./ui/button";
import { Card, CardContent } from "./ui/card";
import { ChevronLeft, ChevronRight } from "lucide-react";
import david from '../assets/david.png';
import './FeaturedArticle.css';

type ArticleAccessType = 'free' | 'premium' | 'enterprise';

interface Article {
  id: string;
  title: string;
  abstract: string;
  image: string | null;
  author_id: string;
  created_at: string;
  access_type: ArticleAccessType;
}

interface FeaturedArticleProps {
  article: Article;
}

const FeaturedArticle: React.FC<FeaturedArticleProps> = ({ article }) => {
  return (
    <Link to={`/article/${article.id}`} className="featured-article-link">
      <Card className="featured-article-card">
        <CardContent className="featured-card-content">
          <img
            className="featured-article-image"
            alt={article.title}
            src={article.image || ''}
          />

          <div className="featured-article-body">
            <h1 className="featured-article-title-text">
              {article.title}
            </h1>
            <p className="featured-article-abstract">
              {article.abstract}
            </p>
          </div>

          <div className="featured-article-footer">
            <div className="author-info">
              <Avatar className="author-avatar">
                <AvatarImage src={david} alt="Luka Erić" />
                <AvatarFallback>LE</AvatarFallback>
              </Avatar>
              <div className="author-details">
                <div className="author-name">
                  Luka Erić
                </div>
                <div className="publication-date">
                  July 31, 2025
                </div>
              </div>
            </div>

            <div className="navigation-buttons">
              <Button className="navigation-button">
                <ChevronLeft className="navigation-icon" />
              </Button>
              <Button className="navigation-button">
                <ChevronRight className="navigation-icon" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
};

export default FeaturedArticle;