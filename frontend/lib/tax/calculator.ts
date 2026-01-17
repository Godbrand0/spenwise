export interface TaxBracket {
  min: number;
  max: number | null;
  rate: number;
}

export interface TaxConfig {
  taxBrackets: TaxBracket[];
  personalAllowance: number;
  reliefAllowancePercent: number;
}

export interface TaxCalculationResult {
  grossIncome: number;
  taxableIncome: number;
  consolidatedReliefAllowance: number;
  personalAllowance: number;
  estimatedTax: number;
  effectiveRate: number;
  taxCalculationDetails: Array<{
    bracket: string;
    amount: number;
    tax: number;
  }>;
}

// Default Nigerian tax configuration for 2026
export const defaultTaxConfig: TaxConfig = {
  taxBrackets: [
    { min: 0, max: 300000, rate: 0.07 },
    { min: 300001, max: 600000, rate: 0.11 },
    { min: 600001, max: 1100000, rate: 0.15 },
    { min: 1100001, max: 1600000, rate: 0.19 },
    { min: 1600001, max: 3200000, rate: 0.21 },
    { min: 3200001, max: null, rate: 0.24 },
  ],
  personalAllowance: 0,
  reliefAllowancePercent: 20,
};

export async function calculateTax(
  grossIncome: number,
  taxConfig: TaxConfig = defaultTaxConfig
): Promise<TaxCalculationResult> {
  // Calculate consolidated relief allowance (20% of gross income, capped at ₦200,000)
  const consolidatedReliefAllowance = Math.min(
    (grossIncome * taxConfig.reliefAllowancePercent) / 100,
    200000
  );

  // Calculate taxable income
  const taxableIncome = Math.max(
    0,
    grossIncome - consolidatedReliefAllowance - taxConfig.personalAllowance
  );

  // Calculate tax using progressive brackets
  const { totalTax, breakdown } = calculateProgressiveTax(
    taxableIncome,
    taxConfig.taxBrackets
  );

  return {
    grossIncome,
    taxableIncome,
    consolidatedReliefAllowance,
    personalAllowance: taxConfig.personalAllowance,
    estimatedTax: totalTax,
    effectiveRate: grossIncome > 0 ? (totalTax / grossIncome) * 100 : 0,
    taxCalculationDetails: breakdown,
  };
}

function calculateProgressiveTax(
  taxableIncome: number,
  brackets: TaxBracket[]
): {
  totalTax: number;
  breakdown: Array<{ bracket: string; amount: number; tax: number }>;
} {
  let totalTax = 0;
  const breakdown: Array<{ bracket: string; amount: number; tax: number }> = [];

  for (const bracket of brackets) {
    const bracketMax = bracket.max || Infinity;

    if (taxableIncome <= bracket.min) {
      break;
    }

    const taxableInBracket = Math.min(
      taxableIncome - bracket.min,
      bracketMax - bracket.min
    );

    const taxForBracket = taxableInBracket * bracket.rate;
    totalTax += taxForBracket;

    breakdown.push({
      bracket: `₦${bracket.min.toLocaleString()} - ${
        bracket.max ? "₦" + bracket.max.toLocaleString() : "above"
      }`,
      amount: taxableInBracket,
      tax: taxForBracket,
    });

    if (taxableIncome <= bracketMax) {
      break;
    }
  }

  return { totalTax, breakdown };
}

// Calculate monthly tax estimate from annual income
export function calculateMonthlyTax(
  annualIncome: number
): Promise<TaxCalculationResult> {
  return calculateTax(annualIncome / 12);
}

// Calculate tax for different income types
export interface IncomeBreakdown {
  salary: number;
  freelance: number;
  business: number;
  investment: number;
  other: number;
}

export async function calculateTaxFromIncomeBreakdown(
  incomeBreakdown: IncomeBreakdown,
  taxConfig: TaxConfig = defaultTaxConfig
): Promise<TaxCalculationResult> {
  const totalIncome = Object.values(incomeBreakdown).reduce(
    (sum, amount) => sum + amount,
    0
  );
  return calculateTax(totalIncome, taxConfig);
}

// Helper function to format currency
export function formatNaira(amount: number): string {
  return `₦${amount.toLocaleString("en-NG", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

// Helper function to calculate due date
export function calculateTaxDueDate(periodEnd: Date): Date {
  // For Nigerian tax, annual filing is typically due by January 31 of the following year
  const nextYear = periodEnd.getFullYear() + 1;
  return new Date(nextYear, 0, 31); // January 31 of next year
}

// Calculate days until due date
export function getDaysUntilDue(dueDate: Date): number {
  const today = new Date();
  const diffTime = dueDate.getTime() - today.getTime();
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
}
