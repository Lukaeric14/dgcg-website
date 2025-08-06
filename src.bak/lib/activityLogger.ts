import { supabase } from './supabase';

export type ActivityType = 
  | 'user_registered'
  | 'user_subscribed'
  | 'user_unsubscribed'
  | 'article_published'
  | 'newsletter_sent';

export interface ActivityLogEntry {
  type: ActivityType;
  title: string;
  description?: string;
  userId?: string;
  metadata?: Record<string, any>;
}

export interface Activity {
  id: string;
  type: ActivityType;
  title: string;
  description?: string;
  created_at: string;
  user_email?: string;
  user_type?: string;
  metadata?: Record<string, any>;
}

class ActivityLogger {
  /**
   * Log an activity to the database
   */
  async logActivity(entry: ActivityLogEntry): Promise<string | null> {
    try {
      const { data, error } = await supabase.rpc('log_activity', {
        activity_type: entry.type,
        activity_title: entry.title,
        activity_description: entry.description || null,
        activity_user_id: entry.userId || null,
        activity_metadata: entry.metadata || {},
      });

      if (error) {
        console.error('Error logging activity:', error);
        return null;
      }

      console.log(`Activity logged: ${entry.type} - ${entry.title}`);
      return data;
    } catch (error) {
      console.error('Error in logActivity:', error);
      return null;
    }
  }

  /**
   * Get recent activities for dashboard
   */
  async getRecentActivities(limit: number = 10): Promise<Activity[]> {
    try {
      const { data, error } = await supabase.rpc('get_recent_activities', {
        limit_count: limit,
      });

      if (error) {
        console.error('Error fetching recent activities:', error);
        return [];
      }

      return data || [];
    } catch (error) {
      console.error('Error in getRecentActivities:', error);
      return [];
    }
  }



  /**
   * Format activity for display
   */
  formatActivityForDisplay(activity: Activity): {
    title: string;
    description: string;
    timeAgo: string;
    icon: string;
    color: string;
  } {
    const timeAgo = this.getTimeAgo(new Date(activity.created_at));
    
    const activityFormatting: Record<ActivityType, { icon: string; color: string }> = {
      user_registered: { icon: '👤', color: 'text-blue-600' },
      user_subscribed: { icon: '📧', color: 'text-green-600' },
      user_unsubscribed: { icon: '📧', color: 'text-red-600' },
      article_published: { icon: '📝', color: 'text-blue-600' },
      newsletter_sent: { icon: '🚀', color: 'text-green-600' },
    };

    const formatting = activityFormatting[activity.type] || { icon: '📋', color: 'text-gray-600' };

    return {
      title: activity.title,
      description: activity.description || 'No description available',
      timeAgo,
      icon: formatting.icon,
      color: formatting.color,
    };
  }

  /**
   * Get human-readable time ago string
   */
  private getTimeAgo(date: Date): string {
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

    if (diffInSeconds < 60) {
      return 'Just now';
    }

    const diffInMinutes = Math.floor(diffInSeconds / 60);
    if (diffInMinutes < 60) {
      return `${diffInMinutes} minute${diffInMinutes !== 1 ? 's' : ''} ago`;
    }

    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) {
      return `${diffInHours} hour${diffInHours !== 1 ? 's' : ''} ago`;
    }

    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays < 7) {
      return `${diffInDays} day${diffInDays !== 1 ? 's' : ''} ago`;
    }

    const diffInWeeks = Math.floor(diffInDays / 7);
    if (diffInWeeks < 4) {
      return `${diffInWeeks} week${diffInWeeks !== 1 ? 's' : ''} ago`;
    }

    return date.toLocaleDateString();
  }
}

export const activityLogger = new ActivityLogger();