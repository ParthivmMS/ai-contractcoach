document.getElementById("uploadForm").addEventListener("submit", async (event) => {
    event.preventDefault();

    const fileInput = document.getElementById("contractFile");
    const resultDiv = document.getElementById("result");

    if (fileInput.files.length === 0) {
        resultDiv.innerText = "Please upload a contract file first.";
        return;
    }

    const formData = new FormData();
    formData.append("file", fileInput.files[0]);

    try {
        resultDiv.innerText = "Analyzing contract... Please wait.";

        const response = await fetch("https://contractcoach-backend.onrender.com/analyze_contract/", {
            method: "POST",
            body: formData,
        });

        if (!response.ok) {
            throw new Error(`Server error: ${response.status} ${response.statusText}`);
        }

        const data = await response.json();
        
        // If backend sends { summary: "...", risks: "...", obligations: "..." }
        resultDiv.innerHTML = `
            <h3>Contract Summary:</h3>
            <p>${data.summary || "No summary available."}</p>
            
            <h3>Risks:</h3>
            <p>${data.risks || "No risks found."}</p>
            
            <h3>Obligations:</h3>
            <p>${data.obligations || "No obligations listed."}</p>
        `;

    } catch (error) {
        console.error("Error analyzing contract:", error);
        resultDiv.innerText = "Failed to analyze file. Please try again later.";
    }
});
