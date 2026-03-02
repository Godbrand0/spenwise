import { NextRequest, NextResponse } from "next/server";
import { headers } from "next/headers";
import { createServerClient } from "@/lib/database/server";
import { createStatement, getUserById, createUser } from "@/lib/database/utils";

// Set worker source
// pdfjsLib.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.legacy.min.js`;

export async function GET() {
  const envStatus = {
    supabaseUrl: !!process.env.NEXT_PUBLIC_SUPABASE_URL,
    supabaseAnonKey: !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    geminiKey: !!process.env.GEMINI_API_KEY,
    appUrl: !!process.env.NEXT_PUBLIC_APP_URL,
  };

  return NextResponse.json({
    status: "active",
    endpoint: "/api/upload",
    methods: ["POST", "GET"],
    env: envStatus,
    timestamp: new Date().toISOString(),
  });
}

export async function POST(req: NextRequest) {
  const headersList = await headers();
  const origin = headersList.get("origin");
  const host = headersList.get("host");

  console.log(`[API Upload] POST request received from ${origin} to ${host}`);

  try {
    const formData = await req.formData();
    const file = formData.get("statement") as File;
    const userId = formData.get("userId") as string;

    // Validate
    const isPdf = file?.type === "application/pdf";
    const isCsv = file?.type === "text/csv" || 
                  file?.type === "application/vnd.ms-excel" ||
                  file?.name.endsWith(".csv");

    if (!file || (!isPdf && !isCsv)) {
      return NextResponse.json(
        { error: "Invalid file type. Please upload a PDF or CSV file." },
        { status: 400 },
      );
    }

    if (!userId) {
      return NextResponse.json(
        { error: "User ID is required" },
        { status: 400 },
      );
    }

    // Check if user exists in our database, create if not
    const { data: existingUser, error: userCheckError } =
      await getUserById(userId);
    if (userCheckError) {
      console.error("[API Upload] Error checking user:", userCheckError);
      return NextResponse.json(
        { 
          error: "Failed to verify user",
          details: userCheckError instanceof Error ? userCheckError.message : String(userCheckError)
        },
        { status: 500 },
      );
    }

    if (!existingUser) {
      // Get user details from Supabase auth
      const supabase = await createServerClient();
      const { data: authUser } = await supabase.auth.getUser();

      if (!authUser.user || authUser.user.id !== userId) {
        return NextResponse.json({ error: "Invalid user ID" }, { status: 400 });
      }

      // Create user in our database
      const { data: newUser, error: createUserError } = await createUser({
        id: userId,
        email: authUser.user.email || "",
        full_name: authUser.user.user_metadata?.full_name || null,
        avatar_url: authUser.user.user_metadata?.avatar_url || null,
      });

      if (createUserError) {
        console.error("Error creating user:", createUserError);
        return NextResponse.json(
          { error: "Failed to create user profile" },
          { status: 500 },
        );
      }
    }

    if (file.size > 10 * 1024 * 1024) {
      // 10MB
      return NextResponse.json(
        { error: "File too large. Maximum size is 10MB." },
        { status: 400 },
      );
    }

    // Extract text based on file type
    let fullText = "";
    let numPages = 1;

    if (isPdf) {
      // Convert file to buffer
      const buffer = await file.arrayBuffer();
      const uint8Array = new Uint8Array(buffer);

      // Polyfill DOMMatrix for Node.js environments (required by PDF.js v4+)
      if (typeof global.DOMMatrix === "undefined") {
        // @ts-ignore
        global.DOMMatrix = class DOMMatrix {
          constructor() {
            // Minimal mock implementation
          }
        };
      }

      // Use ESM versions of PDF.js
      console.log("[API Upload] Loading PDF.js...");
      const pdfjsLib = await import("pdfjs-dist/legacy/build/pdf.mjs");
      const path = await import("path");
      
      // Set worker source to local filesystem path for Vercel compatibility
      const workerPath = path.join(process.cwd(), "node_modules", "pdfjs-dist", "legacy", "build", "pdf.worker.mjs");
      console.log(`[API Upload] Using worker path: ${workerPath}`);
      // @ts-ignore
      pdfjsLib.GlobalWorkerOptions.workerSrc = workerPath;

      console.log("[API Upload] Initializing PDF loading task...");
      const loadingTask = pdfjsLib.getDocument({ 
        data: uint8Array,
        useSystemFonts: true,
        disableFontFace: true, 
      });
      const pdf = await loadingTask.promise;
      numPages = pdf.numPages;
      console.log(`[API Upload] PDF loaded successfully. Pages: ${numPages}`);

      for (let pageNum = 1; pageNum <= numPages; pageNum++) {
        const page = await pdf.getPage(pageNum);
        const textContent = await page.getTextContent();
        const pageText = textContent.items
          .filter((item: any) => "str" in item)
          .map((item: any) => item.str)
          .join(" ");
        fullText += pageText + "\n";
      }
    } else {
      // Handle CSV
      console.log("[API Upload] Processing CSV file...");
      fullText = await file.text();
      numPages = 1;
    }

    // Extract statement metadata from PDF text
    const { extractStatementMetadata } = await import("@/lib/extraction/metadata-extractor");
    const metadata = extractStatementMetadata(fullText);

    // Create statement record in database with extracted metadata
    const statementData = {
      user_id: userId,
      filename: file.name,
      file_size: file.size,
      num_pages: numPages,
      raw_text: fullText,
      extraction_method: "hybrid" as const,
      processing_status: "completed" as const,
      bank_name: metadata.bank_name || undefined,
      statement_period_start: metadata.statement_period_start || undefined,
      statement_period_end: metadata.statement_period_end || undefined,
      account_number: metadata.account_number || undefined,
      account_name: metadata.account_name || undefined,
      opening_balance: metadata.opening_balance || undefined,
      closing_balance: metadata.closing_balance || undefined,
    };

    console.log("[API Upload] Creating statement record in database...");
    const { data: statement, error: statementError } =
      await createStatement(statementData);

    if (statementError) {
      console.error("[API Upload] Error creating statement record:", statementError);
      return NextResponse.json(
        { 
          error: "Failed to save statement metadata",
          details: statementError.message || "Database insertion failed"
        },
        { status: 500 },
      );
    }
    console.log(`[API Upload] Statement saved successfully. ID: ${statement?.id}`);

    return NextResponse.json({
      text: fullText,
      numPages,
      statementId: statement?.id,
      metadata: {
        bankName: metadata.bank_name,
        periodStart: metadata.statement_period_start,
        periodEnd: metadata.statement_period_end,
        accountNumber: metadata.account_number,
        openingBalance: metadata.opening_balance,
        closingBalance: metadata.closing_balance,
      },
      info: {},
    });
  } catch (error) {
    console.error("Error processing PDF:", error);
    return NextResponse.json(
      {
        error: "Failed to process PDF file",
        details: error instanceof Error ? error.message : String(error),
        stack: error instanceof Error ? error.stack : undefined,
        name: error instanceof Error ? error.name : undefined,
      },
      { status: 500 },
    );
  }
}
