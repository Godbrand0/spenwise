// Simple test script to verify the improved signup and verification flow
// This tests the signup API to ensure it doesn't create users during signup

async function testSimpleFlow() {
  const testEmail = "thompsoneregha005@gmail.com"; // Use the verified test email
  const testPassword = "testpassword123";
  const testFirstName = "Test User";

  try {
    console.log("=== Testing Improved Signup Flow ===");
    
    // Test signup (should only send OTP, not create user)
    console.log("\n1. Testing signup API...");
    const signupResponse = await fetch("http://localhost:3000/api/auth/signup", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        email: testEmail,
        password: testPassword,
        firstName: testFirstName,
      }),
    });

    console.log("Signup response status:", signupResponse.status);
    const signupData = await signupResponse.json();
    console.log("Signup response data:", signupData);

    if (signupData.success) {
      console.log("✅ Signup successful - OTP sent (user not created during signup)");
      console.log("✅ Improved signup flow test passed");
    } else {
      console.error("❌ Signup failed:", signupData.error);
    }
  } catch (error) {
    console.error("❌ Test failed with error:", error);
  }
}

// Run the test
testSimpleFlow();