# 📧 **Mailgun Setup Guide for DGCG Newsletter System**

This guide will walk you through setting up Mailgun for your newsletter system step by step.

## 🎯 **Why Mailgun?**

Mailgun is a reliable email service that provides:
- ✅ **High deliverability rates** (emails don't go to spam)
- ✅ **Free tier** with 5,000 emails/month for 3 months
- ✅ **Easy domain verification**
- ✅ **Detailed tracking and analytics**
- ✅ **Professional email infrastructure**

## 🚀 **Step-by-Step Setup**

### **Step 1: Create Mailgun Account**

1. **Go to** [mailgun.com](https://mailgun.com)
2. **Click** "Start sending" or "Sign up"
3. **Fill out** the registration form:
   - Use your business email
   - Company name: "DGCG" 
   - Choose "Transactional" for email type
4. **Verify** your email address
5. **Complete** phone verification if required

### **Step 2: Choose Your Plan**

1. **Free Trial**: 5,000 emails/month for 3 months (perfect for starting)
2. **Flex Plan**: $35/month for 50,000 emails (when you scale up)
3. **Select Free Trial** for now

### **Step 3: Add Your Domain**

1. **In Mailgun dashboard**, go to **Sending → Domains**
2. **Click** "Add New Domain"
3. **Enter your domain** (e.g., `yourdomain.com` or `dgcg.com`)
4. **Choose** "US" region (or EU if you prefer)
5. **Click** "Add Domain"

### **Step 4: Verify Your Domain (DNS Setup)**

Mailgun will provide DNS records to add to your domain. You'll need to add these through your domain registrar (GoDaddy, Namecheap, Cloudflare, etc.):

#### **Required DNS Records:**

1. **SPF Record** (TXT):
   ```
   Name: @ (or your domain)
   Value: v=spf1 include:mailgun.org ~all
   ```

2. **DKIM Record** (TXT):
   ```
   Name: k1._domainkey
   Value: [Mailgun will provide the long value]
   ```

3. **MX Records**:
   ```
   Name: @ (or your domain)
   Value: 10 mxa.mailgun.org
   Value: 10 mxb.mailgun.org
   ```

4. **CNAME Record** (optional but recommended):
   ```
   Name: email (or mg)
   Value: mailgun.org
   ```

#### **How to Add DNS Records:**

**If using Cloudflare:**
1. Go to your Cloudflare dashboard
2. Select your domain
3. Go to **DNS → Records**
4. Click **Add record** for each one
5. Copy the exact values from Mailgun

**If using GoDaddy/Namecheap:**
1. Log into your domain registrar
2. Find **DNS Management** or **DNS Settings**
3. Add each record type with the values from Mailgun

### **Step 5: Wait for Verification**

1. **DNS propagation** can take 24-48 hours
2. **Check status** in Mailgun dashboard (Sending → Domains)
3. **Green checkmarks** = fully verified
4. **You can send emails** once verified

### **Step 6: Get Your API Credentials**

1. **Go to** Settings → API Keys
2. **Copy your Private API Key** (starts with `key-`)
3. **Note your domain** (from Sending → Domains)

### **Step 7: Configure Your Application**

Add these to your `.env` file:

```bash
# Mailgun Configuration
REACT_APP_MAILGUN_API_KEY=key-1234567890abcdef...
REACT_APP_MAILGUN_DOMAIN=yourdomain.com
REACT_APP_MAILGUN_FROM_EMAIL=newsletter@yourdomain.com
REACT_APP_MAILGUN_FROM_NAME=DGCG Newsletter
```

## 🧪 **Testing Your Setup**

### **Test 1: Validate Domain in Admin**
1. Go to your **Admin → Newsletter** section
2. The system will automatically validate your Mailgun domain
3. You should see a green status if everything is configured correctly

### **Test 2: Send Test Email**
1. **Create a test newsletter** in your admin
2. Use the **"Send Test Email"** feature
3. **Send to your personal email**
4. **Check delivery** (including spam folder)

### **Test 3: Check Mailgun Logs**
1. **Go to** Sending → Logs in Mailgun
2. **You should see** your test email delivery
3. **Status should be** "delivered"

## 🛠️ **Domain Configuration Examples**

### **Option 1: Use Main Domain**
- **Domain**: `dgcg.com`
- **From Email**: `newsletter@dgcg.com`
- **Pros**: Professional, matches your brand
- **Cons**: Requires DNS changes to main domain

### **Option 2: Use Subdomain**
- **Domain**: `mail.dgcg.com` or `mg.dgcg.com`
- **From Email**: `newsletter@mail.dgcg.com`
- **Pros**: Isolates email setup, easier DNS management
- **Cons**: Slightly less recognizable

### **Option 3: Use Mailgun Sandbox (Testing Only)**
- **Domain**: `sandboxXXXXXX.mailgun.org`
- **From Email**: `postmaster@sandboxXXXXXX.mailgun.org`
- **Pros**: No DNS setup required, works immediately
- **Cons**: Only sends to verified recipients, looks unprofessional

## 🚨 **Troubleshooting Common Issues**

### **Problem**: "Domain not verified"
**Solution**: 
- Check DNS records are exactly as Mailgun specified
- Wait 24-48 hours for DNS propagation
- Use [DNS checker](https://dnschecker.org) to verify records

### **Problem**: "API Key invalid"
**Solution**:
- Make sure you copied the **Private API Key** (not public)
- Check for extra spaces or characters
- Key should start with `key-`

### **Problem**: "Emails going to spam"
**Solution**:
- Ensure SPF and DKIM records are properly set
- Domain must be fully verified (all green checkmarks)
- Use a consistent "From" name and email
- Include unsubscribe links (we do this automatically)

### **Problem**: "Rate limit exceeded"
**Solution**:
- Free accounts limited to 300 emails/hour
- Upgrade to paid plan for higher limits
- Our system sends in batches to respect limits

## 💡 **Pro Tips**

### **Domain Reputation**
- **Start slowly** - send to engaged subscribers first
- **Monitor bounce rates** - keep under 5%
- **Include clear unsubscribe** - reduces spam reports
- **Use consistent sender info** - builds trust

### **Deliverability Best Practices**
- **Authenticate your domain** - complete all DNS records
- **Warm up your domain** - start with smaller sends
- **Clean your list** - remove bounced emails
- **Engaging content** - reduces unsubscribes

### **Cost Management**
- **Free tier**: 5,000 emails/month for 3 months
- **After free tier**: $35/month for 50,000 emails
- **Monitor usage** in Mailgun dashboard
- **Consider paid tier** when you have 1,000+ subscribers

## 📊 **Expected Timeline**

- **Account creation**: 5 minutes
- **Domain addition**: 2 minutes
- **DNS configuration**: 15 minutes
- **DNS propagation**: 2-48 hours ⏰
- **Testing and verification**: 10 minutes

**Total setup time**: ~1 hour + waiting for DNS

## 🎉 **What Happens Next**

Once Mailgun is configured:

1. ✅ **Create newsletters** in your admin panel
2. ✅ **Send to segmented audiences** (free vs paid)
3. ✅ **Track delivery status** automatically
4. ✅ **Handle unsubscribes** seamlessly
5. ✅ **Professional email delivery** to your subscribers

## 🆘 **Need Help?**

If you run into issues:

1. **Check Mailgun documentation**: [documentation.mailgun.com](https://documentation.mailgun.com)
2. **Mailgun support**: Available through their dashboard
3. **DNS help**: Your domain registrar's support team
4. **System issues**: Check browser console for error messages

---

**Ready to send professional newsletters to your DGCG subscribers!** 🚀

Once you complete this setup, your newsletter system will be fully operational with reliable email delivery, automatic unsubscribe handling, and professional presentation.