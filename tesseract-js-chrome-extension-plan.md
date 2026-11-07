# Using Tesseract.js in a Chrome Extension (Manifest V3)

## 1. Goal

Integrate Tesseract.js into a Chrome Extension using Manifest V3 so the extension can perform OCR (Optical Character Recognition) locally in the browser.

**Important:** Tesseract.js is a general-purpose OCR library. It is suitable for extracting ordinary text from images, accessibility workflows, and testing with images you own. It is not a Logo-solving engine and should not be used to bypass a website's Logo or other anti-automation verification.

## 2. Recommended architecture

- Keep OCR functionality in a dedicated module (`ocr.js`).
- Bundle Tesseract.js and its runtime assets locally with the extension.
- Do not depend on a CDN at runtime.
- Configure the worker, WebAssembly core, and language data paths explicitly.
- Use a build tool such as Vite or Webpack to bundle npm dependencies for the extension.

### Suggested project structure

```text
chrome-extension/
├── manifest.json
├── package.json
├── src/
│   ├── background.js
│   ├── content.js
│   ├── popup.js
│   └── ocr.js
├── public/
│   └── vendor/
│       └── tesseract/
│           ├── worker.min.js
│           ├── tesseract-core.wasm.js
│           ├── tesseract-core.wasm
│           └── lang/
│               └── eng.traineddata.gz
└── dist/
```

The exact runtime asset filenames depend on the Tesseract.js version and package distribution. Copy/package the matching worker, core, and language assets from the installed dependency; do not assume every version uses the same filenames.

## 3. Install dependencies

```bash
npm install tesseract.js
```

Add and configure Vite or Webpack as the extension build tool. The build should produce extension-compatible JavaScript and copy the required Tesseract runtime assets into the final extension output.

## 4. Manifest V3 configuration

Example `manifest.json`:

```json
{
  "manifest_version": 3,
  "name": "OCR Extension",
  "version": "1.0.0",
  "permissions": ["activeTab", "scripting"],
  "background": {
    "service_worker": "src/background.js"
  },
  "content_security_policy": {
    "extension_pages": "script-src 'self' 'wasm-unsafe-eval'; object-src 'self'"
  }
}
```

Adjust paths to match the actual build output. Add `host_permissions` only if the extension genuinely needs access to specific sites.

## 5. OCR module example

Example using the Tesseract.js worker API. Confirm the API and asset paths against the exact version installed in the project.

```javascript
import { createWorker } from "tesseract.js";

let workerPromise;

async function getWorker() {
  if (!workerPromise) {
    workerPromise = createWorker("eng", 1, {
      workerPath: chrome.runtime.getURL(
        "vendor/tesseract/worker.min.js"
      ),
      corePath: chrome.runtime.getURL(
        "vendor/tesseract/"
      ),
      langPath: chrome.runtime.getURL(
        "vendor/tesseract/lang/"
      ),
      workerBlobURL: false
    });
  }

  return workerPromise;
}

export async function extractText(image) {
  const worker = await getWorker();
  const result = await worker.recognize(image);
  return result.data.text;
}

export async function terminateOCR() {
  if (workerPromise) {
    const worker = await workerPromise;
    await worker.terminate();
    workerPromise = undefined;
  }
}
```

This is a starting point, not a guaranteed drop-in configuration: Tesseract.js versions differ in worker/core asset layout and initialization options. Match the paths to the files actually packaged in `dist/` and test the built extension.

## 6. Image input

The OCR module can accept an image source supported by the installed Tesseract.js version, such as an image URL, `Blob`, canvas, or image element.

For an extension processing an image that the user is authorized to access:

1. Obtain the image through an allowed extension workflow.
2. Convert it to a supported image source if needed.
3. Pass it to `extractText(image)`.
4. Display or otherwise use the extracted text in the extension UI.

If reading an image from a page, respect the site's access controls and the extension's declared permissions.

## 7. Build and package

1. Install Tesseract.js and the chosen bundler.
2. Configure the bundler to build the extension entry points.
3. Copy Tesseract's worker, WebAssembly core files, and language data into the extension output.
4. Ensure all runtime paths point to packaged extension resources.
5. Load the generated `dist/` directory through `chrome://extensions` using **Developer mode → Load unpacked**.
6. Test OCR on ordinary sample images, including cases with different sizes, contrast levels, and image formats.

## 8. Key implementation considerations

| Area | Recommendation |
|---|---|
| Runtime assets | Package worker, WASM core, and language data locally |
| Network access | Avoid CDN/runtime downloads |
| WebAssembly | Configure MV3 extension-page CSP as required |
| Worker | Use a packaged worker and test with `workerBlobURL: false` |
| Language data | Include only the languages the extension needs |
| Performance | Reuse a worker for multiple OCR operations; terminate it when no longer needed |
| Build | Use Vite or Webpack and verify the final output paths |
| Permissions | Request only the permissions the extension needs |

## 9. Testing checklist

- [ ] Extension loads without manifest or CSP errors.
- [ ] All Tesseract worker and WASM files are present in the packaged output.
- [ ] Language data loads without a network dependency.
- [ ] OCR works on a local, ordinary sample image.
- [ ] Repeated OCR calls reuse the worker successfully.
- [ ] Worker termination and reinitialization work.
- [ ] The extension works after being reloaded from the built `dist/` folder.
- [ ] No remote code or CDN dependency is required at runtime.

## 10. References

- [Tesseract.js GitHub repository](https://github.com/naptha/tesseract.js)
- [Chrome Extensions: Content Security Policy](https://developer.chrome.com/docs/extensions/reference/manifest/content-security-policy)
- [Chrome Extensions: Manifest V3 overview](https://developer.chrome.com/docs/extensions/develop/migrate/what-is-mv3)

---

**Version note:** Pin the Tesseract.js version in `package.json` and validate its documented worker initialization options and runtime asset layout. The example above should be checked against that pinned version before production use.
