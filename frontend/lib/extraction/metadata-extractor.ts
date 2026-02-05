/**
 * Extract statement metadata from PDF text
 * Extracts: bank name, dates, account info, balances
 */

export interface StatementMetadata {
  bank_name: string | null;
  statement_period_start: string | null;
  statement_period_end: string | null;
  account_number: string | null;
  account_name: string | null;
  opening_balance: number | null;
  closing_balance: number | null;
}

export function extractStatementMetadata(pdfText: string): StatementMetadata {
  const metadata: StatementMetadata = {
    bank_name: null,
    statement_period_start: null,
    statement_period_end: null,
    account_number: null,
    account_name: null,
    opening_balance: null,
    closing_balance: null,
  };

  // Extract bank name
  const bankPatterns = [
    /(?:GUARANTY TRUST BANK|GTBank|GT BANK)/i,
    /(?:ACCESS BANK|ACCESSBANK)/i,
    /(?:UNITED BANK FOR AFRICA|UBA)/i,
    /(?:FIRST BANK|FIRSTBANK)/i,
    /(?:ZENITH BANK|ZENITHBANK)/i,
    /(?:UNION BANK|UNIONBANK)/i,
    /(?:FIDELITY BANK|FIDELITYBANK)/i,
    /(?:STANBIC IBTC|STANBIC)/i,
    /(?:STERLING BANK|STERLINGBANK)/i,
    /(?:WEMA BANK|WEMABANK)/i,
    /(?:POLARIS BANK|POLARISBANK)/i,
    /(?:ECOBANK|ECO BANK)/i,
  ];

  for (const pattern of bankPatterns) {
    const match = pdfText.match(pattern);
    if (match) {
      metadata.bank_name = match[0].trim();
      break;
    }
  }

  // Extract statement period
  // Common formats: "01 Jan 2024 - 31 Jan 2024", "January 2024", "01/01/2024 to 31/01/2024"
  const periodPatterns = [
    /(?:statement period|period)[\s:]+(\d{1,2}[\s\-\/]\w{3,9}[\s\-\/]\d{4})[\s\-to]+(\d{1,2}[\s\-\/]\w{3,9}[\s\-\/]\d{4})/i,
    /(\d{1,2}\/\d{1,2}\/\d{4})[\s\-to]+(\d{1,2}\/\d{1,2}\/\d{4})/,
    /(\d{1,2}\s+\w{3,9}\s+\d{4})[\s\-to]+(\d{1,2}\s+\w{3,9}\s+\d{4})/i,
  ];

  for (const pattern of periodPatterns) {
    const match = pdfText.match(pattern);
    if (match) {
      try {
        metadata.statement_period_start = parseDate(match[1]);
        metadata.statement_period_end = parseDate(match[2]);
        break;
      } catch (e) {
        console.warn("Failed to parse dates:", match[1], match[2]);
      }
    }
  }

  // If no period found, try to extract month/year
  if (!metadata.statement_period_start) {
    const monthYearMatch = pdfText.match(/(\w{3,9})\s+(\d{4})/i);
    if (monthYearMatch) {
      try {
        const month = monthYearMatch[1];
        const year = monthYearMatch[2];
        const date = new Date(`${month} 1, ${year}`);
        if (!isNaN(date.getTime())) {
          metadata.statement_period_start = formatDate(
            new Date(date.getFullYear(), date.getMonth(), 1)
          );
          metadata.statement_period_end = formatDate(
            new Date(date.getFullYear(), date.getMonth() + 1, 0)
          );
        }
      } catch (e) {
        console.warn("Failed to parse month/year");
      }
    }
  }

  // Extract account number
  const accountPatterns = [
    /(?:account number|acct no|a\/c no)[\s:]+(\d{10,})/i,
    /(?:account|acct)[\s:]+(\d{10,})/i,
  ];

  for (const pattern of accountPatterns) {
    const match = pdfText.match(pattern);
    if (match) {
      metadata.account_number = match[1].trim();
      break;
    }
  }

  // Extract account name
  const namePatterns = [
    /(?:account name|acct name|name)[\s:]+([A-Z\s]{3,50})/i,
  ];

  for (const pattern of namePatterns) {
    const match = pdfText.match(pattern);
    if (match) {
      metadata.account_name = match[1].trim();
      break;
    }
  }

  // Extract opening balance
  const openingPatterns = [
    /(?:opening balance|opening bal|o\/bal)[\s:]+(?:NGN|₦)?\s*([\d,]+\.?\d*)/i,
    /(?:balance b\/f|balance brought forward)[\s:]+(?:NGN|₦)?\s*([\d,]+\.?\d*)/i,
  ];

  for (const pattern of openingPatterns) {
    const match = pdfText.match(pattern);
    if (match) {
      metadata.opening_balance = parseAmount(match[1]);
      break;
    }
  }

  // Extract closing balance
  const closingPatterns = [
    /(?:closing balance|closing bal|c\/bal)[\s:]+(?:NGN|₦)?\s*([\d,]+\.?\d*)/i,
    /(?:balance c\/f|balance carried forward)[\s:]+(?:NGN|₦)?\s*([\d,]+\.?\d*)/i,
  ];

  for (const pattern of closingPatterns) {
    const match = pdfText.match(pattern);
    if (match) {
      metadata.closing_balance = parseAmount(match[1]);
      break;
    }
  }

  return metadata;
}

// Helper function to parse date strings
function parseDate(dateStr: string): string {
  const cleaned = dateStr.trim().replace(/\s+/g, " ");

  // Try different date formats
  const formats = [
    // DD Mon YYYY
    /(\d{1,2})\s+(\w{3,9})\s+(\d{4})/,
    // DD/MM/YYYY
    /(\d{1,2})\/(\d{1,2})\/(\d{4})/,
    // DD-MM-YYYY
    /(\d{1,2})-(\d{1,2})-(\d{4})/,
  ];

  for (const format of formats) {
    const match = cleaned.match(format);
    if (match) {
      if (format.source.includes("\\w")) {
        // Month name format
        const day = match[1].padStart(2, "0");
        const month = parseMonth(match[2]);
        const year = match[3];
        return `${year}-${month}-${day}`;
      } else {
        // Numeric format
        const day = match[1].padStart(2, "0");
        const month = match[2].padStart(2, "0");
        const year = match[3];
        return `${year}-${month}-${day}`;
      }
    }
  }

  throw new Error(`Unable to parse date: ${dateStr}`);
}

// Helper to parse month names
function parseMonth(monthStr: string): string {
  const months: { [key: string]: string } = {
    jan: "01",
    january: "01",
    feb: "02",
    february: "02",
    mar: "03",
    march: "03",
    apr: "04",
    april: "04",
    may: "05",
    jun: "06",
    june: "06",
    jul: "07",
    july: "07",
    aug: "08",
    august: "08",
    sep: "09",
    september: "09",
    oct: "10",
    october: "10",
    nov: "11",
    november: "11",
    dec: "12",
    december: "12",
  };

  const normalized = monthStr.toLowerCase();
  return months[normalized] || "01";
}

// Helper to format date
function formatDate(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

// Helper to parse amount strings
function parseAmount(amountStr: string): number {
  // Remove commas and parse as float
  const cleaned = amountStr.replace(/,/g, "");
  return parseFloat(cleaned);
}
