import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import { Card, CardContent } from "../ui/card";
import React from "react";
import { getUserInitials } from '../../lib/utils';
import "./ArticleSidebar.css";

interface Article {
    id: string;
    title: string;
    image: string | null;
    author_id: string;
    created_at: string;
    access_type: 'free' | 'premium' | 'enterprise';
    author?: {
        id: string;
        email: string;
        full_name: string;
        avatar_url: string;
    };
}

interface ArticleSidebarProps {
    articles: Article[];
}

export default function ArticleSidebar({ articles }: ArticleSidebarProps) {
    return (
        <div className="article-sidebar">
            {articles.map((article) => (
                <Card key={article.id} className="article-sidebar-card">
                    <CardContent className="article-sidebar-card-content">
                        <img
                            className="article-sidebar-image"
                            alt="Article thumbnail"
                            src={article.image || '/api/placeholder/165/165'}
                            onError={(e) => {
                                const target = e.target as HTMLImageElement;
                                target.src = '/api/placeholder/165/165';
                            }}
                        />
                        <div className="article-sidebar-info">
                            <div className="article-sidebar-title-container">
                                <h2 className="article-sidebar-title text-cormorant-h2 text-white-full">
                                    {article.title}
                                </h2>
                            </div>
                            <div className="article-sidebar-author-container">
                                <Avatar className="article-sidebar-avatar">
                                    <AvatarImage 
                                        src={article.author?.avatar_url || ""} 
                                        alt={article.author?.full_name || article.author?.email || "Author avatar"} 
                                    />
                                    <AvatarFallback className="article-sidebar-avatar-fallback">
                                        {getUserInitials(article.author?.full_name || article.author?.email || "Author")}
                                    </AvatarFallback>
                                </Avatar>
                                <div className="article-sidebar-author-name-container">
                                    <span className="article-sidebar-author-name text-cormorant-body text-white">
                                        {article.author?.full_name || article.author?.email || "Author"}
                                    </span>
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            ))}
        </div>
    );
}
