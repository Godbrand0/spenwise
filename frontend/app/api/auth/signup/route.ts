import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@/lib/database/server";
import { Resend } from "resend";
import { EmailTemplate } from "@/components/email-template";
import { generateSecureOTP } from "@/lib/otp";
import { render } from "@react-email/render";

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

    // Initialize Resend with API key (done at runtime, not build time)
    console.log("Initializing Resend...");
    console.log("RESEND_API_KEY exists:", !!process.env.RESEND_API_KEY);
    console.log(
      "RESEND_API_KEY format:",
      process.env.RESEND_API_KEY
        ? process.env.RESEND_API_KEY.substring(0, 10) + "..."
        : "undefined",
    );
    const resend = new Resend(process.env.RESEND_API_KEY);
    console.log("Resend initialized");

    // Send OTP via Resend with custom template
    console.log("Sending email via Resend...");

    // Render the React component to HTML
    const emailHtml = await render(
      EmailTemplate({
        otp,
        firstName: firstName || email.split("@")[0],
      }),
    );

    console.log("Email template rendered successfully");

    // Log email details for debugging
    console.log("Email details:", {
      from: "Spenwise <onboarding@resend.dev>",
      to: [email],
      subject: "Verify Your Email - Spenwise",
      isTestEmail: email === "thompsoneregha005@gmail.com",
    });

    const { data: emailData, error: emailError } = await resend.emails.send({
      from: "Spenwise <onboarding@resend.dev>",
      to: [email],
      subject: "Verify Your Email - Spenwise",
      html: emailHtml,
    });

    if (emailError) {
      console.error("Resend error:", emailError);
      console.error("Full error details:", JSON.stringify(emailError, null, 2));
      console.error("Attempted to send to:", email);
      console.error(
        "Is this the test email?",
        email === "thompsoneregha005@gmail.com",
      );
      return NextResponse.json(
        {
          error: "Failed to send verification email. Please try again.",
          details: emailError.message,
        },
        { status: 500 },
      );
    }
    console.log("Email sent successfully:", emailData);
    console.log("Email ID:", emailData?.id);

    // User creation is now handled during verification
    // This avoids conflicts and ensures the user is only created after email verification
    console.log("Signup process completed successfully - OTP sent");
    return NextResponse.json(
      {
        success: true,
        message: "Verification code sent. Please check your email.",
        emailId: emailData?.id,
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
