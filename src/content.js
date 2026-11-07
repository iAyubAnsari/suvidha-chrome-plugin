import Tesseract from "tesseract.js";

(() => {
  if (window.__suvidhaAssistantLoaded) return;
  window.__suvidhaAssistantLoaded = true;

  const norm = s => (s || "").replace(/[_\-]+/g, " ").replace(/\s+/g, " ").trim().toLowerCase();

  // Floating notification badge
  function notice(message, isError = false) {
    let box = document.getElementById("suvidha-assistant-notice");
    if (!box) {
      box = document.createElement("div");
      box.id = "suvidha-assistant-notice";
      Object.assign(box.style, {
        position: "fixed",
        right: "15px",
        bottom: "15px",
        zIndex: "999999",
        background: "#ffffff",
        padding: "12px 16px",
        border: "2px solid #531b91",
        borderRadius: "8px",
        boxShadow: "0 4px 18px rgba(0,0,0,0.18)",
        font: "13px -apple-system, BlinkMacSystemFont, 'Segoe UI', Arial, sans-serif",
        maxWidth: "340px",
        lineHeight: "1.4",
        color: "#1e293b",
        transition: "all 0.2s ease"
      });
      document.body.appendChild(box);
    }
    box.style.borderColor = isError ? "#c0392b" : "#25845b";
    box.textContent = message;
  }

  // Extract text from image with id="logo" via Tesseract.js
  async function extractLogoText() {
    const img = document.getElementById("logo");
    if (!img) {
      notice("Logo image (#logo) not found.", true);
      return null;
    }

    notice("Reading text from image (#logo)...", false);

    let imageSource = img;
    try {
      // Use canvas to get a clean base64 data URL if dimensions exist
      if (img.src && !img.src.startsWith("data:")) {
        const canvas = document.createElement("canvas");
        canvas.width = img.naturalWidth || img.width || 200;
        canvas.height = img.naturalHeight || img.height || 50;
        const ctx = canvas.getContext("2d");
        if (ctx) {
          ctx.drawImage(img, 0, 0);
          imageSource = canvas.toDataURL("image/png");
        }
      }
    } catch (e) {
      // If tainted canvas due to cross-origin, fallback to original element or src
      imageSource = img.src || img;
    }

    try {
      // Use locally bundled worker and core WASM for MV3 compliance
      const workerOptions = {
        workerBlobURL: false // Prevent CSP violation from blob: URL importScripts
      };
      if (typeof chrome !== "undefined" && chrome.runtime?.getURL) {
        workerOptions.workerPath = chrome.runtime.getURL("tesseract-worker.min.js");
        workerOptions.corePath = chrome.runtime.getURL("tesseract-core-simd-lstm.wasm.js");
      }

      const { data: { text } } = await Tesseract.recognize(
        imageSource,
        "eng",
        {
          ...workerOptions,
          logger: (m) => {
            if (m.status === "recognizing text" && m.progress !== undefined) {
              notice(`Extracting text: ${Math.round(m.progress * 100)}%`, false);
            }
          }
        }
      );
      const cleaned = (text || "").trim().replace(/\s+/g, "").toUpperCase();
      console.log("[OCR Result] Extracted text (UPPERCASE):", cleaned);
      notice(`OCR Extracted: ${cleaned}`, false);
      return cleaned;
    } catch (err) {
      console.error("Tesseract OCR failed:", err);
      notice("Failed to extract text from logo.", true);
      return null;
    }
  }

  // Set input value compatible with React/Vue and trigger change/input events
  function setValue(el, value) {
    if (!el || value === undefined || value === null || value === "") return false;
    const proto = el instanceof HTMLTextAreaElement
      ? HTMLTextAreaElement.prototype
      : (el instanceof HTMLSelectElement ? HTMLSelectElement.prototype : HTMLInputElement.prototype);

    const setter = Object.getOwnPropertyDescriptor(proto, "value")?.set;
    if (setter) setter.call(el, String(value));
    else el.value = String(value);

    el.dispatchEvent(new Event("input", { bubbles: true }));
    el.dispatchEvent(new Event("change", { bubbles: true }));
    return true;
  }

  // Search input/textarea by context terms (direct attributes first to prevent parent bleeding)
  function findInput(terms) {
    const inputs = [...document.querySelectorAll("input:not([type=hidden]), textarea")].filter(
      el => (el.offsetWidth || el.offsetHeight)
    );

    // 1st pass: strict check on direct attributes (id, name, placeholder, aria-label, labels)
    const directMatch = inputs.find(el => {
      const directContext = norm([
        el.id,
        el.name,
        el.placeholder,
        el.getAttribute("aria-label"),
        [...(el.labels || [])].map(x => x.innerText || x.textContent).join(" ")
      ].join(" "));
      return terms.some(t => directContext.includes(t));
    });
    if (directMatch) return directMatch;

    // 2nd pass: check closest small container (.form-group, td, label) excluding broad containers
    return inputs.find(el => {
      const parent = (el.closest && el.closest(".form-group, .form-row, td, tr, label")) || el.parentElement;
      if (!parent || parent === document.body || parent.tagName === "FORM") return false;
      const parentText = norm(parent.innerText || parent.textContent);
      return terms.some(t => parentText.includes(t));
    });
  }

  // Wait for an element to appear in DOM
  function waitFor(predicate, timeoutMs = 8000, intervalMs = 200) {
    return new Promise((resolve) => {
      const start = Date.now();
      const check = () => {
        const res = predicate();
        if (res) return resolve(res);
        if (Date.now() - start >= timeoutMs) return resolve(null);
        setTimeout(check, intervalMs);
      };
      check();
    });
  }

  // Extract day number (1-31) from any date format (YYYY-MM-DD, MM/DD/YYYY, DD/MM/YYYY, or raw number)
  function extractDay(dateStr) {
    if (!dateStr) return null;
    const str = String(dateStr).trim();
    // YYYY-MM-DD
    const ymd = str.match(/^(\d{4})-(\d{1,2})-(\d{1,2})$/);
    if (ymd) return parseInt(ymd[3], 10);
    // MM/DD/YYYY or DD/MM/YYYY
    const slash = str.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/);
    if (slash) {
      const p1 = parseInt(slash[1], 10);
      const p2 = parseInt(slash[2], 10);
      if (p1 > 12) return p1;
      if (p2 > 12) return p2;
      if (p2 === 11) return p1; // e.g. 08/11/2026 -> 8 in November
      if (p1 === 11) return p2; // e.g. 11/08/2026 -> 8 in November
      return p1;
    }
    const num = parseInt(str, 10);
    if (!isNaN(num) && num >= 1 && num <= 31) return num;
    return null;
  }

  // Find .slot_available element on the Suvidha calendar
  function findAvailableSlot(targetDay) {
    // Check .slot_available elements directly (the official portal class)
    const slots = [...document.querySelectorAll(".slot_available, .slot_available_reschedule, [data-booking_date]")];

    if (slots.length > 0) {
      if (targetDay !== null) {
        // Find slot whose date ends with targetDay (e.g. 2026-11-08)
        const match = slots.find(s => {
          const bd = (s.getAttribute("data-booking_date") || s.dataset?.booking_date || s.dataset?.bookingDate || "").trim();
          const ymd = bd.match(/^(\d{4})-(\d{1,2})-(\d{1,2})$/);
          if (ymd && parseInt(ymd[3], 10) === targetDay) return true;
          const cell = (s.closest && s.closest("td, div[class*='cell'], div[class*='day']")) || s.parentElement;
          if (cell) {
            const txt = (cell.innerText || cell.textContent || "").trim();
            const tokens = txt.split(/[\s\n\r\t]+/);
            if (tokens.some(t => t.replace(/\D/g, "") === String(targetDay))) return true;
          }
          return false;
        });
        if (match) return match;
      }
      // Return first available slot
      return slots[0];
    }

    // Fallback: search calendar cells
    const cells = [...document.querySelectorAll("td, div[class*='cell'], div[class*='day']")];
    if (targetDay !== null) {
      const targetCell = cells.find(cell => {
        const txt = (cell.innerText || cell.textContent || "").trim();
        const tokens = txt.split(/[\s\n\r\t]+/);
        return tokens.some(t => t.replace(/\D/g, "") === String(targetDay));
      });
      if (targetCell) {
        const action = targetCell.querySelector("a, button, [class*='badge'], [class*='slot'], i.fa, i[class*='plus']");
        return (action && action.closest && action.closest("a, button, [onclick]")) || action || targetCell;
      }
    }

    return null;
  }

  // Select and submit slot
  function selectAndSubmitSlot(slotElement) {
    if (!slotElement) return false;

    slotElement.scrollIntoView?.({ behavior: "smooth", block: "center" });

    // Read booking date attribute from portal element
    const bookingDate = (
      slotElement.getAttribute("data-booking_date") ||
      slotElement.dataset?.booking_date ||
      slotElement.dataset?.bookingDate ||
      ""
    ).trim();

    // Update .event-date input in portal form
    const eventDateInputs = document.querySelectorAll(".event-date, input[name='event_date'], input[name='booking_date']");
    eventDateInputs.forEach(input => {
      if (bookingDate) input.value = bookingDate;
      input.dispatchEvent(new Event("input", { bubbles: true }));
      input.dispatchEvent(new Event("change", { bubbles: true }));
    });

    // Dispatch full mouse event sequence directly on .slot_available
    const target = (slotElement.closest && slotElement.closest(".slot_available")) || slotElement;
    const EventCtor = typeof MouseEvent !== "undefined" ? MouseEvent : Event;
    target.dispatchEvent(new EventCtor("mousedown", { bubbles: true, cancelable: true, view: window }));
    target.dispatchEvent(new EventCtor("mouseup", { bubbles: true, cancelable: true, view: window }));
    target.click();
    target.dispatchEvent(new EventCtor("click", { bubbles: true, cancelable: true, view: window }));

    // Find the portal form and submit it directly to guarantee navigation
    const form = (target.closest && target.closest("form")) || document.querySelector("form");
    if (form) {
      setTimeout(() => {
        if (window.location.href.includes("avilable-slot")) {
          try {
            HTMLFormElement.prototype.submit.call(form);
          } catch (e) {
            form.submit();
          }
        }
      }, 400);
    }

    return true;
  }

  // STEP 1, 2 & 3: Handle /exporter-oth/avilable-slot
  async function handleAvailableSlots(profile) {
    notice("Processing slot selection...");

    // 1. Find & select 'Type of Goods' dropdown
    const typeSelect = [...document.querySelectorAll("select")].find(sel => {
      const context = norm([
        sel.id, sel.name,
        [...(sel.labels || [])].map(x => x.innerText).join(" "),
        sel.parentElement?.innerText
      ].join(" "));
      return context.includes("type of goods") && (sel.offsetWidth || sel.offsetHeight);
    }) || document.querySelector("select");

    if (typeSelect && profile.goodsType) {
      const targetOption = [...typeSelect.options].find(opt =>
        norm(opt.text).includes(norm(profile.goodsType))
      );
      if (targetOption && typeSelect.value !== targetOption.value) {
        typeSelect.value = targetOption.value;
        setValue(typeSelect, targetOption.value);
        notice(`Selected Type: ${targetOption.text}`);
      }
    }

    // 2. Wait for second 'Goods' dropdown to populate via AJAX
    const goodsSelect = await waitFor(() => {
      const selects = [...document.querySelectorAll("select")].filter(
        s => s !== typeSelect && (s.offsetWidth || s.offsetHeight)
      );
      return selects.find(s => s.options.length > 1) || null;
    }, 6000);

    if (goodsSelect && profile.goodsCategory) {
      const targetCat = norm(profile.goodsCategory);
      const catOption = [...goodsSelect.options].find(opt => {
        const txt = norm(opt.text);
        return txt.includes(targetCat) || targetCat.includes(txt);
      });
      if (catOption && goodsSelect.value !== catOption.value) {
        goodsSelect.value = catOption.value;
        setValue(goodsSelect, catOption.value);
        notice(`Selected Category: ${catOption.text}`);
      }
    }

    // 3. Wait for Calendar to render and click the target date's slot
    if (profile.autoSlot !== false) {
      const targetDay = extractDay(profile.slotDate) || extractDay(profile.lcDate);

      const slotElement = await waitFor(() => {
        return findAvailableSlot(targetDay);
      }, 8000);

      if (slotElement) {
        notice(`Found available slot for ${targetDay ? 'day ' + targetDay : 'date'}. Opening booking form...`, false);
        setTimeout(() => selectAndSubmitSlot(slotElement), 350);
        return `Slot selected for ${targetDay ? 'day ' + targetDay : 'date'}. Opening booking form...`;
      } else {
        notice("Calendar loaded. Please click the desired slot (+).", false);
        return "Waiting for manual slot click.";
      }
    }

    return "Slot selection complete.";
  }

  // STEP 4: Handle /exporter-oth/slot-booking form
  function handleBookingForm(p) {
    notice("Filling booking details...");

    const fields = [
      [
        ["goods you want to export", "name of the goods", "name of goods", "goods name"],
        p.goods,
        "Goods"
      ],
      [
        ["25 alphanumeric udin", "udin of lc", "udin"],
        p.udin,
        "UDIN"
      ],
      [
        ["enter the lc number", "lc number", "lc no"],
        p.lcNumber,
        "LC number"
      ],
      [
        ["mm/dd/yyyy", "lc date"],
        p.lcDate,
        "LC date"
      ],
      [
        ["name of the importer", "name of importer", "importer name", "importer"],
        p.importer,
        "Importer"
      ],
      [
        ["enter total number of vehicle", "total number of vehicles", "number of vehicles", "vehicles"],
        p.vehicles,
        "Vehicles"
      ]
    ];

    const filled = [];
    fields.forEach(([terms, val, label]) => {
      if (val === undefined || val === null || val === "") return;
      const el = findInput(terms);
      if (el) {
        let formattedVal = val;
        if (label === "LC date" && el.type !== "date" && /^\d{4}-\d{2}-\d{2}$/.test(val)) {
          const [yyyy, mm, dd] = val.split("-");
          formattedVal = `${mm}/${dd}/${yyyy}`;
        }
        if (setValue(el, formattedVal)) filled.push(label);
      }
    });

    // Handle Calculate button and OCR trigger
    const calculate = [...document.querySelectorAll("button, input[type=button], input[type=submit], a")].find(el => {
      const txt = norm(el.innerText || el.value || "");
      return txt.includes("calculate") && (el.offsetWidth || el.offsetHeight);
    });

    if (calculate) {
      calculate.addEventListener?.("click", async () => {
        const text = await extractLogoText();
        const logoInput = findInput(["logovalue"]);
        if (logoInput) {
          // if (text) {
          //   // setValue(logoInput, text.toUpperCase());

          // }
          // Scroll and bring focus directly to the logo input
          logoInput.scrollIntoView?.({ behavior: "smooth", block: "center" });
          logoInput.focus();

          console.log({ text })
          const extractedText = text
          if (text) {
            logoInput.value = "";
            let index = 0;

            const typingInterval = setInterval(() => {
              logoInput.value += extractedText[index];
              index++;

              if (index >= extractedText.length) {
                clearInterval(typingInterval);
              }
            }, 200); // 300ms delay between characters
          }


        }
      });
    }

    if (p.autoCalc !== false) {
      if (calculate) {
        setTimeout(() => {
          const EventCtor = typeof MouseEvent !== "undefined" ? MouseEvent : Event;
          calculate.dispatchEvent(new EventCtor("mousedown", { bubbles: true, cancelable: true, view: window }));
          calculate.dispatchEvent(new EventCtor("mouseup", { bubbles: true, cancelable: true, view: window }));
          calculate.click();
        }, 250);
        notice("Autofill complete. Calculate clicked. Enter logo.", false);
      } else {
        notice("Autofill complete. Please click Calculate manually.", false);
      }
    } else {
      notice("Autofill complete. Enter logo.", false);
    }



    return filled;
  }

  // Helper to click or select option in native select or custom Angular Material mat-select
  async function selectDropdownOption(containerOrSelect, optionText) {
    if (!containerOrSelect) return false;
    const normTarget = norm(optionText);

    // 1. If native HTMLSelectElement
    if (containerOrSelect.tagName === "SELECT") {
      const opt = [...containerOrSelect.options].find(o => norm(o.text).includes(normTarget));
      if (opt) {
        containerOrSelect.value = opt.value;
        setValue(containerOrSelect, opt.value);
        return true;
      }
    }

    // 2. Locate the precise clickable trigger inside the mat-form-field
    const trigger = (
      containerOrSelect.querySelector?.(".mat-select-trigger, [cdk-overlay-origin], mat-select") ||
      (containerOrSelect.classList?.contains("mat-select-trigger") ? containerOrSelect : null) ||
      containerOrSelect
    );

    const EventCtor = typeof MouseEvent !== "undefined" ? MouseEvent : Event;

    // Focus and click the trigger to open the Angular CDK overlay
    trigger.focus?.();
    trigger.dispatchEvent(new EventCtor("mousedown", { bubbles: true, cancelable: true, view: window }));
    trigger.dispatchEvent(new EventCtor("mouseup", { bubbles: true, cancelable: true, view: window }));
    trigger.click();
    trigger.dispatchEvent(new EventCtor("click", { bubbles: true, cancelable: true, view: window }));

    // Wait for the overlay mat-option to appear
    const option = await waitFor(() => {
      // Angular Material mounts mat-option inside .cdk-overlay-container
      const options = [...document.querySelectorAll("mat-option, .mat-option, [role='option']")].filter(
        el => (el.offsetWidth || el.offsetHeight)
      );
      return options.find(el => {
        const txt = norm(el.innerText || el.textContent || "");
        return txt === normTarget || txt.includes(normTarget);
      }) || null;
    }, 4500, 150);

    if (option) {
      await new Promise(r => setTimeout(r, 150));
      option.scrollIntoView?.({ block: "nearest" });
      option.dispatchEvent(new EventCtor("mousedown", { bubbles: true, cancelable: true, view: window }));
      option.dispatchEvent(new EventCtor("mouseup", { bubbles: true, cancelable: true, view: window }));
      option.click();
      option.dispatchEvent(new EventCtor("click", { bubbles: true, cancelable: true, view: window }));
      await new Promise(r => setTimeout(r, 300));
      return true;
    }

    return false;
  }

  // STEP 5: Handle GRIPS Payment Portal (wbifms.gov.in/GRIPS/v2/#/g2-payment)
  async function handleGripsPayment(profile) {
    notice("GRIPS Payment page detected...", false);

    // --- STEP 5.1: Review and Confirmation (Step 1) ---
    const checkbox = await waitFor(() => {
      const checkboxes = [...document.querySelectorAll("input[type='checkbox']")];
      return checkboxes.find(cb => {
        const context = norm([
          cb.id,
          cb.name,
          cb.parentElement?.innerText,
          cb.closest("label, div, p")?.innerText
        ].join(" "));
        return context.includes("verified and checked") || context.includes("verified");
      }) || null;
    }, 2500);

    if (checkbox && !checkbox.checked) {
      checkbox.checked = true;
      checkbox.dispatchEvent(new Event("change", { bubbles: true }));
      checkbox.dispatchEvent(new Event("input", { bubbles: true }));
      checkbox.click();
      notice("Checked 'Verified and checked'. Clicking Next...", false);

      await new Promise(r => setTimeout(r, 400));

      const nextBtn = await waitFor(() => {
        const buttons = [...document.querySelectorAll("button, input[type=button], input[type=submit], a")];
        return buttons.find(btn => {
          const txt = norm(btn.innerText || btn.value || "");
          return (txt === "next" || txt.includes("next")) && (btn.offsetWidth || btn.offsetHeight) && !btn.disabled;
        }) || null;
      }, 3000);

      if (nextBtn) {
        nextBtn.click();
        notice("Review step completed. Loading Payment Mode selection...", false);
      }
    }

    // --- STEP 5.2: Payment Mode and Bank Selection (Step 2) ---
    notice("Loading Payment Mode & Bank Selection...", false);
    await new Promise(r => setTimeout(r, 800));

    // Find Payment Mode: mat-select with label 'Payment Mode' or id containing mat-select
    const paymentModeSelect = await waitFor(() => {
      // 1. By ID or label from the actual DOM provided
      const byLabel = document.querySelector("mat-select[aria-labelledby*='mat-form-field-label-1'], #mat-select-0");
      if (byLabel && (byLabel.offsetWidth || byLabel.offsetHeight)) return byLabel;

      // 2. By context 'Payment Mode'
      const allSelects = [...document.querySelectorAll("mat-select, [role='combobox']")].filter(
        el => (el.offsetWidth || el.offsetHeight)
      );
      const match = allSelects.find(el => {
        const labelText = norm(el.closest(".mat-form-field")?.querySelector(".mat-form-field-label")?.innerText || "");
        return labelText.includes("payment mode");
      });
      return match || allSelects[0] || null;
    }, 10000, 200);

    if (paymentModeSelect) {
      notice("Selecting Payment Mode: SBI Epay...", false);
      const paymentModeTarget = profile.paymentMode || "SBI Epay";
      await selectDropdownOption(paymentModeSelect, paymentModeTarget);

      // Delay for Angular to process selection and render the 'Pay through' dropdown
      await new Promise(r => setTimeout(r, 1200));

      // Find Pay through: mat-select with label 'Pay through' or 'Bank'
      const payThroughSelect = await waitFor(() => {
        // 1. By label/ID from DOM
        const byLabel = document.querySelector("mat-select[aria-labelledby*='mat-form-field-label-3'], #mat-select-2");
        if (byLabel && (byLabel.offsetWidth || byLabel.offsetHeight)) return byLabel;

        // 2. By context 'Pay through' or 'Bank'
        const allSelects = [...document.querySelectorAll("mat-select, [role='combobox']")].filter(
          el => (el.offsetWidth || el.offsetHeight) && el !== paymentModeSelect
        );
        const match = allSelects.find(el => {
          const labelText = norm(el.closest(".mat-form-field")?.querySelector(".mat-form-field-label")?.innerText || "");
          return labelText.includes("pay through") || labelText.includes("bank");
        });
        return match || allSelects[0] || null;
      }, 8000, 200);

      if (payThroughSelect) {
        notice("Selecting Pay through: Payment Gateway/Bank...", false);
        const payThroughTarget = profile.payThrough || "Payment Gateway";
        await selectDropdownOption(payThroughSelect, payThroughTarget);

        await new Promise(r => setTimeout(r, 800));

        // Click NEXT button on Step 2
        const nextBtn2 = await waitFor(() => {
          const buttons = [...document.querySelectorAll("button, input[type=button], input[type=submit], a")];
          return buttons.find(btn => {
            const txt = norm(btn.innerText || btn.value || "");
            return (txt === "next" || txt.includes("next")) && (btn.offsetWidth || btn.offsetHeight) && !btn.disabled;
          }) || null;
        }, 6000, 200);

        if (nextBtn2) {
          nextBtn2.scrollIntoView?.({ block: "center" });
          nextBtn2.click();
          notice("Selected SBI Epay & Payment Gateway. Clicked Next.", false);
        }
      }
    }

    // --- STEP 5.3: Transaction Details & Pay Now (Step 3) ---
    notice("Waiting for Transaction Details & Pay Now button...", false);
    const payNowBtn = await waitFor(() => {
      const buttons = [...document.querySelectorAll("button, input[type=button], input[type=submit], a")];
      return buttons.find(btn => {
        const txt = norm(btn.innerText || btn.value || "");
        return (txt === "pay now" || txt.includes("pay now")) && (btn.offsetWidth || btn.offsetHeight) && !btn.disabled;
      }) || null;
    }, 12000, 300);

    if (payNowBtn) {
      await new Promise(r => setTimeout(r, 600));
      payNowBtn.scrollIntoView?.({ block: "center" });
      payNowBtn.click();
      notice("Pay Now clicked! Redirecting to Payment Gateway...", false);
      return "Pay Now clicked. Final payment redirect in progress.";
    }

    return "GRIPS payment automation in progress.";
  }

  // STEP 6: Handle SBI ePay Gateway (epay.sbi.bank.in)
  async function handleSbiEpay() {
    notice("SBI ePay gateway detected. Selecting NEFT tab...", false);

    // Wait for the NEFT element in .side_nav
    const neftTab = await waitFor(() => {
      // 1. Direct ID / class from provided DOM
      const direct = document.querySelector("#activeNEFT a, li#activeNEFT, a.collapse5");
      if (direct && (direct.offsetWidth || direct.offsetHeight)) return direct;

      // 2. Fallback search by text within .side_nav
      const navLinks = [...document.querySelectorAll(".side_nav a, .side_nav li, a, button")].filter(
        el => (el.offsetWidth || el.offsetHeight)
      );
      return navLinks.find(el => {
        const txt = norm(el.innerText || el.textContent || "");
        return txt === "neft" || txt.includes("neft");
      }) || null;
    }, 10000, 200);

    if (neftTab) {
      await new Promise(r => setTimeout(r, 400));
      neftTab.scrollIntoView?.({ block: "center" });

      const EventCtor = typeof MouseEvent !== "undefined" ? MouseEvent : Event;
      neftTab.dispatchEvent(new EventCtor("mousedown", { bubbles: true, cancelable: true, view: window }));
      neftTab.dispatchEvent(new EventCtor("mouseup", { bubbles: true, cancelable: true, view: window }));
      neftTab.click();
      neftTab.dispatchEvent(new EventCtor("click", { bubbles: true, cancelable: true, view: window }));

      notice("NEFT selected! Ready for Pay Now.", false);
      return "NEFT tab selected on SBI ePay.";
    } else {
      notice("NEFT tab not found on SBI ePay.", true);
      return "NEFT tab not found.";
    }
  }

  // Master action router
  async function runAction(profile) {
    const url = window.location.href;
    if (url.includes("avilable-slot")) {
      const res = await handleAvailableSlots(profile);
      return res;
    } else if (url.includes("slot-booking") || url.includes("booking")) {
      const filled = handleBookingForm(profile);
      return "Filled: " + (filled.join(", ") || "No matching fields found");
    } else if (url.includes("wbifms.gov.in") || url.includes("g2-payment") || url.includes("GRIPS")) {
      const res = await handleGripsPayment(profile);
      return res;
    } else if (url.includes("epay.sbi.bank.in") || url.includes("AggregatorHostedListener")) {
      const res = await handleSbiEpay();
      return res;
    } else {
      notice("Ready. Navigate to slot, booking or payment page.", false);
      return "Current page is not recognized as slot, booking, or payment form.";
    }
  }

  // Listen for popup messages
  chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {
    if (msg?.type === "SUVIDHA_TRIGGER" || msg?.type === "SUVIDHA_AUTOFILL") {
      runAction(msg.profile || {}).then(resMsg => {
        sendResponse({ message: resMsg });
      });
      return true; // async response
    }
  });

  // Auto-run on page load if enabled in profile (or auto-handle payment portals)
  chrome.storage.local.get("profile", ({ profile }) => {
    const isPaymentPortal = (
      window.location.href.includes("wbifms.gov.in") ||
      window.location.href.includes("g2-payment") ||
      window.location.href.includes("epay.sbi.bank.in")
    );
    if (profile?.autoRun || isPaymentPortal) {
      setTimeout(() => runAction(profile || {}), 600);
    }
  });

  // Error detection via MutationObserver (using textContent to prevent layout thrashing)
  new MutationObserver(() => {
    const text = norm(document.body?.textContent);
    if (text.includes("logo code does not match")) {
      notice("logo failed. Please check and enter it again.", true);
    }
  }).observe(document.body, { subtree: true, childList: true });

})();
