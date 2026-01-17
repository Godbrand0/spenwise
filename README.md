# SpendWise AI - Intelligent Financial Management with Tax Estimation

A Next.js-powered financial intelligence platform that automatically extracts transactions from bank statements, provides AI-powered insights, and estimates tax obligations for Nigerian users.

## 🚀 Features

### Core Functionality

- **PDF Bank Statement Processing** - Upload and extract transactions from Nigerian bank statements (GTBank, Access, UBA, First Bank)
- **AI-Powered Categorization** - Smart transaction categorization with user correction learning
- **Income Detection & Classification** - Automatically identifies and classifies different income sources
- **Historical Trend Analysis** - Compare spending patterns across multiple statements
- **Financial Goal Tracking** - Set and automatically evaluate financial todos
- **Tax Estimation Engine** - Calculate Nigerian tax estimates with compliance tracking

### Tax Features

- **Automated Tax Calculation** - Based on progressive Nigerian tax brackets
- **Income Aggregation** - Combines income from multiple statements and sources
- **Compliance Tracking** - Monitor upcoming, overdue, and paid tax obligations
- **Email Reminders** - Automatic notifications for upcoming tax deadlines
- **Configurable Tax Rules** - Database-driven tax configuration for easy updates

## 🏗️ Architecture

### Technology Stack

- **Frontend & Backend**: Next.js 14 with TypeScript (full-stack framework)
- **Database**: PostgreSQL with Supabase (recommended) or any PostgreSQL provider
- **AI**: Google Gemini 1.5 Flash for transaction extraction and insights
- **Deployment**: Vercel with cron jobs for automated tasks

**Note**: You don't need to install a separate backend! Next.js provides both the frontend and backend API routes in a single application. The "backend" functionality is handled by Next.js API routes within the same project.

### Key Components

- **Hybrid Extraction Engine** - Regex parsing with AI fallback for cost efficiency
- **Category Standardization System** - Consistent categorization with learning capabilities
- **Tax Calculation Engine** - Rule-based, configurable tax calculations
- **Automated Reminder System** - Email notifications for tax deadlines and goal tracking

## 📊 Database Schema

### Core Tables

- `users` - User accounts and authentication
- `statements` - Uploaded bank statements with metadata
- `transactions` - Individual transactions with categorization
- `categories` - Standardized categories with keyword matching
- `financial_todos` - User-defined financial goals

### Tax Tables

- `tax_estimates` - Calculated tax estimates with status tracking
- `tax_configurations` - Flexible tax rules and brackets
- `tax_brackets` - Progressive tax calculation data

## 🛠️ Installation & Setup

### Prerequisites

- Node.js 18+
- PostgreSQL database (Supabase recommended for easy setup)
- Google AI Studio API key (free tier available)

### Do I need a separate backend?

No! SpendWise AI uses Next.js, which is a full-stack framework. The backend functionality is handled by Next.js API routes within the same project. You only need to:

1. Set up a PostgreSQL database (Supabase is recommended for free hosting)
2. Configure your environment variables
3. Run the Next.js development server

The API routes in the `app/api/` directory handle all backend operations like PDF processing, tax calculations, and data storage.

### Quick Start

```bash
# Clone the repository
git clone <repository-url>
cd spendwise-ai

# Install dependencies (use pnpm for this project)
pnpm install

# Set up environment variables
cp .env.example .env.local
# Edit .env.local with your configuration

# Run database migrations
pnpm run db:migrate

# Start development server
pnpm run dev
```

**Note**: This project uses pnpm as the package manager. If you encounter npm errors, use pnpm instead.

### Environment Variables

```env
# Database
DATABASE_URL="your-postgres-connection-string"

# AI Services
GEMINI_API_KEY="your-google-ai-studio-key"

# Email Service (Resend/SendGrid)
EMAIL_API_KEY="your-email-service-key"
FROM_EMAIL="noreply@yourdomain.com"

# App Configuration
NEXT_PUBLIC_APP_URL="https://yourdomain.com"
CRON_SECRET="your-cron-secret"
```

## 📁 Project Structure

```
spendwise-ai/
├── app/                    # Next.js App Router
│   ├── api/               # API routes
│   │   ├── upload/        # PDF upload endpoint
│   │   ├── transactions/  # Transaction management
│   │   ├── tax/          # Tax calculation endpoints
│   │   └── todos/        # Financial goal management
│   ├── analysis/         # Analysis dashboard pages
│   ├── tax/             # Tax overview and details
│   └── insights/         # AI insights pages
├── components/           # Reusable React components
├── lib/                 # Utility functions
│   ├── ai/             # AI integration (Gemini)
│   ├── extraction/     # PDF processing logic
│   ├── categorization/ # Transaction categorization
│   ├── tax/           # Tax calculation engine
│   └── notifications/ # Email and reminder system
├── public/             # Static assets
└── types/             # TypeScript type definitions
```

## 🧠 AI Integration

### Transaction Extraction

The system uses a hybrid approach:

1. **Regex Parsing** - Fast, free extraction for common bank formats
2. **AI Fallback** - Google Gemini for complex or unrecognized formats
3. **Validation Layer** - Ensures data quality and consistency

### Categorization

- **Keyword Matching** - Fast categorization using predefined keywords
- **AI Categorization** - Fallback for uncategorized transactions
- **Learning System** - Improves from user corrections

### Insights Generation

- **Historical Analysis** - Compares spending across multiple periods
- **Trend Identification** - Highlights patterns and anomalies
- **Actionable Recommendations** - Specific, measurable financial advice

## 💰 Tax Estimation Features

### Supported Tax Calculations

- **Progressive Tax Brackets** - Nigerian tax structure with configurable rates
- **Relief Allowances** - Personal and consolidated relief calculations
- **Income Classification** - Separate handling for salary, freelance, business, and investment income
- **Period-based Estimates** - Monthly and yearly tax calculations

### Compliance Tracking

- **Status Management** - Track upcoming, overdue, and paid taxes
- **Automated Reminders** - Email notifications at 30 and 7 days before due dates
- **Payment History** - Complete record of tax payments
- **Overdue Detection** - Automatic status updates for missed deadlines

### Tax Configuration

- **Database-driven Rules** - No hardcoded tax rates in the application
- **Flexible Brackets** - Easy updates for changing tax laws
- **Country Support** - Designed for Nigerian tax system but extensible

## 🔄 Automated Workflows

### Daily Cron Jobs

- **Tax Reminders** - Check for upcoming tax obligations
- **Overdue Detection** - Update status for missed deadlines
- **Todo Evaluation** - Assess financial goals at month-end

### Email Notifications

- **Tax Reminders** - 30 days and 7 days before due dates
- **Overdue Alerts** - Immediate notification for missed payments
- **Goal Completion** - Success/failure notifications for financial todos
- **Payment Confirmations** - Receipt when taxes are marked as paid

## 🧪 Testing

### Test Coverage

- **Unit Tests** - Extraction logic, tax calculations, categorization
- **Integration Tests** - AI pipeline, database operations
- **E2E Tests** - Complete upload-to-insights workflow
- **Tax Calculation Tests** - Various income levels and scenarios

### Running Tests

```bash
# Run all tests
pnpm test

# Run with coverage
pnpm run test:coverage

# Run E2E tests
pnpm run test:e2e
```

## 📈 Monitoring & Analytics

### Usage Tracking

- **Token Usage** - Monitor AI API consumption
- **Extraction Methods** - Track regex vs AI usage
- **User Engagement** - Statement uploads and feature usage
- **Cost Monitoring** - Alert system for approaching limits

### Performance Metrics

- **Processing Speed** - PDF extraction and analysis times
- **Categorization Accuracy** - User correction rates
- **Tax Calculation Accuracy** - User feedback on estimates

## 🚀 Deployment

### Production Setup

1. **Database** - Set up PostgreSQL with Supabase or Railway
2. **Environment Variables** - Configure all required variables
3. **Domain & SSL** - Set up custom domain with HTTPS
4. **Cron Jobs** - Configure automated daily tasks
5. **Monitoring** - Set up error tracking and analytics

### Vercel Deployment

```bash
# Deploy to Vercel
pnpm run deploy

# Set up cron jobs in vercel.json
# Configure environment variables in Vercel dashboard
```

## 🔒 Security & Privacy

### Data Protection

- **File Validation** - PDF-only uploads with size limits
- **Secure Storage** - Temporary file handling with cleanup
- **API Authentication** - Protected routes with proper validation
- **Data Encryption** - Sensitive data encrypted at rest

### Tax Disclaimer

All tax estimates include clear disclaimers:

- Estimates based on uploaded statements only
- Not a substitute for professional tax advice
- Users should consult qualified tax professionals
- Actual tax liability may vary

## 🤝 Contributing

### Development Workflow

1. Fork the repository
2. Create feature branch
3. Make changes with proper tests
4. Submit pull request with description

### Code Standards

- **TypeScript** - Strict typing throughout
- **ESLint + Prettier** - Consistent code formatting
- **Component Structure** - Reusable, well-documented components
- **Error Handling** - Comprehensive error boundaries and logging

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

### Documentation

- **API Documentation** - Complete API reference
- **Database Schema** - Detailed table descriptions
- **Tax Configuration** - Guide for updating tax rules

### Common Issues

- **PDF Processing** - Supported formats and troubleshooting
- **Categorization** - Improving accuracy with user corrections
- **Tax Calculations** - Understanding estimates and limitations

## 🗺️ Roadmap

### Month 2

- Push notifications for todos and tax reminders
- Mobile app (React Native)
- Multi-bank account support
- Tax configuration admin panel

### Month 3

- Budget recommendations based on income
- Spending predictions
- Savings goals with compound interest calculator
- Integration with FIRS for tax filing guidance

### Month 4-6

- Monetization (freemium model)
- Partnership with savings platforms
- AI financial coaching chat
- Tax professional marketplace

## 📊 Success Metrics

### Development Milestones

- **Week 2**: PDF upload + extraction working
- **Week 4**: Full analysis pipeline + tax estimation working
- **Week 6**: Historical trends + todos + tax tracking functional
- **Week 7**: Production-ready with 10 beta users

### Business Metrics

- **User Engagement** - Monthly active users and statement uploads
- **Feature Adoption** - Usage of tax estimates and financial todos
- **Accuracy Rates** - Categorization and extraction accuracy
- **User Satisfaction** - Feedback on tax estimates and insights

---

**SpendWise AI** - Your intelligent financial assistant for smarter spending and tax compliance.

Built with ❤️ for Nigerian users who want to take control of their finances.
