// Test script to verify the email sending issue
// This tests with both the verified email and an unverified email

async function testEmailSending() {
  const testCases = [
    {
      email: "thompsoneregha005@gmail.com", // Verified test email
      description: "Verified test email (should work)",
    },
    {
      email: "test@example.com", // Unverified email
      description: "Unverified email (should fail)",
    },
  ];

  for (const testCase of testCases) {
    console.log(`\n=== Testing with ${testCase.description} ===`);
    console.log(`Email: ${testCase.email}`);

    try {
      const response = await fetch("http://localhost:3000/api/auth/signup", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: testCase.email,
          password: "testpassword123",
          firstName: "Test",
        }),
      });

      console.log("Response status:", response.status);
      const data = await response.json();
      console.log("Response data:", data);

      if (data.success || response.ok) {
        console.log("✅ Test passed: Email sent successfully");
      } else {
        console.log("❌ Test failed: Email sending failed");
        console.log("Error:", data.error);
        console.log("Details:", data.details);
      }
    } catch (error) {
      console.error("❌ Test failed with error:", error);
    }
  }
}

// Run the test
testEmailSending();
