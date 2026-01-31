import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@/lib/database/server";
import { isValidOTP } from "@/lib/otp";

const MAX_ATTEMPTS = 5;

export async function POST(request: NextRequest) {
  try {
    const { email, otp, password, firstName } = await request.json();

    console.log("Verify OTP request received:", {
      email,
      otp: otp ? "***" : null,
      password: password ? "***" : null,
      firstName,
    });

    // Validate input
    if (!email || !otp) {
      console.log("Validation failed: missing email or otp");
      return NextResponse.json(
        { error: "Email and OTP are required" },
        { status: 400 },
      );
    }

    if (!isValidOTP(otp)) {
      console.log("Validation failed: invalid OTP format");
      return NextResponse.json(
        { error: "Invalid OTP format. Must be 6 digits." },
        { status: 400 },
      );
    }

    // Create a Supabase client for server-side usage
    console.log("Creating Supabase client...");
    const supabase = await createServerClient();
    console.log("Supabase client created successfully");

    // Retrieve the OTP from database
    console.log("Looking up OTP in database...");
    const { data: otpRecord, error: fetchError } = await supabase
      .from("email_otps")
      .select("*")
      .eq("email", email)
      .eq("otp_code", otp)
      .eq("verified", false)
      .gte("expires_at", new Date().toISOString())
      .order("created_at", { ascending: false })
      .limit(1)
      .single();

    console.log("OTP lookup result:", {
      otpRecord: otpRecord
        ? {
            id: otpRecord.id,
            email: otpRecord.email,
            verified: otpRecord.verified,
            expires_at: otpRecord.expires_at,
          }
        : null,
      fetchError,
    });

    if (fetchError || !otpRecord) {
      // Check if too many attempts
      const { data: allAttempts } = await supabase
        .from("email_otps")
        .select("attempts")
        .eq("email", email)
        .order("created_at", { ascending: false })
        .limit(1)
        .single();

      if (allAttempts && allAttempts.attempts >= MAX_ATTEMPTS) {
        return NextResponse.json(
          {
            error:
              "Too many failed attempts. Please request a new verification code.",
          },
          { status: 429 },
        );
      }

      // Increment attempts
      await supabase
        .from("email_otps")
        .update({ attempts: (allAttempts?.attempts || 0) + 1 })
        .eq("email", email)
        .order("created_at", { ascending: false })
        .limit(1);

      return NextResponse.json(
        {
          error:
            "Invalid or expired OTP. Please check your code and try again.",
        },
        { status: 400 },
      );
    }

    // Mark OTP as verified
    const { error: updateError } = await supabase
      .from("email_otps")
      .update({ verified: true })
      .eq("id", otpRecord.id);

    if (updateError) {
      console.error("OTP update error:", updateError);
      return NextResponse.json(
        { error: "Verification failed. Please try again." },
        { status: 500 },
      );
    }

    // Create the user account after successful OTP verification
    console.log("Creating user account after successful OTP verification...");

    if (!password) {
      console.log("Password missing for account creation");
      return NextResponse.json(
        { error: "Password is required to create account" },
        { status: 400 },
      );
    }

    // First try to sign in the user (in case they already exist from previous signup)
    console.log("Attempting to sign in user first...");
    const { data: signInData, error: signInError } =
      await supabase.auth.signInWithPassword({
        email,
        password,
      });

    console.log("Sign-in attempt result:", {
      hasUser: !!signInData.user,
      hasSession: !!signInData.session,
      signInError,
    });

    // If sign in successful, user already exists
    if (signInData.user && signInData.session) {
      console.log("User already exists and signed in successfully");
      return NextResponse.json(
        {
          success: true,
          message: "Email verified and signed in successfully!",
          verified: true,
          user: signInData.user,
          session: signInData.session,
        },
        { status: 200 },
      );
    }

    // If sign in failed, try to create the user
    console.log(
      "User doesn't exist or sign in failed, attempting to create user...",
    );
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: undefined,
        data: {
          firstName: firstName || email.split("@")[0],
          email_verified: true, // Mark as verified since OTP was valid
        },
      },
    });

    console.log("Account creation result:", {
      hasUser: !!authData.user,
      hasSession: !!authData.session,
      authError,
    });

    if (authError) {
      console.error("Error creating user during verification:", authError);
      console.error(
        "Full auth error details:",
        JSON.stringify(authError, null, 2),
      );

      // Check if it's a duplicate user error
      if (
        authError.message.includes("already registered") ||
        authError.message.includes("duplicate")
      ) {
        console.log(
          "User already exists, but sign in failed. This might be a password mismatch.",
        );
        return NextResponse.json(
          {
            success: true,
            message: "Email verified successfully! Please sign in to continue.",
            verified: true,
            requiresSignIn: true,
          },
          { status: 200 },
        );
      }

      return NextResponse.json(
        {
          error: "Failed to create user account",
          details: authError.message,
        },
        { status: 500 },
      );
    }

    // If user was just created, they should have a session
    if (authData.user && authData.session) {
      console.log("User account created and signed in successfully");
      return NextResponse.json(
        {
          success: true,
          message: "Email verified and account created successfully!",
          verified: true,
          user: authData.user,
          session: authData.session,
        },
        { status: 200 },
      );
    }

    // If user was created but no session (email verification required), try to sign in
    if (authData.user && !authData.session) {
      console.log("User created but no session, attempting to sign in...");
      const { data: retrySignInData, error: retrySignInError } =
        await supabase.auth.signInWithPassword({
          email,
          password,
        });

      if (retrySignInError) {
        console.error("Retry sign-in error:", retrySignInError);
        return NextResponse.json(
          {
            success: true,
            message: "Email verified successfully! Please sign in to continue.",
            verified: true,
            requiresSignIn: true,
          },
          { status: 200 },
        );
      }

      return NextResponse.json(
        {
          success: true,
          message: "Email verified and signed in successfully!",
          verified: true,
          user: retrySignInData.user,
          session: retrySignInData.session,
        },
        { status: 200 },
      );
    }

    return NextResponse.json(
      {
        success: true,
        message: "Email verified successfully! You can now sign in.",
        verified: true,
      },
      { status: 200 },
    );
  } catch (error) {
    console.error("Verify OTP error:", error);
    return NextResponse.json(
      { error: "An unexpected error occurred during verification" },
      { status: 500 },
    );
  }
}
