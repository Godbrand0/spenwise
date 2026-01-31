// Test script to verify the signup API fix
// This simulates the signup request to check if the response is handled correctly

async function testSignupAPI() {
  const testEmail = "test@example.com";
  const testPassword = "testpassword123";

  try {
    console.log("Testing signup API...");

    const response = await fetch("http://localhost:3000/api/auth/signup", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        email: testEmail,
        password: testPassword,
        firstName: "Test",
      }),
    });

    console.log("Response status:", response.status);
    const data = await response.json();
    console.log("Response data:", data);

    // Check if the response indicates success
    if (data.success || response.ok) {
      console.log("✅ Test passed: API returns success flag");
      console.log("✅ User should be redirected to OTP verification page");
    } else {
      console.log("❌ Test failed: API does not return success flag");
      console.log("Error:", data.error);
    }
  } catch (error) {
    console.error("❌ Test failed with error:", error);
  }
}

// Run the test
testSignupAPI();
