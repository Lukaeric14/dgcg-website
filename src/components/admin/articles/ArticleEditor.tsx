import React, { useCallback, useEffect, useState } from 'react';
import { useAuth } from '../../../contexts/AuthContext';
import { supabase } from '../../../lib/supabase';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import { TextStyle } from '@tiptap/extension-text-style';
import { Color } from '@tiptap/extension-color';
import { TextAlign } from '@tiptap/extension-text-align';
import { FontFamily } from '@tiptap/extension-font-family';
import { Underline } from '@tiptap/extension-underline';
import { Link } from '@tiptap/extension-link';
import { Image } from '@tiptap/extension-image';
import { Button } from "../../ui/button";
import { Input } from "../../ui/input";
import { Label } from "../../ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "../../ui/card";
import { Separator } from "../../ui/separator";
import { 
  Bold, 
  Italic, 
  Underline as UnderlineIcon, 
  Strikethrough,
  Code,
  List,
  ListOrdered,
  Quote,
  Heading1,
  Heading2,
  Heading3,
  AlignLeft,
  AlignCenter,
  AlignRight,
  AlignJustify,
  Link as LinkIcon,
  Image as ImageIcon,
  Upload,
  Undo,
  Redo,
  Save,
  ArrowLeft,
  Maximize,
  X
} from "lucide-react";
import './ArticleEditor.css';

interface ArticleEditorProps {
  articleId?: string;
  onBack: () => void;
}

interface ArticleForm {
  title: string;
  abstract: string;
  body: string;
  image: string;
  access_type: 'free' | 'premium' | 'enterprise';
  ai_generated_percent: number;
  ai_generated_ai_refined_percent: number;
  human_written_ai_refined_percent: number;
  human_written_percent: number;
}

const ArticleEditor: React.FC<ArticleEditorProps> = ({ articleId, onBack }) => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [isZenMode, setIsZenMode] = useState(false);
  const [formData, setFormData] = useState<ArticleForm>({
    title: '',
    abstract: '',
    body: '',
    image: '',
    access_type: 'free',
    ai_generated_percent: 0,
    ai_generated_ai_refined_percent: 0,
    human_written_ai_refined_percent: 0,
    human_written_percent: 100,
  });

  const editor = useEditor({
    extensions: [
      StarterKit,
      TextStyle,
      Color,
      TextAlign.configure({
        types: ['heading', 'paragraph'],
      }),
      FontFamily,
      Underline,
      Link.configure({
        openOnClick: false,
      }),
      Image,
    ],
    content: formData.body,
    onUpdate: ({ editor }) => {
      setFormData(prev => ({
        ...prev,
        body: editor.getHTML()
      }));
    },
  });

  const zenEditor = useEditor({
    extensions: [
      StarterKit,
      TextStyle,
      Color,
      TextAlign.configure({
        types: ['heading', 'paragraph'],
      }),
      FontFamily,
      Underline,
      Link.configure({
        openOnClick: false,
      }),
      Image,
    ],
    content: formData.body,
    onUpdate: ({ editor }) => {
      setFormData(prev => ({
        ...prev,
        body: editor.getHTML()
      }));
    },
  });

  const fetchArticle = useCallback(async () => {
    if (!articleId) return;
    
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('articles')
        .select('*')
        .eq('id', articleId)
        .single();

      if (error) {
        console.error('Error fetching article:', error);
      } else if (data) {
        setFormData({
          title: data.title,
          abstract: data.abstract,
          body: data.body,
          image: data.image || '',
          access_type: data.access_type,
          ai_generated_percent: data.ai_generated_percent || 0,
          ai_generated_ai_refined_percent: data.ai_generated_ai_refined_percent || 0,
          human_written_ai_refined_percent: data.human_written_ai_refined_percent || 0,
          human_written_percent: data.human_written_percent || 100,
        });
      }
    } catch (error) {
      console.error('Error in fetchArticle:', error);
    } finally {
      setLoading(false);
    }
  }, [articleId, setFormData, setLoading]);

  useEffect(() => {
    if (articleId) {
      fetchArticle();
    }
  }, [articleId, fetchArticle]);

  useEffect(() => {
    if (editor && formData.body !== editor.getHTML()) {
      editor.commands.setContent(formData.body);
    }
  }, [formData.body, editor]);

  useEffect(() => {
    if (zenEditor && formData.body !== zenEditor.getHTML()) {
      zenEditor.commands.setContent(formData.body);
    }
  }, [formData.body, zenEditor]);

  const handleSave = async () => {
    if (!user) return;

    setSaving(true);
    try {
      const articleData = {
        ...formData,
        author_id: user.id,
      };

      if (articleId) {
        // Update existing article
        const { error } = await supabase
          .from('articles')
          .update(articleData)
          .eq('id', articleId);

        if (error) {
          console.error('Error updating article:', error);
          alert('Error updating article. Please try again.');
        } else {
          alert('Article updated successfully!');
        }
      } else {
        // Create new article
        const { data, error } = await supabase
          .from('articles')
          .insert([articleData])
          .select();

        if (error) {
          console.error('Error creating article:', error);
          alert('Error creating article. Please try again.');
        } else {
          console.log('Article created successfully:', data);
          alert('Article created successfully!');
          onBack(); // Go back to articles list
        }
      }
    } catch (error) {
      console.error('Error in handleSave:', error);
      alert('Error saving article. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const handleInputChange = (field: keyof ArticleForm, value: string | number) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const addLink = () => {
    const url = window.prompt('Enter URL:');
    if (url) {
      editor?.chain().focus().extendMarkRange('link').setLink({ href: url }).run();
    }
  };

  const handleImageUpload = async (file: File) => {
    setUploading(true);
    try {
      // Create a unique filename
      const fileExt = file.name.split('.').pop();
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`;
      
      // Upload to Supabase Storage
      const { error } = await supabase.storage
        .from('article-images')
        .upload(fileName, file);

      if (error) {
        console.error('Error uploading image:', error);
        alert('Error uploading image. Please try again.');
        return;
      }

      // Get the public URL
      const { data: { publicUrl } } = supabase.storage
        .from('article-images')
        .getPublicUrl(fileName);

      // Update the featured image field
      setFormData(prev => ({
        ...prev,
        image: publicUrl
      }));

      alert('Image uploaded successfully!');
    } catch (error) {
      console.error('Error in handleImageUpload:', error);
      alert('Error uploading image. Please try again.');
    } finally {
      setUploading(false);
    }
  };

  const addImageToEditor = () => {
    const url = window.prompt('Enter image URL:');
    if (url) {
      const activeEditor = isZenMode ? zenEditor : editor;
      activeEditor?.chain().focus().setImage({ src: url }).run();
    }
  };



  const enterZenMode = () => {
    setIsZenMode(true);
    // Sync content to zen editor
    if (zenEditor && editor) {
      zenEditor.commands.setContent(editor.getHTML());
    }
  };

  const exitZenMode = () => {
    setIsZenMode(false);
    // Sync content back to main editor
    if (editor && zenEditor) {
      editor.commands.setContent(zenEditor.getHTML());
    }
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // Check file type
      if (!file.type.startsWith('image/')) {
        alert('Please select an image file.');
        return;
      }
      
      // Check file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        alert('File size must be less than 5MB.');
        return;
      }
      
      handleImageUpload(file);
    }
  };

  if (loading) {
    return (
      <div className="article-editor-loading">
        <h2>Loading article...</h2>
      </div>
    );
  }

  return (
    <div className="article-editor">
      <div className="article-editor-header">
        <div className="article-editor-header-left">
          <Button variant="outline" onClick={onBack} className="back-button">
            <ArrowLeft className="back-icon" />
            Back to Articles
          </Button>
          <h1 className="article-editor-title">
            {articleId ? 'Edit Article' : 'Create New Article'}
          </h1>
        </div>
        <Button onClick={handleSave} disabled={saving} className="save-button">
          <Save className="save-icon" />
          {saving ? 'Saving...' : 'Save Article'}
        </Button>
      </div>

      <div className="article-editor-content full-width">
        <div className="article-editor-sidebar">
          <Card>
            <CardHeader>
              <CardTitle>Article Settings</CardTitle>
            </CardHeader>
            <CardContent className="article-settings">
              <div className="setting-field">
                <Label htmlFor="title">Title</Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) => handleInputChange('title', e.target.value)}
                  placeholder="Enter article title"
                />
              </div>

              <div className="setting-field">
                <Label htmlFor="abstract">Abstract</Label>
                <textarea
                  id="abstract"
                  value={formData.abstract}
                  onChange={(e) => handleInputChange('abstract', e.target.value)}
                  placeholder="Enter article abstract"
                  className="abstract-textarea"
                />
              </div>

              <div className="setting-field">
                <Label htmlFor="image">Featured Image</Label>
                <div className="image-upload-section">
                  <div className="image-upload-buttons">
                    <button
                      type="button"
                      className="image-upload-button"
                      onClick={() => document.getElementById('image-upload-input')?.click()}
                      disabled={uploading}
                    >
                      <Upload className="toolbar-icon" />
                      {uploading ? 'Uploading...' : 'Upload Image'}
                    </button>
                    <Input
                      id="image-upload-input"
                      type="file"
                      accept="image/*"
                      onChange={handleFileSelect}
                      className="image-upload-input"
                    />
                    <Input
                      value={formData.image}
                      onChange={(e) => handleInputChange('image', e.target.value)}
                      placeholder="Or paste image URL"
                      className="flex-1"
                    />
                  </div>
                  {uploading && (
                    <div className="image-upload-progress">
                      Uploading image, please wait...
                    </div>
                  )}
                  {formData.image && (
                    <img
                      src={formData.image}
                      alt="Featured"
                      className="image-preview"
                    />
                  )}
                </div>
              </div>

              <div className="setting-field">
                <Label htmlFor="access_type">Access Type</Label>
                <Select
                  value={formData.access_type}
                  onValueChange={(value: 'free' | 'premium' | 'enterprise') => 
                    handleInputChange('access_type', value)
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select access type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="free">Free</SelectItem>
                    <SelectItem value="premium">Premium</SelectItem>
                    <SelectItem value="enterprise">Enterprise</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="ai-content-section">
                <h4>AI Attribution</h4>
                <div className="percentage-fields">
                  <div className="percentage-field">
                    <Label htmlFor="ai_generated_percent">AI Generated %</Label>
                    <Input
                      id="ai_generated_percent"
                      type="number"
                      min="0"
                      max="100"
                      value={formData.ai_generated_percent}
                      onChange={(e) => handleInputChange('ai_generated_percent', parseInt(e.target.value) || 0)}
                    />
                  </div>
                  <div className="percentage-field">
                    <Label htmlFor="ai_generated_ai_refined_percent">AI Generated + AI Refined %</Label>
                    <Input
                      id="ai_generated_ai_refined_percent"
                      type="number"
                      min="0"
                      max="100"
                      value={formData.ai_generated_ai_refined_percent}
                      onChange={(e) => handleInputChange('ai_generated_ai_refined_percent', parseInt(e.target.value) || 0)}
                    />
                  </div>
                </div>
              </div>
              <div className="ai-content-section">
                <h4>Human Attribution</h4>
                <div className="percentage-fields">
                  <div className="percentage-field">
                    <Label htmlFor="human_written_ai_refined_percent">Human Written + AI Refined %</Label>
                    <Input
                      id="human_written_ai_refined_percent"
                      type="number"
                      min="0"
                      max="100"
                      value={formData.human_written_ai_refined_percent}
                      onChange={(e) => handleInputChange('human_written_ai_refined_percent', parseInt(e.target.value) || 0)}
                    />
                  </div>
                  <div className="percentage-field">
                    <Label htmlFor="human_written_percent">Human Written %</Label>
                    <Input
                      id="human_written_percent"
                      type="number"
                      min="0"
                      max="100"
                      value={formData.human_written_percent}
                      onChange={(e) => handleInputChange('human_written_percent', parseInt(e.target.value) || 0)}
                    />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="article-editor-main">
          <Card className="editor-card">
            <CardHeader>
              <div className="editor-toolbar">
                <div className="toolbar-group">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => editor?.chain().focus().undo().run()}
                    disabled={!editor?.can().chain().focus().undo().run()}
                  >
                    <Undo className="toolbar-icon" />
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => editor?.chain().focus().redo().run()}
                    disabled={!editor?.can().chain().focus().redo().run()}
                  >
                    <Redo className="toolbar-icon" />
                  </Button>
                </div>

                <Separator orientation="vertical" />

                <div className="toolbar-group">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => editor?.chain().focus().toggleHeading({ level: 1 }).run()}
                    className={editor?.isActive('heading', { level: 1 }) ? 'is-active' : ''}
                  >
                    <Heading1 className="toolbar-icon" />
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => editor?.chain().focus().toggleHeading({ level: 2 }).run()}
                    className={editor?.isActive('heading', { level: 2 }) ? 'is-active' : ''}
                  >
                    <Heading2 className="toolbar-icon" />
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => editor?.chain().focus().toggleHeading({ level: 3 }).run()}
                    className={editor?.isActive('heading', { level: 3 }) ? 'is-active' : ''}
                  >
                    <Heading3 className="toolbar-icon" />
                  </Button>
                </div>

                <Separator orientation="vertical" />

                <div className="toolbar-group">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => editor?.chain().focus().toggleBold().run()}
                    className={editor?.isActive('bold') ? 'is-active' : ''}
                  >
                    <Bold className="toolbar-icon" />
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => editor?.chain().focus().toggleItalic().run()}
                    className={editor?.isActive('italic') ? 'is-active' : ''}
                  >
                    <Italic className="toolbar-icon" />
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => editor?.chain().focus().toggleUnderline().run()}
                    className={editor?.isActive('underline') ? 'is-active' : ''}
                  >
                    <UnderlineIcon className="toolbar-icon" />
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => editor?.chain().focus().toggleStrike().run()}
                    className={editor?.isActive('strike') ? 'is-active' : ''}
                  >
                    <Strikethrough className="toolbar-icon" />
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => editor?.chain().focus().toggleCode().run()}
                    className={editor?.isActive('code') ? 'is-active' : ''}
                  >
                    <Code className="toolbar-icon" />
                  </Button>
                </div>

                <Separator orientation="vertical" />

                <div className="toolbar-group">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => editor?.chain().focus().setTextAlign('left').run()}
                    className={editor?.isActive({ textAlign: 'left' }) ? 'is-active' : ''}
                  >
                    <AlignLeft className="toolbar-icon" />
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => editor?.chain().focus().setTextAlign('center').run()}
                    className={editor?.isActive({ textAlign: 'center' }) ? 'is-active' : ''}
                  >
                    <AlignCenter className="toolbar-icon" />
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => editor?.chain().focus().setTextAlign('right').run()}
                    className={editor?.isActive({ textAlign: 'right' }) ? 'is-active' : ''}
                  >
                    <AlignRight className="toolbar-icon" />
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => editor?.chain().focus().setTextAlign('justify').run()}
                    className={editor?.isActive({ textAlign: 'justify' }) ? 'is-active' : ''}
                  >
                    <AlignJustify className="toolbar-icon" />
                  </Button>
                </div>

                <Separator orientation="vertical" />

                <div className="toolbar-group">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => editor?.chain().focus().toggleBulletList().run()}
                    className={editor?.isActive('bulletList') ? 'is-active' : ''}
                  >
                    <List className="toolbar-icon" />
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => editor?.chain().focus().toggleOrderedList().run()}
                    className={editor?.isActive('orderedList') ? 'is-active' : ''}
                  >
                    <ListOrdered className="toolbar-icon" />
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => editor?.chain().focus().toggleBlockquote().run()}
                    className={editor?.isActive('blockquote') ? 'is-active' : ''}
                  >
                    <Quote className="toolbar-icon" />
                  </Button>
                </div>

                <Separator orientation="vertical" />

                <div className="toolbar-group">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={addLink}
                  >
                    <LinkIcon className="toolbar-icon" />
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={addImageToEditor}
                  >
                    <ImageIcon className="toolbar-icon" />
                  </Button>
                </div>

                <Separator orientation="vertical" />

                <div className="toolbar-group">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={enterZenMode}
                    title="Zen Mode - Distraction-free writing"
                  >
                    <Maximize className="toolbar-icon" />
                    Zen Mode
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent className="editor-content">
              <EditorContent editor={editor} className="tiptap-editor" />
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Zen Mode Overlay */}
      {isZenMode && (
        <div className="zen-mode-overlay">
          <div className="zen-mode-header">
            <Button
              variant="outline"
              size="sm"
              onClick={exitZenMode}
              className="zen-exit-button"
              title="Exit Zen Mode"
            >
              <X className="zen-exit-icon" />
            </Button>
          </div>
          <div className="zen-mode-content">
            <div className="zen-editor-container">
              <EditorContent editor={zenEditor} className="zen-editor" />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ArticleEditor;
