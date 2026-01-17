export interface Transaction {
  date: string;
  description: string;
  amount: number;
  type: "debit" | "credit";
  is_income: boolean;
}

export function extractWithRegex(pdfText: string): {
  transactions: Transaction[];
  confidence: number;
} {
  // GTBank format: "15/01/2024  Transfer  5,000.00 DR"
  const gtbankPattern =
    /(\d{2}\/\d{2}\/\d{4})\s+(.+?)\s+([\d,]+\.\d{2})\s+(DR|CR)/g;

  // Access Bank format: "15 Jan 2024 Transfer to John Doe 5,000.00 Dr"
  const accessPattern =
    /(\d{2}\s+\w{3}\s+\d{4})\s+(.+?)\s+([\d,]+\.\d{2})\s+(Dr|Cr)/g;

  // UBA format: "2024-01-15 TRANSFER 5000.00 D"
  const ubaPattern = /(\d{4}-\d{2}-\d{2})\s+(.+?)\s+([\d,]+\.\d{2})\s+(D|C)/g;

  const transactions: Transaction[] = [];
  let match;
  let confidence = 0;

  // Try GTBank pattern first
  while ((match = gtbankPattern.exec(pdfText)) !== null) {
    const description = match[2].trim().toLowerCase();
    const isCredit = match[4] === "CR";

    // Simple income detection heuristics
    const incomeKeywords = [
      "salary",
      "payment received",
      "freelance",
      "consulting fee",
      "wages",
    ];
    const is_income =
      isCredit && incomeKeywords.some((kw) => description.includes(kw));

    transactions.push({
      date: convertDate(match[1]), // Convert to YYYY-MM-DD
      description: match[2].trim(),
      amount: parseFloat(match[3].replace(/,/g, "")),
      type: isCredit ? "credit" : "debit",
      is_income,
    });
  }

  // If no GTBank transactions found, try Access Bank pattern
  if (transactions.length === 0) {
    while ((match = accessPattern.exec(pdfText)) !== null) {
      const description = match[2].trim().toLowerCase();
      const isCredit = match[4] === "Cr";

      const incomeKeywords = [
        "salary",
        "payment received",
        "freelance",
        "consulting fee",
        "wages",
      ];
      const is_income =
        isCredit && incomeKeywords.some((kw) => description.includes(kw));

      transactions.push({
        date: convertAccessDate(match[1]),
        description: match[2].trim(),
        amount: parseFloat(match[3].replace(/,/g, "")),
        type: isCredit ? "credit" : "debit",
        is_income,
      });
    }
  }

  // If still no transactions, try UBA pattern
  if (transactions.length === 0) {
    while ((match = ubaPattern.exec(pdfText)) !== null) {
      const description = match[2].trim().toLowerCase();
      const isCredit = match[4] === "C";

      const incomeKeywords = [
        "salary",
        "payment received",
        "freelance",
        "consulting fee",
        "wages",
      ];
      const is_income =
        isCredit && incomeKeywords.some((kw) => description.includes(kw));

      transactions.push({
        date: match[1], // Already in YYYY-MM-DD format
        description: match[2].trim(),
        amount: parseFloat(match[3].replace(/,/g, "")),
        type: isCredit ? "credit" : "debit",
        is_income,
      });
    }
  }

  // Confidence based on transaction count
  if (transactions.length > 10) confidence = 0.9;
  else if (transactions.length > 5) confidence = 0.7;
  else if (transactions.length > 0) confidence = 0.5;
  else confidence = 0;

  return { transactions, confidence };
}

function convertDate(dateStr: string): string {
  // Convert DD/MM/YYYY to YYYY-MM-DD
  const parts = dateStr.split("/");
  if (parts.length === 3) {
    const [day, month, year] = parts;
    return `${year}-${month.padStart(2, "0")}-${day.padStart(2, "0")}`;
  }
  return dateStr;
}

function convertAccessDate(dateStr: string): string {
  // Convert "DD Mon YYYY" to YYYY-MM-DD
  const months: { [key: string]: string } = {
    Jan: "01",
    Feb: "02",
    Mar: "03",
    Apr: "04",
    May: "05",
    Jun: "06",
    Jul: "07",
    Aug: "08",
    Sep: "09",
    Oct: "10",
    Nov: "11",
    Dec: "12",
  };

  const parts = dateStr.split(" ");
  if (parts.length === 3) {
    const [day, month, year] = parts;
    return `${year}-${months[month]}-${day.padStart(2, "0")}`;
  }
  return dateStr;
}
