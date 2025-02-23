/**
 * Backend API base URL.
 */
const BASE_URL = "https://localhost:7045"; 

/**
 * Method to display error messages.
 * @param {any} message 
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

/**
 * Method to clear error message.
 */
function clearError() {
  const errorContainer = document.querySelector(".error-container");
  if (errorContainer) {
    errorContainer.style.display = "none";
  }
}

/**
 * A method to display a success message.
 * @param {any} message 
 */
function displaySuccess(message) {
  const successContainer = document.querySelector(".success-container");
  if (successContainer) {
    successContainer.textContent = message;
    successContainer.style.display = "block";
  } else {
    alert(message);
  }
}

/**
 * A method which shows either the login or signup form according to input.
 * @param {string} formType 
 * @returns 
 */
function showForm(formType) {
  const loginForm = document.getElementById("login-form");
  const signupForm = document.getElementById("signup-form");
  const formTitle = document.getElementById("form-title");

  if (!loginForm || !signupForm || !formTitle) {
    console.error("❌ Form elements are missing from the page.");
    return;
  }

  if (formType === "signup") {
    loginForm.style.display = "none";
    signupForm.style.display = "block";
    formTitle.textContent = "Sign Up";
  } else {
    signupForm.style.display = "none";
    loginForm.style.display = "block";
    formTitle.textContent = "Login";
  }
}

/**
 * This part is responisible for:
 * 1. parsing ?form from the URL to decide which form to show,
 * 2. handling toggling between forms via links,
 * 3. handling login/signup form submissions,
 * 4. password validation,
 * 5. logout functionality.
 */
document.addEventListener("DOMContentLoaded", function () {
  const urlParams = new URLSearchParams(window.location.search);
  const formType = urlParams.get("form") || "login"; 
  showForm(formType);
  clearError();

  document.getElementById("to-signup")?.addEventListener("click", (e) => {
    e.preventDefault();
    showForm("signup");
    clearError();
  });

  document.getElementById("to-login")?.addEventListener("click", (e) => {
    e.preventDefault();
    showForm("login");
    clearError();
  });

  const loginForm = document.getElementById("login-form");
  loginForm?.addEventListener("submit", async function (e) {
    e.preventDefault();

    const email = document.getElementById("login-email").value.trim();
    const password = document.getElementById("login-password").value.trim();
    const loginButton = loginForm.querySelector("button");

    if (!email || !password) {
      displayError("Please enter both email and password.");
      return;
    }

    loginButton.disabled = true;
    loginButton.style.pointerEvents = "none";
    loginButton.textContent = "Logging in...";

    try {
      const response = await fetch(`${BASE_URL}/api/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const result = await response.json();
      console.log("🔎 [DEBUG] Server response:", result);

      if (response.ok) {
        localStorage.setItem("userEmail", email);
        displaySuccess(result.message);
        setTimeout(() => {
          window.location.href = "dashboard.html";
        }, 1000);
      } else {
        displayError(result.message || "Invalid credentials.");
      }
    } catch (error) {
      console.error("❌ [ERROR] Login request failed:", error);
      displayError("An error occurred during login. Please try again.");
    } finally {
      loginButton.disabled = false;
      loginButton.style.pointerEvents = "auto";
      loginButton.textContent = "Login";
    }
  });

  const signupForm = document.getElementById("signup-form");
  signupForm?.addEventListener("submit", async function (e) {
    e.preventDefault();

    const username = document.getElementById("signup-username").value.trim();
    const email = document.getElementById("signup-email").value.trim();
    const password = document.getElementById("signup-password").value.trim();
    const confirmPassword = document.getElementById("signup-confirm-password").value.trim();

    if (password !== confirmPassword) {
      displayError("Passwords do not match!");
      return;
    }

    const signupButton = signupForm.querySelector("button");
    signupButton.disabled = true;
    signupButton.textContent = "Signing up...";

    try {
      const response = await fetch(`${BASE_URL}/api/auth/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, email, password }),
      });

      const result = await response.json();

      if (response.ok) {
        displaySuccess(result.message);
        localStorage.setItem("userEmail", email);
        setTimeout(() => {
          window.location.href = "verify.html";
        }, 1000);
      } else {
        displayError(result.message || "Failed to sign up.");
      }
    } catch (error) {
      console.error("❌ [ERROR] Sign-Up request failed:", error);
      displayError("An error occurred during sign-up. Please try again later.");
    } finally {
      signupButton.disabled = false;
      signupButton.textContent = "Sign Up";
    }
  });

  const signupPass = document.getElementById("signup-password");
  const feedback = {
    digit: document.getElementById("digit"),
    upper: document.getElementById("upper"),
    lower: document.getElementById("lower"),
    special: document.getElementById("special"),
    length: document.getElementById("length"),
  };
  const signupBtn = document.getElementById("signup-btn");

  signupPass?.addEventListener("input", function () {
    const password = signupPass.value;

    const hasDigit = /\d/.test(password);
    const hasUpper = /[A-Z]/.test(password);
    const hasLower = /[a-z]/.test(password);
    const hasSpecial = /[!@#$%^&*(),.?":{}|<>]/.test(password);
    const hasLength = password.length >= 8;

    updateFeedback(feedback.digit, hasDigit);
    updateFeedback(feedback.upper, hasUpper);
    updateFeedback(feedback.lower, hasLower);
    updateFeedback(feedback.special, hasSpecial);
    updateFeedback(feedback.length, hasLength);

    if (hasDigit && hasUpper && hasLower && hasSpecial && hasLength) {
      signupBtn.disabled = false;
      signupBtn.classList.add("active");
    } else {
      signupBtn.disabled = true;
      signupBtn.classList.remove("active");
    }
  });

  function updateFeedback(element, isValid) {
    if (element) {
      element.style.color = isValid ? "green" : "red";
    }
  }

  const emailInput = document.getElementById("login-email");
  const passwordInput = document.getElementById("login-password");
  const loginButton = document.querySelector("#login-form button");

  function updateLoginButtonState() {
    loginButton.disabled = !(emailInput.value.trim() && passwordInput.value.trim());
  }

  emailInput?.addEventListener("input", updateLoginButtonState);
  passwordInput?.addEventListener("input", updateLoginButtonState);

  const logoutLink = document.getElementById("logout");
  if (logoutLink) {
    logoutLink.addEventListener("click", function (e) {
      e.preventDefault();
      localStorage.removeItem("userEmail");
      window.location.href = "login.html";
    });
  }
});

