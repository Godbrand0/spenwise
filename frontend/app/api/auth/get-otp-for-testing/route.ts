import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@/lib/database/server";

// This endpoint is for testing purposes only
// It retrieves the latest OTP for a given email from the database
export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json();

    if (!email) {
      return NextResponse.json(
        { error: "Email is required" },
        { status: 400 },
      );
    }

    // Create a Supabase client for server-side usage
    const supabase = await createServerClient();

    // Retrieve the latest OTP from database
    const { data: otpRecord, error: fetchError } = await supabase
      .from("email_otps")
      .select("otp_code, created_at, expires_at")
      .eq("email", email)
      .order("created_at", { ascending: false })
      .limit(1)
      .single();

    if (fetchError) {
      console.error("Error fetching OTP:", fetchError);
      return NextResponse.json(
        { error: "Failed to retrieve OTP" },
        { status: 500 },
      );
    }

    if (!otpRecord) {
      return NextResponse.json(
        { error: "No OTP found for this email" },
        { status: 404 },
      );
    }

    return NextResponse.json({
      otp: otpRecord.otp_code,
      created_at: otpRecord.created_at,
      expires_at: otpRecord.expires_at,
    });
  } catch (error) {
    console.error("Get OTP error:", error);
    return NextResponse.json(
      { error: "An unexpected error occurred" },
      { status: 500 },
    );
  }
}