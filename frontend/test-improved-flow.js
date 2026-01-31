// Test script to verify the improved signup and verification flow
// This tests the complete flow from signup to OTP verification

async function testImprovedFlow() {
  const testEmail = "thompsoneregha005@gmail.com"; // Use the verified test email
  const testPassword = "testpassword123";
  const testFirstName = "Test User";

  try {
    console.log("=== Testing Improved Signup Flow ===");

    // Step 1: Test signup (should only send OTP, not create user)
    console.log("\n1. Testing signup API...");
    const signupResponse = await fetch(
      "http://localhost:3000/api/auth/signup",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: testEmail,
          password: testPassword,
          firstName: testFirstName,
        }),
      },
    );

    console.log("Signup response status:", signupResponse.status);
    const signupData = await signupResponse.json();
    console.log("Signup response data:", signupData);

    if (!signupData.success) {
      console.error("❌ Signup failed:", signupData.error);
      return;
    }

    console.log("✅ Signup successful - OTP sent");

    // Extract OTP from the response (in a real scenario, user would get this from email)
    // For testing, we'll need to get the OTP from the database
    console.log("\n2. Getting OTP from database for testing...");

    // We need to make a request to get the OTP from the database
    // This is just for testing - in production, the user would get the OTP from email
    const otpResponse = await fetch(
      "http://localhost:3000/api/auth/get-otp-for-testing",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: testEmail,
        }),
      },
    );

    let otp = "123456"; // Default fallback

    if (otpResponse.ok) {
      const otpData = await otpResponse.json();
      if (otpData.otp) {
        otp = otpData.otp;
        console.log("Retrieved OTP from database:", otp);
      } else {
        console.log(
          "Could not retrieve OTP from database, using default:",
          otp,
        );
      }
    } else {
      console.log("Could not retrieve OTP from database, using default:", otp);
    }

    // Step 2: Test OTP verification (should create user and sign in)
    console.log("\n3. Testing OTP verification...");
    const verifyResponse = await fetch(
      "http://localhost:3000/api/auth/verify-otp",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: testEmail,
          otp: otp,
          password: testPassword,
          firstName: testFirstName,
        }),
      },
    );

    console.log("Verification response status:", verifyResponse.status);
    const verifyData = await verifyResponse.json();
    console.log("Verification response data:", verifyData);

    if (verifyData.success) {
      console.log("✅ Verification successful - User created and signed in");
      console.log("✅ Improved flow test passed");
    } else {
      console.error("❌ Verification failed:", verifyData.error);
    }
  } catch (error) {
    console.error("❌ Test failed with error:", error);
  }
}

// Run the test
testImprovedFlow();
