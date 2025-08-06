import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { Card, CardContent } from "./ui/card";
import React from "react";
import "./ArticleSidebar.css";

interface Article {
    id: string;
    title: string;
    image: string | null;
    author_id: string;
    created_at: string;
    access_type: 'free' | 'premium' | 'enterprise';
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
                                <h2 className="article-sidebar-title">
                                    {article.title}
                                </h2>
                            </div>
                            <div className="article-sidebar-author-container">
                                <Avatar className="article-sidebar-avatar">
                                    <AvatarImage 
                                        src="" 
                                        alt="Author avatar" 
                                    />
                                    <AvatarFallback className="article-sidebar-avatar-fallback">
                                        LE
                                    </AvatarFallback>
                                </Avatar>
                                <div className="article-sidebar-author-name-container">
                                    <span className="article-sidebar-author-name">
                                        Luka Erić
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
