const BASE_URL = "https://localhost:7045"; // Replace with your actual API base URL

document.addEventListener("DOMContentLoaded", () => {
    const algorithmName = "InsertionSort";
    const completeButton = document.getElementById("markCompleted");
    const completedText = document.getElementById("completed-text");
    const startButton = document.getElementById("startSortingButton");
    const userEmail = localStorage.getItem("userEmail"); // Get user email from localStorage

    if (!userEmail) {
        console.warn("⚠️ User email is missing.");
        return;
    }

    checkCompletionStatus(userEmail, algorithmName, completeButton, completedText);

    if (completeButton) {
        completeButton.addEventListener("click", function () {
            markAsCompleted(userEmail, algorithmName, completeButton, completedText);
        });
    }

    if (startButton) {
        startButton.addEventListener("click", startInsertionSortVisualization);
    } else {
        console.warn("⚠️ 'startSortingButton' not found in the document.");
    }
});

// ✅ Function to Check If the Algorithm is Already Completed
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

// ✅ Function to Mark Algorithm as Completed
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

// ✅ Insertion Sort Visualization
async function startInsertionSortVisualization() {
    let input = document.getElementById("numbers").value;
    let array = input.split(",").map(num => parseInt(num.trim())).filter(num => !isNaN(num));

    if (array.length > 0) {
        console.log("🔹 Starting Insertion Sort with array:", array);
        visualizeInsertionSort(array);
    } else {
        alert("Please enter valid numbers.");
    }
}

// ✅ Visualization Function
async function visualizeInsertionSort(array) {
    console.log("🎥 Insertion Sort visualization started.");
    const container = document.getElementById("visualization");
    container.innerHTML = ""; // Clear previous visualization

    let bars = array.map((value) => {
        const bar = document.createElement("div");
        bar.classList.add("bar");
        bar.style.height = `${value * 5}px`; // Scale height
        bar.style.width = "40px";
        bar.style.margin = "3px";
        bar.style.backgroundColor = "#007BFF"; // Default blue color
        bar.style.transition = "height 0.5s, background-color 0.3s ease-in-out";
        bar.style.display = "flex";
        bar.style.alignItems = "flex-end"; // Align text at the bottom
        bar.style.justifyContent = "center";
        bar.style.color = "black";
        bar.style.fontSize = "14px";
        bar.style.fontWeight = "bold";
        bar.setAttribute("data-value", value);
        bar.textContent = value;
        container.appendChild(bar);
        return bar;
    });

    await insertionSort(bars);

    bars.forEach(bar => (bar.style.backgroundColor = "#28a745")); // Set all bars to green after sorting
}

// ✅ Insertion Sort Algorithm (with Debugging)
async function insertionSort(bars) {
    for (let i = 1; i < bars.length; i++) {
        let key = parseInt(bars[i].getAttribute("data-value"));
        console.log(`🎯 Inserting value: ${key} at index ${i}`);
        bars[i].classList.add("active"); // Highlight active element (gold)

        let j = i - 1;

        while (j >= 0 && parseInt(bars[j].getAttribute("data-value")) > key) {
            console.log(`🔄 Comparing: ${bars[j].getAttribute("data-value")} with ${key}`);
            bars[j].classList.add("comparing"); // Highlight compared elements (red)
            await delay(500); // Delay for visualization

            // Swap elements
            bars[j + 1].style.height = bars[j].style.height;
            bars[j + 1].setAttribute("data-value", bars[j].getAttribute("data-value"));
            bars[j + 1].textContent = bars[j].textContent;

            bars[j].classList.remove("comparing"); // Remove red highlight
            j--;
        }

        // Insert key into correct position
        bars[j + 1].style.height = `${key * 5}px`;
        bars[j + 1].setAttribute("data-value", key);
        bars[j + 1].textContent = key;
        console.log(`✅ Inserted ${key} at index ${j + 1}`);

        bars[i].classList.remove("active"); // Remove gold highlight
        await delay(1000);
    }

    console.log("✅ Sorting completed.");
}

// ✅ Delay Function (For Animation)
function delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}
