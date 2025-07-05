import React from 'react';
import { Story, Meta } from '@storybook/react';
import { DeedTokenPanel } from './DeedTokenPanel';
import { Property } from '@escrow/schemas';

export default {
  title: 'Adapters/Real Estate/DeedTokenPanel',
  component: DeedTokenPanel,
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component: 'Real estate deed tokenization panel with IPFS verification and EIP-712 signature support.',
      },
    },
  },
  argTypes: {
    onTokenize: { action: 'tokenize' },
    onVerify: { action: 'verify' },
    onRevoke: { action: 'revoke' },
  },
} as Meta;

const Template: Story<any> = (args) => <DeedTokenPanel {...args} />;

const mockProperty: Property = {
  propertyId: 'PROP001',
  owner: '0x1234567890123456789012345678901234567890',
  location: '123 Main St, New York, NY',
  coordinates: {
    lat: 40.7128,
    lng: -74.0060,
  },
  size: 1500,
  valuation: 750000,
  zoning: 'R-1',
  documentUri: 'ipfs://QmExample123',
  verified: false,
};

export const Default = Template.bind({});
Default.args = {
  property: mockProperty,
  dealId: 'DEAL001',
  loading: false,
  error: null,
};

export const Loading = Template.bind({});
Loading.args = {
  property: mockProperty,
  dealId: 'DEAL001',
  loading: true,
  error: null,
};

export const WithError = Template.bind({});
WithError.args = {
  property: mockProperty,
  dealId: 'DEAL001',
  loading: false,
  error: 'Failed to tokenize deed: Insufficient gas',
};

export const Tokenized = Template.bind({});
Tokenized.args = {
  property: {
    ...mockProperty,
    verified: true,
  },
  dealId: 'DEAL001',
  tokenId: '123',
  loading: false,
  error: null,
};

export const Verified = Template.bind({});
Verified.args = {
  property: {
    ...mockProperty,
    verified: true,
  },
  dealId: 'DEAL001',
  tokenId: '123',
  verificationSignature: '0x1234567890123456789012345678901234567890',
  loading: false,
  error: null,
};

export const Revoked = Template.bind({});
Revoked.args = {
  property: {
    ...mockProperty,
    verified: false,
  },
  dealId: 'DEAL001',
  tokenId: '123',
  revoked: true,
  revocationReason: 'Fraudulent documentation',
  loading: false,
  error: null,
};

export const LargeProperty = Template.bind({});
LargeProperty.args = {
  property: {
    ...mockProperty,
    size: 5000,
    valuation: 2500000,
    location: '456 Park Avenue, New York, NY',
  },
  dealId: 'DEAL002',
  loading: false,
  error: null,
};

export const CommercialProperty = Template.bind({});
CommercialProperty.args = {
  property: {
    ...mockProperty,
    zoning: 'C-1',
    size: 10000,
    valuation: 5000000,
    location: '789 Business District, New York, NY',
  },
  dealId: 'DEAL003',
  loading: false,
  error: null,
};

// Accessibility stories
export const Accessibility = Template.bind({});
Accessibility.args = {
  property: mockProperty,
  dealId: 'DEAL001',
  loading: false,
  error: null,
};
Accessibility.parameters = {
  a11y: {
    config: {
      rules: [
        {
          id: 'color-contrast',
          enabled: true,
        },
        {
          id: 'button-name',
          enabled: true,
        },
        {
          id: 'form-field-multiple-labels',
          enabled: true,
        },
      ],
    },
  },
};

// RTL support
export const RTL = Template.bind({});
RTL.args = {
  property: {
    ...mockProperty,
    location: 'شارع الرئيسي ١٢٣، القاهرة، مصر',
  },
  dealId: 'DEAL001',
  loading: false,
  error: null,
};
RTL.parameters = {
  direction: 'rtl',
};

// Mobile responsive
export const Mobile = Template.bind({});
Mobile.args = {
  property: mockProperty,
  dealId: 'DEAL001',
  loading: false,
  error: null,
};
Mobile.parameters = {
  viewport: {
    defaultViewport: 'mobile1',
  },
};

// Tablet responsive
export const Tablet = Template.bind({});
Tablet.args = {
  property: mockProperty,
  dealId: 'DEAL001',
  loading: false,
  error: null,
};
Tablet.parameters = {
  viewport: {
    defaultViewport: 'tablet',
  },
};

// Dark theme
export const DarkTheme = Template.bind({});
DarkTheme.args = {
  property: mockProperty,
  dealId: 'DEAL001',
  loading: false,
  error: null,
};
DarkTheme.parameters = {
  backgrounds: {
    default: 'dark',
  },
};

// High contrast
export const HighContrast = Template.bind({});
HighContrast.args = {
  property: mockProperty,
  dealId: 'DEAL001',
  loading: false,
  error: null,
};
HighContrast.parameters = {
  backgrounds: {
    default: 'high-contrast',
  },
}; 