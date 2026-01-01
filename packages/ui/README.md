# @escrow/ui - Atomic Design System

A comprehensive, accessible, and performant UI component library built with React, TypeScript, and Tailwind CSS following atomic design principles.

## 🏗️ Architecture

This design system follows the **Atomic Design** methodology:

- **Atoms**: Basic building blocks (Button, Input, Icon, Badge, Avatar, Spinner)
- **Molecules**: Simple combinations of atoms (SearchBox, Dropdown, Card)
- **Organisms**: Complex components (Header, DataTable, FormWizard)
- **Templates**: Layout components (DashboardLayout, AuthLayout)
- **Pages**: Specific page implementations

## 🎨 Design Tokens

Centralized design tokens ensure consistency across all components:

- **Colors**: Primary, secondary, neutral, and semantic color scales
- **Typography**: Font families, sizes, weights, and line heights
- **Spacing**: Consistent spacing scale and semantic spacing tokens
- **Shadows**: Elevation system for depth and hierarchy
- **Animations**: Duration, easing, and keyframe definitions

```typescript
import { colors, typography, spacing, shadows } from '@escrow/ui/tokens';
```

## 🧩 Components

### Atoms

#### Button
Versatile button component with multiple variants and states.

```tsx
import { Button } from '@escrow/ui';

<Button variant="primary" size="md" loading={false}>
  Click me
</Button>
```

**Props:**
- `variant`: 'primary' | 'secondary' | 'outline' | 'ghost' | 'destructive' | 'success' | 'warning'
- `size`: 'xs' | 'sm' | 'md' | 'lg' | 'xl'
- `loading`: boolean
- `leftIcon`, `rightIcon`: React.ReactNode
- `fullWidth`: boolean

#### Input
Accessible input component with validation states.

```tsx
import { Input } from '@escrow/ui';

<Input
  label="Email"
  placeholder="Enter your email"
  error="Invalid email format"
  leftIcon={<Icon name="search" />}
/>
```

#### Icon
Comprehensive icon system with consistent sizing and colors.

```tsx
import { Icon } from '@escrow/ui';

<Icon name="search" size="md" color="primary" />
```

#### Badge
Status and labeling component with multiple variants.

```tsx
import { Badge } from '@escrow/ui';

<Badge variant="success" dismissible onDismiss={() => {}}>
  Active
</Badge>
```

#### Avatar
User avatar component with fallback support.

```tsx
import { Avatar } from '@escrow/ui';

<Avatar src="/avatar.jpg" name="John Doe" size="lg" />
```

#### Spinner
Loading indicator with multiple variants and sizes.

```tsx
import { Spinner } from '@escrow/ui';

<Spinner variant="primary" size="md" />
```

### Molecules

#### SearchBox
Advanced search input with debouncing and clear functionality.

```tsx
import { SearchBox } from '@escrow/ui';

<SearchBox
  placeholder="Search..."
  onSearch={(query) => console.log(query)}
  showClearButton
  debounceMs={300}
/>
```

#### Dropdown
Accessible dropdown component with keyboard navigation.

```tsx
import { Dropdown } from '@escrow/ui';

<Dropdown
  options={[
    { value: '1', label: 'Option 1', icon: <Icon name="check" /> },
    { value: '2', label: 'Option 2' }
  ]}
  onChange={(value) => console.log(value)}
  placeholder="Select an option"
/>
```

#### Card
Flexible card component with multiple variants and sub-components.

```tsx
import { Card, CardHeader, CardTitle, CardContent } from '@escrow/ui';

<Card variant="elevated" hover="lift">
  <CardHeader>
    <CardTitle>Card Title</CardTitle>
  </CardHeader>
  <CardContent>
    Card content goes here
  </CardContent>
</Card>
```

### Organisms

#### Header
Complete header component with navigation, search, and user menu.

```tsx
import { Header } from '@escrow/ui';

<Header
  logo={<Logo />}
  navigation={[
    { label: 'Dashboard', href: '/dashboard', active: true },
    { label: 'Deals', href: '/deals' }
  ]}
  showSearch
  user={{ name: 'John Doe', email: 'john@example.com' }}
  userMenuItems={[
    { label: 'Profile', onClick: () => {} },
    { label: 'Logout', onClick: () => {} }
  ]}
/>
```

### Templates

#### DashboardLayout
Complete dashboard layout with header, sidebar, and main content area.

```tsx
import { DashboardLayout } from '@escrow/ui';

<DashboardLayout
  header={{
    logo: <Logo />,
    user: { name: 'John Doe' },
    showSearch: true
  }}
  sidebar={{
    items: [
      { id: '1', label: 'Dashboard', icon: <Icon name="home" /> },
      { id: '2', label: 'Deals', icon: <Icon name="document" /> }
    ],
    collapsible: true
  }}
>
  <main>Your content here</main>
</DashboardLayout>
```

## 🎯 Features

### Accessibility First
- WCAG 2.1 AA compliant
- Keyboard navigation support
- Screen reader optimized
- Focus management
- ARIA attributes

### Performance Optimized
- Tree-shakeable exports
- Minimal bundle size
- Optimized re-renders
- Lazy loading support

### Developer Experience
- Full TypeScript support
- Comprehensive documentation
- Storybook integration
- Testing utilities
- ESLint rules

### Customization
- CSS custom properties
- Tailwind CSS integration
- Theme system
- Variant system with CVA

## 🛠️ Installation

```bash
npm install @escrow/ui
```

### Peer Dependencies
```bash
npm install react react-dom tailwindcss
```

### Optional Dependencies
```bash
npm install framer-motion three @react-three/fiber
```

## ⚙️ Setup

### Tailwind CSS Configuration

Add the UI package to your Tailwind CSS configuration:

```js
// tailwind.config.js
module.exports = {
  content: [
    './src/**/*.{js,ts,jsx,tsx}',
    './node_modules/@escrow/ui/**/*.{js,ts,jsx,tsx}'
  ],
  theme: {
    extend: {
      // Your custom theme extensions
    }
  },
  plugins: []
}
```

### CSS Variables

Import the design tokens CSS file in your main CSS file:

```css
/* globals.css */
@import '@escrow/ui/tokens.css';
@tailwind base;
@tailwind components;
@tailwind utilities;
```

### TypeScript

The package includes full TypeScript definitions. No additional setup required.

## 🧪 Testing

### Testing Utilities

```tsx
import { render, screen } from '@testing-library/react';
import { Button } from '@escrow/ui';

test('renders button with text', () => {
  render(<Button>Click me</Button>);
  expect(screen.getByRole('button', { name: /click me/i })).toBeInTheDocument();
});
```

### Accessibility Testing

```tsx
import { axe, toHaveNoViolations } from 'jest-axe';

expect.extend(toHaveNoViolations);

test('button has no accessibility violations', async () => {
  const { container } = render(<Button>Accessible Button</Button>);
  const results = await axe(container);
  expect(results).toHaveNoViolations();
});
```

## 📚 Storybook

View all components in Storybook:

```bash
npm run storybook
```

## 🎨 Customization

### Theme Customization

```tsx
import { ThemeProvider } from '@escrow/ui';

const customTheme = {
  colors: {
    primary: {
      500: '#your-primary-color'
    }
  }
};

<ThemeProvider theme={customTheme}>
  <App />
</ThemeProvider>
```

### CSS Custom Properties

```css
:root {
  --color-primary-500: #your-primary-color;
  --font-family-sans: 'Your Font', sans-serif;
}
```

## 🔧 Development

### Building

```bash
npm run build
```

### Testing

```bash
npm run test
```

### Linting

```bash
npm run lint
```

### Storybook

```bash
npm run storybook
```

## 📖 Documentation

- [Storybook Documentation](https://storybook.escrow.com)
- [Design System Guidelines](./docs/guidelines.md)
- [Component API Reference](./docs/api.md)
- [Accessibility Guide](./docs/accessibility.md)

## 🤝 Contributing

1. Follow the atomic design principles
2. Ensure accessibility compliance
3. Write comprehensive tests
4. Update documentation
5. Add Storybook stories

## 📄 License

MIT License - see [LICENSE](./LICENSE) for details.

## 🚀 Roadmap

- [ ] Advanced form components
- [ ] Data visualization components
- [ ] Animation system with Framer Motion
- [ ] 3D components with Three.js
- [ ] Mobile-specific components
- [ ] Dark mode support
- [ ] RTL language support
- [ ] Advanced accessibility features