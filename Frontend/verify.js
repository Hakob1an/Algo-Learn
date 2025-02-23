/**
 * Backend API URL
 */
const BASE_URL = "https://localhost:7045";

/**
 * This code is responsible for:
 * 1. checking if elements exist before running any code,
 * 2. loading stored email from localStorage,
 * 3. handling the event for verfication request.
 */
document.addEventListener("DOMContentLoaded", function () {
  const verifyButton = document.getElementById("verify-button");
  const emailInput = document.getElementById("verification-email");
  const codeInput = document.getElementById("verification-code");

  if (!verifyButton) {
    console.error("❌ [ERROR] Verify button not found in the DOM!");
    return;
  }

  if (!emailInput || !codeInput) {
    console.error("❌ [ERROR] Email input or verification code input not found!");
    return;
  }

  const storedEmail = localStorage.getItem("userEmail");
  if (storedEmail) {
    emailInput.value = storedEmail;
  } else {
    console.warn("⚠️ [WARNING] No stored email found. User must enter it manually.");
  }

  verifyButton.addEventListener("click", async function () {
    const email = emailInput.value.trim();
    const code = codeInput.value.trim();

    if (!email || !code) {
      displayError("Please enter your email and verification code.");
      return;
    }

    console.log(`🔎 [DEBUG] Sending verification request:`, { email, code });

    try {
      const response = await fetch(`${BASE_URL}/api/auth/verify-code`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, code }),
      });

      const result = await response.json();
      console.log("🔎 [DEBUG] Server response:", result);

      if (response.ok) {
        displaySuccess("✅ Email verified successfully!");
        setTimeout(() => {
          window.location.href = "login.html";
        }, 2000);
      } else {
        displayError(result.message || "❌ Invalid verification code.");
      }
    } catch (error) {
      console.error("❌ [ERROR] Verification request failed:", error);
      displayError("An error occurred during verification. Please try again later.");
    }
  });
});

/**
 * Method to show error messages.
 * @param {string} message 
 */
function displayError(message) {
  const errorContainer = document.querySelector(".error-container");
  if (errorContainer) {
    errorContainer.textContent = message;
    errorContainer.style.display = "block";
  } else {
    alert(message);
  }
}

function displaySuccess(message) {
  alert(message);
}
