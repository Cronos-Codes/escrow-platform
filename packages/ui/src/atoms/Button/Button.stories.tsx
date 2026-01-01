import type { Meta, StoryObj } from '@storybook/react';
import { Button } from './Button';
import { Icon } from '../Icon';

const meta: Meta<typeof Button> = {
  title: 'Atoms/Button',
  component: Button,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component: 'A versatile button component with multiple variants, sizes, and states. Built with accessibility and user experience in mind.',
      },
    },
  },
  tags: ['autodocs'],
  argTypes: {
    variant: {
      control: 'select',
      options: ['primary', 'secondary', 'outline', 'ghost', 'destructive', 'success', 'warning'],
      description: 'The visual style variant of the button',
    },
    size: {
      control: 'select',
      options: ['xs', 'sm', 'md', 'lg', 'xl'],
      description: 'The size of the button',
    },
    loading: {
      control: 'boolean',
      description: 'Whether the button is in a loading state',
    },
    disabled: {
      control: 'boolean',
      description: 'Whether the button is disabled',
    },
    fullWidth: {
      control: 'boolean',
      description: 'Whether the button should take the full width of its container',
    },
    children: {
      control: 'text',
      description: 'The content of the button',
    },
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

// Basic Stories
export const Default: Story = {
  args: {
    children: 'Button',
  },
};

export const Primary: Story = {
  args: {
    variant: 'primary',
    children: 'Primary Button',
  },
};

export const Secondary: Story = {
  args: {
    variant: 'secondary',
    children: 'Secondary Button',
  },
};

export const Outline: Story = {
  args: {
    variant: 'outline',
    children: 'Outline Button',
  },
};

export const Ghost: Story = {
  args: {
    variant: 'ghost',
    children: 'Ghost Button',
  },
};

export const Destructive: Story = {
  args: {
    variant: 'destructive',
    children: 'Destructive Button',
  },
};

export const Success: Story = {
  args: {
    variant: 'success',
    children: 'Success Button',
  },
};

export const Warning: Story = {
  args: {
    variant: 'warning',
    children: 'Warning Button',
  },
};

// Size Variants
export const Sizes: Story = {
  render: () => (
    <div className="flex items-center gap-4">
      <Button size="xs">Extra Small</Button>
      <Button size="sm">Small</Button>
      <Button size="md">Medium</Button>
      <Button size="lg">Large</Button>
      <Button size="xl">Extra Large</Button>
    </div>
  ),
};

// States
export const Loading: Story = {
  args: {
    loading: true,
    children: 'Loading...',
  },
};

export const Disabled: Story = {
  args: {
    disabled: true,
    children: 'Disabled Button',
  },
};

export const FullWidth: Story = {
  args: {
    fullWidth: true,
    children: 'Full Width Button',
  },
  parameters: {
    layout: 'padded',
  },
};

// With Icons
export const WithLeftIcon: Story = {
  args: {
    leftIcon: <Icon name="check" size="sm" />,
    children: 'Success',
    variant: 'success',
  },
};

export const WithRightIcon: Story = {
  args: {
    rightIcon: <Icon name="chevron-right" size="sm" />,
    children: 'Continue',
  },
};

export const WithBothIcons: Story = {
  args: {
    leftIcon: <Icon name="check" size="sm" />,
    rightIcon: <Icon name="chevron-right" size="sm" />,
    children: 'Complete',
    variant: 'success',
  },
};

export const IconOnly: Story = {
  args: {
    leftIcon: <Icon name="search" size="sm" />,
    'aria-label': 'Search',
    variant: 'outline',
    size: 'sm',
  },
};

// All Variants Showcase
export const AllVariants: Story = {
  render: () => (
    <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
      <Button variant="primary">Primary</Button>
      <Button variant="secondary">Secondary</Button>
      <Button variant="outline">Outline</Button>
      <Button variant="ghost">Ghost</Button>
      <Button variant="destructive">Destructive</Button>
      <Button variant="success">Success</Button>
      <Button variant="warning">Warning</Button>
      <Button disabled>Disabled</Button>
    </div>
  ),
  parameters: {
    layout: 'padded',
  },
};

// Interactive Examples
export const InteractiveExample: Story = {
  render: () => {
    const handleClick = () => {
      alert('Button clicked!');
    };

    return (
      <div className="space-y-4">
        <div className="flex gap-2">
          <Button onClick={handleClick}>Click Me</Button>
          <Button variant="outline" onClick={handleClick}>
            Or Me
          </Button>
        </div>
        <div className="flex gap-2">
          <Button
            variant="success"
            leftIcon={<Icon name="check" size="sm" />}
            onClick={handleClick}
          >
            Approve
          </Button>
          <Button
            variant="destructive"
            leftIcon={<Icon name="x-mark" size="sm" />}
            onClick={handleClick}
          >
            Reject
          </Button>
        </div>
      </div>
    );
  },
};

// Loading States
export const LoadingStates: Story = {
  render: () => (
    <div className="space-y-4">
      <div className="flex gap-2">
        <Button loading>Loading</Button>
        <Button loading variant="outline">
          Processing
        </Button>
        <Button loading variant="success">
          Saving
        </Button>
      </div>
      <div className="flex gap-2">
        <Button loading size="sm">
          Small Loading
        </Button>
        <Button loading size="lg">
          Large Loading
        </Button>
      </div>
    </div>
  ),
};