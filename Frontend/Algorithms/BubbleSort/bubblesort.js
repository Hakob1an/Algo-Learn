/**
 * Backend API URL
 */
const BASE_URL = "https://localhost:7045";

/**
 * This event hander checks if algorithm is alredy completed. If not, 
 * it shows the "Mark Completed" button, otehrwise, it shows a text
 * telling user that algorithm is completed.
 */
document.addEventListener("DOMContentLoaded", () => {
    const urlParams = new URLSearchParams(window.location.search);
    const algorithmName = urlParams.get("name") || "BubbleSort"; 

    const completeButton = document.getElementById("markCompleted");
    const completedText = document.getElementById("completed-text");
    const startButton = document.getElementById("startSortingButton");
    const userEmail = localStorage.getItem("userEmail");

    if (!algorithmName || !userEmail) {
        console.warn("⚠️ Algorithm name or user email is missing.");
        return;
    }

    checkCompletionStatus(userEmail, algorithmName, completeButton, completedText);
s
    if (completeButton) {
        completeButton.addEventListener("click", function () {
            markAsCompleted(userEmail, algorithmName, completeButton, completedText);
        });
    } else {
        console.warn("⚠️ 'markCompleted' button not found.");
    }

    if (startButton) {
        startButton.addEventListener("click", startBubbleSortVisualization);
    } else {
        console.warn("⚠️ 'startSortingButton' not found in the document.");
    }
});


/**
 * A method for checking if algorithm is completed.
 * @param {string} userEmail 
 * @param {string} algorithmName 
 * @param {HTMLElement} completeButton 
 * @param {HTMLElement} completedText 
 * @returns 
 */
async function checkCompletionStatus(userEmail, algorithmName, completeButton, completedText) {
    try {
        const response = await fetch(`${BASE_URL}/api/dashboard/completed/${userEmail}`);

        if (!response.ok) {
            console.warn("No completed topics found for user:", userEmail);
            return;
        }

        const completedTopics = await response.json();

        if (completedTopics.includes(algorithmName)) {
            console.log(`✅ ${algorithmName} is already marked as completed.`);
            completeButton.style.display = "none";
            completedText.style.display = "block";
        }
    } catch (error) {
        console.error("Error checking completion status:", error);
    }
}

/**
 * A method to mark the algorithm completed.
 * @param {string} userEmail 
 * @param {string} algorithmName 
 * @param {HTMLElement} completeButton 
 * @param {HTMLElement} completedText
 */
async function markAsCompleted(userEmail, algorithmName, completeButton, completedText) {
    try {
        const response = await fetch(`${BASE_URL}/api/dashboard/complete`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                Email: userEmail,
                TopicName: algorithmName
            })
        });

        const result = await response.json();
        if (response.ok) {
            console.log("✅ Algorithm marked as completed:", result);
            completeButton.style.display = "none";
            completedText.style.display = "block";
        } else {
            console.error("❌ Error marking completion:", result.message);
        }
    } catch (error) {
        console.error("❌ Error marking completion:", error);
    }
}

/**
 * A method for bubble sort visualization.
 * @param {*} array 
 */
async function loadBubbleSortVisualization(array) {
    console.log("Bubble Sort visualization script loaded.");

    const container = document.getElementById("visualization");
    const startButton = document.getElementById("startSortingButton");

    startButton.disabled = true;
    startButton.textContent = "Sorting...";
    startButton.style.backgroundColor = "#6c757d";

    container.innerHTML = "";
    console.log("Visualization container cleared.");

    let bars = array.map((value, index) => {
        const bar = document.createElement("div");
        bar.classList.add("bar");
        bar.style.height = `${value * 5}px`; 
        bar.style.width = "40px";
        bar.style.margin = "3px";
        bar.style.backgroundColor = "#007BFF"; 
        bar.style.transition = "height 0.5s, background-color 0.3s ease-in-out";
        bar.style.display = "flex";
        bar.style.alignItems = "flex-end"; 
        bar.style.justifyContent = "center";
        bar.style.color = "white"; 
        bar.style.fontSize = "14px";
        bar.style.fontWeight = "bold";
        bar.setAttribute("data-value", value);
        bar.textContent = value;
        container.appendChild(bar);
        return bar;
    });

    await bubbleSort(bars);

    startButton.disabled = false;
    startButton.textContent = "Start Sorting";
    startButton.style.backgroundColor = "#007BFF";
}

/**
 * A method for bubble sort animation.
 * @param {*} bars 
 */
async function bubbleSort(bars) {
    let n = bars.length;
    let swapped;

    do {
        swapped = false;
        for (let i = 0; i < n - 1; i++) {
            bars[i].style.backgroundColor = "#FF5733";
            bars[i + 1].style.backgroundColor = "#FF5733";
            await delay(500);

            let value1 = parseInt(bars[i].getAttribute("data-value"));
            let value2 = parseInt(bars[i + 1].getAttribute("data-value"));

            if (value1 > value2) {
                bars[i].style.height = `${value2 * 5}px`;
                bars[i + 1].style.height = `${value1 * 5}px`;
                bars[i].setAttribute("data-value", value2);
                bars[i + 1].setAttribute("data-value", value1);
                swapped = true;
            }

            bars[i].style.backgroundColor = "#007BFF";
            bars[i + 1].style.backgroundColor = "#007BFF";
            await delay(200);
        }
        n--;
    } while (swapped);

    bars.forEach(bar => (bar.style.backgroundColor = "#28a745"));
}

function delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * A method whcih starts the bubble sort visualization.
 */
function startBubbleSortVisualization() {
    let input = document.getElementById("numbers").value;
    let array = input.split(",").map(num => parseInt(num.trim())).filter(num => !isNaN(num));

    if (array.length > 0) {
        loadBubbleSortVisualization(array);
    } else {
        alert("Please enter valid numbers.");
    }
}
