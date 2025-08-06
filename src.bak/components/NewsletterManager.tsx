import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "./ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";
import { Plus, Pencil, Trash2, Send, Eye, Calendar } from "lucide-react";
import NewsletterEditor from './NewsletterEditor';
import './NewsletterManager.css';

interface Newsletter {
  id: string;
  title: string;
  subject: string;
  body: string;
  plain_text?: string;
  access_type: 'free' | 'paid';
  status: 'draft' | 'scheduled' | 'sent' | 'cancelled';
  author_id: string;
  created_at: string;
  updated_at: string;
  scheduled_at?: string;
  sent_at?: string;
  recipient_count: number;
  metadata?: any;
}

const NewsletterManager: React.FC = () => {
  const { user } = useAuth();
  const [newsletters, setNewsletters] = useState<Newsletter[]>([]);
  const [loading, setLoading] = useState(true);
  const [showEditor, setShowEditor] = useState(false);
  const [editingNewsletterId, setEditingNewsletterId] = useState<string | undefined>(undefined);
  const [filterStatus, setFilterStatus] = useState<'all' | 'draft' | 'scheduled' | 'sent'>('all');
  const [filterAccessType, setFilterAccessType] = useState<'all' | 'free' | 'paid'>('all');

  useEffect(() => {
    fetchNewsletters();
  }, []);

  const fetchNewsletters = async () => {
    try {
      console.log('Fetching newsletters...');
      
      const { data: newslettersData, error } = await supabase
        .from('newsletters')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching newsletters:', error);
      } else {
        console.log('Newsletters fetched:', newslettersData?.length || 0);
        setNewsletters(newslettersData || []);
      }
    } catch (error) {
      console.error('Error in fetchNewsletters:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateNewsletter = () => {
    setEditingNewsletterId(undefined);
    setShowEditor(true);
  };

  const handleEditNewsletter = (newsletterId: string) => {
    setEditingNewsletterId(newsletterId);
    setShowEditor(true);
  };

  const handleBackToList = () => {
    setShowEditor(false);
    setEditingNewsletterId(undefined);
    fetchNewsletters(); // Refresh the newsletters list
  };

  const handleDelete = async (newsletterId: string) => {
    if (!window.confirm('Are you sure you want to delete this newsletter?')) return;

    try {
      const { error } = await supabase
        .from('newsletters')
        .delete()
        .eq('id', newsletterId);

      if (error) {
        console.error('Error deleting newsletter:', error);
        alert('Error deleting newsletter. Please try again.');
      } else {
        fetchNewsletters(); // Refresh the newsletters list
      }
    } catch (error) {
      console.error('Error in handleDelete:', error);
      alert('Error deleting newsletter. Please try again.');
    }
  };

  const handleSendNewsletter = async (newsletterId: string) => {
    if (!window.confirm('Are you sure you want to send this newsletter? This action cannot be undone.')) return;

    try {
      // Import newsletter service dynamically
      const { newsletterService } = await import('../lib/newsletterService');
      
      const result = await newsletterService.sendNewsletter(newsletterId);
      
      if (result.success) {
        alert(`Newsletter sent successfully to ${result.totalSent} subscribers!`);
        fetchNewsletters(); // Refresh the newsletters list to show updated status
      } else {
        alert(`Newsletter sending completed with errors. ${result.totalSent} sent, ${result.totalFailed} failed.`);
      }
    } catch (error) {
      console.error('Error sending newsletter:', error);
      alert(`Error sending newsletter: ${error instanceof Error ? error.message : 'Unknown error'}. Please try again.`);
    }
  };

  const filteredNewsletters = newsletters.filter(newsletter => {
    const matchesStatus = filterStatus === 'all' || newsletter.status === filterStatus;
    const matchesAccessType = filterAccessType === 'all' || newsletter.access_type === filterAccessType;
    return matchesStatus && matchesAccessType;
  });

  const formatDate = (dateString?: string) => {
    if (!dateString) return 'Not set';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'draft':
        return 'newsletter-status-draft';
      case 'scheduled':
        return 'newsletter-status-scheduled';
      case 'sent':
        return 'newsletter-status-sent';
      case 'cancelled':
        return 'newsletter-status-cancelled';
      default:
        return 'newsletter-status-draft';
    }
  };

  const getAccessTypeColor = (type: string) => {
    switch (type) {
      case 'free':
        return 'newsletter-access-free';
      case 'paid':
        return 'newsletter-access-paid';
      default:
        return 'newsletter-access-free';
    }
  };

  if (showEditor) {
    return (
      <NewsletterEditor 
        newsletterId={editingNewsletterId}
        onBack={handleBackToList}
      />
    );
  }

  if (loading) {
    return (
      <div className="newsletter-manager">
        <div className="newsletter-header">
          <h1 className="newsletter-title">Newsletters</h1>
        </div>
        <div className="newsletter-loading">Loading newsletters...</div>
      </div>
    );
  }

  return (
    <div className="newsletter-manager">
      <div className="newsletter-header">
        <h1 className="newsletter-title">Newsletters</h1>
        <Button className="add-newsletter-button" onClick={handleCreateNewsletter}>
          <Plus className="add-icon" />
          Add Newsletter
        </Button>
      </div>

      <div className="newsletter-filters">
        <Select value={filterStatus} onValueChange={(value: 'all' | 'draft' | 'scheduled' | 'sent') => setFilterStatus(value)}>
          <SelectTrigger className="filter-select">
            <SelectValue placeholder="Filter by status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="draft">Draft</SelectItem>
            <SelectItem value="scheduled">Scheduled</SelectItem>
            <SelectItem value="sent">Sent</SelectItem>
          </SelectContent>
        </Select>

        <Select value={filterAccessType} onValueChange={(value: 'all' | 'free' | 'paid') => setFilterAccessType(value)}>
          <SelectTrigger className="filter-select">
            <SelectValue placeholder="Filter by access" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Access</SelectItem>
            <SelectItem value="free">Free</SelectItem>
            <SelectItem value="paid">Paid</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="newsletter-table-container">
        <Table>
          <TableCaption>A list of all your newsletters.</TableCaption>
          <TableHeader>
            <TableRow>
              <TableHead>Title & Subject</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Access</TableHead>
              <TableHead>Recipients</TableHead>
              <TableHead>Created</TableHead>
              <TableHead>Sent</TableHead>
              <TableHead className="actions-column">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredNewsletters.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="no-newsletters">
                  {filterStatus !== 'all' || filterAccessType !== 'all'
                    ? 'No newsletters match your filters.'
                    : 'No newsletters found. Create your first newsletter!'}
                </TableCell>
              </TableRow>
            ) : (
              filteredNewsletters.map((newsletter) => (
                <TableRow key={newsletter.id}>
                  <TableCell className="newsletter-title-cell">
                    <div className="newsletter-title-info">
                      <span className="newsletter-title">{newsletter.title}</span>
                      <span className="newsletter-subject">Subject: {newsletter.subject}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge className={`newsletter-status ${getStatusColor(newsletter.status)}`}>
                      {newsletter.status}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge className={`newsletter-access ${getAccessTypeColor(newsletter.access_type)}`}>
                      {newsletter.access_type}
                    </Badge>
                  </TableCell>
                  <TableCell>{newsletter.recipient_count || 0}</TableCell>
                  <TableCell>{formatDate(newsletter.created_at)}</TableCell>
                  <TableCell>{formatDate(newsletter.sent_at)}</TableCell>
                  <TableCell>
                    <div className="newsletter-actions">
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="edit-button"
                        onClick={() => handleEditNewsletter(newsletter.id)}
                      >
                        <Pencil className="action-icon" />
                      </Button>
                      
                      {newsletter.status === 'draft' && (
                        <Button 
                          variant="outline" 
                          size="sm" 
                          className="send-button"
                          onClick={() => handleSendNewsletter(newsletter.id)}
                        >
                          <Send className="action-icon" />
                        </Button>
                      )}
                      
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="delete-button"
                        onClick={() => handleDelete(newsletter.id)}
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

export default NewsletterManager;