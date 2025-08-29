# Dashboard Navigation System

A responsive, mobile-first collapsible navigation system for the dashboard with smooth transitions and Zustand-powered authentication.

## Components Overview

### 🏠 Dashboard Layout (`src/app/dashboard/layout.tsx`)

Main layout wrapper that orchestrates the entire dashboard structure.

### 📱 Mobile Components

- **`MobileHeader`** - Top header bar visible only on mobile devices
- **`MobileNav`** - Slide-out sheet navigation for mobile screens
- **`Breadcrumb`** - Navigation breadcrumb for better UX

### 🖥️ Desktop Components

- **`DesktopSidebar`** - Collapsible sidebar for desktop screens
- **Auto-responsive** - Automatically collapses on smaller desktop screens

## Features

### ✅ Mobile-First Design

- **Responsive breakpoints**: Mobile (< 768px), Desktop (≥ 768px)
- **Touch-friendly** mobile navigation
- **Hamburger menu** with slide-out sheet
- **Auto-hiding** header on desktop

### ✅ Collapsible Desktop Sidebar

- **Manual toggle** with chevron buttons
- **Auto-collapse** on screens < 1024px width
- **Smooth transitions** with CSS animations
- **Tooltips** when collapsed
- **Persistent state** during session

### ✅ Navigation Features

- **Active state** highlighting
- **Icons** from Lucide React
- **User profile** section with role display
- **Logout functionality** integrated
- **Breadcrumb navigation** for deeper pages

### ✅ Authentication Integration

- **Zustand auth store** powered
- **User profile** display
- **Role-based** UI elements
- **Logout** with state cleanup

## Responsive Behavior

| Screen Size                        | Behavior                                  |
| ---------------------------------- | ----------------------------------------- |
| **Mobile** (< 768px)               | Header + hamburger menu → slide-out sheet |
| **Small Desktop** (768px - 1024px) | Collapsed sidebar by default              |
| **Large Desktop** (≥ 1024px)       | Expanded sidebar by default               |

## Navigation Items

```tsx
const navigation = [
  {
    name: "Dashboard",
    href: "/dashboard",
    icon: Home,
  },
  {
    name: "Submissions",
    href: "/dashboard/submissions",
    icon: FileText,
  },
];
```

## File Structure

```
src/
├── app/dashboard/
│   └── layout.tsx           # Main dashboard layout
├── components/
│   ├── DesktopSidebar.tsx   # Collapsible desktop sidebar
│   ├── MobileHeader.tsx     # Mobile header bar
│   ├── MobileNav.tsx        # Mobile slide-out navigation
│   └── Breadcrumb.tsx       # Navigation breadcrumbs
├── hooks/
│   └── useMediaQuery.ts     # Responsive hooks
└── stores/
    └── authStore.ts         # Zustand authentication store
```

## Usage

The navigation is automatically included in all dashboard pages through the layout component:

```tsx
// Any page inside /dashboard automatically gets the navigation
export default function DashboardPage() {
  return (
    <div>
      <h1>Dashboard Content</h1>
      {/* Navigation is handled by layout.tsx */}
    </div>
  );
}
```

## Customization

### Adding New Navigation Items

Update the `navigation` array in both `DesktopSidebar.tsx` and `MobileNav.tsx`:

```tsx
const navigation = [
  // Existing items...
  {
    name: "New Page",
    href: "/dashboard/new-page",
    icon: NewIcon,
  },
];
```

### Updating Breadcrumb Labels

Modify the `pathNameMap` in `Breadcrumb.tsx`:

```tsx
const pathNameMap: Record<string, string> = {
  "/dashboard": "Dashboard",
  "/dashboard/submissions": "Submissions",
  "/dashboard/new-page": "New Page", // Add new mappings
};
```

### Styling Customization

The components use Tailwind CSS classes and can be customized through:

- **CSS variables** for theme colors
- **Tailwind utilities** for spacing and layout
- **Custom CSS** for advanced animations

## Performance Features

- **Conditional rendering** based on screen size
- **Smooth transitions** with CSS transforms
- **Optimized re-renders** with Zustand selectors
- **Lazy loading** of navigation components
- **Media query hooks** for responsive behavior

## Accessibility Features

- **Keyboard navigation** support
- **Screen reader** friendly labels
- **Focus management** in mobile sheet
- **ARIA attributes** for interactive elements
- **Semantic HTML** structure
- **High contrast** hover states

## Browser Support

- **Modern browsers** (Chrome, Firefox, Safari, Edge)
- **Mobile browsers** (iOS Safari, Chrome Mobile)
- **CSS Grid** and **Flexbox** layouts
- **CSS custom properties** support
