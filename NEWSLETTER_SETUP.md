# Newsletter System Setup Guide

## 🎯 Overview

This newsletter system provides:
- **Rich HTML newsletter creation** with Tiptap editor
- **Real-time email preview** 
- **Subscriber segmentation** (free vs paid)
- **Mailgun integration** for reliable delivery
- **Send tracking** and analytics
- **Comprehensive admin interface**

## 📋 Prerequisites

1. **Supabase project** with admin access
2. **Mailgun account** (free tier available)
3. **Verified domain** for sending emails

## 🚀 Setup Instructions

### Step 1: Database Setup

Run this SQL in your Supabase SQL Editor:

```sql
-- Run the newsletter-schema.sql file
-- This creates newsletters and newsletter_sends tables with proper RLS
```

### Step 2: Environment Variables

Add these to your `.env` file:

```bash
# Mailgun Configuration
REACT_APP_MAILGUN_API_KEY=your_mailgun_api_key
REACT_APP_MAILGUN_DOMAIN=your_mailgun_domain  
REACT_APP_MAILGUN_FROM_EMAIL=noreply@yourdomain.com
REACT_APP_MAILGUN_FROM_NAME=DGCG Newsletter
```

### Step 3: Mailgun Setup

1. **Sign up** at [mailgun.com](https://mailgun.com)
2. **Add your domain**:
   - Go to Sending → Domains
   - Add your domain (e.g., `yourdomain.com`)
   - Follow DNS verification steps
3. **Get API Key**:
   - Go to Settings → API Keys
   - Copy your private API key
4. **Configure DNS** (required for domain verification):
   ```
   TXT: v=spf1 include:mailgun.org ~all
   CNAME: mg → mailgun.org
   MX: 10 mxa.mailgun.org
   MX: 10 mxb.mailgun.org
   ```

### Step 4: Test Configuration

In your newsletter admin:
1. Go to **Newsletter** section
2. Create a test newsletter
3. Use **Send Test Email** feature
4. Verify delivery to your email

## 📊 Features Implemented

### Core Functionality
- ✅ Newsletter CRUD operations
- ✅ Rich text editor with HTML output
- ✅ Real-time email preview
- ✅ Free vs Paid subscriber segmentation
- ✅ Mailgun integration for sending
- ✅ Send tracking and status updates
- ✅ Responsive admin interface

### Subscriber Management
- ✅ Automatic subscriber segmentation
- ✅ Email validation and filtering
- ✅ Delivery status tracking
- ✅ Unsubscribe link generation

### Editor Features
- ✅ WYSIWYG editing with Tiptap
- ✅ Text formatting (bold, italic, headings)
- ✅ Lists and links
- ✅ Image embedding
- ✅ Auto-generated plain text version
- ✅ Live HTML preview

### Email Features
- ✅ Professional email templates
- ✅ Automatic footer with unsubscribe
- ✅ Mobile-responsive design
- ✅ Batch sending for performance
- ✅ Delivery tracking and analytics

## 🧪 Testing

### Manual Testing
1. Create newsletters with different access types
2. Test editor features (formatting, links, images)
3. Verify email preview accuracy
4. Send test emails to different providers
5. Check delivery status and tracking

### Automated Testing
Run the Playwright test suite:
```bash
npx playwright test tests/newsletter-system.spec.ts
```

### Test Coverage
- ✅ Newsletter creation and editing
- ✅ Rich text editor functionality
- ✅ Email preview generation
- ✅ Access control (free vs paid)
- ✅ Navigation and UI interactions
- ✅ Responsive design
- ✅ Error handling

## 📈 Usage Workflow

### Creating a Newsletter
1. **Navigate** to Admin → Newsletter
2. **Click** "Add Newsletter" 
3. **Fill** newsletter title and email subject
4. **Select** access type (free/paid)
5. **Write** content using rich editor
6. **Preview** email in preview tab
7. **Save** as draft or send immediately

### Sending Process
1. **Verify** newsletter content and settings
2. **Click** "Send Now" 
3. **Confirm** sending (cannot be undone)
4. **Monitor** delivery status in analytics
5. **Track** open/click rates (if Mailgun webhooks configured)

### Subscriber Segmentation
- **Free newsletters** → sent to all subscribers
- **Paid newsletters** → sent to paid subscribers only
- **Automatic filtering** based on user type in database

## 🔧 Advanced Configuration

### Webhook Setup (Optional)
Configure Mailgun webhooks for tracking:
1. In Mailgun dashboard → Webhooks
2. Add webhook URL: `yourdomain.com/api/mailgun-webhook`
3. Enable events: delivered, opened, clicked, bounced
4. Implement webhook handler to update newsletter_sends table

### Custom Email Templates
Modify the email template in `newsletterService.ts`:
- Update HTML structure
- Customize styling
- Add branded headers/footers
- Include social media links

### Analytics Dashboard
Extend the system with:
- Newsletter performance metrics
- Subscriber growth tracking
- Engagement analytics
- A/B testing capabilities

## 🚨 Troubleshooting

### Common Issues

**1. Emails not sending**
- Check Mailgun API key and domain
- Verify domain authentication in Mailgun
- Check browser console for errors

**2. Domain verification failed**
- Ensure DNS records are correctly configured
- Wait 24-48 hours for DNS propagation
- Use Mailgun's domain verification tool

**3. Subscribers not receiving emails**
- Verify subscriber emails in users_profiles table
- Check subscriber type matches newsletter access type
- Review newsletter_sends table for error messages

**4. Preview not updating**
- Clear browser cache
- Check for JavaScript errors
- Verify Tiptap editor is functioning

### Debug Tools
- Browser developer console
- Supabase logs and queries
- Mailgun delivery logs
- Newsletter analytics data

## 📚 Technical Architecture

### Database Schema
```
newsletters (main content)
├── id, title, subject, body
├── access_type, status
├── author_id, created_at
└── metadata (JSON)

newsletter_sends (tracking)
├── newsletter_id, user_id
├── email, status, sent_at
├── mailgun_id, error_message
└── metadata (JSON)
```

### Components
```
NewsletterManager (list view)
├── Table with filtering
├── Create/Edit/Delete actions
└── Status management

NewsletterEditor (creation/editing)
├── Tiptap rich text editor
├── Settings sidebar
├── Live email preview
└── Send functionality
```

### Services
```
mailgunService (email sending)
├── Batch email delivery
├── Template management
├── Error handling
└── Tracking integration

newsletterService (business logic)
├── Subscriber segmentation
├── Send orchestration
├── Analytics collection
└── Status management
```

This newsletter system is production-ready and includes comprehensive error handling, testing, and monitoring capabilities!