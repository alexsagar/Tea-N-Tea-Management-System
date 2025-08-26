# Theme System

## Overview
The application now supports both dark and light themes with smooth transitions and persistent user preferences.

## Features

### Theme Toggle
- **Location**: Header component, between notifications and user menu
- **Icon**: Sun icon for dark theme, Moon icon for light theme
- **Functionality**: Click to switch between themes
- **Accessibility**: Proper ARIA labels and tooltips

### Theme Persistence
- **Storage**: User preferences saved in localStorage
- **Default**: Dark theme if no preference is set
- **Fallback**: Graceful fallback to dark theme if localStorage is unavailable

### Smooth Transitions
- **Duration**: 200ms transitions for all theme changes
- **Properties**: Background, text color, borders, and shadows
- **Reduced Motion**: Respects user's motion preferences

## Implementation

### Theme Context
```jsx
import { useTheme } from '../../context/ThemeContext';

const { theme, toggleTheme, isDark, isLight } = useTheme();
```

### CSS Variables
The system uses CSS custom properties for all themeable values:

```css
:root {
  --bg: 0 0% 0%;           /* Dark theme background */
  --surface: 0 0% 3%;      /* Dark theme surface */
  --fg: 0 0% 100%;         /* Dark theme text */
  --border: 0 0% 12%;      /* Dark theme borders */
}

.light-theme {
  --bg: 0 0% 100%;         /* Light theme background */
  --surface: 0 0% 98%;     /* Light theme surface */
  --fg: 0 0% 10%;          /* Light theme text */
  --border: 0 0% 88%;      /* Light theme borders */
}
```

### Component Usage
All components automatically inherit theme colors through CSS variables. No JavaScript changes required.

## Theme Colors

### Dark Theme
- **Background**: Pure black (#000000)
- **Surface**: Very dark gray (#080808)
- **Surface 2**: Dark gray (#0f0f0f)
- **Text**: White (#ffffff)
- **Muted Text**: Light gray (#b3b3b3)
- **Borders**: Dark gray (#1f1f1f)

### Light Theme
- **Background**: Pure white (#ffffff)
- **Surface**: Very light gray (#fafafa)
- **Surface 2**: Light gray (#f5f5f5)
- **Text**: Near black (#1a1a1a)
- **Muted Text**: Dark gray (#4d4d4d)
- **Borders**: Light gray (#e1e1e1)

## Adding New Themeable Components

### 1. Use CSS Variables
```css
.my-component {
  background: hsl(var(--surface));
  color: hsl(var(--fg));
  border: 1px solid hsl(var(--border));
}
```

### 2. Add Transitions
```css
.my-component {
  transition: background-color var(--transition), 
              color var(--transition), 
              border-color var(--transition);
}
```

### 3. Test Both Themes
Ensure your component looks good in both light and dark modes.

## Browser Support

- **Modern Browsers**: Full support for CSS custom properties
- **Fallback**: Dark theme for older browsers
- **Progressive Enhancement**: Theme switching gracefully degrades

## Performance

- **CSS Variables**: Efficient theme switching without DOM manipulation
- **Transitions**: Hardware-accelerated animations
- **Minimal JavaScript**: Only theme state management

## Accessibility

- **High Contrast**: Both themes meet accessibility standards
- **Reduced Motion**: Respects user preferences
- **Focus Indicators**: Clear focus states in both themes
- **Color Independence**: Information not conveyed by color alone
