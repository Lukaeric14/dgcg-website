# DGCG Website Structure & Guidelines

## Overview
DGCG (David/Goliath Consulting Group) is a React TypeScript website with unified navigation, admin panel, and content management system.

## Navigation Architecture

### Public Website Navigation
- **UnifiedNavBar**: Single navigation component used across all public pages
- **Variants**: `default`, `article`, `consulting`
- **Features**: User authentication, admin panel access (admin users only)

### Admin Navigation
- **Prefix**: All admin components use `admin-nav-` prefix
- **Components**: `AdminNavMain`, `AdminNavUser`, `AdminNavDocuments`, `AdminNavSecondary`
- **Access**: Only users with `type: 'admin'` in `users_profiles` table

## File Structure

```
src/
├── components/
│   ├── shared/
│   │   ├── UnifiedNavBar.tsx          # Main website navigation
│   │   ├── admin-nav-*.tsx            # Admin navigation components
│   │   └── app-sidebar.tsx            # Admin sidebar wrapper
│   ├── pages/                         # Public website pages
│   ├── admin/                         # Admin dashboard components
│   └── sections/                      # Reusable page sections
├── contexts/
│   └── AuthContext.tsx                # User authentication state
└── lib/
    └── supabase.ts                    # Database client
```

## Key Guidelines

### Navigation Rules
1. **No Double Navigation**: Pages should not render their own navigation bars
2. **App.tsx Controls**: Main navigation rendered in `App.tsx` for all public routes
3. **Admin Separation**: Admin navigation completely separate from website navigation
4. **Hide Admin Routes**: Navigation hidden on `/login`, `/register`, `/admin/*` routes

### User Authentication
- **Admin Check**: Query `users_profiles` table for `type === 'admin'`
- **Display Names**: Capitalize first letter of email username
- **Dropdown Logic**: Show admin panel only for admin users

### CSS Organization
- **UnifiedNavBar.css**: Main navigation styles
- **admin.css**: Admin-specific styles with Inter font
- **Component-specific**: Each component has its own CSS file

### Database Schema
```sql
users_profiles:
  - id (UUID)
  - type (enum: 'admin', 'free_user', 'paid_user')
  - email (string)
  - full_name (string)
  - avatar_url (string)
```

## Common Patterns

### Admin Status Checking
```typescript
const { data: profile } = await supabase
  .from('users_profiles')
  .select('type')
  .eq('id', user.id)
  .single();
const isAdmin = profile?.type === 'admin';
```

### Navigation Variants
```typescript
<UnifiedNavBar variant="article" onManifestoClick={handleClick} />
```

## Security Notes
- Admin access controlled by database `type` field
- No client-side admin role assignment
- Admin panel option hidden for non-admin users
- Admin routes protected with permission checks

## Build Commands
```bash
npm run build    # Production build
npm start        # Development server
```

## Key Files to Modify
- **Navigation**: `src/components/shared/UnifiedNavBar.tsx`
- **Admin**: `src/components/shared/admin-nav-*.tsx`
- **Routing**: `src/App.tsx`
- **Auth**: `src/contexts/AuthContext.tsx` 