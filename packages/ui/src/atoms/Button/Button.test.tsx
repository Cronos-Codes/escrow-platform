import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { Button } from './Button';

describe('Button', () => {
  describe('Rendering', () => {
    it('renders with default props', () => {
      render(<Button>Click me</Button>);
      const button = screen.getByRole('button', { name: /click me/i });
      expect(button).toBeInTheDocument();
      expect(button).toHaveClass('inline-flex', 'items-center', 'justify-center');
    });

    it('renders with custom className', () => {
      render(<Button className="custom-class">Click me</Button>);
      const button = screen.getByRole('button');
      expect(button).toHaveClass('custom-class');
    });

    it('renders children correctly', () => {
      render(<Button>Test Content</Button>);
      expect(screen.getByText('Test Content')).toBeInTheDocument();
    });
  });

  describe('Variants', () => {
    it('applies primary variant styles by default', () => {
      render(<Button>Primary</Button>);
      const button = screen.getByRole('button');
      expect(button).toHaveClass('bg-blue-600', 'text-white');
    });

    it('applies secondary variant styles', () => {
      render(<Button variant="secondary">Secondary</Button>);
      const button = screen.getByRole('button');
      expect(button).toHaveClass('bg-gray-100', 'text-gray-900');
    });

    it('applies outline variant styles', () => {
      render(<Button variant="outline">Outline</Button>);
      const button = screen.getByRole('button');
      expect(button).toHaveClass('border', 'border-gray-300', 'bg-white');
    });

    it('applies ghost variant styles', () => {
      render(<Button variant="ghost">Ghost</Button>);
      const button = screen.getByRole('button');
      expect(button).toHaveClass('text-gray-700');
    });

    it('applies destructive variant styles', () => {
      render(<Button variant="destructive">Destructive</Button>);
      const button = screen.getByRole('button');
      expect(button).toHaveClass('bg-red-600', 'text-white');
    });
  });

  describe('Sizes', () => {
    it('applies medium size by default', () => {
      render(<Button>Medium</Button>);
      const button = screen.getByRole('button');
      expect(button).toHaveClass('h-9', 'px-4', 'text-sm');
    });

    it('applies small size styles', () => {
      render(<Button size="sm">Small</Button>);
      const button = screen.getByRole('button');
      expect(button).toHaveClass('h-8', 'px-3', 'text-sm');
    });

    it('applies large size styles', () => {
      render(<Button size="lg">Large</Button>);
      const button = screen.getByRole('button');
      expect(button).toHaveClass('h-10', 'px-6', 'text-base');
    });

    it('applies extra small size styles', () => {
      render(<Button size="xs">Extra Small</Button>);
      const button = screen.getByRole('button');
      expect(button).toHaveClass('h-7', 'px-2', 'text-xs');
    });

    it('applies extra large size styles', () => {
      render(<Button size="xl">Extra Large</Button>);
      const button = screen.getByRole('button');
      expect(button).toHaveClass('h-12', 'px-8', 'text-lg');
    });
  });

  describe('Full Width', () => {
    it('applies full width styles when fullWidth is true', () => {
      render(<Button fullWidth>Full Width</Button>);
      const button = screen.getByRole('button');
      expect(button).toHaveClass('w-full');
    });

    it('does not apply full width styles by default', () => {
      render(<Button>Normal Width</Button>);
      const button = screen.getByRole('button');
      expect(button).not.toHaveClass('w-full');
    });
  });

  describe('Loading State', () => {
    it('shows loading spinner when loading is true', () => {
      render(<Button loading>Loading</Button>);
      const button = screen.getByRole('button');
      const spinner = button.querySelector('svg');
      expect(spinner).toBeInTheDocument();
      expect(spinner).toHaveClass('animate-spin');
    });

    it('disables button when loading', () => {
      render(<Button loading>Loading</Button>);
      const button = screen.getByRole('button');
      expect(button).toBeDisabled();
    });

    it('hides left icon when loading', () => {
      render(
        <Button loading leftIcon={<span data-testid="left-icon">Icon</span>}>
          Loading
        </Button>
      );
      expect(screen.queryByTestId('left-icon')).not.toBeInTheDocument();
    });

    it('hides right icon when loading', () => {
      render(
        <Button loading rightIcon={<span data-testid="right-icon">Icon</span>}>
          Loading
        </Button>
      );
      expect(screen.queryByTestId('right-icon')).not.toBeInTheDocument();
    });
  });

  describe('Icons', () => {
    it('renders left icon', () => {
      render(
        <Button leftIcon={<span data-testid="left-icon">Left</span>}>
          With Left Icon
        </Button>
      );
      expect(screen.getByTestId('left-icon')).toBeInTheDocument();
    });

    it('renders right icon', () => {
      render(
        <Button rightIcon={<span data-testid="right-icon">Right</span>}>
          With Right Icon
        </Button>
      );
      expect(screen.getByTestId('right-icon')).toBeInTheDocument();
    });

    it('renders both left and right icons', () => {
      render(
        <Button
          leftIcon={<span data-testid="left-icon">Left</span>}
          rightIcon={<span data-testid="right-icon">Right</span>}
        >
          With Both Icons
        </Button>
      );
      expect(screen.getByTestId('left-icon')).toBeInTheDocument();
      expect(screen.getByTestId('right-icon')).toBeInTheDocument();
    });
  });

  describe('Disabled State', () => {
    it('disables button when disabled prop is true', () => {
      render(<Button disabled>Disabled</Button>);
      const button = screen.getByRole('button');
      expect(button).toBeDisabled();
    });

    it('applies disabled styles', () => {
      render(<Button disabled>Disabled</Button>);
      const button = screen.getByRole('button');
      expect(button).toHaveClass('disabled:pointer-events-none', 'disabled:opacity-50');
    });

    it('does not call onClick when disabled', () => {
      const handleClick = vi.fn();
      render(
        <Button disabled onClick={handleClick}>
          Disabled
        </Button>
      );
      const button = screen.getByRole('button');
      fireEvent.click(button);
      expect(handleClick).not.toHaveBeenCalled();
    });
  });

  describe('Interactions', () => {
    it('calls onClick when clicked', () => {
      const handleClick = vi.fn();
      render(<Button onClick={handleClick}>Click me</Button>);
      const button = screen.getByRole('button');
      fireEvent.click(button);
      expect(handleClick).toHaveBeenCalledTimes(1);
    });

    it('does not call onClick when loading', () => {
      const handleClick = vi.fn();
      render(
        <Button loading onClick={handleClick}>
          Loading
        </Button>
      );
      const button = screen.getByRole('button');
      fireEvent.click(button);
      expect(handleClick).not.toHaveBeenCalled();
    });

    it('supports keyboard navigation', () => {
      const handleClick = vi.fn();
      render(<Button onClick={handleClick}>Click me</Button>);
      const button = screen.getByRole('button');
      
      button.focus();
      expect(button).toHaveFocus();
      
      fireEvent.keyDown(button, { key: 'Enter' });
      expect(handleClick).toHaveBeenCalledTimes(1);
    });
  });

  describe('Accessibility', () => {
    it('has proper button role', () => {
      render(<Button>Accessible Button</Button>);
      const button = screen.getByRole('button');
      expect(button).toBeInTheDocument();
    });

    it('supports aria-label', () => {
      render(<Button aria-label="Custom label">Button</Button>);
      const button = screen.getByLabelText('Custom label');
      expect(button).toBeInTheDocument();
    });

    it('supports aria-describedby', () => {
      render(
        <div>
          <Button aria-describedby="description">Button</Button>
          <div id="description">Button description</div>
        </div>
      );
      const button = screen.getByRole('button');
      expect(button).toHaveAttribute('aria-describedby', 'description');
    });

    it('has focus-visible styles', () => {
      render(<Button>Focusable</Button>);
      const button = screen.getByRole('button');
      expect(button).toHaveClass('focus-visible:outline-none', 'focus-visible:ring-2');
    });
  });

  describe('HTML Attributes', () => {
    it('forwards HTML button attributes', () => {
      render(
        <Button type="submit" name="submit-button" value="submit">
          Submit
        </Button>
      );
      const button = screen.getByRole('button');
      expect(button).toHaveAttribute('type', 'submit');
      expect(button).toHaveAttribute('name', 'submit-button');
      expect(button).toHaveAttribute('value', 'submit');
    });

    it('supports data attributes', () => {
      render(<Button data-testid="custom-button">Custom</Button>);
      const button = screen.getByTestId('custom-button');
      expect(button).toBeInTheDocument();
    });
  });

  describe('Ref Forwarding', () => {
    it('forwards ref to button element', () => {
      const ref = React.createRef<HTMLButtonElement>();
      render(<Button ref={ref}>Ref Button</Button>);
      expect(ref.current).toBeInstanceOf(HTMLButtonElement);
      expect(ref.current?.textContent).toBe('Ref Button');
    });
  });
});