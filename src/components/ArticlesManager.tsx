import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import ArticleEditor from './ArticleEditor';
import { Button } from "./ui/button";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "./ui/table";
import { Plus, Pencil, Trash2 } from "lucide-react";
import './ArticlesManager.css';

interface Article {
  id: string;
  title: string;
  abstract: string;
  body: string;
  image: string | null;
  author_id: string;
  created_at: string;
  access_type: 'free' | 'premium' | 'enterprise';
  ai_generated_percent: number;
  ai_generated_ai_refined_percent: number;
  human_written_ai_refined_percent: number;
  human_written_percent: number;
}

const ArticlesManager: React.FC = () => {
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);
  const [showEditor, setShowEditor] = useState(false);
  const [editingArticleId, setEditingArticleId] = useState<string | undefined>(undefined);

  useEffect(() => {
    fetchArticles();
  }, []);

  const fetchArticles = async () => {
    try {
      const { data, error } = await supabase
        .from('articles')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching articles:', error);
      } else {
        setArticles(data || []);
      }
    } catch (error) {
      console.error('Error in fetchArticles:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateArticle = () => {
    setEditingArticleId(undefined);
    setShowEditor(true);
  };

  const handleEditArticle = (articleId: string) => {
    setEditingArticleId(articleId);
    setShowEditor(true);
  };

  const handleBackToList = () => {
    setShowEditor(false);
    setEditingArticleId(undefined);
    fetchArticles(); // Refresh the articles list
  };

  const handleDelete = async (articleId: string) => {
    if (!window.confirm('Are you sure you want to delete this article?')) return;

    try {
      const { error } = await supabase
        .from('articles')
        .delete()
        .eq('id', articleId);

      if (error) {
        console.error('Error deleting article:', error);
        alert('Error deleting article. Please try again.');
      } else {
        fetchArticles(); // Refresh the articles list
      }
    } catch (error) {
      console.error('Error in handleDelete:', error);
      alert('Error deleting article. Please try again.');
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  if (showEditor) {
    return (
      <ArticleEditor 
        articleId={editingArticleId}
        onBack={handleBackToList}
      />
    );
  }

  if (loading) {
    return (
      <div className="articles-manager">
        <div className="articles-header">
          <h1 className="articles-title">Articles</h1>
        </div>
        <div className="articles-loading">Loading articles...</div>
      </div>
    );
  }

  return (
    <div className="articles-manager">
      <div className="articles-header">
        <h1 className="articles-title">Articles</h1>
        <Button className="add-article-button" onClick={handleCreateArticle}>
          <Plus className="add-icon" />
          Add Article
        </Button>
      </div>

      <div className="articles-table-container">
        <Table>
          <TableCaption>A list of all your articles.</TableCaption>
          <TableHeader>
            <TableRow>
              <TableHead>Title</TableHead>
              <TableHead>Access Type</TableHead>
              <TableHead>Created</TableHead>
              <TableHead>AI Content %</TableHead>
              <TableHead className="actions-column">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {articles.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="no-articles">
                  No articles found. Create your first article!
                </TableCell>
              </TableRow>
            ) : (
              articles.map((article) => (
                <TableRow key={article.id}>
                  <TableCell className="article-title-cell">
                    <div className="article-title-info">
                      <span className="article-title">{article.title}</span>
                      <span className="article-abstract">{article.abstract}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <span className={`access-type access-type-${article.access_type}`}>
                      {article.access_type}
                    </span>
                  </TableCell>
                  <TableCell>{formatDate(article.created_at)}</TableCell>
                  <TableCell>{article.ai_generated_percent}%</TableCell>
                  <TableCell>
                    <div className="article-actions">
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="edit-button"
                        onClick={() => handleEditArticle(article.id)}
                      >
                        <Pencil className="action-icon" />
                      </Button>
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="delete-button"
                        onClick={() => handleDelete(article.id)}
                      >
                        <Trash2 className="action-icon" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};

export default ArticlesManager;