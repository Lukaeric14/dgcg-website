# Styling Guidelines for DGCG Website

## Core Principles

### 1. **Global CSS First**
- All typography, colors, and base styling must come from global CSS files
- Component-specific CSS should only handle layout and unique component structure
- Never use inline styles for static styling

### 2. **Two-Tier CSS Architecture**
- **Public Website**: Uses `src/index.css` for Cormorant Garamond and Palatino fonts
- **Admin Panel**: Uses `src/admin.css` for Inter font styling
- Components automatically get the correct fonts based on their route

### 3. **No Inline Styles Policy**
- **Forbidden**: Static inline styles for fonts, colors, spacing, layout
- **Allowed**: Dynamic values (CSS custom properties, transforms, animations)
- **Allowed**: Functional requirements (hidden file inputs)

## Tech Stack

- **Framework**: React 18 with TypeScript
- **Styling**: CSS files (no CSS-in-JS, no styled-components)
- **Routing**: React Router for route-based CSS loading
- **Build Tool**: Vite
- **UI Components**: Custom components with Tailwind-inspired utility classes
- **State Management**: React Context (AuthContext)
- **Backend**: Supabase for data and authentication
- **Deployment**: Vercel
- **Content**: All content (e.g., article titles, bodies) must be dynamically loaded from Supabase/backend—never use static placeholders or Figma text in components.

## Component Creation Guidelines

### When Creating New Components

1. **Always use global typography classes** for text styling
2. **Create component-specific CSS** only for layout and unique structure
3. **Never add font, color, or text styling** to component CSS files

### Example Component Structure

```tsx
// ✅ Good Component
const MyComponent = () => {
  return (
    <div className="my-component-container">
      <h1 className="text-cormorant-h1 text-white">Title</h1>
      <p className="text-cormorant-body text-white">Content</p>
      <button className="my-component-button text-cormorant-small text-white">
        Action
      </button>
    </div>
  );
};
```

```css
/* ✅ Good Component CSS */
.my-component-container {
  display: flex;
  flex-direction: column;
  gap: 20px;
  padding: 24px;
  background: rgba(255, 255, 255, 0.05);
  border-radius: 12px;
}

.my-component-button {
  padding: 12px 24px;
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 8px;
  background: transparent;
  cursor: pointer;
  transition: all 0.2s;
}
```

### ❌ Avoid These Patterns

```tsx
// ❌ Bad - Inline styles
<div style={{ fontSize: '18px', color: 'white', fontFamily: 'Cormorant Garamond' }}>

// ❌ Bad - Component CSS with typography
.my-component-title {
  font-family: 'Cormorant Garamond', serif;
  font-size: 48px;
  color: white;
  font-weight: 700;
}
```

## Figma MCP Integration Guidelines

### When Using Figma MCP Server

1. **Extract design tokens** from Figma (colors, typography, spacing)
2. **Map to existing global classes** when possible
3. **Create new global classes** only if design system doesn't have equivalents
4. **Component CSS should only handle layout** from Figma designs

### Figma to Code Workflow

1. **Analyze Figma design** for:
   - Typography (font family, size, weight, letter spacing)
   - Colors (text, background, borders)
   - Layout (spacing, positioning, flexbox/grid)

2. **Map to global classes**:
   ```tsx
   // Figma: 48px Cormorant Garamond Bold
   <h1 className="text-cormorant-h1 text-white">
   
   // Figma: 16px Inter Regular
   <p className="text-admin-body text-admin-gray">
   ```

3. **Create component CSS** for layout only:
   ```css
   .figma-component {
     display: flex;
     gap: 24px;
     padding: 32px;
     border-radius: 16px;
   }
   ```

## Route-Based Styling

### Automatic Font Selection

The app automatically loads the correct global CSS based on routes:

- **Public routes** (`/`, `/article/*`, `/blog/*`, etc.): Uses `index.css` (Cormorant/Palatino)
- **Admin routes** (`/admin/*`): Uses `admin.css` (Inter)

### Component Placement Guidelines

- **Public components**: Place in `src/components/pages/` or `src/components/sections/`
- **Admin components**: Place in `src/components/admin/`
- **Shared components**: Place in `src/components/shared/` (use public fonts by default)

## CSS File Organization

### Component CSS Files Should Contain:

✅ **Allowed Properties:**
- `display`, `flex-direction`, `justify-content`, `align-items`
- `gap`, `padding`, `margin`
- `width`, `height`, `max-width`, `min-height`
- `position`, `top`, `left`, `right`, `bottom`
- `border-radius`, `border-width`, `border-style`
- `background-color`, `background-image`
- `transform`, `transition`
- `z-index`, `overflow`
- `object-fit`, `object-position`

❌ **Forbidden Properties:**
- `font-family`, `font-size`, `font-weight`, `font-style`
- `color`, `text-color`
- `line-height`, `letter-spacing`
- `text-align`, `text-decoration`
- `text-shadow`, `text-transform`

## Common Patterns

### Card Components
```tsx
<div className="card-container">
  <h2 className="text-cormorant-h2 text-white">Card Title</h2>
  <p className="text-cormorant-body text-white">Card content</p>
</div>
```

```css
.card-container {
  padding: 24px;
  background: rgba(255, 255, 255, 0.05);
  border-radius: 12px;
  border: 1px solid rgba(255, 255, 255, 0.1);
}
```

### Button Components
```tsx
<button className="btn-primary text-cormorant-small text-white">
  Primary Action
</button>
```

```css
.btn-primary {
  padding: 12px 24px;
  background: #a62a1e;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  transition: background-color 0.2s;
}
```

## Testing Guidelines

### Before Committing Changes

1. **Check for inline styles**: Search for `style={` in `.tsx` files
2. **Verify typography classes**: Ensure all text uses global classes
3. **Test both routes**: Verify components work in both public and admin contexts
4. **Check responsive design**: Test on mobile, tablet, and desktop

### Common Issues to Avoid

1. **Mixed font families** in the same component
2. **Hardcoded colors** instead of using global color classes
3. **Component CSS with typography** instead of layout
4. **Inline styles** for static styling
5. **Inconsistent spacing** - use the spacing scale

## Migration Checklist

When updating existing components:

- [ ] Remove all `font-family`, `font-size`, `font-weight` from component CSS
- [ ] Remove all `color` properties from component CSS
- [ ] Replace with appropriate global typography classes
- [ ] Remove inline styles for static properties
- [ ] Test component in both public and admin contexts
- [ ] Verify responsive behavior
- [ ] Check for any remaining typography in component CSS

## Summary

**Remember**: Global CSS for typography and colors, component CSS for layout only. This ensures consistency, maintainability, and proper separation of concerns across the entire codebase. 