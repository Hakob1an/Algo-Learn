/**
 * Backend API URL
 */
const BASE_URL = "https://localhost:7045";

/**
 * This part is responsible for:
 * 1. checking if user is logged in, if not it redirects to login,
 * 2. fetching and displaying existing user data,
 * 3. populating the fields with existing datam except for password,
 * 4. handling "save changes",
 * 5. grabing the data and sending it to backend.
 */
document.addEventListener("DOMContentLoaded", async () => {
  const userEmail = localStorage.getItem("userEmail");
  if (!userEmail) {
    window.location.href = "login.html";
    return;
  }

  try {
    const response = await fetch(`${BASE_URL}/api/profile/${encodeURIComponent(userEmail)}`);
    if (!response.ok) {
      throw new Error("Could not fetch user data.");
    }
    const userData = await response.json();
    
    document.getElementById("name").value = userData.username || "";
    document.getElementById("email").value = userData.email || "";
  } catch (error) {
    console.error("Error fetching user data:", error);
  }

  const form = document.querySelector(".settings-form");
  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    const updatedName = document.getElementById("name").value.trim();
    const updatedEmail = document.getElementById("email").value.trim();
    const updatedPassword = document.getElementById("password").value.trim();

    const updatePayload = {
      username: updatedName,
      email: updatedEmail
    };

    if (updatedPassword) {
      updatePayload.password = updatedPassword;
    }

    try {
      const updateResponse = await fetch(`${BASE_URL}/api/profile/${encodeURIComponent(userEmail)}`, {
        method: "PUT", 
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(updatePayload)
      });

      if (!updateResponse.ok) {
        const err = await updateResponse.json();
        throw new Error(err.message || "Failed to update settings.");
      }

      if (updatedEmail && updatedEmail !== userEmail) {
        localStorage.setItem("userEmail", updatedEmail);
      }

      alert("Account settings updated successfully!");
    } catch (error) {
      console.error("Update error:", error);
      alert(error.message || "Something went wrong updating your settings.");
    }
  });


  const logoutLink = document.getElementById("logout");
  if (logoutLink) {
    logoutLink.addEventListener("click", (e) => {
      e.preventDefault();
      localStorage.removeItem("userEmail");
      window.location.href = "login.html";
    });
  }
});
