"use client";

import { useState } from "react";
import { calculateTax, formatNaira } from "../../../lib/tax/calculator";
import TaxBadge from "../../../components/tax/TaxBadge";

export default function TaxCalculatorPage() {
  const [incomeBreakdown, setIncomeBreakdown] = useState({
    salary: 0,
    freelance: 0,
    business: 0,
    investment: 0,
    other: 0,
  });

  const [taxResult, setTaxResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const handleCalculate = async () => {
    setLoading(true);
    try {
      const response = await fetch("/api/tax/estimate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: "demo-user", // In real app, get from auth
          periodStart: "2024-01-01",
          periodEnd: "2024-12-31",
          periodType: "yearly",
          incomeBreakdown,
        }),
      });

      const data = await response.json();
      setTaxResult(data.calculation);
    } catch (error) {
      console.error("Error calculating tax:", error);
    } finally {
      setLoading(false);
    }
  };

  const totalIncome = Object.values(incomeBreakdown).reduce(
    (sum, amount) => sum + amount,
    0,
  );

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-8">Tax Calculator</h1>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Income Input */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold mb-6">Income Breakdown</h2>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Salary Income
              </label>
              <input
                type="number"
                value={incomeBreakdown.salary}
                onChange={(e) =>
                  setIncomeBreakdown({
                    ...incomeBreakdown,
                    salary: parseFloat(e.target.value) || 0,
                  })
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="0.00"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Freelance Income
              </label>
              <input
                type="number"
                value={incomeBreakdown.freelance}
                onChange={(e) =>
                  setIncomeBreakdown({
                    ...incomeBreakdown,
                    freelance: parseFloat(e.target.value) || 0,
                  })
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="0.00"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Business Income
              </label>
              <input
                type="number"
                value={incomeBreakdown.business}
                onChange={(e) =>
                  setIncomeBreakdown({
                    ...incomeBreakdown,
                    business: parseFloat(e.target.value) || 0,
                  })
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="0.00"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Investment Income
              </label>
              <input
                type="number"
                value={incomeBreakdown.investment}
                onChange={(e) =>
                  setIncomeBreakdown({
                    ...incomeBreakdown,
                    investment: parseFloat(e.target.value) || 0,
                  })
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="0.00"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Other Income
              </label>
              <input
                type="number"
                value={incomeBreakdown.other}
                onChange={(e) =>
                  setIncomeBreakdown({
                    ...incomeBreakdown,
                    other: parseFloat(e.target.value) || 0,
                  })
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="0.00"
              />
            </div>

            <div className="pt-4 border-t border-gray-200">
              <div className="flex justify-between items-center">
                <span className="text-lg font-semibold">Total Income:</span>
                <span className="text-lg font-bold text-blue-600">
                  {formatNaira(totalIncome)}
                </span>
              </div>
            </div>

            <button
              onClick={handleCalculate}
              disabled={loading || totalIncome === 0}
              className="w-full mt-6 bg-blue-600 text-white py-3 px-4 rounded-md hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed font-medium"
            >
              {loading ? "Calculating..." : "Calculate Tax"}
            </button>
          </div>
        </div>

        {/* Tax Results */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold mb-6">Tax Calculation</h2>

          {taxResult ? (
            <div className="space-y-4">
              {/* Tax Badge */}
              <TaxBadge
                badge={taxResult.taxBadge}
                isTaxable={taxResult.isTaxable}
                exemptionReason={taxResult.taxExemptionReason}
              />

              {taxResult.isTaxable && (
                <>
                  <div className="flex justify-between">
                    <span>Gross Income:</span>
                    <span className="font-medium">
                      {formatNaira(taxResult.grossIncome)}
                    </span>
                  </div>

                  <div className="flex justify-between">
                    <span>Taxable Income:</span>
                    <span className="font-medium">
                      {formatNaira(taxResult.taxableIncome)}
                    </span>
                  </div>

                  <div className="flex justify-between">
                    <span>Consolidated Relief Allowance:</span>
                    <span className="font-medium text-green-600">
                      -{formatNaira(taxResult.consolidatedReliefAllowance)}
                    </span>
                  </div>

                  <div className="pt-4 border-t border-gray-200">
                    <div className="flex justify-between items-center">
                      <span className="text-lg font-semibold">
                        Estimated Tax:
                      </span>
                      <span className="text-lg font-bold text-red-600">
                        {formatNaira(taxResult.estimatedTax)}
                      </span>
                    </div>
                  </div>

                  <div className="flex justify-between">
                    <span>Effective Tax Rate:</span>
                    <span className="font-medium">
                      {taxResult.effectiveRate.toFixed(2)}%
                    </span>
                  </div>

                  <div className="mt-6 p-4 bg-blue-50 rounded-lg">
                    <h3 className="font-semibold mb-2">Tax Breakdown</h3>
                    {taxResult.taxCalculationDetails?.map(
                      (bracket: any, index: number) => (
                        <div
                          key={index}
                          className="flex justify-between text-sm"
                        >
                          <span>{bracket.bracket}</span>
                          <span>{formatNaira(bracket.tax)}</span>
                        </div>
                      ),
                    )}
                  </div>
                </>
              )}
            </div>
          ) : (
            <div className="text-gray-500 text-center py-8">
              Enter your income details and click "Calculate Tax" to see your
              tax estimate
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
