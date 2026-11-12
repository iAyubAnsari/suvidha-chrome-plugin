// background.js

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.type === "SOLVE_CAPTCHA_API") {
    solveWithPythonOCR(request.imageBase64)
      .then(text => sendResponse({ text }))
      .catch(err => sendResponse({ error: err.message }));
    return true; // Keep message channel open for async response
  }
});

async function solveWithPythonOCR(base64Image) {
  try {
    const response = await fetch("http://127.0.0.1:8000/solve", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ imageBase64: base64Image })
    });

    if (!response.ok) {
      throw new Error(`Python OCR Server responded with HTTP ${response.status}`);
    }

    const data = await response.json();
    if (!data.success) {
      throw new Error(data.detail || "Python OCR failed to decode text.");
    }

    return data.text || "";
  } catch (err) {
    if (err.message && (err.message.includes("Failed to fetch") || err.name === "TypeError")) {
      throw new Error("Python OCR Server is not running on http://127.0.0.1:8000. Start it via: python python-ocr/server.py");
    }
    throw err;
  }
}
