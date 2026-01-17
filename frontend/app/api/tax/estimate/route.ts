import { NextRequest, NextResponse } from 'next/server';
import { calculateTax, IncomeBreakdown } from '../../../../lib/tax/calculator';

export async function POST(req: NextRequest) {
  try {
    const { userId, periodStart, periodEnd, periodType, incomeBreakdown } = await req.json();
    
    if (!userId || !periodStart || !periodEnd) {
      return NextResponse.json(
        { error: 'Missing required fields: userId, periodStart, periodEnd' },
        { status: 400 }
      );
    }
    
    // Calculate total income from breakdown
    const totalIncome = incomeBreakdown 
      ? Object.values(incomeBreakdown as IncomeBreakdown).reduce((sum, amount) => sum + amount, 0)
      : 0;
    
    // Calculate tax
    const taxCalculation = await calculateTax(totalIncome);
    
    // Determine due date (January 31 of next year for annual tax)
    const periodEndDate = new Date(periodEnd);
    const dueDate = new Date(periodEndDate.getFullYear() + 1, 0, 31); // January 31 of next year
    
    // Mock estimate object (in real app, save to database)
    const estimate = {
      id: Date.now(), // Mock ID
      user_id: userId,
      period_start: periodStart,
      period_end: periodEnd,
      period_type: periodType || 'yearly',
      gross_income: totalIncome,
      taxable_income: taxCalculation.taxableIncome,
      income_breakdown: incomeBreakdown || {},
      estimated_tax: taxCalculation.estimatedTax,
      tax_calculation_details: taxCalculation.taxCalculationDetails,
      due_date: dueDate.toISOString().split('T')[0], // YYYY-MM-DD format
      status: 'upcoming',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    
    return NextResponse.json({
      estimate,
      calculation: taxCalculation
    });
  } catch (error) {
    console.error('Error calculating tax estimate:', error);
    return NextResponse.json(
      { error: 'Failed to calculate tax estimate' },
      { status: 500 }
    );
  }
}