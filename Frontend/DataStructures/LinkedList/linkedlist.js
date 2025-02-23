console.log("📌 Linked List visualization script loaded.");

const BASE_URL = "https://localhost:7045"; // Replace with your actual API base URL

// ✅ Define LinkedList Class
class LinkedList {
    constructor() {
        this.head = null;
    }

    insert(val) {
        let node = new Node(val);
        if (this.head === null) {
            this.head = node;
        } else {
            let ptr = this.head;
            while (ptr.next !== null) {
                ptr = ptr.next;
            }
            ptr.next = node;
        }
        displayNodes();
    }

    delete(val) {
        val = Number.parseInt(val);
        if (this.head === null) {
            popup(false, "Can't delete from an empty linked list.");
            return;
        }

        let ptr = this.head;
        let prev = null;

        while (ptr !== null) {
            if (ptr.data === val) {
                if (prev === null) {
                    this.head = ptr.next;
                } else {
                    prev.next = ptr.next;
                }
                displayNodes();
                return;
            }
            prev = ptr;
            ptr = ptr.next;
        }
        popup(false, "Node not found.");
    }

    async search(n) {
        let current = this.head;
        while (current !== null) {
            let nodeElement = document.getElementById(`node-${current.data}`);
            nodeElement.style.backgroundColor = "yellow";
            await sleep(500);

            if (current.data === Number.parseInt(n)) {
                nodeElement.style.backgroundColor = "lightgreen";
                return;
            } else {
                nodeElement.style.backgroundColor = "";
            }
            current = current.next;
        }
        popup(false, "Node not found in the list!");
    }
}

// ✅ Node Structure
class Node {
    constructor(data) {
        this.data = data;
        this.next = null;
    }
}

// ✅ Initialize Linked List
let linkedList = new LinkedList();

function displayNodes() {
    const parent = document.getElementById("visualization");
    parent.innerHTML = ""; // Clear previous visualization

    let current = linkedList.head;
    while (current !== null) {
        // 1️⃣ Create the node
        const nodeDiv = document.createElement("div");
        nodeDiv.classList.add("linkedlist-node");
        nodeDiv.id = `node-${current.data}`;
        
        // 2️⃣ Fill the node (data, etc.)
        const dataBox = document.createElement("div");
        dataBox.classList.add("data-box");
        dataBox.textContent = current.data;
        nodeDiv.appendChild(dataBox);

        // 3️⃣ Append node to the visualization container
        parent.appendChild(nodeDiv);

        // 4️⃣ If there's a next node, create & insert the arrow *after* the node
        if (current.next !== null) {
            const arrowContainer = document.createElement("div");
            arrowContainer.classList.add("arrow-container");
            
            const arrowStem = document.createElement("div");
            arrowStem.classList.add("arrow-stem");
            
            arrowContainer.appendChild(arrowStem);
            parent.appendChild(arrowContainer);
        }
        // 5️⃣ If there is no "next," you can optionally show a / or NULL pointer
        else {
            const nullPointer = document.createElement("div");
            nullPointer.classList.add("null-pointer");
            nullPointer.textContent = "/";
            parent.appendChild(nullPointer);
        }

        current = current.next;
    }
}


// ✅ Start Insertion
function startLinkedListInsertion() {
    let val = document.getElementById("insertInput").value;
    if (val !== "" && !isNaN(val)) {
        linkedList.insert(Number.parseInt(val));
    } else {
        popup(false, "Please enter a valid number.");
    }
    document.getElementById("insertInput").value = "";
}

// ✅ Start Deletion
function startLinkedListDeletion() {
    let val = document.getElementById("deleteInput").value;
    if (val !== "" && !isNaN(val)) {
        linkedList.delete(Number.parseInt(val));
    } else {
        popup(false, "Please enter a valid number.");
    }
    document.getElementById("deleteInput").value = "";
}

// ✅ Start Search
function startLinkedListSearch() {
    let val = document.getElementById("searchInput").value;
    if (val !== "" && !isNaN(val)) {
        linkedList.search(Number.parseInt(val));
    } else {
        popup(false, "Please enter a valid number.");
    }
    document.getElementById("searchInput").value = "";
}

// ✅ Helper Function: Delay Execution for Animation
function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

// ✅ Load and visualize Linked List dynamically
function loadLinkedListVisualization() {
    console.log("📌 Linked List visualization script loaded.");

    const container = document.getElementById("visualization");
    if (!container) {
        console.error("❌ ERROR: 'visualization' container not found.");
        return;
    }

    container.innerHTML = "";
    console.log("🧹 Cleared visualization container.");
    
    displayNodes();
}

// ✅ Alert Popup
function popup(success, message) {
    alert(message);
}

// ✅ Run UI setup immediately
document.addEventListener("DOMContentLoaded", () => {
    document.getElementById("btnInsert").addEventListener("click", startLinkedListInsertion);
    document.getElementById("btnDelete").addEventListener("click", startLinkedListDeletion);
    document.getElementById("btnSearch").addEventListener("click", startLinkedListSearch);
    loadLinkedListVisualization();
    checkAndSetupCompletionFeature();
});

// ✅ Completion Feature (Mark as Completed)
async function checkAndSetupCompletionFeature() {
    const completeButton = document.getElementById("markCompleted");
    const completedText = document.getElementById("completed-text");
    const userEmail = localStorage.getItem("userEmail");

    if (!userEmail) {
        console.error("No user email found in localStorage.");
        completeButton.style.display = "none"; // Hide the button if the user is not logged in
        return;
    }

    const dataStructureName = "LinkedList"; // Ensure consistent naming
    checkCompletionStatus(userEmail, dataStructureName, completeButton, completedText);

    // Attach event listener for marking as completed
    completeButton.addEventListener("click", function () {
        markAsCompleted(userEmail, dataStructureName, completeButton, completedText);
    });
}

// ✅ Check if the data structure is already completed
async function checkCompletionStatus(userEmail, dataStructureName, completeButton, completedText) {
    try {
        const response = await fetch(`${BASE_URL}/api/dashboard/completed/${userEmail}`);

        if (!response.ok) {
            console.warn("No completed topics found for user:", userEmail);
            return;
        }

        const completedTopics = await response.json();

        if (completedTopics.includes(dataStructureName)) {
            console.log(`✅ ${dataStructureName} is already marked as completed.`);
            completeButton.style.display = "none";
            completedText.style.display = "block";
        }
    } catch (error) {
        console.error("Error checking completion status:", error);
    }
}

// ✅ Mark a data structure as completed
async function markAsCompleted(userEmail, dataStructureName, completeButton, completedText) {
    console.log("➡️ Sending completion request for:", dataStructureName);

    try {
        const response = await fetch(`${BASE_URL}/api/dashboard/complete`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                Email: userEmail,
                TopicName: dataStructureName
            })
        });

        const result = await response.json();
        console.log("⬅️ API Response:", result);

        if (response.ok) {
            console.log("✅ Data structure marked as completed!");
            completeButton.style.display = "none";
            completedText.style.display = "block";
        } else {
            console.error("❌ API Error:", result.message);
        }
    } catch (error) {
        console.error("❌ Error marking completion:", error);
    }
}
