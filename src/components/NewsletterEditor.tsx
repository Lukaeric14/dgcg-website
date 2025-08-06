import React, { useCallback, useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import { TextStyle } from '@tiptap/extension-text-style';
import { Color } from '@tiptap/extension-color';
import { TextAlign } from '@tiptap/extension-text-align';
import { FontFamily } from '@tiptap/extension-font-family';
import { Underline } from '@tiptap/extension-underline';
import { Link } from '@tiptap/extension-link';
import { Image } from '@tiptap/extension-image';
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Textarea } from "./ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Separator } from "./ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import { 
  Bold, 
  Italic, 
  Underline as UnderlineIcon, 
  List,
  ListOrdered,
  Heading1,
  Heading2,
  Heading3,
  Link as LinkIcon,
  Image as ImageIcon,
  Undo,
  Redo,
  Save,
  ArrowLeft,
  Eye,
  Send,
  Maximize,
  X
} from "lucide-react";
import './NewsletterEditor.css';

interface NewsletterEditorProps {
  newsletterId?: string;
  onBack: () => void;
}

interface NewsletterForm {
  title: string;
  subject: string;
  body: string;
  plain_text: string;
  access_type: 'free' | 'paid';
  status: 'draft' | 'scheduled' | 'sent' | 'cancelled';
}

const NewsletterEditor: React.FC<NewsletterEditorProps> = ({ newsletterId, onBack }) => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [isZenMode, setIsZenMode] = useState(false);
  const [formData, setFormData] = useState<NewsletterForm>({
    title: '',
    subject: '',
    body: '',
    plain_text: '',
    access_type: 'free',
    status: 'draft',
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
      const html = editor.getHTML();
      setFormData(prev => ({
        ...prev,
        body: html,
        plain_text: editor.getText() // Auto-generate plain text
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
      const html = editor.getHTML();
      setFormData(prev => ({
        ...prev,
        body: html,
        plain_text: editor.getText() // Auto-generate plain text
      }));
    },
  });

  const fetchNewsletter = useCallback(async () => {
    if (!newsletterId) return;
    
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('newsletters')
        .select('*')
        .eq('id', newsletterId)
        .single();

      if (error) {
        console.error('Error fetching newsletter:', error);
      } else if (data) {
        setFormData({
          title: data.title,
          subject: data.subject,
          body: data.body,
          plain_text: data.plain_text || '',
          access_type: data.access_type,
          status: data.status,
        });
      }
    } catch (error) {
      console.error('Error in fetchNewsletter:', error);
    } finally {
      setLoading(false);
    }
  }, [newsletterId, setFormData, setLoading]);

  useEffect(() => {
    if (newsletterId) {
      fetchNewsletter();
    }
  }, [newsletterId, fetchNewsletter]);

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

  const handleSave = async (statusToSave: 'draft' | 'sent' = 'draft') => {
    if (!user) return;

    setSaving(true);
    try {
      const newsletterData = {
        ...formData,
        status: statusToSave,
        author_id: user.id,
      };

      if (newsletterId) {
        // Update existing newsletter
        const { error } = await supabase
          .from('newsletters')
          .update(newsletterData)
          .eq('id', newsletterId);

        if (error) {
          console.error('Error updating newsletter:', error);
          alert('Error updating newsletter. Please try again.');
        } else {
          alert('Newsletter updated successfully!');
        }
      } else {
        // Create new newsletter
        const { data, error } = await supabase
          .from('newsletters')
          .insert([newsletterData])
          .select();

        if (error) {
          console.error('Error creating newsletter:', error);
          alert('Error creating newsletter. Please try again.');
        } else {
          console.log('Newsletter created successfully:', data);
          alert('Newsletter created successfully!');
          if (statusToSave === 'draft') {
            onBack(); // Go back to newsletters list
          }
        }
      }
    } catch (error) {
      console.error('Error in handleSave:', error);
      alert('Error saving newsletter. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const handleSendNow = async () => {
    if (!formData.title.trim() || !formData.subject.trim() || !formData.body.trim()) {
      alert('Please fill in all required fields (title, subject, and content) before sending.');
      return;
    }

    if (!window.confirm('Are you sure you want to send this newsletter immediately? This cannot be undone.')) {
      return;
    }

    // First save the newsletter
    await handleSave('draft');
    
    // Then send it (implementation will depend on newsletter service)
    try {
      setSaving(true);
      // Import newsletter service dynamically to avoid circular imports
      const { newsletterService } = await import('../lib/newsletterService');
      
      if (newsletterId) {
        const result = await newsletterService.sendNewsletter(newsletterId);
        if (result.success) {
          alert(`Newsletter sent successfully to ${result.totalSent} subscribers!`);
          onBack(); // Go back to newsletters list
        } else {
          alert(`Newsletter sending completed with errors. ${result.totalSent} sent, ${result.totalFailed} failed.`);
        }
      } else {
        alert('Please save the newsletter as a draft first, then try sending again.');
      }
    } catch (error) {
      console.error('Error sending newsletter:', error);
      alert('Error sending newsletter. Please try again or contact support.');
    } finally {
      setSaving(false);
    }
  };

  const handleInputChange = (field: keyof NewsletterForm, value: string) => {
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

  const addImage = () => {
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

  // Create email preview HTML with basic styling
  const getEmailPreviewHTML = () => {
    return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${formData.subject}</title>
  <style>
    body {
      font-family: Arial, sans-serif;
      line-height: 1.6;
      color: #333;
      max-width: 600px;
      margin: 0 auto;
      padding: 20px;
      background-color: #f9f9f9;
    }
    .email-container {
      background-color: white;
      padding: 30px;
      border-radius: 8px;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
    }
    .email-header {
      text-align: center;
      border-bottom: 2px solid #eee;
      padding-bottom: 20px;
      margin-bottom: 30px;
    }
    .email-title {
      color: #1f2937;
      font-size: 24px;
      margin: 0;
    }
    .email-content {
      line-height: 1.7;
    }
    .email-footer {
      margin-top: 40px;
      padding-top: 20px;
      border-top: 1px solid #eee;
      text-align: center;
      color: #666;
      font-size: 14px;
    }
    h1, h2, h3 { color: #1f2937; }
    a { color: #2563eb; }
    img { max-width: 100%; height: auto; }
  </style>
</head>
<body>
  <div class="email-container">
    <div class="email-header">
      <h1 class="email-title">${formData.title}</h1>
    </div>
    <div class="email-content">
      ${formData.body}
    </div>
    <div class="email-footer">
      <p>You received this email because you're subscribed to our newsletter.</p>
      <p><a href="#unsubscribe">Unsubscribe</a> | <a href="#preferences">Manage Preferences</a></p>
    </div>
  </div>
</body>
</html>`;
  };

  if (loading) {
    return (
      <div className="newsletter-editor-loading">
        <h2>Loading newsletter...</h2>
      </div>
    );
  }

  return (
    <div className="newsletter-editor">
      <div className="newsletter-editor-header">
        <div className="newsletter-editor-header-left">
          <Button variant="outline" onClick={onBack} className="back-button">
            <ArrowLeft className="back-icon" />
            Back to Newsletters
          </Button>
          <h1 className="newsletter-editor-title">
            {newsletterId ? 'Edit Newsletter' : 'Create New Newsletter'}
          </h1>
        </div>
        <div className="newsletter-editor-header-actions">
          <Button onClick={() => handleSave('draft')} disabled={saving} variant="outline">
            <Save className="save-icon" />
            {saving ? 'Saving...' : 'Save Draft'}
          </Button>
          <Button onClick={handleSendNow} disabled={saving} className="send-button">
            <Send className="send-icon" />
            Send Now
          </Button>
        </div>
      </div>

      <div className="newsletter-editor-content">
        <div className="newsletter-editor-sidebar">
          <Card>
            <CardHeader>
              <CardTitle>Newsletter Settings</CardTitle>
            </CardHeader>
            <CardContent className="newsletter-settings">
              <div className="setting-field">
                <Label htmlFor="title">Newsletter Title</Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) => handleInputChange('title', e.target.value)}
                  placeholder="Enter newsletter title"
                />
              </div>

              <div className="setting-field">
                <Label htmlFor="subject">Email Subject</Label>
                <Input
                  id="subject"
                  value={formData.subject}
                  onChange={(e) => handleInputChange('subject', e.target.value)}
                  placeholder="Enter email subject line"
                />
              </div>

              <div className="setting-field">
                <Label htmlFor="access_type">Access Type</Label>
                <Select
                  value={formData.access_type}
                  onValueChange={(value: 'free' | 'paid') => 
                    handleInputChange('access_type', value)
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select access type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="free">Free (All Subscribers)</SelectItem>
                    <SelectItem value="paid">Paid (Paid Subscribers Only)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <Separator />

              <div className="setting-field">
                <Label htmlFor="plain_text">Plain Text Version</Label>
                <Textarea
                  id="plain_text"
                  value={formData.plain_text}
                  onChange={(e) => handleInputChange('plain_text', e.target.value)}
                  placeholder="Auto-generated from content..."
                  className="plain-text-textarea"
                  rows={4}
                />
                <p className="setting-help">
                  Auto-generated from your content. Edit if needed for email clients that don't support HTML.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="newsletter-editor-main">
          <Tabs defaultValue="editor" className="newsletter-tabs">
            <TabsList className="newsletter-tabs-list">
              <TabsTrigger value="editor">Content Editor</TabsTrigger>
              <TabsTrigger value="preview">Email Preview</TabsTrigger>
            </TabsList>
            
            <TabsContent value="editor" className="newsletter-tab-content">
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
                        onClick={addImage}
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
            </TabsContent>
            
            <TabsContent value="preview" className="newsletter-tab-content">
              <Card className="preview-card">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Eye className="preview-icon" />
                    Email Preview
                  </CardTitle>
                  <p className="preview-description">
                    This is how your newsletter will look in most email clients.
                  </p>
                </CardHeader>
                <CardContent className="preview-content">
                  <div className="email-preview-container">
                    <iframe
                      srcDoc={getEmailPreviewHTML()}
                      className="email-preview-frame"
                      title="Email Preview"
                    />
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
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

export default NewsletterEditor;