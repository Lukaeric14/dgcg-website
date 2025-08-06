# DGCG Website - Worksteams & QA Testing Guide

## Overview
This document outlines all functional worksteams in the DGCG website application for comprehensive Playwright testing and QA validation.

## Application Architecture
- **Frontend**: React TypeScript with Create React App
- **Backend**: Supabase (PostgreSQL database, authentication, real-time subscriptions)
- **Authentication**: Supabase Auth with role-based access control
- **Styling**: CSS modules with responsive design
- **State Management**: React Context (AuthContext)

---

## 1. Public Website Workstream

### **Landing Page / Home**
- **Route**: `/`
- **Component**: `Home.tsx:27`
- **Features**:
  - Featured article display with hero layout
  - Article sidebar with recent posts (3 articles)
  - Article filtering by access type (free/paid)
  - Responsive grid layout
- **Testing Points**:
  - Article loading and display
  - Featured article image and content rendering
  - Navigation to individual articles
  - Responsive layout across devices
  - Error handling for failed article fetches

### **Navigation**
- **Component**: `NavBar.tsx:13`
- **Features**:
  - Logo and branding
  - Main navigation menu
  - Responsive mobile menu
  - Login/logout state management
- **Testing Points**:
  - Navigation menu functionality
  - Mobile responsive behavior
  - Login state visibility changes
  - Brand logo click navigation

### **Article Reading**
- **Route**: `/article/:id`
- **Component**: `ArticlePage.tsx:24`
- **Features**:
  - Individual article display
  - Access control (free/premium/enterprise)
  - Author information
  - Article metadata (creation date, access type)
- **Testing Points**:
  - Article content rendering
  - Access control enforcement
  - URL parameter handling
  - 404 handling for invalid article IDs

### **Pricing Page**
- **Route**: `/blog/pricing`
- **Component**: `PricingPage.tsx:25`
- **Features**:
  - Subscription tier information
  - Pricing structure display
- **Testing Points**:
  - Pricing information display
  - Call-to-action functionality

### **Consulting Page**
- **Route**: `/consulting`
- **Component**: `Consulting.tsx:5`
- **Features**:
  - Service information
  - Contact forms
- **Testing Points**:
  - Content display
  - Form submissions (if applicable)

---

## 2. Authentication Workstream

### **User Registration**
- **Route**: `/register`
- **Component**: `Register.tsx:28`
- **Features**:
  - Email/password registration
  - User type selection (free_user/paid_user)
  - Email verification workflow
  - Newsletter subscription opt-in
- **Testing Points**:
  - Registration form validation
  - Password strength requirements
  - Email verification flow
  - Successful registration redirect
  - Error handling for existing users

### **User Login**
- **Route**: `/login`
- **Component**: `Login.tsx:27`
- **Features**:
  - Email/password authentication
  - Remember me functionality
  - Password reset
  - Redirect to intended page after login
- **Testing Points**:
  - Login form validation
  - Successful authentication
  - Invalid credential handling
  - Password reset workflow
  - Session persistence

### **Authentication Context**
- **Component**: `AuthContext.tsx:4`
- **Features**:
  - Global auth state management
  - User session handling
  - Role-based access control
  - Automatic token refresh
- **Testing Points**:
  - Session persistence across page refreshes
  - Automatic logout on token expiry
  - Role-based component rendering

---

## 3. Admin Dashboard Workstream

### **Admin Authentication & Access Control**
- **Route**: `/admin/*`
- **Component**: `AdminDashboard.tsx:31`
- **Features**:
  - Admin role verification via database lookup
  - Permission-based access control
  - Automatic redirect for non-admin users
- **Testing Points**:
  - Admin role verification
  - Access denial for non-admin users
  - Permission loading states
  - Error handling for role lookup failures

### **Dashboard Overview**
- **Route**: `/admin`
- **Component**: `AdminDashboard.tsx:31`
- **Features**:
  - Statistics cards (articles, subscribers, newsletters, emails sent)
  - Recent activity feed
  - Quick action buttons
  - Real-time data updates
- **Testing Points**:
  - Statistics accuracy and loading
  - Activity feed updates
  - Quick action navigation
  - Data refresh functionality

### **Sidebar Navigation**
- **Component**: `app-sidebar.tsx:35`
- **Features**:
  - Collapsible sidebar
  - Main navigation (Dashboard, Articles, Newsletter, Analytics, Subscribers)
  - Document management (Notes, Reports)
  - User profile section
- **Testing Points**:
  - Navigation functionality
  - Sidebar collapse/expand
  - Active page highlighting
  - User information display

---

## 4. Content Management Workstream

### **Articles Management**
- **Route**: `/admin/articles`
- **Component**: `ArticlesManager.tsx:33`
- **Features**:
  - Article listing with pagination
  - CRUD operations (Create, Read, Update, Delete)
  - Access type management (free/premium/enterprise)
  - AI generation tracking (percentages)
  - Article status management
- **Testing Points**:
  - Article list loading and display
  - Create new article workflow
  - Edit existing article functionality
  - Delete article with confirmation
  - Search and filtering
  - Access type assignment

### **Article Editor**
- **Component**: `ArticleEditor.tsx:4`
- **Features**:
  - Rich text editing
  - Image upload and management
  - Metadata editing (title, abstract, access type)
  - AI generation percentage tracking
  - Auto-save functionality
  - Preview mode
- **Testing Points**:
  - Rich text editor functionality
  - Image upload and display
  - Auto-save behavior
  - Preview accuracy
  - Form validation
  - Save and publish workflow

---

## 5. Newsletter Management Workstream

### **Newsletter Manager**
- **Route**: `/admin/newsletter`
- **Component**: `NewsletterManager.tsx:43`
- **Features**:
  - Newsletter listing and status tracking
  - CRUD operations for newsletters
  - Status management (draft/scheduled/sent/cancelled)
  - Access type filtering (free/paid)
  - Recipient count tracking
  - Send scheduling
- **Testing Points**:
  - Newsletter list display
  - Status filtering functionality
  - Create newsletter workflow
  - Edit newsletter content
  - Schedule newsletter sending
  - Send confirmation dialogs
  - Recipient count accuracy

### **Newsletter Editor**
- **Component**: `NewsletterEditor.tsx:23`
- **Features**:
  - Rich text email composition
  - Subject line editing
  - Plain text version generation
  - Recipient targeting (free vs paid users)
  - Preview functionality
  - Send immediately or schedule
- **Testing Points**:
  - Email composition functionality
  - Subject line validation
  - Recipient targeting
  - Preview rendering
  - Send scheduling
  - Email validation

---

## 6. Subscriber Management Workstream

### **Subscribers Manager**
- **Route**: `/admin/subscribers`
- **Component**: `SubscribersManager.tsx:35`
- **Features**:
  - Subscriber listing and search
  - User type filtering (free_user/paid_user/admin)
  - Subscriber statistics dashboard
  - Email verification status
  - Last login tracking
  - Bulk operations
- **Testing Points**:
  - Subscriber list loading
  - Search functionality
  - Type filtering
  - Statistics accuracy
  - User detail display
  - Bulk action functionality

### **Newsletter Unsubscribe**
- **Route**: `/unsubscribe`
- **Component**: `Unsubscribe.tsx:12`
- **Features**:
  - Email unsubscribe workflow
  - Confirmation messaging
  - Database preference updates
- **Testing Points**:
  - Unsubscribe link processing
  - Confirmation display
  - Database update verification
  - Success/error messaging

---

## 7. Notes Management Workstream

### **Notes Manager**
- **Route**: `/admin/notes`
- **Component**: `NotesManager.tsx:8`
- **Features**:
  - Internal note-taking system
  - Note CRUD operations
  - Search and organization
  - Admin-only access
- **Testing Points**:
  - Note creation and editing
  - Search functionality
  - Note organization
  - Access control verification

---

## 8. Analytics & Reporting Workstream

### **Analytics Dashboard**
- **Route**: `/admin/analytics`
- **Component**: Integrated in `AdminDashboard.tsx`
- **Features**:
  - Website traffic analytics
  - Article performance metrics
  - Newsletter engagement tracking
  - User growth statistics
- **Testing Points**:
  - Chart rendering and data accuracy
  - Date range filtering
  - Export functionality
  - Real-time updates

---

## Database Schema Testing Requirements

### **Core Tables**
- `articles` - Article content and metadata
- `newsletters` - Newsletter campaigns
- `newsletter_sends` - Send tracking
- `users_profiles` - Extended user information
- `activities` - System activity logging

### **Key Testing Areas**
- Data integrity constraints
- Foreign key relationships
- Row-level security policies
- Real-time subscription functionality
- Database triggers and functions

---

## Integration Testing Scenarios

### **End-to-End User Workflows**
1. **Public User Journey**: Homepage → Article reading → Registration → Login
2. **Content Creator Flow**: Login → Admin dashboard → Create article → Publish
3. **Newsletter Campaign**: Create newsletter → Target audience → Schedule → Send
4. **Subscriber Management**: View subscribers → Filter → Export data

### **Cross-Component Integration**
- Authentication state across all components
- Real-time updates between admin actions and public display
- Email service integration with newsletter sending
- File upload integration with image storage

---

## Performance Testing Considerations

### **Load Testing Areas**
- Article listing pagination with large datasets
- Newsletter sending to large subscriber lists
- Dashboard statistics calculation with high data volume
- Search functionality across large content databases

### **UI/UX Testing**
- Mobile responsiveness across all components
- Loading states and error handling
- Accessibility compliance (WCAG guidelines)
- Cross-browser compatibility

---

## Security Testing Requirements

### **Authentication & Authorization**
- Admin role verification
- Session management and timeout
- Password security requirements
- CSRF protection

### **Data Protection**
- Input validation and sanitization
- SQL injection prevention
- XSS protection
- Secure file upload handling

---

## Testing Environment Setup

### **Required Test Data**
- Sample articles with different access types
- Test user accounts (free, paid, admin)
- Newsletter templates and subscriber lists
- Activity log entries

### **External Dependencies**
- Supabase connection and authentication
- Email service integration (Mailgun)
- File storage for images
- Environment variable configuration