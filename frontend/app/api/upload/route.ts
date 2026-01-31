import { NextRequest, NextResponse } from "next/server";
import * as pdfjsLib from "pdfjs-dist/legacy/build/pdf.mjs";
import { TextItem } from "pdfjs-dist/types/src/display/api";
import { createServerClient } from "@/lib/database/server";
import { createStatement, getUserById, createUser } from "@/lib/database/utils";

// Set worker source
// pdfjsLib.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.legacy.min.js`;

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get("statement") as File;
    const userId = formData.get("userId") as string;

    // Validate
    if (!file || file.type !== "application/pdf") {
      return NextResponse.json(
        { error: "Invalid file type. Please upload a PDF file." },
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
      console.error("Error checking user:", userCheckError);
      return NextResponse.json(
        { error: "Failed to verify user" },
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

    // Convert file to buffer
    const buffer = await file.arrayBuffer();
    const uint8Array = new Uint8Array(buffer);

    // Load PDF document
    const loadingTask = pdfjsLib.getDocument({ data: uint8Array });
    const pdf = await loadingTask.promise;

    // Extract text from all pages
    let fullText = "";
    const numPages = pdf.numPages;

    for (let pageNum = 1; pageNum <= numPages; pageNum++) {
      const page = await pdf.getPage(pageNum);
      const textContent = await page.getTextContent();

      // Extract text items
      const pageText = textContent.items
        .filter((item: any): item is TextItem => "str" in item)
        .map((item: any) => item.str)
        .join(" ");

      fullText += pageText + "\n";
    }

    // Create statement record in database
    const statementData = {
      user_id: userId,
      filename: file.name,
      file_size: file.size,
      num_pages: numPages,
      raw_text: fullText,
      extraction_method: "hybrid",
      processing_status: "completed" as const,
    };

    const { data: statement, error: statementError } =
      await createStatement(statementData);

    if (statementError) {
      console.error("Error creating statement record:", statementError);
      return NextResponse.json(
        { error: "Failed to save statement metadata" },
        { status: 500 },
      );
    }

    return NextResponse.json({
      text: fullText,
      numPages,
      statementId: statement?.id,
      info: {},
      metadata: {},
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
