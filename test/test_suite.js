import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
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
    'goodsType', 'goodsCategory', 'slotDate', 'autoSlot',
    'goods', 'udin', 'lcNumber', 'lcDate', 'importer', 'vehicles',
    'autoCalc', 'autoRun', 'save', 'fill', 'status'
  ];

  for (const id of expectedIds) {
    assert.match(popupHtml, new RegExp(`id=["']${id}["']`), `popup.html contains element with id="${id}"`);
  }
});

test('3. Popup Logic (popup.js)', async (t) => {
  const popupJsCode = fs.readFileSync(path.join(PROJECT_DIR, 'popup.js'), 'utf8');

  function createPopupContext(initialStorage = {}, tabUrl = 'https://suvidha-mp.wb.gov.in/exporter-oth/avilable-slot') {
    const elements = {};
    const ids = [
      'goodsType', 'goodsCategory', 'slotDate', 'autoSlot',
      'goods', 'udin', 'lcNumber', 'lcDate', 'importer', 'vehicles',
      'autoCalc', 'autoRun', 'save', 'fill', 'status'
    ];
    ids.forEach(id => {
      elements[id] = {
        id,
        value: '',
        checked: false,
        textContent: '',
        onclick: null
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
        goodsType: 'NON-PERISHABLE',
        goodsCategory: 'OTHERS - NON PERISHABLE (UP TO 06 WHEELERS)',
        slotDate: '2026-11-08',
        autoSlot: true,
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

    assert.equal(elements.goodsType.value, 'NON-PERISHABLE');
    assert.equal(elements.goodsCategory.value, 'OTHERS - NON PERISHABLE (UP TO 06 WHEELERS)');
    assert.equal(elements.slotDate.value, '2026-11-08');
    assert.equal(elements.autoSlot.checked, true);
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

    elements.goodsType.value = 'NON-PERISHABLE';
    elements.goodsCategory.value = 'STONE CHIPS (UP TO 12 WHEELER)';
    elements.slotDate.value = '2026-11-08';
    elements.autoSlot.checked = true;
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
      goodsType: 'NON-PERISHABLE',
      goodsCategory: 'STONE CHIPS (UP TO 12 WHEELER)',
      slotDate: '2026-11-08',
      goods: 'Basmati Rice',
      udin: 'UDIN999',
      lcNumber: 'LC888',
      lcDate: '2026-11-05',
      importer: 'Global Traders',
      vehicles: '2',
      autoSlot: true,
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
      this.dispatchedEvents = [];
      this.focused = false;
      this.clicked = false;
      this.style = {};
    }
    get innerText() {
      const childText = this.children.map(c => c.innerText).join(' ');
      return ((this._innerText || '') + ' ' + childText).trim();
    }
    set innerText(v) {
      this._innerText = v;
    }
    get textContent() {
      return this.innerText;
    }
    set textContent(v) {
      this._innerText = v;
    }
    get value() { return this._value; }
    set value(v) { this._value = v; }
    getAttribute(name) { return this.attributes[name] || null; }
    setAttribute(name, val) { this.attributes[name] = val; }
    appendChild(child) {
      child.parentElement = this;
      this.children.push(child);
      if (child.tagName === 'OPTION') {
        this.options.push(child);
      }
      return child;
    }
    querySelector(sel) {
      if (sel.includes('+') || sel.includes('button') || sel.includes('span')) {
        return this.children.find(c => (c.innerText || '').includes('+')) || null;
      }
      return null;
    }
    closest(sel) {
      let cur = this;
      while (cur) {
        if (sel.includes('a') && cur.tagName === 'A') return cur;
        if (sel.includes('button') && cur.tagName === 'BUTTON') return cur;
        cur = cur.parentElement;
      }
      return null;
    }
    dispatchEvent(event) {
      this.dispatchedEvents.push(event);
      return true;
    }
    focus() { this.focused = true; }
    click() { this.clicked = true; }
  }

  class HTMLInputElement extends HTMLElement {}
  class HTMLTextAreaElement extends HTMLElement {}
  class HTMLSelectElement extends HTMLElement {}
  class HTMLOptionElement extends HTMLElement {
    constructor(text, val) {
      super('option');
      this.text = text;
      this.value = val;
      this.innerText = text;
      this.textContent = text;
    }
  }

  function createDocumentMock() {
    const body = new HTMLElement('body');
    const allElements = [body];

    const doc = {
      body,
      createElement: (tag) => {
        let el;
        const lower = tag.toLowerCase();
        if (lower === 'input') el = new HTMLInputElement('input');
        else if (lower === 'textarea') el = new HTMLTextAreaElement('textarea');
        else if (lower === 'select') el = new HTMLSelectElement('select');
        else if (lower === 'option') el = new HTMLOptionElement('', '');
        else el = new HTMLElement(tag);
        allElements.push(el);
        return el;
      },
      getElementById: (id) => allElements.find(e => e.id === id) || null,
      querySelector: (sel) => {
        if (sel === 'select') return allElements.find(e => e instanceof HTMLSelectElement) || null;
        return null;
      },
      querySelectorAll: (sel) => {
        if (sel.includes('.slot_available')) {
          return allElements.filter(e => e.getAttribute('class')?.includes('slot_available'));
        }
        if (sel === 'select') {
          return allElements.filter(e => e instanceof HTMLSelectElement);
        }
        if (sel === 'input:not([type=hidden]), textarea') {
          return allElements.filter(e =>
            (e instanceof HTMLInputElement && e.type !== 'hidden') ||
            (e instanceof HTMLTextAreaElement)
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
        if (sel.includes('td, div')) {
          return allElements.filter(e => e.tagName === 'TD' || e.tagName === 'DIV');
        }
        return [];
      }
    };
    return { doc, allElements };
  }

  await t.test('Page 1: Slot Selection & Calendar Slot Click (/exporter-oth/avilable-slot)', async () => {
    const { doc } = createDocumentMock();
    const windowMock = {
      location: { href: 'https://suvidha-mp.wb.gov.in/exporter-oth/avilable-slot' },
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
      observe() {}
      disconnect() {}
    }

    // 1. Type of Goods select
    const divType = doc.createElement('div');
    divType.innerText = 'Type of Goods *';
    const selectType = doc.createElement('select');
    selectType.name = 'type_of_goods';
    const optType1 = new HTMLOptionElement('-SELECT-', '');
    const optType2 = new HTMLOptionElement('NON-PERISHABLE', '1');
    const optType3 = new HTMLOptionElement('PERISHABLE AND PRIORITY GOODS', '2');
    selectType.appendChild(optType1);
    selectType.appendChild(optType2);
    selectType.appendChild(optType3);
    divType.appendChild(selectType);
    doc.body.appendChild(divType);

    // 2. Goods select
    const divGoods = doc.createElement('div');
    divGoods.innerText = 'Goods *';
    const selectGoods = doc.createElement('select');
    selectGoods.name = 'goods_id';
    const optG1 = new HTMLOptionElement('SELECT', '');
    const optG2 = new HTMLOptionElement('OTHERS - NON PERISHABLE (UP TO 06 WHEELERS)', '101');
    selectGoods.appendChild(optG1);
    selectGoods.appendChild(optG2);
    divGoods.appendChild(selectGoods);
    doc.body.appendChild(divGoods);

    // 3. Calendar cell for Nov 8 with .slot_available badge matching portal code
    const cellDate8 = doc.createElement('td');
    cellDate8.innerText = '8';
    const badgePlus = doc.createElement('span');
    badgePlus.className = 'slot_available';
    badgePlus.setAttribute('class', 'slot_available');
    badgePlus.setAttribute('data-booking_date', '2026-11-08');
    badgePlus.innerText = '+ 27';
    cellDate8.appendChild(badgePlus);
    doc.body.appendChild(cellDate8);

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

    // Trigger slot selection via message
    let responseResult = null;
    messageHandler({
      type: 'SUVIDHA_TRIGGER',
      profile: {
        goodsType: 'NON-PERISHABLE',
        goodsCategory: 'OTHERS - NON PERISHABLE (UP TO 06 WHEELERS)',
        slotDate: '2026-11-08',
        autoSlot: true
      }
    }, {}, (res) => { responseResult = res; });

    // Allow async actions and scheduled clicks to complete
    await new Promise(r => setTimeout(r, 450));

    assert.equal(selectType.value, '1', 'Selected NON-PERISHABLE');
    assert.equal(selectGoods.value, '101', 'Selected UP TO 06 WHEELERS');
    assert.equal(badgePlus.clicked, true, 'Clicked + 27 badge on 8th Nov');
  });

  await t.test('Page 2: Booking Form Autofill & Calculate (/exporter-oth/slot-booking)', async () => {
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
        }
      },
      storage: {
        local: {
          get: (key, cb) => cb({})
        }
      }
    };

    class MockMutationObserver {
      observe() {}
      disconnect() {}
    }

    // Build form from Screenshot 4
    const inputGoods = doc.createElement('input');
    inputGoods.placeholder = 'Enter the name of the goods you want to export';
    doc.body.appendChild(inputGoods);

    const inputUdin = doc.createElement('input');
    inputUdin.placeholder = 'ENTER 25 ALPHANUMERIC UDIN OF LC';
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

    const captchaInput = doc.createElement('input');
    captchaInput.placeholder = 'Enter Captcha Code';
    doc.body.appendChild(captchaInput);

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
    assert.equal(captchaInput.focused, true, 'Captcha input was focused');
  });

  await t.test('Page 3: GRIPS Payment Verification & Next (/GRIPS/v2/#/g2-payment)', async () => {
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
      observe() {}
      disconnect() {}
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
});
