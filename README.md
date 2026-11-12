# Suvidha Booking Assistant

A Manifest V3 Google Chrome extension designed for exporters using the West Bengal Government's **Suvidha Vehicles Facilitation System** (`suvidha-mp.wb.gov.in`).

---

## Workflow Overview

1. **Manual Slot Step (`/exporter-oth/avilable-slot`)**:
   - The user manually selects **Type of Goods**, **Vehicle / Goods Category**, and chooses their desired date slot on the calendar.
2. **Automated Booking Step (`/exporter-oth/slot-booking`)**:
   - Once the user lands on the booking page, Suvidha Assistant takes over automatically:
     - Autofills **Name of Goods**, **UDIN**, **LC Number**, **LC Date**, **Importer**, and **Vehicles**.
     - Clicks **Calculate**.
     - Captures the CAPTCHA image and sends it to the local Python OCR microservice.
     - Simulates natural keystroke typing to enter the CAPTCHA code.
     - Clicks **Proceed to payment**.
3. **Automated GRIPS Treasury Payment (`wbifms.gov.in/GRIPS/v2/#/g2-payment`)**:
   - Confirms "Verified and checked" and advances through the review step.
   - Selects **Payment Mode** (SBI ePay) and **Bank / Gateway** options via Angular Material dropdowns.
   - Clicks **Pay Now**.
4. **Automated SBI ePay Gateway (`epay.sbi.bank.in`)**:
   - Detects the payment gateway and automatically activates the **NEFT / RTGS** tab.

---

## Project Structure

```
suvidha-chrome-plugin/
├── package.json           # Node.js scripts and devDependencies
├── build.mjs              # esbuild bundler configuration
├── python-ocr/            # Local FastAPI OCR microservice
│   ├── server.py          # EasyOCR + OpenCV captcha resolver
│   └── requirements.txt   # fastapi, uvicorn, easyocr, opencv-python-headless
├── src/                   # Source files
│   ├── manifest.json      # Manifest V3 configuration
│   ├── popup.html         # Exporter profile configuration popup
│   ├── popup.js           # Popup settings persistence and triggers
│   ├── content.js         # Content script router and DOM automation
│   ├── background.js      # Service worker bridge to local OCR server
│   └── icons/
├── chrome-extensions/     # Compiled output directory (Load unpacked in Chrome)
└── test/                  # Automated test suite
```

---

## Getting Started

### 1. Start the Local Python OCR Server
```bash
cd python-ocr
pip install -r requirements.txt
python server.py
```
The OCR server will run at `http://127.0.0.1:8000`.

### 2. Build the Extension
```bash
npm install
npm run build
```
For active development with continuous rebuilds on file change:
```bash
npm run dev
```

### 3. Run Automated Tests
```bash
npm test
```

---

## Loading in Google Chrome

1. Open Google Chrome and go to `chrome://extensions/`.
2. Enable **Developer mode** (top right switch).
3. Click **Load unpacked**.
4. Select the **`chrome-extensions`** directory.
5. Click the extension icon to save your default exporter details.
