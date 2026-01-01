import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Button } from './Button';

describe('Button', () => {
  it('renders button with text', () => {
    render(<Button>Test Button</Button>);
    expect(screen.getByRole('button')).toHaveTextContent('Test Button');
  });

  it('applies variant classes correctly', () => {
    render(<Button variant="primary">Primary Button</Button>);
    const button = screen.getByRole('button');
    expect(button).toHaveClass('bg-gradient-to-r');
  });

  it('handles click events', () => {
    let clicked = false;
    render(<Button onClick={() => { clicked = true; }}>Click Me</Button>);
    
    screen.getByRole('button').click();
    expect(clicked).toBe(true);
  });

  it('can be disabled', () => {
    render(<Button disabled>Disabled Button</Button>);
    const button = screen.getByRole('button');
    expect(button).toBeDisabled();
  });
});