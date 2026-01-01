# Gold Escrow Admin Portal

A modern, production-ready admin dashboard for Gold Escrow built with Next.js and Material-UI.

## 🚀 Features

- **Modern UI**: Built with Material-UI v7 and Next.js 15
- **Gold Escrow Branding**: Custom theme with gold and dark color scheme
- **Role-Based Access Control**: Admin, Operator, Arbiter, and Support roles
- **Responsive Design**: Works on desktop, tablet, and mobile
- **Real-time Data**: Integration with Firebase for real-time updates
- **Audit Trail**: Immutable audit logging for all admin actions
- **High-Risk Action Protection**: WebAuthn/2FA for sensitive operations

## 📋 Admin Modules

### Dashboard Overview
- Key Performance Indicators (KPIs)
- Real-time metrics and analytics
- Recent activity feed
- System health monitoring

### User Management
- User listing with advanced filters
- Role assignment and management
- User suspension/activation
- KYC verification status

### Escrow Operations
- Active escrow monitoring
- Force release capabilities
- Escrow cancellation
- Transaction history

### Dispute Resolution
- Dispute queue management
- Arbiter assignment
- Evidence review system
- Verdict publishing

### Financial Management
- Paymaster balance monitoring
- Top-up and withdrawal operations
- Policy configuration
- Risk assessment

### System Administration
- Audit log review
- System settings
- Feature flags
- Maintenance controls

## 🛠️ Technology Stack

- **Frontend**: Next.js 15, React 18, TypeScript
- **UI Framework**: Material-UI v7, Emotion
- **State Management**: TanStack Query, React Context
- **Authentication**: Firebase Auth with custom claims
- **Database**: Firestore with real-time listeners
- **Styling**: Tailwind CSS, Material-UI theming
- **Charts**: ApexCharts, Recharts
- **Icons**: Tabler Icons, Material Icons

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ 
- npm or yarn
- Firebase project setup

### Installation

1. Install dependencies:
```bash
npm install
```

2. Set up environment variables:
```bash
cp .env.example .env.local
```

3. Start the development server:
```bash
npm run dev
```

4. Open [http://localhost:3001](http://localhost:3001) in your browser.

## 🔧 Development

### Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint
- `npm run type-check` - Run TypeScript type checking
- `npm run test` - Run tests
- `npm run storybook` - Start Storybook

### Project Structure

```
apps/admin-portal/
├── app/                          # Next.js app directory
│   ├── (DashboardLayout)/        # Main dashboard layout
│   │   ├── components/           # Dashboard components
│   │   ├── layout/               # Layout components
│   │   └── page.tsx              # Dashboard home page
│   ├── authentication/           # Auth pages
│   └── layout.tsx                # Root layout
├── components/                   # Shared components
├── hooks/                        # Custom React hooks
├── lib/                          # Utilities and configurations
└── public/                       # Static assets
```

## 🎨 Customization

### Theme Configuration

The admin portal uses a custom Gold Escrow theme defined in `lib/utils/theme/DefaultColors.tsx`:

- **Primary**: Gold (#eab308)
- **Secondary**: Dark Gray (#1f2937)
- **Success**: Green (#13DEB9)
- **Error**: Red (#FA896B)
- **Warning**: Orange (#FFAE1F)

### Adding New Pages

1. Create a new page in `app/(DashboardLayout)/`
2. Add navigation item in `app/(DashboardLayout)/layout/sidebar/MenuItems.tsx`
3. Implement role-based access control using `useRequireRole` hook

## 🔐 Security Features

- **Role-Based Access Control**: Server-side and client-side role validation
- **Audit Logging**: Immutable audit trail for all admin actions
- **High-Risk Action Protection**: WebAuthn/2FA for sensitive operations
- **Firestore Security Rules**: Comprehensive security rules for data access
- **Input Validation**: Zod schemas for all data validation

## 📊 Monitoring & Observability

- **Structured Logging**: JSON logs with trace IDs and metadata
- **Metrics Collection**: Prometheus/Cloud Monitoring integration
- **Error Tracking**: Comprehensive error handling and reporting
- **Performance Monitoring**: Real-time performance metrics

## 🧪 Testing

- **Unit Tests**: Jest and React Testing Library
- **Integration Tests**: API and component integration tests
- **E2E Tests**: Playwright for end-to-end testing
- **Contract Tests**: Hardhat for smart contract testing

## 🚀 Deployment

### Production Build

```bash
npm run build
npm run start
```

### Environment Variables

Required environment variables:

```env
NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_auth_domain
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_storage_bucket
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id
```

## 📚 Documentation

- [Admin Runbook](./ops/admin-runbook.md) - Operational procedures
- [Deployment Guide](./ops/deploy-playbook.md) - Deployment instructions
- [API Documentation](./docs/api.md) - Backend API reference
- [Component Library](./docs/components.md) - UI component documentation

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests for new functionality
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

For support and questions:
- Create an issue in the repository
- Contact the development team
- Check the documentation

---

**Gold Escrow Admin Portal** - Secure, scalable, and user-friendly administration for the Gold Escrow platform.
