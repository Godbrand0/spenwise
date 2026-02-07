import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@/lib/database/server";
import { sendOTPEmail } from "@/lib/email/nodemailer";
import { generateSecureOTP } from "@/lib/otp";

export async function POST(request: NextRequest) {
  try {
    console.log("Signup request received");

    let requestBody;
    try {
      requestBody = await request.json();
      console.log("Request body parsed successfully");
    } catch (parseError) {
      console.error("Failed to parse request body:", parseError);
      return NextResponse.json(
        { error: "Invalid JSON in request body" },
        { status: 400 },
      );
    }

    const { email, password, firstName } = requestBody;
    console.log("Request data:", {
      email,
      password: password ? "***" : null,
      firstName,
    });

    // Validate input
    if (!email || !password) {
      console.log("Validation failed: missing email or password");
      return NextResponse.json(
        { error: "Email and password are required" },
        { status: 400 },
      );
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      console.log("Validation failed: invalid email format");
      return NextResponse.json(
        { error: "Invalid email format" },
        { status: 400 },
      );
    }

    // Create a Supabase client for server-side usage
    console.log("Creating Supabase client...");
    const supabase = await createServerClient();
    console.log("Supabase client created successfully");

    // Check if user already exists
    console.log("Checking for existing user...");
    const { data: existingUser, error: existingUserError } = await supabase
      .from("email_otps")
      .select("email, created_at")
      .eq("email", email)
      .gte("created_at", new Date(Date.now() - 60000).toISOString()) // Last minute
      .single();

    console.log("Existing user check result:", {
      existingUser,
      existingUserError,
    });

    if (existingUser) {
      return NextResponse.json(
        {
          error:
            "An OTP was recently sent. Please wait before requesting a new one.",
        },
        { status: 429 },
      );
    }

    // Generate OTP
    console.log("Generating OTP...");
    const otp = generateSecureOTP();
    console.log("OTP generated:", otp);

    // Store OTP in database
    console.log("Storing OTP in database...");
    const { error: otpError } = await supabase.from("email_otps").insert({
      email,
      otp_code: otp,
    });

    if (otpError) {
      console.error("OTP storage error:", otpError);
      return NextResponse.json(
        { error: "Failed to generate verification code" },
        { status: 500 },
      );
    }
    console.log("OTP stored successfully");

    // Send OTP via Nodemailer
    console.log("Sending email via Nodemailer...");
    const { success: emailSuccess, error: emailError, data: emailData } = await sendOTPEmail({
      to: email,
      subject: "Verify Your Email - Spenwise",
      otp,
      firstName: firstName || email.split("@")[0],
    });

    if (!emailSuccess) {
      console.error("Nodemailer error:", emailError);
      return NextResponse.json(
        {
          error: "Failed to send verification email. Please try again.",
          details: emailError instanceof Error ? emailError.message : "Unknown error",
        },
        { status: 500 },
      );
    }
    console.log("Email sent successfully");

    // User creation is now handled during verification
    // This avoids conflicts and ensures the user is only created after email verification
    console.log("Signup process completed successfully - OTP sent");
    return NextResponse.json(
      {
        success: true,
        message: "Verification code sent. Please check your email.",
      },
      { status: 200 },
    );
  } catch (error) {
    console.error("Signup error:", error);
    console.error(
      "Error stack:",
      error instanceof Error ? error.stack : "No stack trace",
    );
    return NextResponse.json(
      {
        error: "An unexpected error occurred during signup",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    );
  }
}
