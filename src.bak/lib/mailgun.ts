// Mailgun integration for sending newsletters
// Make sure to set these environment variables in your .env file:
// REACT_APP_MAILGUN_API_KEY=your_mailgun_api_key
// REACT_APP_MAILGUN_DOMAIN=your_mailgun_domain
// REACT_APP_MAILGUN_FROM_EMAIL=noreply@yourdomain.com

interface MailgunConfig {
  apiKey: string;
  domain: string;
  fromEmail: string;
  fromName: string;
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

class MailgunService {
  private config: MailgunConfig;

  constructor() {
    this.config = {
      apiKey: process.env.REACT_APP_MAILGUN_API_KEY || '',
      domain: process.env.REACT_APP_MAILGUN_DOMAIN || '',
      fromEmail: process.env.REACT_APP_MAILGUN_FROM_EMAIL || 'noreply@example.com',
      fromName: process.env.REACT_APP_MAILGUN_FROM_NAME || 'DGCG Newsletter',
    };

    if (!this.config.apiKey || !this.config.domain) {
      console.warn('Mailgun not configured. Please set REACT_APP_MAILGUN_API_KEY and REACT_APP_MAILGUN_DOMAIN');
    }
  }

  isConfigured(): boolean {
    return !!(this.config.apiKey && this.config.domain);
  }

  private getMailgunUrl(): string {
    return `https://api.mailgun.net/v3/${this.config.domain}/messages`;
  }

  private getAuthHeader(): string {
    return 'Basic ' + btoa(`api:${this.config.apiKey}`);
  }

  private addUnsubscribeFooter(htmlContent: string, recipient: EmailRecipient): string {
    const unsubscribeUrl = `${window.location.origin}/unsubscribe?email=${encodeURIComponent(recipient.email)}&userId=${recipient.userId}`;
    
    const footer = `
      <div style="margin-top: 40px; padding-top: 20px; border-top: 1px solid #eee; text-align: center; color: #666; font-size: 14px;">
        <p>You received this email because you're subscribed to our newsletter.</p>
        <p>
          <a href="${unsubscribeUrl}" style="color: #666;">Unsubscribe</a> | 
          <a href="${window.location.origin}/preferences?userId=${recipient.userId}" style="color: #666;">Manage Preferences</a>
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
        formData.append('from', `${this.config.fromName} <${this.config.fromEmail}>`);
        formData.append('to', recipientEmails);
        formData.append('subject', newsletter.subject);
        
        // Add HTML content with unsubscribe footer for the first recipient (Mailgun will handle personalization)
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

  async sendTestEmail(
    toEmail: string, 
    subject: string, 
    htmlContent: string, 
    plainTextContent?: string
  ): Promise<{ success: boolean; messageId?: string; error?: string }> {
    if (!this.isConfigured()) {
      throw new Error('Mailgun is not configured.');
    }

    try {
      const formData = new FormData();
      formData.append('from', `${this.config.fromName} <${this.config.fromEmail}>`);
      formData.append('to', toEmail);
      formData.append('subject', `[TEST] ${subject}`);
      formData.append('html', htmlContent);
      
      if (plainTextContent) {
        formData.append('text', plainTextContent);
      }

      const response = await fetch(this.getMailgunUrl(), {
        method: 'POST',
        headers: {
          'Authorization': this.getAuthHeader(),
        },
        body: formData,
      });

      const result = await response.json();

      if (response.ok) {
        return {
          success: true,
          messageId: result.id,
        };
      } else {
        return {
          success: false,
          error: result.message || 'Unknown error',
        };
      }
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Network error',
      };
    }
  }

  async validateDomain(): Promise<{ valid: boolean; error?: string }> {
    if (!this.isConfigured()) {
      return { valid: false, error: 'Mailgun not configured' };
    }

    try {
      const response = await fetch(`https://api.mailgun.net/v3/domains/${this.config.domain}`, {
        headers: {
          'Authorization': this.getAuthHeader(),
        },
      });

      if (response.ok) {
        return { valid: true };
      } else {
        const result = await response.json();
        return { valid: false, error: result.message };
      }
    } catch (error) {
      return { 
        valid: false, 
        error: error instanceof Error ? error.message : 'Network error' 
      };
    }
  }
}

export const mailgunService = new MailgunService();
export type { EmailRecipient, NewsletterEmail };