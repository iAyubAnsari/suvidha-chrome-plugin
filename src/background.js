// background.js

// 1. Listen for the message sent from content.js when the captcha needs solving
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.type === "SOLVE_CAPTCHA_API") {
        solveWithPythonOCR(request.imageBase64)
            .then(text => sendResponse({ text }))
            .catch(err => sendResponse({ error: err.message }));
        return true; // Keeps the message channel open for the async response
    }
});

// 2. Call your local Python FastAPI backend instead of external Gemini API
async function solveWithPythonOCR(base64Image) {
    const response = await fetch("http://127.0.0.1:8000/solve", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ imageBase64: base64Image })
    });

    if (!response.ok) {
        throw new Error(`Python OCR Server failed with status ${response.status}`);
    }

    const data = await response.json();
    if (!data.success) {
        throw new Error("Python OCR failed to decode text.");
    }

    return data.text || "";
}