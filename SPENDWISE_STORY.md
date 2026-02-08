# SpendWise AI: Intelligent Financial Management for Nigerians

## Inspiration

The idea for SpendWise AI was born from a personal frustration that millions of Nigerians face daily - the complexity of managing personal finances in a rapidly evolving economy. As Nigeria's digital banking ecosystem expanded, so did the volume of financial data, yet tools to make sense of this data remained scarce or ill-suited to local contexts.

Traditional financial management apps failed to understand Nigerian banking peculiarities:

- The unique transaction patterns of Nigerian banks
- The informal economy's impact on personal finance
- The complex Nigerian tax system with its progressive brackets and exemptions
- The specific merchant landscape dominated by local businesses

We saw an opportunity to create something that wasn't just another expense tracker, but an intelligent financial companion that truly understood the Nigerian financial ecosystem.

## What it does

SpendWise AI is a comprehensive financial intelligence platform that:

- **Automatically extracts transactions** from Nigerian bank statements (GTBank, Access, UBA, First Bank) using a hybrid AI approach
- **Intelligently categorizes transactions** with Nigerian-specific categories and merchant recognition
- **Provides AI-powered financial insights** including spending patterns, trend analysis, and cost-cutting recommendations
- **Calculates Nigerian tax estimates** with proper progressive brackets, exemptions, and relief allowances
- **Tracks financial goals** with automated evaluation and progress monitoring
- **Sends tax reminders** and compliance notifications to keep users on track

The platform transforms complex financial data into actionable insights, helping Nigerians make better financial decisions and stay tax-compliant.

## How we built it

### Technical Architecture

We built SpendWise AI using a modern full-stack approach:

- **Frontend & Backend**: Next.js 14 with TypeScript for a unified development experience
- **Database**: PostgreSQL with Supabase for real-time capabilities and easy management
- **AI Integration**: Google Gemini 1.5 Flash for intelligent transaction extraction and categorization
- **UI/UX**: Tailwind CSS with responsive design for accessibility across devices

### Technologies Used

**Languages & Frameworks:**

- TypeScript
- Next.js 14 (App Router)
- React 19
- Node.js

**Database & Storage:**

- PostgreSQL
- Supabase (Database, Auth, Storage)
- Prisma (Database ORM)

**AI & APIs:**

- Google Gemini 1.5 Flash AI
- Google Generative AI SDK
- PDF.js (PDF processing)

**UI & Styling:**

- Tailwind CSS
- Lucide React (Icons)
- Recharts (Data visualization)

**State Management:**

- Redux Toolkit
- Redux Persist

**Authentication & Security:**

- Supabase Auth
- JWT tokens
- OTP-based authentication

**Email & Notifications:**

- Nodemailer
- React Email (Email templates)

**Development & Deployment:**

- Vercel (Hosting)
- pnpm (Package manager)
- ESLint (Code linting)
- Jest (Testing)
- Playwright (E2E testing)

### Hybrid Transaction Extraction System

Our core innovation is the hybrid extraction approach:

1. **Regex Parsing First**: Fast, free extraction for structured statements
2. **AI Fallback**: Gemini AI for complex or unrecognized formats

```typescript
// The hybrid extraction approach
export async function extractWithAI(pdfText: string): Promise<Transaction[]> {
  const systemInstruction = `You are an expert Nigerian financial forensic auditor specializing in bank statement analysis. 
  Your goal is to extract transactions with high precision and identify specific patterns unique to the Nigerian economy.`;

  // ... AI extraction logic
}
```

### Nigerian-Specific Categorization

We built a categorization system that understands local context:

- **Nigerian POS Heuristics**: Identifying cash withdrawal patterns unique to Nigerian POS agents
- **Local Merchant Recognition**: Shoprite, Spar, KFC, Uber, Bolt, and other Nigerian businesses
- **Context-Aware Analysis**: Distinguishing between personal and business expenses

### Tax Estimation Engine

Our tax calculation engine implements Nigerian tax law accurately:

```typescript
// Nigerian tax configuration
export const defaultTaxConfig: TaxConfig = {
  taxBrackets: [
    { min: 800001, max: 1500000, rate: 0.15 },
    { min: 1500001, max: 2500000, rate: 0.19 },
    { min: 2500001, max: 3500000, rate: 0.21 },
    { min: 3500001, max: 5000000, rate: 0.23 },
    { min: 5000001, max: null, rate: 0.25 },
  ],
  personalAllowance: 800000, // First ₦800,000 is tax-exempt
  reliefAllowancePercent: 20,
};
```

## Challenges we ran into

### 1. AI Cost Management

**Challenge**: Gemini AI API costs could quickly escalate with frequent usage.

**Solution**: Implemented a hybrid approach that uses AI only when necessary:

- Keyword matching for common transactions (free)
- AI fallback only for uncategorized items
- Token usage tracking with daily limits
- Confidence scoring to avoid unnecessary AI calls

### 2. Nigerian Banking Format Variability

**Challenge**: Nigerian bank statements came in dozens of formats with inconsistent data structures.

**Solution**: Built a flexible extraction system:

- Multiple regex patterns for common formats
- AI fallback for unusual formats
- Continuous learning from user corrections
- Format detection and routing

### 3. Tax Law Complexity

**Challenge**: Nigerian tax law has specific exemptions and calculations that generic tools miss.

**Solution**: Created a comprehensive tax engine:

- Database-driven tax configuration for easy updates
- Support for different income types
- Exemption detection and application
- Progressive bracket calculations with proper relief allowances

### 4. User Trust and Data Privacy

**Challenge**: Financial data is highly sensitive; users needed to trust our platform.

**Solution**: Implemented robust security measures:

- Secure file handling with automatic cleanup
- Data encryption at rest
- Transparent tax disclaimers
- Clear privacy policies

## Accomplishments that we're proud of

### 1. Cost-Effective AI Integration

We developed a sophisticated cost management system that keeps AI usage efficient:

- Token usage tracking with warnings
- Intelligent fallback mechanisms
- Batch processing for efficiency
- Free tier optimization

### 2. Context-Aware Transaction Analysis

Our system doesn't just categorize transactions - it understands context:

- Identifies recurring transactions for consistent categorization
- Distinguishes between personal and business expenses
- Recognizes Nigerian-specific transaction patterns

### 3. Accurate Nigerian Tax Implementation

We built the most comprehensive Nigerian tax estimation tool available:

- Proper implementation of progressive tax brackets
- Accurate exemption detection and application
- Support for different income types
- Clear visualization of tax obligations

### 4. User-Centric Design

Created an intuitive interface that makes complex financial data accessible:

- Visual analytics with interactive charts
- Clear tax dashboard with actionable insights
- Financial goal tracking with automated evaluation
- Mobile-responsive design for accessibility

## What we learned

1. **Local Context Matters**: Generic solutions fail when they don't understand local nuances
2. **Cost Efficiency is Key**: Smart AI usage beats brute force approaches
3. **User Trust is Earned**: Transparency and security are non-negotiable
4. **Iterative Development**: Building in phases allowed us to validate and improve continuously
5. **Hybrid Approaches Win**: Combining rule-based systems with AI creates more robust solutions
6. **Financial Data is Complex**: Nigerian financial patterns require specialized understanding

## What's next for SpendWise

### Short-term (Next 3 months)

- **Push notifications** for todos and tax reminders
- **Mobile app** (React Native) for on-the-go financial management
- **Multi-bank account support** for comprehensive financial overview
- **Tax configuration admin panel** for easy updates to tax rules

### Medium-term (3-6 months)

- **Budget recommendations** based on income and spending patterns
- **Spending predictions** using machine learning
- **Savings goals** with compound interest calculator
- **Integration with FIRS** for tax filing guidance

### Long-term (6+ months)

- **Monetization** (freemium model) with premium features
- **Partnership with savings platforms** for automated investment
- **AI financial coaching chat** for personalized advice
- **Tax professional marketplace** connecting users with experts

### Technical Enhancements

- **Predictive analytics** for spending forecasts
- **Anomaly detection** for fraud prevention
- **Natural language queries** for conversational financial insights
- **Multi-currency support** for the Nigerian diaspora

---

**SpendWise AI** - Your intelligent financial assistant for smarter spending and tax compliance.

Built with ❤️ for Nigerian users who want to take control of their finances.
