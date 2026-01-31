import { NextRequest, NextResponse } from "next/server";
import { calculateTax, IncomeBreakdown } from "@/lib/tax/calculator";
import { createServerClient } from "@/lib/database/server";
import {
  createTaxCalculation,
  getTaxCalculationsByUserId,
} from "@/lib/database/utils";

export async function POST(req: NextRequest) {
  try {
    const { userId, periodStart, periodEnd, periodType, incomeBreakdown } =
      await req.json();

    if (!userId || !periodStart || !periodEnd) {
      return NextResponse.json(
        { error: "Missing required fields: userId, periodStart, periodEnd" },
        { status: 400 },
      );
    }

    // Calculate total income from breakdown
    const totalIncome = incomeBreakdown
      ? Object.values(incomeBreakdown as IncomeBreakdown).reduce(
          (sum, amount) => sum + amount,
          0,
        )
      : 0;

    // Calculate tax
    const taxCalculation = await calculateTax(totalIncome);

    // Determine due date (January 31 of next year for annual tax)
    const periodEndDate = new Date(periodEnd);
    const dueDate = new Date(periodEndDate.getFullYear() + 1, 0, 31); // January 31 of next year

    // Save tax calculation to database
    const taxCalculationData = {
      user_id: userId,
      tax_year: periodEndDate.getFullYear(),
      tax_period: (periodType || "yearly") as
        | "annual"
        | "monthly"
        | "quarterly",
      period_start: periodStart,
      period_end: periodEnd,
      gross_income: totalIncome,
      salary_income: incomeBreakdown?.salary || 0,
      freelance_income: incomeBreakdown?.freelance || 0,
      business_income: incomeBreakdown?.business || 0,
      investment_income: incomeBreakdown?.investment || 0,
      other_income: incomeBreakdown?.other || 0,
      taxable_income: taxCalculation.taxableIncome,
      personal_allowance: taxCalculation.personalAllowance,
      consolidated_relief_allowance: taxCalculation.consolidatedReliefAllowance,
      estimated_tax: taxCalculation.estimatedTax,
      tax_status: "estimated" as const,
      due_date: dueDate.toISOString().split("T")[0],
      amount_paid: 0,
      tax_config: {}, // Store the tax configuration used
      calculation_details: taxCalculation.taxCalculationDetails,
      is_taxable: taxCalculation.isTaxable,
      tax_exemption_reason: taxCalculation.taxExemptionReason,
      tax_badge: taxCalculation.taxBadge,
    };

    const { data: savedTaxCalculation, error: saveError } =
      await createTaxCalculation(taxCalculationData);

    if (saveError) {
      console.error("Error saving tax calculation:", saveError);
      return NextResponse.json(
        { error: "Failed to save tax calculation" },
        { status: 500 },
      );
    }

    return NextResponse.json({
      estimate: {
        id: savedTaxCalculation?.id,
        user_id: userId,
        period_start: periodStart,
        period_end: periodEnd,
        period_type: periodType || "yearly",
        gross_income: totalIncome,
        taxable_income: taxCalculation.taxableIncome,
        income_breakdown: incomeBreakdown || {},
        estimated_tax: taxCalculation.estimatedTax,
        tax_calculation_details: taxCalculation.taxCalculationDetails,
        due_date: dueDate.toISOString().split("T")[0],
        status: "estimated",
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      },
      calculation: taxCalculation,
    });
  } catch (error) {
    console.error("Error calculating tax estimate:", error);
    return NextResponse.json(
      { error: "Failed to calculate tax estimate" },
      { status: 500 },
    );
  }
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get("userId");

    if (!userId) {
      return NextResponse.json(
        { error: "User ID is required" },
        { status: 400 },
      );
    }

    const { data: taxCalculations, error } =
      await getTaxCalculationsByUserId(userId);

    if (error) {
      console.error("Error fetching tax calculations:", error);
      return NextResponse.json(
        { error: "Failed to fetch tax calculations" },
        { status: 500 },
      );
    }

    return NextResponse.json(taxCalculations);
  } catch (error) {
    console.error("Error in tax API:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
