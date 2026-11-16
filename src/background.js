// background.js

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.type === "SOLVE_CAPTCHA_API") {
    solveWithPythonOCR(request.imageBase64)
      .then(text => sendResponse({ text }))
      .catch(err => sendResponse({ error: err.message }));
    return true; // Keep message channel open for async response
  }
});

// Primary safe port is 18000 (outside Windows dynamic reservation 1024-15001)
const OCR_PORTS = [18000, 18080, 28000, 8765, 8000];

async function solveWithPythonOCR(base64Image) {
  for (const port of OCR_PORTS) {
    try {
      const response = await fetch(`http://127.0.0.1:${port}/solve`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ imageBase64: base64Image })
      });

      if (!response.ok) {
        throw new Error(`Python OCR Server on port ${port} responded with HTTP ${response.status}`);
      }

      const data = await response.json();
      if (!data.success) {
        throw new Error(data.detail || "Python OCR failed to decode text.");
      }

      return data.text || "";
    } catch (err) {
      if (err.name === "TypeError" || (err.message && err.message.includes("Failed to fetch"))) {
        continue; // Try next fallback port if not listening
      }
      throw err;
    }
  }

  throw new Error(
    "Python OCR Server is not running on http://127.0.0.1:18000. Start it via: python python-ocr/server.py"
  );
}
