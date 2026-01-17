"use client";

import { useEffect, useState } from "react";
import {
  Calendar,
  DollarSign,
  AlertCircle,
  CheckCircle,
  TrendingUp,
} from "lucide-react";
import { formatNaira, getDaysUntilDue } from "../../lib/tax/calculator";

interface TaxEstimate {
  id: number;
  period_start: string;
  period_end: string;
  period_type: "monthly" | "yearly";
  gross_income: number;
  taxable_income: number;
  estimated_tax: number;
  due_date: string;
  status: "upcoming" | "overdue" | "paid";
  paid_at?: string;
}

export default function TaxOverviewPage() {
  const [estimates, setEstimates] = useState<TaxEstimate[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Mock data for now - in real app, fetch from API
    const mockEstimates: TaxEstimate[] = [
      {
        id: 1,
        period_start: "2026-01-01",
        period_end: "2026-12-31",
        period_type: "yearly",
        gross_income: 5000000,
        taxable_income: 4000000,
        estimated_tax: 430000,
        due_date: "2027-01-31",
        status: "upcoming",
      },
      {
        id: 2,
        period_start: "2025-01-01",
        period_end: "2025-12-31",
        period_type: "yearly",
        gross_income: 4200000,
        taxable_income: 3360000,
        estimated_tax: 352000,
        due_date: "2026-01-31",
        status: "paid",
        paid_at: "2026-01-25",
      },
    ];

    setTimeout(() => {
      setEstimates(mockEstimates);
      setLoading(false);
    }, 1000);
  }, []);

  async function markAsPaid(estimateId: number) {
    // In real app, call API
    setEstimates((prev) =>
      prev.map((est) =>
        est.id === estimateId
          ? {
              ...est,
              status: "paid" as const,
              paid_at: new Date().toISOString(),
            }
          : est
      )
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading tax estimates...</p>
        </div>
      </div>
    );
  }

  const upcoming = estimates.filter((e) => e.status === "upcoming");
  const overdue = estimates.filter((e) => e.status === "overdue");
  const paid = estimates.filter((e) => e.status === "paid");

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Tax Overview
          </h1>
          <p className="text-gray-600">
            Track your estimated tax obligations based on your income
            statements.
          </p>
        </div>

        {/* Warning Banner if overdue */}
        {overdue.length > 0 && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6 flex items-start">
            <AlertCircle className="text-red-500 mr-3 mt-1" size={20} />
            <div>
              <h3 className="font-semibold text-red-900">
                {overdue.length} Overdue Tax Payment
                {overdue.length > 1 ? "s" : ""}
              </h3>
              <p className="text-red-700 text-sm">
                Please review and update your tax status to avoid penalties.
              </p>
            </div>
          </div>
        )}

        {/* Summary Cards */}
        <div className="grid md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-2 bg-blue-100 rounded-lg">
                <TrendingUp className="h-6 w-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">
                  Total Taxable Income
                </p>
                <p className="text-2xl font-bold text-gray-900">
                  {formatNaira(
                    estimates.reduce((sum, e) => sum + e.gross_income, 0)
                  )}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-2 bg-green-100 rounded-lg">
                <DollarSign className="h-6 w-6 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">
                  Total Estimated Tax
                </p>
                <p className="text-2xl font-bold text-gray-900">
                  {formatNaira(
                    estimates.reduce((sum, e) => sum + e.estimated_tax, 0)
                  )}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-2 bg-yellow-100 rounded-lg">
                <Calendar className="h-6 w-6 text-yellow-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">
                  Next Due Date
                </p>
                <p className="text-2xl font-bold text-gray-900">
                  {upcoming.length > 0
                    ? new Date(upcoming[0].due_date).toLocaleDateString()
                    : "None"}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Upcoming Taxes */}
        <section className="mb-8">
          <h2 className="text-xl font-semibold mb-4">
            Upcoming Tax Obligations
          </h2>

          {upcoming.length === 0 ? (
            <div className="bg-white rounded-lg shadow p-8 text-center">
              <p className="text-gray-500">No upcoming tax payments</p>
            </div>
          ) : (
            <div className="grid gap-4">
              {upcoming.map((estimate) => (
                <TaxCard
                  key={estimate.id}
                  estimate={estimate}
                  onMarkPaid={markAsPaid}
                />
              ))}
            </div>
          )}
        </section>

        {/* Overdue Taxes */}
        {overdue.length > 0 && (
          <section className="mb-8">
            <h2 className="text-xl font-semibold mb-4 text-red-900">Overdue</h2>
            <div className="grid gap-4">
              {overdue.map((estimate) => (
                <TaxCard
                  key={estimate.id}
                  estimate={estimate}
                  onMarkPaid={markAsPaid}
                  variant="overdue"
                />
              ))}
            </div>
          </section>
        )}

        {/* Paid History */}
        <section>
          <h2 className="text-xl font-semibold mb-4">Payment History</h2>

          {paid.length === 0 ? (
            <div className="bg-white rounded-lg shadow p-8 text-center">
              <p className="text-gray-500">No payment history yet</p>
            </div>
          ) : (
            <div className="space-y-2">
              {paid.map((estimate) => (
                <div
                  key={estimate.id}
                  className="bg-green-50 border border-green-200 rounded-lg p-4"
                >
                  <div className="flex justify-between items-center">
                    <div>
                      <p className="font-medium">
                        {formatPeriod(
                          estimate.period_start,
                          estimate.period_end
                        )}
                      </p>
                      <p className="text-sm text-gray-600">
                        Paid on{" "}
                        {new Date(estimate.paid_at!).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-lg font-semibold text-green-700">
                        {formatNaira(estimate.estimated_tax)}
                      </p>
                      <CheckCircle
                        className="text-green-500 ml-auto mt-1"
                        size={20}
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* Disclaimer */}
        <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-4">
          <p className="text-sm text-blue-900">
            <strong>Important:</strong> These are estimates based on your bank
            statements. Tax calculations may not account for all deductions,
            exemptions, or special circumstances. Please consult with a
            qualified tax professional for accurate filing.
          </p>
        </div>
      </div>
    </div>
  );
}

function TaxCard({
  estimate,
  onMarkPaid,
  variant = "upcoming",
}: {
  estimate: TaxEstimate;
  onMarkPaid: (id: number) => void;
  variant?: "upcoming" | "overdue";
}) {
  const daysUntilDue = getDaysUntilDue(new Date(estimate.due_date));
  const isUrgent = daysUntilDue <= 7 && variant === "upcoming";
  const borderColor =
    variant === "overdue"
      ? "border-red-300"
      : isUrgent
      ? "border-yellow-300"
      : "border-gray-200";
  const bgColor =
    variant === "overdue"
      ? "bg-red-50"
      : isUrgent
      ? "bg-yellow-50"
      : "bg-white";

  return (
    <div className={`${bgColor} border ${borderColor} rounded-lg p-6`}>
      <div className="flex justify-between items-start mb-4">
        <div>
          <h3 className="text-lg font-semibold">
            {formatPeriod(estimate.period_start, estimate.period_end)} Tax
          </h3>
          <p className="text-sm text-gray-600">
            {estimate.period_type === "yearly" ? "Annual" : "Monthly"} Income
            Tax
          </p>
        </div>

        <div className="text-right">
          <p className="text-2xl font-bold text-blue-600">
            {formatNaira(estimate.estimated_tax)}
          </p>
          <p className="text-xs text-gray-500">Estimated</p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 mb-4">
        <div className="flex items-center text-sm">
          <DollarSign size={16} className="mr-2 text-gray-500" />
          <div>
            <p className="text-gray-600">Gross Income</p>
            <p className="font-medium">{formatNaira(estimate.gross_income)}</p>
          </div>
        </div>

        <div className="flex items-center text-sm">
          <Calendar size={16} className="mr-2 text-gray-500" />
          <div>
            <p className="text-gray-600">Due Date</p>
            <p className="font-medium">
              {new Date(estimate.due_date).toLocaleDateString()}
            </p>
            {variant === "upcoming" && (
              <p
                className={`text-xs ${
                  isUrgent ? "text-yellow-700" : "text-gray-500"
                }`}
              >
                {daysUntilDue} days remaining
              </p>
            )}
          </div>
        </div>
      </div>

      <div className="flex gap-2">
        <button
          onClick={() => onMarkPaid(estimate.id)}
          className="flex-1 bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition"
        >
          Mark as Paid
        </button>

        <button
          onClick={() => {
            // In real app, navigate to detail page
            console.log("View details for", estimate.id);
          }}
          className="flex-1 bg-gray-100 text-gray-700 px-4 py-2 rounded hover:bg-gray-200 transition"
        >
          View Details
        </button>
      </div>
    </div>
  );
}

function formatPeriod(startDate: string, endDate: string): string {
  const start = new Date(startDate);
  const end = new Date(endDate);

  if (start.getFullYear() === end.getFullYear()) {
    return start.getFullYear().toString();
  }

  return `${start.getFullYear()} - ${end.getFullYear()}`;
}
