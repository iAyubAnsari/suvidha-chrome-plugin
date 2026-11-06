# Suvidha Booking Assistant

A Manifest V3 Google Chrome extension designed for exporters using the West Bengal Government's **Suvidha Vehicles Facilitation System** (`suvidha-mp.wb.gov.in`).

---

## Project Structure

```
suvidha-chrome-plugin/
├── package.json           # Node.js dependencies (axios, esbuild, etc.)
├── build.mjs              # esbuild bundler configuration
├── src/                   # Source files (supports standard ES imports like 'axios')
│   ├── manifest.json
│   ├── popup.html
│   ├── popup.js           # Can import npm packages (e.g. import axios from 'axios')
│   ├── content.js         # Injected script
│   └── icons/
├── chrome-extensions/     # Built extension directory (load this in Chrome)
│   ├── manifest.json
│   ├── popup.html
│   ├── popup.js
│   ├── content.js
│   └── icons/
└── test/                  # Test suite
```

---

## Getting Started

### 1. Install Dependencies
```bash
npm install
```

### 2. Build the Extension
```bash
npm run build
```
This bundles all JavaScript files into standalone bundles in the `chrome-extensions/` folder.

To continuously rebuild on file changes while developing:
```bash
npm run dev
```

### 3. Run Automated Tests
```bash
npm test
```

---

## Loading in Google Chrome

1. Open Chrome and navigate to `chrome://extensions/`.
2. Toggle **Developer mode** on (top-right corner).
3. Click **Load unpacked**.
4. Select the **`chrome-extensions`** directory inside this project folder.
5. Pin **Suvidha Booking Assistant** to your browser toolbar.

---

## Using NPM Packages (e.g., Axios)

You can import packages directly in `src/popup.js` or `src/content.js`:

```javascript
import axios from 'axios';

// Example: Fetch data via axios
async function fetchData() {
  const response = await axios.get('https://example.com/api');
  console.log(response.data);
}
```

Run `npm run build` (or have `npm run dev` running), and esbuild will bundle the dependencies automatically into `chrome-extensions/`.
