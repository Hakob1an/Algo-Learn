// const BASE_URL = "https://localhost:7045"; // Backend API base URL

// // Fetch Last Viewed Item
// async function fetchLastViewedItem(userEmail) {
//   try {
//     const response = await fetch(`${BASE_URL}/api/dashboard/getLastViewedItem/${encodeURIComponent(userEmail)}`);
//     const data = await response.json();

//     if (response.ok) {
//       const lastViewedSection = document.getElementById("last-viewed-section");
//       const lastViewedItemLink = document.getElementById("lastViewedItemLink");

//       if (data.lastViewedItem) {
//         // Define the mapping of topics to their respective URLs
//         const pageMapping = {
//           "BubbleSort": "algorithm_detail.html?topic=bubblesort",
//           "Dijkstra": "algorithm_detail.html?topic=dijkstra",
//           "LinkedList": "datastructures_detail.html?topic=linkedlist",
//           "BinaryTree": "datastructures_detail.html?topic=binarytree"
//         };

//         const targetPage = pageMapping[data.lastViewedItem] || "learn.html"; // Default fallback

//         lastViewedItemLink.textContent = data.lastViewedItem;
//         lastViewedItemLink.href = targetPage; // Set link dynamically
//         lastViewedSection.style.display = "block"; // Show section
//       } else {
//         lastViewedItemLink.textContent = "No previous progress found.";
//         lastViewedItemLink.href = "#"; // No action if nothing is found
//       }
//     } else {
//       console.error("Failed to fetch last viewed item:", data.message);
//     }
//   } catch (error) {
//     console.error("Error fetching last viewed item:", error);
//   }
// }

// // Load last viewed item when page loads
// window.addEventListener("DOMContentLoaded", () => {
//   const userEmail = localStorage.getItem("userEmail");
//   if (userEmail) {
//     fetchLastViewedItem(userEmail);
//   }
// });

