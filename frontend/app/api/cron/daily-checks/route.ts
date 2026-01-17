import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  // Verify cron secret
  const authHeader = req.headers.get("authorization");
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return new Response("Unauthorized", { status: 401 });
  }

  try {
    // Run all daily jobs
    await sendDailyTaxReminders();
    await checkOverdueTaxes();

    // End of month: evaluate todos
    const today = new Date();
    if (isLastDayOfMonth(today)) {
      await evaluatePendingTodos();
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Cron job failed:", error);
    return NextResponse.json(
      { error: (error as Error).message },
      { status: 500 }
    );
  }
}

async function sendDailyTaxReminders() {
  console.log("Sending daily tax reminders...");
  // In a real implementation, this would:
  // 1. Query database for taxes due in 30 days and 7 days
  // 2. Send email notifications
  // 3. Log sent reminders
}

async function checkOverdueTaxes() {
  console.log("Checking for overdue taxes...");
  // In a real implementation, this would:
  // 1. Find taxes with due dates in the past
  // 2. Update their status to 'overdue'
  // 3. Send overdue notifications
}

async function evaluatePendingTodos() {
  console.log("Evaluating pending financial todos...");
  // In a real implementation, this would:
  // 1. Find todos due for current period
  // 2. Calculate actual spending vs targets
  // 3. Update todo status to 'completed' or 'failed'
  // 4. Send notifications to users
}

function isLastDayOfMonth(date: Date): boolean {
  return (
    new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate() ===
    date.getDate()
  );
}
