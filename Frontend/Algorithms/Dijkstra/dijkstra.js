const BASE_URL = "https://localhost:7045"; // Replace with your actual API base URL

        document.addEventListener("DOMContentLoaded", () => {
            const completeButton = document.getElementById("markCompleted");
            const completedText = document.getElementById("completed-text");
            const startButton = document.getElementById("startDijkstraButton");
            const userEmail = localStorage.getItem("userEmail"); // Retrieve stored user email

            if (!userEmail) {
                console.warn("User email is missing. Completion tracking disabled.");
            } else {
                checkCompletionStatus(userEmail, "Dijkstra", completeButton, completedText);
            }

            // Event listener for marking the algorithm as completed
            if (completeButton) {
                completeButton.addEventListener("click", function () {
                    markAsCompleted(userEmail, "Dijkstra", completeButton, completedText);
                });
            }

            // Event listener for starting Dijkstra visualization
            if (startButton) {
                startButton.addEventListener("click", startDijkstraVisualization);
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

        // ✅ Function to Start Visualization (Uses Start & End Node Inputs)
        async function startDijkstraVisualization() {
            console.log("Dijkstra visualization started.");

            const startNode = parseInt(document.getElementById("start-node").value);
            const endNode = parseInt(document.getElementById("end-node").value);
            const container = document.getElementById("visualization");

            if (isNaN(startNode) || isNaN(endNode)) {
                alert("Please enter valid start and end nodes.");
                return;
            }

            container.innerHTML = "<p>Generating graph...</p>";

            // Example graph data
            const graphData = {
                nodes: [
                    { id: 0 }, { id: 1 }, { id: 2 }, { id: 3 }, { id: 4 }, 
                    { id: 5 }, { id: 6 }, { id: 7 }, { id: 8 }, { id: 9 }
                ],
                edges: [
                    { source: 0, target: 1, weight: 4 },
                    { source: 0, target: 2, weight: 2 },
                    { source: 1, target: 2, weight: 1 },
                    { source: 1, target: 3, weight: 5 },
                    { source: 2, target: 3, weight: 8 },
                    { source: 2, target: 4, weight: 10 },
                    { source: 3, target: 5, weight: 2 },
                    { source: 4, target: 5, weight: 6 },
                    { source: 4, target: 6, weight: 3 },
                    { source: 5, target: 7, weight: 9 },
                    { source: 6, target: 7, weight: 5 },
                    { source: 6, target: 8, weight: 2 },
                    { source: 7, target: 8, weight: 4 },
                    { source: 7, target: 9, weight: 7 },
                    { source: 8, target: 9, weight: 6 }
                ]
            };

            // Pass startNode and endNode to the visualizeGraph function
            visualizeGraph(graphData, startNode, endNode);
        }

        // Updated signature to accept startNode/endNode
        function visualizeGraph(graph, startNode, endNode) {
            console.log("Visualizing graph...");

            // Clear previous visualization
            d3.select("#visualization").html("");

            const width = 600, height = 500;
            const svg = d3.select("#visualization")
                .append("svg")
                .attr("width", width)
                .attr("height", height);

            const simulation = d3.forceSimulation(graph.nodes)
                .force("link", d3.forceLink(graph.edges).id(d => d.id).distance(100))
                .force("charge", d3.forceManyBody().strength(-300))
                .force("center", d3.forceCenter(width / 2, height / 2));

            // Draw edges
            const link = svg.selectAll("line")
                .data(graph.edges)
                .enter().append("line")
                .attr("stroke", "gray")
                .attr("stroke-width", 2);

            // Draw nodes
            const node = svg.selectAll("circle")
                .data(graph.nodes)
                .enter().append("circle")
                .attr("r", 20)
                .attr("fill", "lightblue")
                .attr("stroke", "black")
                .attr("stroke-width", 2);

            // Node labels
            const text = svg.selectAll("text")
                .data(graph.nodes)
                .enter().append("text")
                .attr("text-anchor", "middle")
                .attr("dy", 5)
                .attr("font-size", "14px")
                .text(d => d.id);

            // Apply forces
            simulation.on("tick", () => {
                link
                    .attr("x1", d => d.source.x)
                    .attr("y1", d => d.source.y)
                    .attr("x2", d => d.target.x)
                    .attr("y2", d => d.target.y);

                node
                    .attr("cx", d => d.x)
                    .attr("cy", d => d.y);

                text
                    .attr("x", d => d.x)
                    .attr("y", d => d.y);
            });

            // Pass start/end node values to runDijkstra
            runDijkstra(graph, node, link, startNode, endNode);
        }

        async function runDijkstra(graph, node, link, source, destination) {
            console.log("Running Dijkstra's algorithm...");

            let distances = {};
            let previous = {};
            let unvisited = new Set();

            // Initialize distances
            graph.nodes.forEach(n => {
                distances[n.id] = Infinity;
                previous[n.id] = null;
                unvisited.add(n.id);
            });

            // Use the chosen start node, set distance to 0
            distances[source] = 0;

            // **Mark Start Node as Dark Green**
            node.filter(d => d.id === source)
                .transition()
                .duration(500)
                .attr("fill", "green");

            await delay(500);

            while (unvisited.size > 0) {
                // Find node with minimum distance
                let minNode = Array.from(unvisited)
                    .reduce((a, b) => (distances[a] < distances[b] ? a : b));
                
                unvisited.delete(minNode);

                // If we've reached the destination, we can stop early (optional optimization)
                if (minNode === destination) {
                    break;
                }

                // **Mark Node as Light Green (Visited)**
                if (minNode !== source) {
                    node.filter(d => d.id === minNode)
                        .transition()
                        .duration(500)
                        .attr("fill", "#90EE90"); // Light Green
                }

                await delay(500);

                // Relax edges connected to minNode
                graph.edges.forEach(edge => {
                    // Check if this edge touches the current node
                    if (edge.source.id === minNode || edge.target.id === minNode) {
                        let neighbor = edge.source.id === minNode
                            ? edge.target.id
                            : edge.source.id;

                        if (!unvisited.has(neighbor)) return;

                        let newDist = distances[minNode] + edge.weight;
                        if (newDist < distances[neighbor]) {
                            distances[neighbor] = newDist;
                            previous[neighbor] = minNode;

                            // **Highlight edge (Orange) when updating distances**
                            link.filter(d =>
                                (d.source.id === minNode && d.target.id === neighbor) ||
                                (d.target.id === minNode && d.source.id === neighbor)
                            )
                            .transition()
                            .duration(500)
                            .attr("stroke", "orange")
                            .attr("stroke-width", 5);
                        }
                    }
                });

                await delay(500);
            }

            // --- BUILD FINAL PATH ---
    let pathEdges = [];
    let pathNode = destination;
    while (previous[pathNode] !== null) {
        const u = previous[pathNode];
        const v = pathNode;
        pathEdges.push([u, v]);
        pathNode = u;
    }

    // --- RESET ALL EDGES TO GRAY ---
    await link.transition()
        .duration(500)
        .attr("stroke", "gray")
        .attr("stroke-width", 2)
        .end();

    // --- HIGHLIGHT ONLY THE FINAL SHORTEST-PATH EDGES IN GREEN ---
    pathEdges.forEach(([u, v]) => {
        link.filter(d =>
            (d.source.id === u && d.target.id === v) ||
            (d.source.id === v && d.target.id === u)
        )
        .transition()
        .duration(500)
        .attr("stroke", "green")
        .attr("stroke-width", 6);
    });

            // **Trace Back the Shortest Path and Mark it as Dark Green**
            pathNode = destination;
            while (previous[pathNode] !== null) {
                node.filter(d => d.id === pathNode)
                    .transition()
                    .duration(500)
                    .attr("fill", "green"); // Dark Green for shortest path

                link.filter(d =>
                    (d.source.id === previous[pathNode] && d.target.id === pathNode) ||
                    (d.target.id === previous[pathNode] && d.source.id === pathNode)
                )
                .transition()
                .duration(500)
                .attr("stroke", "green")
                .attr("stroke-width", 6);

                pathNode = previous[pathNode];
                await delay(500);
            }

            // Mark the source also as green (in case it's not already)
            node.filter(d => d.id === source)
                .transition()
                .duration(500)
                .attr("fill", "green");

            console.log(
                `Shortest distance from ${source} to ${destination} is ${distances[destination]}`
            );
        }

        // ✅ Function to Delay Execution (For Animation)
        function delay(ms) {
            return new Promise(resolve => setTimeout(resolve, ms));
        }