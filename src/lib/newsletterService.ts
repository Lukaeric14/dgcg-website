import { supabase } from './supabase';

export interface Newsletter {
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

export interface Subscriber {
  id: string;
  email: string;
  type: 'free_user' | 'paid_user' | 'admin';
  created_at: string;
}

class NewsletterService {
  /**
   * Get eligible subscribers for a newsletter based on access type
   */
  async getEligibleSubscribers(accessType: 'free' | 'paid'): Promise<Subscriber[]> {
    try {
      let query = supabase
        .from('users_profiles')
        .select('id, email, type, created_at, newsletter_subscribed, newsletter_preferences')
        .not('email', 'is', null) // Only users with email addresses
        .in('type', ['free_user', 'paid_user']) // Exclude admins from newsletters
        .eq('newsletter_subscribed', true); // Only subscribed users

      // If it's a paid newsletter, only include paid users
      if (accessType === 'paid') {
        query = query.eq('type', 'paid_user');
      }

      const { data, error } = await query;

      if (error) {
        console.error('Error fetching subscribers:', error);
        throw new Error(`Failed to fetch subscribers: ${error.message}`);
      }

      // Filter out users without email addresses and check preferences
      const validSubscribers = (data || []).filter(subscriber => {
        if (!subscriber.email || subscriber.email.trim() === '') {
          return false;
        }

        // Check newsletter preferences
        const preferences = subscriber.newsletter_preferences || {};
        if (accessType === 'free') {
          return preferences.free_newsletters !== false; // Default to true if not set
        } else {
          return preferences.paid_newsletters !== false; // Default to true if not set
        }
      });

      console.log(`Found ${validSubscribers.length} eligible subscribers for ${accessType} newsletter`);
      return validSubscribers;

    } catch (error) {
      console.error('Error in getEligibleSubscribers:', error);
      throw error;
    }
  }

  /**
   * Send a newsletter to eligible subscribers using Supabase Edge Function
   */
  async sendNewsletter(
    newsletterId: string,
    onProgress?: (sent: number, total: number, current: string) => void
  ): Promise<{
    success: boolean;
    totalSent: number;
    totalFailed: number;
    errors: string[];
  }> {
    try {
      // Get the current user's session for authentication
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();
      
      if (sessionError || !session) {
        throw new Error('You must be logged in to send newsletters');
      }

      onProgress?.(0, 1, 'Starting to send...');

      // Call the Supabase Edge Function
      const { data, error } = await supabase.functions.invoke('send-newsletter', {
        body: { newsletterId },
        headers: {
          Authorization: `Bearer ${session.access_token}`,
        },
      });

      if (error) {
        console.error('Error calling send-newsletter function:', error);
        throw new Error(`Failed to send newsletter: ${error.message}`);
      }

      if (data.error) {
        throw new Error(data.error);
      }

      onProgress?.(data.totalSent || 0, data.totalSent + data.totalFailed || 1, 'Completed');

      return {
        success: data.success || false,
        totalSent: data.totalSent || 0,
        totalFailed: data.totalFailed || 0,
        errors: data.errors || [],
      };

    } catch (error) {
      console.error('Error sending newsletter:', error);
      
      // Update newsletter status to failed
      await supabase
        .from('newsletters')
        .update({ 
          status: 'cancelled',
          metadata: {
            error: error instanceof Error ? error.message : 'Unknown error',
            failed_at: new Date().toISOString(),
          }
        })
        .eq('id', newsletterId);

      throw error;
    }
  }

  /**
   * Send a test email using Edge Function
   */
  async sendTestEmail(
    newsletter: Newsletter,
    testEmail: string
  ): Promise<{ success: boolean; error?: string }> {
    try {
      // Get the current user's session for authentication
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();
      
      if (sessionError || !session) {
        throw new Error('You must be logged in to send test emails');
      }

      // Create a temporary newsletter for testing
      const testNewsletter = {
        ...newsletter,
        id: 'test-' + Date.now(),
        title: '[TEST] ' + newsletter.title,
        subject: '[TEST] ' + newsletter.subject,
      };

      // Call the Edge Function with test flag
      const { data, error } = await supabase.functions.invoke('send-test-email', {
        body: { 
          newsletter: testNewsletter,
          testEmail: testEmail 
        },
        headers: {
          Authorization: `Bearer ${session.access_token}`,
        },
      });

      if (error) {
        console.error('Error calling send-test-email function:', error);
        return {
          success: false,
          error: `Failed to send test email: ${error.message}`,
        };
      }

      if (data.error) {
        return {
          success: false,
          error: data.error,
        };
      }

      return {
        success: data.success || true,
        error: data.error,
      };

    } catch (error) {
      console.error('Error sending test email:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  /**
   * Get newsletter analytics
   */
  async getNewsletterAnalytics(newsletterId: string) {
    try {
      const { data: sends, error } = await supabase
        .from('newsletter_sends')
        .select('status, sent_at, error_message')
        .eq('newsletter_id', newsletterId);

      if (error) {
        throw new Error(`Failed to fetch analytics: ${error.message}`);
      }

      const total = sends?.length || 0;
      const sent = sends?.filter(s => s.status === 'sent').length || 0;
      const failed = sends?.filter(s => s.status === 'failed').length || 0;
      const delivered = sends?.filter(s => s.status === 'delivered').length || 0;
      const opened = sends?.filter(s => s.status === 'opened').length || 0;
      const clicked = sends?.filter(s => s.status === 'clicked').length || 0;

      return {
        total,
        sent,
        failed,
        delivered,
        opened,
        clicked,
        deliveryRate: total > 0 ? (delivered / total) * 100 : 0,
        openRate: delivered > 0 ? (opened / delivered) * 100 : 0,
        clickRate: opened > 0 ? (clicked / opened) * 100 : 0,
      };

    } catch (error) {
      console.error('Error fetching newsletter analytics:', error);
      throw error;
    }
  }

  /**
   * Validate Mailgun configuration via Edge Function
   */
  async validateMailgunConfig(): Promise<{ valid: boolean; error?: string }> {
    try {
      // Get the current user's session for authentication
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();
      
      if (sessionError || !session) {
        return {
          valid: false,
          error: 'You must be logged in to validate configuration',
        };
      }

      // Call the Edge Function to validate config
      const { data, error } = await supabase.functions.invoke('validate-mailgun', {
        body: {},
        headers: {
          Authorization: `Bearer ${session.access_token}`,
        },
      });

      if (error) {
        return {
          valid: false,
          error: `Failed to validate: ${error.message}`,
        };
      }

      return {
        valid: data.valid || false,
        error: data.error,
      };

    } catch (error) {
      return {
        valid: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }
}

export const newsletterService = new NewsletterService();