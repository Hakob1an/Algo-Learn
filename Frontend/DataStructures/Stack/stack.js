const BASE_URL = "https://localhost:7045"; // Replace with your actual API base URL

document.addEventListener("DOMContentLoaded", () => {
    const algorithmName = "Stack";
    const completeButton = document.getElementById("markCompleted");
    const completedText = document.getElementById("completed-text");
    const pushButton = document.getElementById("pushButton");
    const popButton = document.getElementById("popButton");
    const stackInput = document.getElementById("stackInput");
    const stackVisualization = document.getElementById("stackVisualization");
    const userEmail = localStorage.getItem("userEmail");

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

    if (pushButton) {
        pushButton.addEventListener("click", pushToStack);
    }

    if (popButton) {
        popButton.addEventListener("click", popFromStack);
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

// ✅ Stack Operations
const stack = [];

// ✅ Push Operation (Adds Element to the Stack)
function pushToStack() {
    const value = stackInput.value.trim();
    if (value === "") {
        alert("⚠️ Please enter a value to push.");
        return;
    }

    stack.push(value);
    stackInput.value = ""; // Clear input field
    console.log(`➕ Pushed: ${value}`);

    // Create a new stack item
    const stackItem = document.createElement("div");
    stackItem.classList.add("stack-item");
    stackItem.textContent = value;
    stackVisualization.appendChild(stackItem);
}

// ✅ Pop Operation (Removes the Top Element)
function popFromStack() {
    if (stack.length === 0) {
        alert("⚠️ Stack is empty. Nothing to pop.");
        return;
    }

    const poppedValue = stack.pop();
    console.log(`❌ Popped: ${poppedValue}`);

    const lastElement = stackVisualization.lastElementChild;
    if (lastElement) {
        lastElement.classList.add("pop-animation"); // Add animation
        setTimeout(() => {
            stackVisualization.removeChild(lastElement);
        }, 300); // Delay to match animation
    }
}
