import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface EmailRecipient {
  email: string;
  name?: string;
  userId?: string;
}

interface NewsletterEmail {
  subject: string;
  htmlContent: string;
  plainTextContent?: string;
  recipients: EmailRecipient[];
  newsletterId: string;
}

// Mailgun service for the edge function
class MailgunService {
  private apiKey: string;
  private domain: string;
  private fromEmail: string;
  private fromName: string;

  constructor() {
    this.apiKey = Deno.env.get('MAILGUN_API_KEY') || '';
    this.domain = Deno.env.get('MAILGUN_DOMAIN') || '';
    this.fromEmail = Deno.env.get('MAILGUN_FROM_EMAIL') || 'noreply@example.com';
    this.fromName = Deno.env.get('MAILGUN_FROM_NAME') || 'DGCG Newsletter';
  }

  isConfigured(): boolean {
    return !!(this.apiKey && this.domain);
  }

  private getMailgunUrl(): string {
    return `https://api.mailgun.net/v3/${this.domain}/messages`;
  }

  private getAuthHeader(): string {
    return 'Basic ' + btoa(`api:${this.apiKey}`);
  }

  private addUnsubscribeFooter(htmlContent: string, recipient: EmailRecipient): string {
    const baseUrl = Deno.env.get('FRONTEND_URL') || 'http://localhost:3000';
    const unsubscribeUrl = `${baseUrl}/unsubscribe?email=${encodeURIComponent(recipient.email)}&userId=${recipient.userId}`;
    
    const footer = `
      <div style="margin-top: 40px; padding-top: 20px; border-top: 1px solid #eee; text-align: center; color: #666; font-size: 14px;">
        <p>You received this email because you're subscribed to our newsletter.</p>
        <p>
          <a href="${unsubscribeUrl}" style="color: #666;">Unsubscribe</a> | 
          <a href="${baseUrl}/preferences?userId=${recipient.userId}" style="color: #666;">Manage Preferences</a>
        </p>
        <p style="font-size: 12px; color: #999;">
          DGCG Newsletter<br>
          Sent with ❤️ by DGCG
        </p>
      </div>
    `;

    // Insert footer before closing body tag, or append if no body tag
    if (htmlContent.includes('</body>')) {
      return htmlContent.replace('</body>', footer + '</body>');
    } else {
      return htmlContent + footer;
    }
  }

  async sendNewsletter(newsletter: NewsletterEmail): Promise<{
    success: boolean;
    results: Array<{
      recipient: EmailRecipient;
      success: boolean;
      messageId?: string;
      error?: string;
    }>;
  }> {
    if (!this.isConfigured()) {
      throw new Error('Mailgun is not configured. Please set environment variables.');
    }

    console.log(`Sending newsletter to ${newsletter.recipients.length} recipients...`);

    const results: Array<{
      recipient: EmailRecipient;
      success: boolean;
      messageId?: string;
      error?: string;
    }> = [];

    // Send emails in batches to avoid rate limits
    const batchSize = 100; // Mailgun's batch limit
    const batches = [];
    
    for (let i = 0; i < newsletter.recipients.length; i += batchSize) {
      batches.push(newsletter.recipients.slice(i, i + batchSize));
    }

    for (const batch of batches) {
      try {
        // For batch sending, we'll send to multiple recipients in one API call
        const recipientEmails = batch.map(r => r.email).join(', ');
        
        const formData = new FormData();
        formData.append('from', `${this.fromName} <${this.fromEmail}>`);
        formData.append('to', recipientEmails);
        formData.append('subject', newsletter.subject);
        
        // Add HTML content with unsubscribe footer for the first recipient
        const htmlWithFooter = this.addUnsubscribeFooter(newsletter.htmlContent, batch[0]);
        formData.append('html', htmlWithFooter);
        
        if (newsletter.plainTextContent) {
          formData.append('text', newsletter.plainTextContent);
        }

        // Add tracking
        formData.append('o:tracking', 'yes');
        formData.append('o:tracking-clicks', 'yes');
        formData.append('o:tracking-opens', 'yes');

        // Add custom variables for tracking
        formData.append('v:newsletter_id', newsletter.newsletterId);

        const response = await fetch(this.getMailgunUrl(), {
          method: 'POST',
          headers: {
            'Authorization': this.getAuthHeader(),
          },
          body: formData,
        });

        const result = await response.json();

        if (response.ok) {
          // Mark all recipients in this batch as successful
          batch.forEach(recipient => {
            results.push({
              recipient,
              success: true,
              messageId: result.id,
            });
          });
          
          console.log(`Batch sent successfully: ${result.id}`);
        } else {
          // Mark all recipients in this batch as failed
          batch.forEach(recipient => {
            results.push({
              recipient,
              success: false,
              error: result.message || 'Unknown error',
            });
          });
          
          console.error('Mailgun batch send failed:', result);
        }

      } catch (error) {
        // Mark all recipients in this batch as failed
        batch.forEach(recipient => {
          results.push({
            recipient,
            success: false,
            error: error instanceof Error ? error.message : 'Network error',
          });
        });
        
        console.error('Error sending batch:', error);
      }

      // Add delay between batches to respect rate limits
      if (batches.length > 1) {
        await new Promise(resolve => setTimeout(resolve, 1000)); // 1 second delay
      }
    }

    const successCount = results.filter(r => r.success).length;
    const failureCount = results.filter(r => !r.success).length;

    console.log(`Newsletter sending complete: ${successCount} successful, ${failureCount} failed`);

    return {
      success: failureCount === 0,
      results,
    };
  }
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    // Initialize Supabase client
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    // Verify authentication
    const authHeader = req.headers.get('Authorization')!
    const token = authHeader.replace('Bearer ', '')
    
    const { data: { user }, error: authError } = await supabaseClient.auth.getUser(token)
    
    if (authError || !user) {
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }),
        { 
          status: 401, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    // Verify user is admin
    const { data: profile, error: profileError } = await supabaseClient
      .from('users_profiles')
      .select('type')
      .eq('id', user.id)
      .single()

    if (profileError || profile?.type !== 'admin') {
      return new Response(
        JSON.stringify({ error: 'Forbidden: Admin access required' }),
        { 
          status: 403, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    // Parse request body
    const { newsletterId } = await req.json()

    if (!newsletterId) {
      return new Response(
        JSON.stringify({ error: 'Newsletter ID is required' }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    // Fetch newsletter
    const { data: newsletter, error: newsletterError } = await supabaseClient
      .from('newsletters')
      .select('*')
      .eq('id', newsletterId)
      .single()

    if (newsletterError || !newsletter) {
      return new Response(
        JSON.stringify({ error: `Newsletter not found: ${newsletterError?.message}` }),
        { 
          status: 404, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    if (newsletter.status === 'sent') {
      return new Response(
        JSON.stringify({ error: 'Newsletter has already been sent' }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    // Get eligible subscribers
    let subscriberQuery = supabaseClient
      .from('users_profiles')
      .select('id, email, type, created_at, newsletter_subscribed, newsletter_preferences')
      .not('email', 'is', null)
      .in('type', ['free_user', 'paid_user'])
      .eq('newsletter_subscribed', true)

    // If it's a paid newsletter, only include paid users
    if (newsletter.access_type === 'paid') {
      subscriberQuery = subscriberQuery.eq('type', 'paid_user')
    }

    const { data: subscribers, error: subscribersError } = await subscriberQuery

    if (subscribersError) {
      return new Response(
        JSON.stringify({ error: `Failed to fetch subscribers: ${subscribersError.message}` }),
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    // Filter subscribers based on preferences
    const eligibleSubscribers = (subscribers || []).filter(subscriber => {
      if (!subscriber.email || subscriber.email.trim() === '') {
        return false;
      }

      const preferences = subscriber.newsletter_preferences || {};
      if (newsletter.access_type === 'free') {
        return preferences.free_newsletters !== false;
      } else {
        return preferences.paid_newsletters !== false;
      }
    });

    if (eligibleSubscribers.length === 0) {
      return new Response(
        JSON.stringify({ error: 'No eligible subscribers found' }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    // Initialize Mailgun service
    const mailgunService = new MailgunService();
    
    if (!mailgunService.isConfigured()) {
      return new Response(
        JSON.stringify({ error: 'Mailgun is not configured. Please set environment variables.' }),
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    // Prepare email data
    const emailData: NewsletterEmail = {
      subject: newsletter.subject,
      htmlContent: newsletter.body,
      plainTextContent: newsletter.plain_text,
      recipients: eligibleSubscribers.map(subscriber => ({
        email: subscriber.email,
        name: subscriber.email.split('@')[0],
        userId: subscriber.id,
      })),
      newsletterId: newsletterId,
    };

    // Send via Mailgun
    const sendResult = await mailgunService.sendNewsletter(emailData);

    // Track individual sends in database
    const sendRecords = sendResult.results.map(result => ({
      newsletter_id: newsletterId,
      user_id: result.recipient.userId!,
      email: result.recipient.email,
      status: result.success ? 'sent' : 'failed',
      mailgun_id: result.messageId,
      error_message: result.error,
      metadata: {
        sent_at: new Date().toISOString(),
      },
    }));

    // Insert send records
    const { error: insertsError } = await supabaseClient
      .from('newsletter_sends')
      .insert(sendRecords);

    if (insertsError) {
      console.error('Error inserting send records:', insertsError);
    }

    // Update newsletter with final results
    const successfulSends = sendResult.results.filter(r => r.success).length;
    const failedSends = sendResult.results.filter(r => !r.success).length;

    await supabaseClient
      .from('newsletters')
      .update({
        status: 'sent',
        sent_at: new Date().toISOString(),
        recipient_count: successfulSends,
        metadata: {
          total_attempted: eligibleSubscribers.length,
          successful_sends: successfulSends,
          failed_sends: failedSends,
          sent_at: new Date().toISOString(),
        },
      })
      .eq('id', newsletterId);

    const errors = sendResult.results
      .filter(r => !r.success)
      .map(r => `${r.recipient.email}: ${r.error}`)
      .slice(0, 10);

    return new Response(
      JSON.stringify({
        success: sendResult.success,
        totalSent: successfulSends,
        totalFailed: failedSends,
        errors,
      }),
      { 
        status: 200, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );

  } catch (error) {
    console.error('Error in send-newsletter function:', error);
    
    return new Response(
      JSON.stringify({ 
        error: error instanceof Error ? error.message : 'Unknown error occurred' 
      }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
})