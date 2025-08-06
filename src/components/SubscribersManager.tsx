import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { Input } from "./ui/input";
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
import { Search, Users, Filter } from "lucide-react";
import './SubscribersManager.css';

interface Subscriber {
  id: string;
  type: 'free_user' | 'paid_user' | 'admin';
  created_at: string;
  email?: string;
  full_name?: string;
  last_sign_in_at?: string;
  email_confirmed_at?: string;
}

const SubscribersManager: React.FC = () => {
  const [subscribers, setSubscribers] = useState<Subscriber[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<'all' | 'free_user' | 'paid_user'>('all');
  const [stats, setStats] = useState({
    total: 0,
    free_users: 0,
    paid_users: 0,
    admins: 0
  });

  useEffect(() => {
    fetchSubscribers();
  }, []);

  const fetchSubscribers = async () => {
    try {
      console.log('Fetching subscribers...');
      
      // Get all profiles with the new email columns
      const { data: allProfiles, error: allProfilesError } = await supabase
        .from('users_profiles')
        .select('id, type, created_at, email, full_name, last_sign_in_at, email_confirmed_at');
      
      console.log('All profiles query result:', { 
        data: allProfiles, 
        error: allProfilesError,
        count: allProfiles?.length || 0 
      });

      // Filter for subscribers only (free_user and paid_user)
      let profiles: any[] = [];
      if (allProfiles) {
        profiles = allProfiles.filter(profile => 
          profile.type === 'free_user' || profile.type === 'paid_user'
        );
      }

      // If the above fails, try the original filtered query
      if (allProfilesError || !allProfiles) {
        console.log('Falling back to filtered query...');
        const { data: filteredProfiles, error: filteredError } = await supabase
          .from('users_profiles')
          .select('id, type, created_at, email, full_name, last_sign_in_at, email_confirmed_at')
          .in('type', ['free_user', 'paid_user']);

        if (filteredError) {
          console.error('Error fetching user profiles:', filteredError);
          setSubscribers([]);
          setStats({ total: 0, free_users: 0, paid_users: 0, admins: 0 });
          setLoading(false);
          return;
        }
        
        profiles = filteredProfiles || [];
      }

      console.log('Filtered profiles:', profiles);

      // Get auth user data for emails and sign-in info
      const userIds = profiles?.map(profile => profile.id) || [];
      
      if (userIds.length === 0) {
        console.log('No subscriber profiles found');
        console.log('This might mean:');
        console.log('1. No users have registered yet');
        console.log('2. User profiles are not being created in users_profiles table');
        console.log('3. RLS policies are preventing access');
        setSubscribers([]);
        setStats({ total: 0, free_users: 0, paid_users: 0, admins: 0 });
        setLoading(false);
        return;
      }

      // Now we can use the data directly from profiles (no need for complex auth fetching)
      console.log('Using profile data with email columns...');
      
      const combinedData: Subscriber[] = profiles.map(profile => ({
        id: profile.id,
        type: profile.type,
        created_at: profile.created_at,
        email: profile.email || 'No email',
        full_name: profile.full_name,
        last_sign_in_at: profile.last_sign_in_at,
        email_confirmed_at: profile.email_confirmed_at,
      }));

      console.log('Final combined data:', combinedData);
      setSubscribers(combinedData);

      // Calculate stats
      const statsData = {
        total: combinedData.length,
        free_users: combinedData.filter(s => s.type === 'free_user').length,
        paid_users: combinedData.filter(s => s.type === 'paid_user').length,
        admins: combinedData.filter(s => s.type === 'admin').length,
      };
      setStats(statsData);

    } catch (error) {
      console.error('Error in fetchSubscribers:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredSubscribers = subscribers.filter(subscriber => {
    const matchesSearch = !searchTerm || 
      subscriber.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      subscriber.id.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesFilter = filterType === 'all' || subscriber.type === filterType;
    
    return matchesSearch && matchesFilter;
  });

  const formatDate = (dateString?: string) => {
    if (!dateString) return 'Never';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getSubscriberTypeColor = (type: string) => {
    switch (type) {
      case 'free_user':
        return 'subscriber-type-free';
      case 'paid_user':
        return 'subscriber-type-paid';
      case 'admin':
        return 'subscriber-type-admin';
      default:
        return 'subscriber-type-free';
    }
  };

  const getSubscriberTypeLabel = (type: string) => {
    switch (type) {
      case 'free_user':
        return 'Free User';
      case 'paid_user':
        return 'Paid User';
      case 'admin':
        return 'Admin';
      default:
        return type;
    }
  };

  if (loading) {
    return (
      <div className="subscribers-manager">
        <div className="subscribers-header">
          <h1 className="subscribers-title">Subscribers</h1>
        </div>
        <div className="subscribers-loading">Loading subscribers...</div>
      </div>
    );
  }

  return (
    <div className="subscribers-manager">
      <div className="subscribers-header">
        <h1 className="subscribers-title text-palatino-h3 text-dark">Subscribers</h1>
        <div className="subscribers-stats">
          <div className="subscribers-stat-item">
            <Users className="subscribers-stat-icon" />
            <span className="subscribers-stat-number text-palatino-h2-title text-dark">{stats.total}</span>
            <span className="subscribers-stat-label text-palatino-body text-gray">Total</span>
          </div>
          <div className="subscribers-stat-item">
            <span className="subscribers-stat-number text-palatino-h2-title text-dark">{stats.free_users}</span>
            <span className="subscribers-stat-label text-palatino-body text-gray">Free</span>
          </div>
          <div className="subscribers-stat-item">
            <span className="subscribers-stat-number text-palatino-h2-title text-dark">{stats.paid_users}</span>
            <span className="subscribers-stat-label text-palatino-body text-gray">Paid</span>
          </div>
        </div>
      </div>

      <div className="subscribers-filters">
        <div className="subscribers-search-box">
          <Search className="subscribers-search-icon" />
          <Input
            placeholder="Search by email or ID..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="subscribers-search-input"
          />
        </div>
        <Select value={filterType} onValueChange={(value: 'all' | 'free_user' | 'paid_user') => setFilterType(value)}>
          <SelectTrigger className="subscribers-filter-select">
            <Filter className="subscribers-filter-icon" />
            <SelectValue placeholder="Filter by type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Subscribers</SelectItem>
            <SelectItem value="free_user">Free Users</SelectItem>
            <SelectItem value="paid_user">Paid Users</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="subscribers-table-container">
        <Table>
          <TableCaption>
            Showing {filteredSubscribers.length} of {subscribers.length} subscribers
          </TableCaption>
          <TableHeader>
            <TableRow>
              <TableHead>Email</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Created</TableHead>
              <TableHead>Last Sign In</TableHead>
              <TableHead>Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredSubscribers.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="no-subscribers">
                  {searchTerm || filterType !== 'all' 
                    ? 'No subscribers match your filters.'
                    : subscribers.length === 0 
                      ? (
                        <div>
                          <div>No subscribers found in the database.</div>
                          <div style={{ marginTop: '8px', fontSize: '14px', color: '#6b7280' }}>
                            This might mean user profiles aren't being created automatically. 
                            Check the browser console for more details.
                          </div>
                        </div>
                      )
                      : 'No subscribers found.'}
                </TableCell>
              </TableRow>
            ) : (
              filteredSubscribers.map((subscriber) => (
                <TableRow key={subscriber.id}>
                  <TableCell className="subscriber-email-cell">
                    <div className="subscriber-email-info">
                      <span className="subscriber-email">
                        {subscriber.email || 'No email available'}
                      </span>
                      <span className="subscriber-id">ID: {subscriber.id.substring(0, 8)}...</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <span className={`subscriber-type ${getSubscriberTypeColor(subscriber.type)}`}>
                      {getSubscriberTypeLabel(subscriber.type)}
                    </span>
                  </TableCell>
                  <TableCell>{formatDate(subscriber.created_at)}</TableCell>
                  <TableCell>{formatDate(subscriber.last_sign_in_at)}</TableCell>
                  <TableCell>
                    <span className={`status-badge ${subscriber.email_confirmed_at ? 'status-confirmed' : 'status-unconfirmed'}`}>
                      {subscriber.email_confirmed_at ? 'Confirmed' : 'Unconfirmed'}
                    </span>
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

export default SubscribersManager;