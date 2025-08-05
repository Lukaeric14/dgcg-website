import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Textarea } from "./ui/textarea";
import { Badge } from "./ui/badge";
import {
  Search,
  Plus,
  Save,
  Trash2,
  ExternalLink,
  Tag,
  X,
  StickyNote,
  Globe
} from "lucide-react";
import './NotesManager.css';

interface Note {
  id: string;
  title: string;
  body: string;
  url?: string;
  tags: string[];
  author_id: string;
  created_at: string;
  updated_at: string;
}

const NotesManager: React.FC = () => {
  const { user } = useAuth();
  const [notes, setNotes] = useState<Note[]>([]);
  const [selectedNote, setSelectedNote] = useState<Note | null>(null);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [isCreating, setIsCreating] = useState(false);
  const [newTag, setNewTag] = useState('');
  const [autoSaveTimeout, setAutoSaveTimeout] = useState<NodeJS.Timeout | null>(null);

  const [formData, setFormData] = useState({
    title: '',
    body: '',
    url: '',
    tags: [] as string[]
  });

  useEffect(() => {
    const loadNotes = async () => {
      if (user) {
        await fetchNotes();
      }
    };
    loadNotes();
  }, [user]);

  // Auto-save effect - triggers when form data changes
  useEffect(() => {
    if (!selectedNote && !isCreating) return;
    if (!formData.title.trim()) return;

    // Clear existing timeout
    if (autoSaveTimeout) {
      clearTimeout(autoSaveTimeout);
    }

    // Set new timeout for auto-save (2 seconds after user stops typing)
    const timeoutId = setTimeout(() => {
      handleAutoSave();
    }, 2000);

    setAutoSaveTimeout(timeoutId);

    // Cleanup timeout on unmount
    return () => {
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [formData.title, formData.body, formData.url, formData.tags]);

  // Cleanup timeout when component unmounts
  useEffect(() => {
    return () => {
      if (autoSaveTimeout) {
        clearTimeout(autoSaveTimeout);
      }
    };
  }, [autoSaveTimeout]);

  const fetchNotes = async () => {
    if (!user) return;
    
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('notes')
        .select('*')
        .eq('author_id', user.id)
        .order('updated_at', { ascending: false });

      if (error) {
        console.error('Error fetching notes:', error);
      } else {
        setNotes(data || []);
      }
    } catch (error) {
      console.error('Error in fetchNotes:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAutoSave = async () => {
    if (!user || !formData.title.trim()) return;

    setSaving(true);
    try {
      const noteData = {
        ...formData,
        author_id: user.id,
      };

      if (selectedNote && !isCreating) {
        // Update existing note
        const { error } = await supabase
          .from('notes')
          .update(noteData)
          .eq('id', selectedNote.id);

        if (error) {
          console.error('Error updating note:', error);
        } else {
          await fetchNotes();
          // Update selected note to reflect changes
          const updatedNote = { ...selectedNote, ...noteData, updated_at: new Date().toISOString() };
          setSelectedNote(updatedNote);
          setLastSaved(new Date());
        }
      } else {
        // Create new note
        const { data, error } = await supabase
          .from('notes')
          .insert([noteData])
          .select()
          .single();

        if (error) {
          console.error('Error creating note:', error);
        } else {
          await fetchNotes();
          setSelectedNote(data);
          setIsCreating(false);
          setLastSaved(new Date());
        }
      }
    } catch (error) {
      console.error('Error in auto-save:', error);
    } finally {
      setSaving(false);
    }
  };

  const handleManualSave = async () => {
    if (autoSaveTimeout) {
      clearTimeout(autoSaveTimeout);
      setAutoSaveTimeout(null);
    }
    await handleAutoSave();
  };

  const handleDelete = async () => {
    if (!selectedNote || !window.confirm('Are you sure you want to delete this note?')) return;

    try {
      const { error } = await supabase
        .from('notes')
        .delete()
        .eq('id', selectedNote.id);

      if (error) {
        console.error('Error deleting note:', error);
        alert('Error deleting note. Please try again.');
      } else {
        await fetchNotes();
        setSelectedNote(null);
        setIsCreating(false);
        setFormData({ title: '', body: '', url: '', tags: [] });
      }
    } catch (error) {
      console.error('Error in handleDelete:', error);
      alert('Error deleting note. Please try again.');
    }
  };

  const selectNote = async (note: Note) => {
    // Auto-save current note before switching
    if ((selectedNote || isCreating) && formData.title.trim()) {
      await handleAutoSave();
    }

    setSelectedNote(note);
    setFormData({
      title: note.title,
      body: note.body,
      url: note.url || '',
      tags: note.tags || []
    });
    setIsCreating(false);
    setLastSaved(null);
  };

  const createNewNote = async () => {
    // Auto-save current note before creating new one
    if ((selectedNote || isCreating) && formData.title.trim()) {
      await handleAutoSave();
    }

    setIsCreating(true);
    setSelectedNote(null);
    setFormData({ title: '', body: '', url: '', tags: [] });
    setLastSaved(null);
  };

  const addTag = () => {
    if (newTag.trim() && !formData.tags.includes(newTag.trim())) {
      setFormData(prev => ({
        ...prev,
        tags: [...prev.tags, newTag.trim()]
      }));
      setNewTag('');
    }
  };

  const removeTag = (tagToRemove: string) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.filter(tag => tag !== tagToRemove)
    }));
  };

  const filteredNotes = notes.filter(note =>
    note.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    note.body.toLowerCase().includes(searchTerm.toLowerCase()) ||
    note.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60);
    
    if (diffInHours < 24) {
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } else if (diffInHours < 24 * 7) {
      return date.toLocaleDateString([], { weekday: 'short' });
    } else {
      return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
    }
  };

  const formatLastSaved = () => {
    if (!lastSaved) return '';
    const now = new Date();
    const diffInSeconds = (now.getTime() - lastSaved.getTime()) / 1000;
    
    if (diffInSeconds < 60) {
      return 'Saved just now';
    } else if (diffInSeconds < 3600) {
      const minutes = Math.floor(diffInSeconds / 60);
      return `Saved ${minutes} minute${minutes === 1 ? '' : 's'} ago`;
    } else {
      return `Saved at ${lastSaved.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
    }
  };

  const getPreviewText = (body: string) => {
    return body.length > 100 ? body.substring(0, 100) + '...' : body;
  };

  if (loading) {
    return (
      <div className="notes-manager-loading">
        <StickyNote className="loading-icon" />
        <h2>Loading notes...</h2>
      </div>
    );
  }

  return (
    <div className="notes-manager">
      <div className="notes-sidebar">
        <div className="notes-sidebar-header">
          <div className="notes-sidebar-title">
            <StickyNote className="notes-icon" />
            <h2>Notes</h2>
          </div>
          <Button onClick={createNewNote} className="new-note-button">
            <Plus className="plus-icon" />
          </Button>
        </div>

        <div className="notes-search">
          <div className="search-input-container">
            <Search className="search-icon" />
            <Input
              type="text"
              placeholder="Search notes..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="search-input"
            />
          </div>
        </div>

        <div className="notes-list">
          {filteredNotes.map((note) => (
            <div
              key={note.id}
              className={`note-item ${selectedNote?.id === note.id ? 'selected' : ''}`}
              onClick={() => selectNote(note)}
            >
              <div className="note-item-header">
                <h3 className="note-item-title">{note.title}</h3>
                <span className="note-item-date">{formatDate(note.updated_at)}</span>
              </div>
              <p className="note-item-preview">{getPreviewText(note.body)}</p>
              {note.tags && note.tags.length > 0 && (
                <div className="note-item-tags">
                  {note.tags.slice(0, 3).map((tag) => (
                    <Badge key={tag} variant="secondary" className="note-tag">
                      {tag}
                    </Badge>
                  ))}
                  {note.tags.length > 3 && (
                    <Badge variant="outline" className="note-tag-more">
                      +{note.tags.length - 3}
                    </Badge>
                  )}
                </div>
              )}
            </div>
          ))}
          {filteredNotes.length === 0 && (
            <div className="no-notes">
              <StickyNote className="no-notes-icon" />
              <p>No notes found</p>
              <Button onClick={createNewNote} variant="outline">
                Create your first note
              </Button>
            </div>
          )}
        </div>
      </div>

      <div className="notes-content">
        {(selectedNote || isCreating) ? (
          <>
            <div className="notes-content-header">
              <div className="note-header-info">
                <div className="note-status">
                  {saving && (
                    <span className="saving-indicator">
                      <div className="saving-spinner"></div>
                      Saving...
                    </span>
                  )}
                  {lastSaved && !saving && (
                    <span className="saved-indicator">
                      {formatLastSaved()}
                    </span>
                  )}
                </div>
              </div>
              <div className="notes-actions">
                <Button onClick={handleManualSave} disabled={saving || !formData.title.trim()} className="save-button">
                  <Save className="save-icon" />
                  Save Now
                </Button>
                {selectedNote && !isCreating && (
                  <Button onClick={handleDelete} variant="outline" className="delete-button">
                    <Trash2 className="delete-icon" />
                    Delete
                  </Button>
                )}
              </div>
            </div>

            <div className="notes-form">
              <div className="form-field">
                <Input
                  value={formData.title}
                  onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                  placeholder="Untitled note"
                  className="title-input-large"
                />
              </div>

              <div className="form-field-row">
                <div className="form-field url-field">
                  <div className="url-input-container">
                    <Globe className="url-icon" />
                    <Input
                      value={formData.url}
                      onChange={(e) => setFormData(prev => ({ ...prev, url: e.target.value }))}
                      placeholder="Add a URL..."
                      className="url-input-inline"
                    />
                    {formData.url && (
                      <Button
                        onClick={() => window.open(formData.url, '_blank')}
                        variant="ghost"
                        size="sm"
                        className="open-url-button-inline"
                      >
                        <ExternalLink className="external-link-icon" />
                      </Button>
                    )}
                  </div>
                </div>

                <div className="form-field tags-field">
                  <div className="tags-input-container-inline">
                    <Tag className="tag-icon-inline" />
                    <Input
                      value={newTag}
                      onChange={(e) => setNewTag(e.target.value)}
                      placeholder="Add tags..."
                      className="tag-input-inline"
                      onKeyPress={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          addTag();
                        }
                      }}
                    />
                  </div>
                </div>
              </div>

              {formData.tags.length > 0 && (
                <div className="current-tags-row">
                  {formData.tags.map((tag) => (
                    <Badge key={tag} variant="secondary" className="current-tag-inline">
                      {tag}
                      <button
                        onClick={() => removeTag(tag)}
                        className="remove-tag-button"
                      >
                        <X className="remove-tag-icon" />
                      </button>
                    </Badge>
                  ))}
                </div>
              )}

              <div className="form-field body-field">
                <Textarea
                  value={formData.body}
                  onChange={(e) => setFormData(prev => ({ ...prev, body: e.target.value }))}
                  placeholder="Start writing..."
                  className="body-textarea-large"
                  rows={20}
                />
              </div>
            </div>
          </>
        ) : (
          <div className="notes-empty-state">
            <StickyNote className="empty-state-icon" />
            <h3>Select a note to view</h3>
            <p>Choose a note from the sidebar to view and edit its content.</p>
            <Button onClick={createNewNote} className="create-note-button">
              <Plus className="plus-icon" />
              Create New Note
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};

export default NotesManager;