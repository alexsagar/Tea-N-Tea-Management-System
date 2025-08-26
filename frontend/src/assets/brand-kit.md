# Tea-N-Tea Brand Kit & Design System

## Brand Identity
**Logo Concept**: Tea leaf + cup motif (stacked + horizontal variations)
**Brand Name**: Tea-N-Tea
**Tagline**: "Steeped in Excellence"

## Color System

### Brand Colors
- `--brand-600`: #2F855A (Primary brand color - deep tea green)
- `--brand-500`: #38A169 (Secondary brand color - vibrant tea green)
- `--brand-50`: #F1FAF5 (Light brand tint - mint cream)

### Accent Colors
- `--amber-500`: #F59E0B (Warning, pending states)
- `--rose-500`: #F43F5E (Error, destructive actions)

### Neutral Scale
- `--ink-900`: #0B1220 (Primary text, headings)
- `--ink-700`: #334155 (Secondary text, labels)
- `--ink-500`: #64748B (Tertiary text, placeholders)
- `--paper`: #FFFFFF (Primary background)
- `--paper-2`: #F8FAFC (Secondary background, cards)

### Semantic Colors
- `--success-500`: #10B981 (Success states)
- `--error-500`: #EF4444 (Error states)
- `--warning-500`: #F59E0B (Warning states)
- `--info-500`: #3B82F6 (Information states)

## Typography

### Font Stack
- **Headings**: Clash Display / DM Serif Display (fallback: Georgia, serif)
- **Body/UI**: Inter (fallback: -apple-system, BlinkMacSystemFont, sans-serif)

### Type Scale
- `--text-4xl`: 32px (Page titles)
- `--text-3xl`: 24px (Section headers)
- `--text-2xl`: 20px (Card titles)
- `--text-lg`: 16px (Body text)
- `--text-sm`: 14px (Small text, labels)

### Line Heights
- `--leading-tight`: 1.4 (Headings)
- `--leading-normal`: 1.6 (Body text)

## Spacing System
- `--space-1`: 4px
- `--space-2`: 8px
- `--space-3`: 12px
- `--space-4`: 16px
- `--space-5`: 20px
- `--space-6`: 24px
- `--space-8`: 32px
- `--space-10`: 40px
- `--space-12`: 48px
- `--space-16`: 64px

## Border Radius
- `--radius-sm`: 6px (Buttons, inputs)
- `--radius-md`: 12px (Cards, modals)
- `--radius-lg`: 16px (Large cards, containers)
- `--radius-xl`: 24px (Hero sections)

## Shadows & Elevation
- `--shadow-sm`: 0 1px 2px 0 rgba(0, 0, 0, 0.05)
- `--shadow-md`: 0 4px 6px -1px rgba(0, 0, 0, 0.1)
- `--shadow-lg`: 0 10px 15px -3px rgba(0, 0, 0, 0.1)
- `--shadow-xl`: 0 20px 25px -5px rgba(0, 0, 0, 0.1)

## Component Specifications

### Buttons
- **Primary**: Brand colors with hover states
- **Secondary**: Ink colors with subtle backgrounds
- **Danger**: Rose colors for destructive actions
- **Sizes**: Small (32px), Medium (40px), Large (48px)

### Cards
- **Standard**: 16px radius, subtle shadows
- **Interactive**: Hover states with elevation changes
- **Header**: Consistent spacing and typography

### Forms
- **Inputs**: 6px radius, focus states with brand colors
- **Validation**: Inline error states with helpful messaging
- **Layout**: Two-column grid for long forms

### Tables
- **Headers**: Sticky, with subtle backgrounds
- **Rows**: Zebra striping, hover states
- **Actions**: Inline action buttons on row hover

### Navigation
- **Sidebar**: Icon + label navigation with active states
- **Breadcrumbs**: Clear hierarchy navigation
- **Search**: Global search with keyboard shortcuts

## Responsive Breakpoints
- **Mobile**: 320px - 767px
- **Tablet**: 768px - 1023px
- **Desktop**: 1024px - 1439px
- **Large Desktop**: 1440px+

## Accessibility Standards
- **Contrast**: AA minimum (4.5:1)
- **Focus**: Brand-colored focus rings
- **Touch Targets**: 44px minimum
- **Keyboard**: Full keyboard navigation support

## Animation & Micro-interactions
- **Duration**: 120-180ms for button interactions
- **Easing**: Smooth, natural curves
- **Feedback**: Immediate visual response to actions
- **Loading**: Skeleton loaders and progress indicators
