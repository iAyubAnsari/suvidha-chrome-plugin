import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import test from 'node:test';
import vm from 'node:vm';

const PROJECT_DIR = path.join(process.cwd(), 'chrome-extensions');

test('1. Manifest Validation', async (t) => {
  const manifestPath = path.join(PROJECT_DIR, 'manifest.json');
  assert.ok(fs.existsSync(manifestPath), 'manifest.json exists');

  const rawBuffer = fs.readFileSync(manifestPath);
  const hasBOM = rawBuffer[0] === 0xef && rawBuffer[1] === 0xbb && rawBuffer[2] === 0xbf;

  await t.test('BOM Check', () => {
    assert.equal(hasBOM, false, 'manifest.json has NO UTF-8 BOM');
  });

  const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));

  await t.test('Manifest V3 structure', () => {
    assert.equal(manifest.manifest_version, 3);
    assert.equal(typeof manifest.name, 'string');
    assert.equal(typeof manifest.version, 'string');
    assert.ok(manifest.action, 'has action');
    assert.equal(manifest.action.default_popup, 'popup.html');
  });

  await t.test('Permissions and Hosts', () => {
    assert.ok(Array.isArray(manifest.permissions));
    assert.ok(manifest.permissions.includes('storage'));
    assert.ok(manifest.permissions.includes('activeTab'));
    assert.ok(Array.isArray(manifest.host_permissions));
    assert.ok(manifest.host_permissions.includes('https://suvidha-mp.wb.gov.in/*'));
  });

  await t.test('Content scripts configuration', () => {
    assert.ok(Array.isArray(manifest.content_scripts));
    assert.equal(manifest.content_scripts.length, 1);
    const cs = manifest.content_scripts[0];
    assert.ok(cs.matches.includes('https://suvidha-mp.wb.gov.in/exporter-oth/*'));
    assert.ok(cs.js.includes('content.js'));
    assert.ok(fs.existsSync(path.join(PROJECT_DIR, cs.js[0])), 'content.js file exists');
  });
});

test('2. Popup HTML and DOM ID Alignment', () => {
  const popupHtml = fs.readFileSync(path.join(PROJECT_DIR, 'popup.html'), 'utf8');
  const expectedIds = [
    'goods', 'udin', 'lcNumber', 'lcDate', 'importer', 'vehicles',
    'autoCalc', 'autoRun', 'save', 'fill', 'status'
  ];

  for (const id of expectedIds) {
    assert.match(popupHtml, new RegExp(`id=["']${id}["']`), `popup.html contains element with id="${id}"`);
  }
});

test('3. Popup Logic (popup.js)', async (t) => {
  const popupJsCode = fs.readFileSync(path.join(PROJECT_DIR, 'popup.js'), 'utf8');

  function createPopupContext(initialStorage = {}, tabUrl = 'https://suvidha-mp.wb.gov.in/exporter-oth/slot-booking') {
    const elements = {};
    const ids = [
      'goods', 'udin', 'lcNumber', 'lcDate', 'importer', 'vehicles',
      'autoCalc', 'autoRun', 'save', 'fill', 'status'
    ];
    ids.forEach(id => {
      elements[id] = {
        id,
        value: '',
        checked: false,
        textContent: '',
        onclick: null,
        onchange: null
      };
    });

    const storage = { ...initialStorage };
    let sentMessages = [];
    let runtimeLastError = null;

    const chrome = {
      storage: {
        local: {
          get: (key, cb) => {
            const res = {};
            if (typeof key === 'string') {
              res[key] = storage[key];
            }
            cb(res);
          },
          set: (data) => {
            Object.assign(storage, data);
            return Promise.resolve();
          }
        }
      },
      tabs: {
        query: (queryInfo) => {
          return Promise.resolve([
            { id: 101, url: tabUrl }
          ]);
        },
        sendMessage: (tabId, msg, cb) => {
          sentMessages.push({ tabId, msg });
          if (chrome.runtime.lastError) {
            cb(undefined);
          } else {
            cb({ message: 'Success' });
          }
        }
      },
      runtime: {
        get lastError() {
          return runtimeLastError;
        },
        set lastError(val) {
          runtimeLastError = val;
        }
      }
    };

    const documentMock = {
      getElementById: (id) => elements[id] || null
    };

    const ctx = vm.createContext({
      document: documentMock,
      chrome,
      console,
      setTimeout: (fn) => fn()
    });

    return { ctx, elements, storage, chrome, getSentMessages: () => sentMessages };
  }

  await t.test('Initializes form from chrome.storage.local', () => {
    const { ctx, elements } = createPopupContext({
      profile: {
        goods: 'Rice',
        udin: 'UDIN123456789012345678',
        lcNumber: 'LC999',
        lcDate: '2026-11-01',
        importer: 'Dhaka Imports Ltd',
        vehicles: '5',
        autoCalc: true,
        autoRun: true
      }
    });

    vm.runInContext(popupJsCode, ctx);

    assert.equal(elements.goods.value, 'Rice');
    assert.equal(elements.udin.value, 'UDIN123456789012345678');
    assert.equal(elements.lcNumber.value, 'LC999');
    assert.equal(elements.lcDate.value, '2026-11-01');
    assert.equal(elements.importer.value, 'Dhaka Imports Ltd');
    assert.equal(elements.vehicles.value, '5');
    assert.equal(elements.autoCalc.checked, true);
    assert.equal(elements.autoRun.checked, true);
  });

  await t.test('Save button persists profile to storage', async () => {
    const { ctx, elements, storage } = createPopupContext();
    vm.runInContext(popupJsCode, ctx);

    elements.goods.value = 'Basmati Rice';
    elements.udin.value = 'UDIN999';
    elements.lcNumber.value = 'LC888';
    elements.lcDate.value = '2026-11-05';
    elements.importer.value = 'Global Traders';
    elements.vehicles.value = '2';
    elements.autoCalc.checked = true;
    elements.autoRun.checked = true;

    await elements.save.onclick();

    assert.deepEqual(JSON.parse(JSON.stringify(storage.profile)), {
      goods: 'Basmati Rice',
      udin: 'UDIN999',
      lcNumber: 'LC888',
      lcDate: '2026-11-05',
      importer: 'Global Traders',
      vehicles: '2',
      autoCalc: true,
      autoRun: true
    });
  });

  await t.test('Fill button triggers active tab with profile', async () => {
    const { ctx, elements, getSentMessages } = createPopupContext(
      {},
      'https://suvidha-mp.wb.gov.in/exporter-oth/slot-booking'
    );
    vm.runInContext(popupJsCode, ctx);

    elements.goods.value = 'Cotton';
    await elements.fill.onclick();

    const messages = getSentMessages();
    assert.equal(messages.length, 1);
    assert.equal(messages[0].msg.type, 'SUVIDHA_TRIGGER');
    assert.equal(messages[0].msg.profile.goods, 'Cotton');
  });
});

test('4. Content Script (content.js)', async (t) => {
  const contentJsCode = fs.readFileSync(path.join(PROJECT_DIR, 'content.js'), 'utf8');

  class HTMLElement {
    constructor(tagName, attrs = {}) {
      this.tagName = tagName.toUpperCase();
      this.id = attrs.id || '';
      this.name = attrs.name || '';
      this.placeholder = attrs.placeholder || '';
      this.type = attrs.type || 'text';
      this._value = attrs.value || '';
      this._innerText = attrs.innerText || '';
      this.attributes = { ...attrs };
      this.parentElement = null;
      this.offsetWidth = 100;
      this.offsetHeight = 30;
      this.labels = [];
      this.children = [];
      this.options = [];
      this.clicked = false;
      this.focused = false;
      this.style = {};
      this.checked = attrs.checked || false;
      this.disabled = attrs.disabled || false;
      this.eventListeners = {};
    }

    get value() {
      return this._value;
    }
    set value(v) {
      this._value = String(v);
    }

    get innerText() {
      return this._innerText;
    }
    set innerText(v) {
      this._innerText = String(v);
    }

    get textContent() {
      return this._innerText;
    }
    set textContent(v) {
      this._innerText = String(v);
    }

    getAttribute(name) {
      return this.attributes[name] || null;
    }

    setAttribute(name, val) {
      this.attributes[name] = String(val);
      if (name === 'class') this.className = String(val);
    }

    appendChild(child) {
      child.parentElement = this;
      this.children.push(child);
      if (child.tagName === 'OPTION') {
        this.options.push(child);
      }
      return child;
    }

    addEventListener(event, fn) {
      if (!this.eventListeners[event]) this.eventListeners[event] = [];
      this.eventListeners[event].push(fn);
    }

    dispatchEvent(ev) {
      const fns = this.eventListeners[ev.type] || [];
      fns.forEach(fn => fn(ev));
      return true;
    }

    click() {
      this.clicked = true;
      this.dispatchEvent({ type: 'click' });
    }

    focus() {
      this.focused = true;
    }

    scrollIntoView() { }

    closest(selector) {
      let curr = this.parentElement;
      while (curr) {
        if (selector === 'form' && curr.tagName === 'FORM') return curr;
        if (selector.includes('label') && curr.tagName === 'LABEL') return curr;
        curr = curr.parentElement;
      }
      return null;
    }
  }

  class HTMLInputElement extends HTMLElement { }
  class HTMLTextAreaElement extends HTMLElement { }
  class HTMLSelectElement extends HTMLElement { }
  class HTMLOptionElement extends HTMLElement {
    constructor(text, value) {
      super('OPTION');
      this.text = text;
      this.value = value;
      this._innerText = text;
    }
  }

  function createDocumentMock() {
    const allElements = [];
    const doc = {
      createElement: (tag) => {
        const el = tag.toLowerCase() === 'select'
          ? new HTMLSelectElement('SELECT')
          : (tag.toLowerCase() === 'textarea' ? new HTMLTextAreaElement('TEXTAREA') : new HTMLInputElement(tag));
        allElements.push(el);
        return el;
      },
      getElementById: (id) => allElements.find(e => e.id === id) || null,
      body: new HTMLElement('BODY'),
      querySelector: (sel) => {
        const results = doc.querySelectorAll(sel);
        return results[0] || null;
      },
      querySelectorAll: (sel) => {
        if (sel.includes('input:not([type=hidden]), textarea')) {
          return allElements.filter(e =>
            (e instanceof HTMLInputElement || e instanceof HTMLTextAreaElement) && e.type !== 'hidden'
          );
        }
        if (sel.includes('button, input[type=button]')) {
          return allElements.filter(e =>
            e.tagName === 'BUTTON' ||
            (e instanceof HTMLInputElement && (e.type === 'button' || e.type === 'submit')) ||
            e.tagName === 'A'
          );
        }
        if (sel.includes('input[type=checkbox]') || sel.includes("input[type='checkbox']")) {
          return allElements.filter(e => e instanceof HTMLInputElement && e.type === 'checkbox');
        }
        if (sel.includes('.side_nav a') || sel.includes('#activeNEFT')) {
          return allElements.filter(e => e.id === 'activeNEFT' || (e.innerText && e.innerText.toLowerCase().includes('neft')));
        }
        return [];
      }
    };
    return { doc, allElements };
  }

  await t.test('Page 1: Booking Form Autofill & Calculate (/exporter-oth/slot-booking)', async () => {
    const { doc } = createDocumentMock();
    const windowMock = {
      location: { href: 'https://suvidha-mp.wb.gov.in/exporter-oth/slot-booking' },
      __suvidhaAssistantLoaded: undefined
    };

    let messageHandler = null;
    const chromeMock = {
      runtime: {
        onMessage: {
          addListener: (fn) => { messageHandler = fn; }
        },
        sendMessage: (msg, cb) => cb?.({ text: 'XYZ123' })
      },
      storage: {
        local: {
          get: (key, cb) => cb({})
        }
      }
    };

    class MockMutationObserver {
      observe() { }
      disconnect() { }
    }

    const inputGoods = doc.createElement('input');
    inputGoods.placeholder = 'Goods you want to export';
    doc.body.appendChild(inputGoods);

    const inputUdin = doc.createElement('input');
    inputUdin.placeholder = '25 alphanumeric UDIN';
    doc.body.appendChild(inputUdin);

    const inputLcNumber = doc.createElement('input');
    inputLcNumber.placeholder = 'Enter the LC Number';
    doc.body.appendChild(inputLcNumber);

    const inputLcDate = doc.createElement('input');
    inputLcDate.placeholder = 'mm/dd/yyyy';
    doc.body.appendChild(inputLcDate);

    const inputImporter = doc.createElement('input');
    inputImporter.placeholder = 'Enter the name of the Importer';
    doc.body.appendChild(inputImporter);

    const inputVehicles = doc.createElement('input');
    inputVehicles.placeholder = 'Enter total number of Vehicle';
    doc.body.appendChild(inputVehicles);

    const calcBtn = doc.createElement('button');
    calcBtn.innerText = 'Calculate';
    doc.body.appendChild(calcBtn);

    const logoInput = doc.createElement('input');
    logoInput.placeholder = 'Enter Logo Code';
    doc.body.appendChild(logoInput);

    const ctx = vm.createContext({
      window: windowMock,
      document: doc,
      chrome: chromeMock,
      MutationObserver: MockMutationObserver,
      Event: globalThis.Event,
      setTimeout: globalThis.setTimeout,
      clearTimeout: globalThis.clearTimeout,
      HTMLInputElement,
      HTMLTextAreaElement,
      HTMLSelectElement
    });

    vm.runInContext(contentJsCode, ctx);

    // Trigger autofill
    let responseResult = null;
    messageHandler({
      type: 'SUVIDHA_TRIGGER',
      profile: {
        goods: 'Basmati Rice',
        udin: 'UDIN123456789012345678',
        lcNumber: 'LC9988',
        lcDate: '2026-11-05',
        importer: 'Dhaka Imports',
        vehicles: '4',
        autoCalc: true
      }
    }, {}, (res) => { responseResult = res; });

    await new Promise(r => setTimeout(r, 450));

    assert.equal(inputGoods.value, 'Basmati Rice');
    assert.equal(inputUdin.value, 'UDIN123456789012345678');
    assert.equal(inputLcNumber.value, 'LC9988');
    // mm/dd/yyyy format converted from yyyy-mm-dd
    assert.equal(inputLcDate.value, '11/05/2026');
    assert.equal(inputImporter.value, 'Dhaka Imports');
    assert.equal(inputVehicles.value, '4');
    assert.equal(calcBtn.clicked, true, 'Calculate button was clicked');
    assert.equal(logoInput.focused, true, 'Logo input was focused');
  });

  await t.test('Page 2: GRIPS Payment Verification & Next (/GRIPS/v2/#/g2-payment)', async () => {
    const { doc } = createDocumentMock();
    const windowMock = {
      location: { href: 'https://wbifms.gov.in/GRIPS/v2/#/g2-payment/external?uuid=123' },
      __suvidhaAssistantLoaded: undefined
    };

    let messageHandler = null;
    const chromeMock = {
      runtime: {
        onMessage: {
          addListener: (fn) => { messageHandler = fn; }
        }
      },
      storage: {
        local: {
          get: (key, cb) => cb({})
        }
      }
    };

    class MockMutationObserver {
      observe() { }
      disconnect() { }
    }

    const checkbox = doc.createElement('input');
    checkbox.type = 'checkbox';
    checkbox.checked = false;
    const label = doc.createElement('label');
    label.innerText = 'Verified and checked';
    label.appendChild(checkbox);
    doc.body.appendChild(label);

    const nextBtn = doc.createElement('button');
    nextBtn.innerText = 'NEXT';
    nextBtn.disabled = false;
    doc.body.appendChild(nextBtn);

    const ctx = vm.createContext({
      window: windowMock,
      document: doc,
      chrome: chromeMock,
      MutationObserver: MockMutationObserver,
      Event: globalThis.Event,
      setTimeout: globalThis.setTimeout,
      clearTimeout: globalThis.clearTimeout,
      HTMLInputElement,
      HTMLTextAreaElement,
      HTMLSelectElement
    });

    vm.runInContext(contentJsCode, ctx);

    // Wait for async tick & click (600ms initial delay + 400ms next delay)
    await new Promise(r => setTimeout(r, 1200));

    assert.equal(checkbox.checked, true, 'Verified and checked checkbox was ticked');
    assert.equal(nextBtn.clicked, true, 'Next button was clicked');
  });

  await t.test('Page 3: SBI ePay NEFT Selection (epay.sbi.bank.in)', async () => {
    const { doc } = createDocumentMock();
    const windowMock = {
      location: { href: 'https://epay.sbi.bank.in/epay/AggregatorHostedListener' },
      __suvidhaAssistantLoaded: undefined
    };

    const chromeMock = {
      runtime: {
        onMessage: { addListener: () => { } }
      },
      storage: {
        local: { get: (key, cb) => cb({}) }
      }
    };

    class MockMutationObserver {
      observe() { }
      disconnect() { }
    }

    const neftTab = doc.createElement('a');
    neftTab.id = 'activeNEFT';
    neftTab.innerText = 'NEFT/RTGS';
    doc.body.appendChild(neftTab);

    const ctx = vm.createContext({
      window: windowMock,
      document: doc,
      chrome: chromeMock,
      MutationObserver: MockMutationObserver,
      Event: globalThis.Event,
      setTimeout: globalThis.setTimeout,
      clearTimeout: globalThis.clearTimeout,
      HTMLInputElement,
      HTMLTextAreaElement,
      HTMLSelectElement
    });

    vm.runInContext(contentJsCode, ctx);

    await new Promise(r => setTimeout(r, 1200));
    assert.equal(neftTab.clicked, true, 'NEFT tab was clicked');
  });

  t.after(() => {
    setTimeout(() => process.exit(0), 50);
  });
});
