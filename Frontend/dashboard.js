/**
 * Backend API base URL.
 */
const BASE_URL = "https://localhost:7045";

/**
 * This method is responsible for:
 * 1. fetching the dashboard data,
 * 2. showing the right UI for new and old users.
 */
async function loadDashboard() {
  try {
    const userEmail = localStorage.getItem("userEmail");
    if (!userEmail) {
      console.warn("No user email found. Redirecting to login...");
      window.location.href = "login.html";
      return;
    }

    console.log("Fetching dashboard data for email:", userEmail);

    const response = await fetch(`${BASE_URL}/api/dashboard/${encodeURIComponent(userEmail)}`, {
      method: "GET",
      headers: { "Content-Type": "application/json" }
    });

    if (!response.ok) {
      console.error("Failed to fetch dashboard data:", await response.text());
      showNewUserUI("User");
      return;
    }

    const data = await response.json();
    console.log("Dashboard data received:", data);

    if (data.isNewUser || data.progress === 0) {
      showNewUserUI(data.username || "New User");
    } else {
      showReturningUserUI(data);
    }
  } catch (error) {
    console.error("Error loading dashboard:", error);
    showNewUserUI("User");
  }
}

function showNewUserUI(username) {
  document.getElementById("progress-section").style.display = "none";
  document.getElementById("lastViewedItemContainer").style.display = "none";
  document.getElementById("suggestions-section").style.display = "none";

  document.getElementById("welcome-message").textContent = `Welcome, ${username}!`;

  const friendlyMessage = document.getElementById("friendly-message");
  const friendlyTitle = document.getElementById("friendly-title");
  const friendlyText = document.getElementById("friendly-text");

  friendlyTitle.textContent = `Welcome to AlgoLearn, ${username}!`;
  friendlyText.textContent = "It looks like you're just getting started. Explore our learning modules to begin your journey!";
  friendlyMessage.style.display = "block";
}

/**
 * Method for showing UI for old users. It displays: 
 * 1. progress, 
 * 2. suggestions,
 * 3. last viewed item.
 * 
 * @param {Promise<any>} data 
 */
function showReturningUserUI(data) {
  document.getElementById("friendly-message").style.display = "none";

  document.getElementById("welcome-message").textContent =
    `Welcome Back, ${data.username || "User"}!`;

  if (typeof data.progress === "number" && data.progress >= 0) {
    document.getElementById("progress-section").style.display = "block";
    document.getElementById("progress-fill").style.width = `${data.progress}%`;
    document.getElementById("progress-text").textContent = `${data.progress}% Completed`;
  }

  const userEmail = localStorage.getItem("userEmail");
  fetchProblemSuggestions(userEmail);

  const lastViewedItemContainer = document.getElementById("lastViewedItemContainer");
  const lastViewedItemLink = document.getElementById("lastViewedItemLink");

  if (data.lastViewedItem) {
    lastViewedItemContainer.style.display = "block";
    const itemName = data.lastViewedItem;
    const folderName = data.lastViewedCategory; 

    let targetPage = "learn.html"; 
    if (folderName === "Algorithm") {
      targetPage = `Algorithms/${itemName}/${itemName.toLowerCase()}.html`;
    } else if (folderName === "DataStructure") {
      targetPage = `DataStructures/${itemName}/${itemName.toLowerCase()}.html`;
    }

    lastViewedItemLink.textContent = `Continue Learning: ${itemName}`;
    lastViewedItemLink.href = targetPage;
    lastViewedItemLink.style.display = "inline-block";
  } else {
    lastViewedItemContainer.style.display = "none";
  }
}

/**
 * A method to fetch problem suggestions according to users progress.
 * Shows 3 problems.
 * @param {string} userEmail 
 */
async function fetchProblemSuggestions(userEmail) {
  try {
    const response = await fetch(`${BASE_URL}/api/dashboard/suggestions/${encodeURIComponent(userEmail)}`);
    if (!response.ok) {
      throw new Error(`❌ Failed to fetch suggestions: ${response.status}`);
    }

    const suggestions = await response.json();
    console.log("Problem suggestions received:", suggestions);

    const suggestionsContainer = document.getElementById("suggestions-list");
    const suggestionsSection = document.getElementById("suggestions-section");

    if (!suggestionsContainer || !suggestionsSection) {
      console.error("❌ Missing elements in dashboard.html: #suggestions-list or #suggestions-section");
      return;
    }

    suggestionsContainer.innerHTML = "";

    if (Array.isArray(suggestions) && suggestions.length > 0) {
      suggestionsSection.style.display = "block";
      suggestions.forEach(problem => {
        const listItem = document.createElement("li");
        const link = document.createElement("a");
        link.href = problem.problemLink;
        link.textContent = problem.problemName;
        link.target = "_blank";
        listItem.appendChild(link);
        suggestionsContainer.appendChild(listItem);
      });
    } else {
      suggestionsSection.style.display = "none";
      console.warn("No array of suggestions returned:", suggestions);
    }
  } catch (error) {
    console.error("❌ Error fetching problem suggestions:", error);
  }
}


window.addEventListener("DOMContentLoaded", loadDashboard);

const logoutButton = document.getElementById("logout");
if (logoutButton) {
  logoutButton.addEventListener("click", (e) => {
    e.preventDefault();
    localStorage.removeItem("userEmail");
    window.location.href = "home.html";
  });
}

const homeButton = document.getElementById("home");
if (homeButton) {
  homeButton.addEventListener("click", (e) => {
    e.preventDefault();
    window.location.href = "dashboard.html";
  });
}
