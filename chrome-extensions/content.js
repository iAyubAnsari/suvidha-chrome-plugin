(() => {
  // src/content.js
  (() => {
    if (window.__suvidhaAssistantLoaded) return;
    window.__suvidhaAssistantLoaded = true;
    const norm = (s) => (s || "").replace(/[_\-]+/g, " ").replace(/\s+/g, " ").trim().toLowerCase();
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
    function setValue(el, value) {
      if (!el || value === void 0 || value === null || value === "") return false;
      if (el.type === "date" && !/^\d{4}-\d{2}-\d{2}$/.test(String(value))) {
        return false;
      }
      if (el.maxLength && el.maxLength > 0 && el.maxLength < String(value).length) {
        el.maxLength = String(value).length + 5;
      }
      const proto = el instanceof HTMLTextAreaElement ? HTMLTextAreaElement.prototype : el instanceof HTMLSelectElement ? HTMLSelectElement.prototype : HTMLInputElement.prototype;
      const setter = Object.getOwnPropertyDescriptor(proto, "value")?.set;
      if (setter) setter.call(el, String(value));
      else el.value = String(value);
      el.dispatchEvent(new Event("input", { bubbles: true }));
      el.dispatchEvent(new Event("change", { bubbles: true }));
      return true;
    }
    function findSmartInput(spec, usedElements = /* @__PURE__ */ new Set()) {
      const {
        terms = [],
        negativeTerms = [],
        expectedType = "text",
        // "text" | "date" | "number"
        allowTextarea = false
      } = spec;
      const allInputs = [...document.querySelectorAll("input:not([type=hidden]), textarea")].filter((el) => {
        if (usedElements.has(el)) return false;
        const t = (el.type || "text").toLowerCase();
        if (t === "hidden" || t === "submit" || t === "button" || t === "checkbox" || t === "radio") return false;
        if (el.disabled || el.readOnly || el.getAttribute("aria-readonly") === "true") return false;
        if (!el.offsetWidth && !el.offsetHeight) return false;
        if (el.tagName === "TEXTAREA" && !allowTextarea) return false;
        return true;
      });
      let bestElement = null;
      let highestScore = -Infinity;
      for (const el of allInputs) {
        let score = 0;
        const elType = (el.type || "text").toLowerCase();
        if (expectedType === "date") {
          if (elType === "date") score += 60;
          else if (elType === "text") score += 20;
          else score -= 200;
        } else if (expectedType === "number") {
          if (elType === "number") score += 70;
          else if (el.getAttribute("min") !== null || el.getAttribute("max") !== null) score += 30;
          else if (elType === "text") score += 15;
          else if (elType === "date") score -= 250;
          else score -= 100;
        } else {
          if (elType === "date") score -= 300;
          else if (elType === "number") score -= 80;
          else if (elType === "text" || el.tagName === "TEXTAREA") score += 30;
        }
        const directContext = norm([
          el.id,
          el.name,
          el.placeholder,
          el.getAttribute("aria-label"),
          [...el.labels || []].map((l) => l.innerText || l.textContent).join(" ")
        ].join(" "));
        for (const term of terms) {
          if (directContext === term) {
            score += 100;
            break;
          } else if (directContext.includes(term)) {
            score += 60;
            break;
          }
        }
        for (const neg of negativeTerms) {
          if (directContext.includes(neg)) {
            score -= 120;
            break;
          }
        }
        const parent = el.closest && el.closest(".form-group, .form-row, td, tr, label, div") || el.parentElement;
        if (parent && parent !== document.body && parent.tagName !== "FORM") {
          const parentText = norm(parent.innerText || parent.textContent || "");
          for (const term of terms) {
            if (parentText.includes(term)) {
              score += 35;
              break;
            }
          }
          for (const neg of negativeTerms) {
            if (parentText.includes(neg)) {
              score -= 90;
              break;
            }
          }
        }
        if (score > highestScore && score >= 35) {
          highestScore = score;
          bestElement = el;
        }
      }
      if (bestElement) {
        usedElements.add(bestElement);
      }
      return bestElement;
    }
    function findInput(terms, options = {}) {
      return findSmartInput({
        terms,
        negativeTerms: options.negativeTerms || [],
        expectedType: options.excludeDate ? "text" : options.onlyDate ? "date" : "text",
        ...options
      });
    }
    function waitFor(predicate, timeoutMs = 8e3, intervalMs = 200) {
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
    async function selectDropdownOption(containerOrSelect, optionText) {
      if (!containerOrSelect) return false;
      const normTarget = norm(optionText);
      if (containerOrSelect.tagName === "SELECT") {
        const opt = [...containerOrSelect.options].find((o) => norm(o.text).includes(normTarget));
        if (opt) {
          containerOrSelect.value = opt.value;
          setValue(containerOrSelect, opt.value);
          return true;
        }
      }
      const trigger = containerOrSelect.querySelector?.(".mat-select-trigger, [cdk-overlay-origin], mat-select") || (containerOrSelect.classList?.contains("mat-select-trigger") ? containerOrSelect : null) || containerOrSelect;
      const EventCtor = typeof MouseEvent !== "undefined" ? MouseEvent : Event;
      trigger.focus?.();
      trigger.dispatchEvent(new EventCtor("mousedown", { bubbles: true, cancelable: true, view: window }));
      trigger.dispatchEvent(new EventCtor("mouseup", { bubbles: true, cancelable: true, view: window }));
      trigger.click();
      trigger.dispatchEvent(new EventCtor("click", { bubbles: true, cancelable: true, view: window }));
      const option = await waitFor(() => {
        const options = [...document.querySelectorAll("mat-option, .mat-option, [role='option']")].filter(
          (el) => el.offsetWidth || el.offsetHeight
        );
        return options.find((el) => {
          const txt = norm(el.innerText || el.textContent || "");
          return txt === normTarget || txt.includes(normTarget);
        }) || null;
      }, 4500, 150);
      if (option) {
        await new Promise((r) => setTimeout(r, 150));
        option.scrollIntoView?.({ block: "nearest" });
        option.dispatchEvent(new EventCtor("mousedown", { bubbles: true, cancelable: true, view: window }));
        option.dispatchEvent(new EventCtor("mouseup", { bubbles: true, cancelable: true, view: window }));
        option.click();
        option.dispatchEvent(new EventCtor("click", { bubbles: true, cancelable: true, view: window }));
        await new Promise((r) => setTimeout(r, 300));
        return true;
      }
      return false;
    }
    async function extractCaptchaText() {
      const img = document.getElementById("captcha") || document.querySelector("img[src*='captcha'], img[id*='captcha'], img[src*='logo'], #logo");
      if (!img) {
        notice("Captcha image element not found.", true);
        return null;
      }
      notice("Solving captcha via OCR...", false);
      try {
        const canvas = document.createElement("canvas");
        canvas.width = img.naturalWidth || img.width || 200;
        canvas.height = img.naturalHeight || img.height || 50;
        const ctx = canvas.getContext("2d");
        if (ctx) {
          ctx.drawImage(img, 0, 0);
        }
        const base64Image = canvas.toDataURL("image/png");
        const response = await chrome.runtime.sendMessage({
          type: "SOLVE_CAPTCHA_API",
          imageBase64: base64Image
        });
        if (response?.error) {
          throw new Error(response.error);
        }
        let cleaned = (response?.text || "").replace(/[^a-zA-Z0-9]/g, "").trim().toUpperCase();
        if (cleaned.length > 6) {
          cleaned = cleaned.substring(0, 6);
        }
        notice(`Captcha decoded: ${cleaned}`, false);
        return cleaned;
      } catch (err) {
        console.error("[Suvidha Assistant] OCR error:", err);
        notice(err.message || "Failed to solve captcha.", true);
        return null;
      }
    }
    async function solveAndTypeCaptcha() {
      const logoInput = findInput(
        ["captchavalue", "captchacode", "captcha", "logo", "logocode", "enter logo code"],
        { excludeDate: true }
      );
      if (!logoInput) {
        notice("Captcha input field not found.", true);
        return;
      }
      logoInput.scrollIntoView?.({ behavior: "smooth", block: "center" });
      logoInput.focus();
      const text = await extractCaptchaText();
      if (!text) return;
      logoInput.value = "";
      let index = 0;
      notice(`Typing code: ${text}`, false);
      const typingInterval = setInterval(() => {
        if (index < text.length) {
          const char = text[index];
          logoInput.value += char;
          logoInput.dispatchEvent(new KeyboardEvent("keydown", { key: char, bubbles: true }));
          logoInput.dispatchEvent(new KeyboardEvent("keypress", { key: char, bubbles: true }));
          logoInput.dispatchEvent(new Event("input", { bubbles: true }));
          logoInput.dispatchEvent(new KeyboardEvent("keyup", { key: char, bubbles: true }));
          logoInput.dispatchEvent(new Event("change", { bubbles: true }));
          index++;
        } else {
          clearInterval(typingInterval);
          notice("Captcha entered! Proceeding to payment...", false);
          setTimeout(() => {
            const paymentBtn = [...document.querySelectorAll("button, input[type=submit], input[type=button], a")].find((el) => {
              const txt = norm(el.innerText || el.value || el.textContent || "");
              return txt.includes("proceed to payment") && (el.offsetWidth || el.offsetHeight);
            });
            if (paymentBtn) {
              notice("Clicking Proceed to payment...", false);
              const EventCtor = typeof MouseEvent !== "undefined" ? MouseEvent : Event;
              paymentBtn.dispatchEvent(new EventCtor("mousedown", { bubbles: true, cancelable: true, view: window }));
              paymentBtn.dispatchEvent(new EventCtor("mouseup", { bubbles: true, cancelable: true, view: window }));
              paymentBtn.click();
            } else {
              notice("Proceed to payment button not found.", true);
            }
          }, 300);
        }
      }, 120);
    }
    function formatUdin(val) {
      if (!val) return "";
      const str = String(val).trim().toUpperCase();
      const cleanAlnum = str.replace(/[^A-Z0-9]/g, "");
      if (cleanAlnum.length === 25) {
        return `${cleanAlnum.slice(0, 2)}-${cleanAlnum.slice(2, 3)}-${cleanAlnum.slice(3, 11)}-${cleanAlnum.slice(11, 12)}-${cleanAlnum.slice(12, 25)}`;
      }
      const parts = str.split(/[\s\-_]+/).filter(Boolean);
      if (parts.length === 5 && cleanAlnum.length === 25) {
        return parts.join("-");
      }
      return str;
    }
    function handleBookingForm(p) {
      notice("Filling booking details...");
      const usedElements = /* @__PURE__ */ new Set();
      const fieldSpecs = [
        {
          label: "Goods",
          val: p.goods,
          expectedType: "text",
          terms: ["goods you want to export", "name of the goods", "name of goods", "goods name"],
          negativeTerms: ["category", "type", "date"]
        },
        {
          label: "UDIN",
          val: formatUdin(p.udin),
          expectedType: "text",
          terms: ["25 alphanumeric udin", "udin of lc", "udin"],
          negativeTerms: ["date"]
        },
        {
          label: "LC number",
          val: p.lcNumber ? String(p.lcNumber).trim().slice(0, 16) : "",
          expectedType: "text",
          terms: ["enter the lc number", "lc number", "lc no"],
          negativeTerms: ["date"]
        },
        {
          label: "LC date",
          val: p.lcDate,
          expectedType: "date",
          terms: ["mm/dd/yyyy", "lc date", "date of lc"],
          negativeTerms: ["arrival", "tentative", "booking", "reschedule", "expiry"]
        },
        {
          label: "Importer",
          val: p.importer,
          expectedType: "text",
          terms: ["name of the importer", "name of importer", "importer name", "importer"],
          negativeTerms: ["exporter"]
        },
        {
          label: "Vehicles",
          val: p.vehicles,
          expectedType: "number",
          terms: ["enter total number of vehicle", "total number of vehicles", "number of vehicles", "vehicles"],
          negativeTerms: ["date"]
        }
      ];
      const filled = [];
      fieldSpecs.forEach((spec) => {
        if (spec.val === void 0 || spec.val === null || spec.val === "") return;
        const el = findSmartInput(spec, usedElements);
        if (el) {
          let formattedVal = spec.val;
          if (spec.label === "LC date") {
            if (el.type !== "date" && /^\d{4}-\d{2}-\d{2}$/.test(spec.val)) {
              const [yyyy, mm, dd] = spec.val.split("-");
              formattedVal = `${mm}/${dd}/${yyyy}`;
            } else if (el.type === "date" && /^\d{1,2}\/\d{1,2}\/\d{4}$/.test(spec.val)) {
              const [mm, dd, yyyy] = spec.val.split("/");
              formattedVal = `${yyyy}-${mm.padStart(2, "0")}-${dd.padStart(2, "0")}`;
            }
          }
          if (setValue(el, formattedVal)) filled.push(spec.label);
        }
      });
      const logoInput = findSmartInput({
        terms: ["captchavalue", "captchacode", "captcha", "logo", "logocode", "enter logo code"],
        expectedType: "text"
      }, usedElements);
      if (logoInput) {
        logoInput.focus();
      }
      const calculate = [...document.querySelectorAll("button, input[type=button], input[type=submit], a")].find((el) => {
        const txt = norm(el.innerText || el.value || "");
        return txt.includes("calculate") && (el.offsetWidth || el.offsetHeight);
      });
      if (p.autoCalc !== false && calculate) {
        setTimeout(() => {
          const EventCtor = typeof MouseEvent !== "undefined" ? MouseEvent : Event;
          calculate.dispatchEvent(new EventCtor("mousedown", { bubbles: true, cancelable: true, view: window }));
          calculate.dispatchEvent(new EventCtor("mouseup", { bubbles: true, cancelable: true, view: window }));
          calculate.click();
          notice("Calculate clicked. Solving captcha...", false);
          setTimeout(() => {
            solveAndTypeCaptcha();
          }, 500);
        }, 250);
      } else {
        notice("Autofill complete. Please click Calculate and enter captcha.", false);
      }
      return filled;
    }
    async function handleGripsPayment(profile) {
      notice("GRIPS Payment page detected...", false);
      const checkbox = await waitFor(() => {
        const checkboxes = [...document.querySelectorAll("input[type='checkbox']")];
        return checkboxes.find((cb) => {
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
        await new Promise((r) => setTimeout(r, 400));
        const nextBtn = await waitFor(() => {
          const buttons = [...document.querySelectorAll("button, input[type=button], input[type=submit], a")];
          return buttons.find((btn) => {
            const txt = norm(btn.innerText || btn.value || "");
            return (txt === "next" || txt.includes("next")) && (btn.offsetWidth || btn.offsetHeight) && !btn.disabled;
          }) || null;
        }, 3e3);
        if (nextBtn) {
          nextBtn.click();
          notice("Review step completed. Loading Payment Mode...", false);
        }
      }
      await new Promise((r) => setTimeout(r, 800));
      const paymentModeSelect = await waitFor(() => {
        const byLabel = document.querySelector("mat-select[aria-labelledby*='mat-form-field-label-1'], #mat-select-0");
        if (byLabel && (byLabel.offsetWidth || byLabel.offsetHeight)) return byLabel;
        const allSelects = [...document.querySelectorAll("mat-select, [role='combobox']")].filter(
          (el) => el.offsetWidth || el.offsetHeight
        );
        return allSelects.find((el) => {
          const labelText = norm(el.closest(".mat-form-field")?.querySelector(".mat-form-field-label")?.innerText || "");
          return labelText.includes("payment mode");
        }) || allSelects[0] || null;
      }, 8e3, 200);
      if (paymentModeSelect) {
        const paymentModeTarget = profile.paymentMode || "SBI Epay";
        notice(`Selecting Payment Mode: ${paymentModeTarget}...`, false);
        await selectDropdownOption(paymentModeSelect, paymentModeTarget);
        await new Promise((r) => setTimeout(r, 1200));
        const payThroughSelect = await waitFor(() => {
          const byLabel = document.querySelector("mat-select[aria-labelledby*='mat-form-field-label-3'], #mat-select-2");
          if (byLabel && (byLabel.offsetWidth || byLabel.offsetHeight)) return byLabel;
          const allSelects = [...document.querySelectorAll("mat-select, [role='combobox']")].filter(
            (el) => (el.offsetWidth || el.offsetHeight) && el !== paymentModeSelect
          );
          return allSelects.find((el) => {
            const labelText = norm(el.closest(".mat-form-field")?.querySelector(".mat-form-field-label")?.innerText || "");
            return labelText.includes("pay through") || labelText.includes("bank");
          }) || allSelects[0] || null;
        }, 6e3, 200);
        if (payThroughSelect) {
          const payThroughTarget = profile.payThrough || "Payment Gateway";
          notice(`Selecting Pay through: ${payThroughTarget}...`, false);
          await selectDropdownOption(payThroughSelect, payThroughTarget);
          await new Promise((r) => setTimeout(r, 800));
          const nextBtn2 = await waitFor(() => {
            const buttons = [...document.querySelectorAll("button, input[type=button], input[type=submit], a")];
            return buttons.find((btn) => {
              const txt = norm(btn.innerText || btn.value || "");
              return (txt === "next" || txt.includes("next")) && (btn.offsetWidth || btn.offsetHeight) && !btn.disabled;
            }) || null;
          }, 6e3, 200);
          if (nextBtn2) {
            nextBtn2.scrollIntoView?.({ block: "center" });
            nextBtn2.click();
            notice("Selected SBI Epay & Gateway. Clicked Next.", false);
          }
        }
      }
      const payNowBtn = await waitFor(() => {
        const buttons = [...document.querySelectorAll("button, input[type=button], input[type=submit], a")];
        return buttons.find((btn) => {
          const txt = norm(btn.innerText || btn.value || "");
          return (txt === "pay now" || txt.includes("pay now")) && (btn.offsetWidth || btn.offsetHeight) && !btn.disabled;
        }) || null;
      }, 12e3, 300);
      if (payNowBtn) {
        await new Promise((r) => setTimeout(r, 600));
        payNowBtn.scrollIntoView?.({ block: "center" });
        payNowBtn.click();
        notice("Pay Now clicked! Redirecting to SBI ePay...", false);
        return "Pay Now clicked. Payment redirect in progress.";
      }
      return "GRIPS payment automation in progress.";
    }
    async function handleSbiEpay() {
      notice("SBI ePay gateway detected. Selecting NEFT tab...", false);
      const neftAnchor = await waitFor(() => {
        const direct = document.querySelector(
          "#activeNEFT a.collapse5, #activeNEFT a, a.collapse5, li#activeNEFT a, li.activeNEFT a"
        );
        if (direct && (direct.offsetWidth || direct.offsetHeight || direct.getClientRects().length > 0)) {
          return direct;
        }
        const li = document.querySelector("#activeNEFT, li.activeNEFT");
        if (li) {
          const childAnchor = li.querySelector("a");
          if (childAnchor) return childAnchor;
          if (li.offsetWidth || li.offsetHeight || li.getClientRects().length > 0) return li;
        }
        const navLinks = [...document.querySelectorAll(".side_nav a, .side_nav li, a, button")].filter(
          (el) => el.offsetWidth || el.offsetHeight || el.getClientRects().length > 0
        );
        return navLinks.find((el) => {
          const txt = norm(el.innerText || el.textContent || "");
          return txt === "neft" || txt.startsWith("neft");
        }) || null;
      }, 12e3, 200);
      if (neftAnchor) {
        await new Promise((r) => setTimeout(r, 400));
        neftAnchor.scrollIntoView?.({ block: "center", inline: "center" });
        const target = neftAnchor.tagName === "A" ? neftAnchor : neftAnchor.querySelector("a") || neftAnchor;
        const EventCtor = typeof MouseEvent !== "undefined" ? MouseEvent : Event;
        target.dispatchEvent(new EventCtor("mouseover", { bubbles: true, cancelable: true, view: window }));
        target.dispatchEvent(new EventCtor("mousedown", { bubbles: true, cancelable: true, view: window }));
        target.dispatchEvent(new EventCtor("mouseup", { bubbles: true, cancelable: true, view: window }));
        target.click();
        target.dispatchEvent(new EventCtor("click", { bubbles: true, cancelable: true, view: window }));
        if (typeof target.onclick === "function") {
          try {
            target.onclick.call(target, { target, currentTarget: target, preventDefault: () => {
            } });
          } catch (e) {
          }
        }
        notice("NEFT selected! Ready for Pay Now.", false);
        return "NEFT tab selected on SBI ePay.";
      } else {
        notice("NEFT tab not found on SBI ePay.", true);
        return "NEFT tab not found.";
      }
    }
    async function runAction(profile) {
      const url = window.location.href;
      const isSbiEpay = url.includes("epay.sbi.bank.in") || url.includes("sbiepay.sbi") || url.includes("AggregatorHostedListener") || Boolean(document.querySelector(".side_nav #activeNEFT, #activeNEFT, a.collapse5"));
      if (url.includes("slot-booking") || url.includes("booking")) {
        const filled = handleBookingForm(profile);
        return "Filled: " + (filled.join(", ") || "No matching fields found");
      } else if (url.includes("wbifms.gov.in") || url.includes("g2-payment") || url.includes("GRIPS")) {
        const res = await handleGripsPayment(profile);
        return res;
      } else if (isSbiEpay) {
        const res = await handleSbiEpay();
        return res;
      } else {
        notice("Ready. Open Suvidha slot booking or payment page.", false);
        return "Current page is not recognized as slot booking or payment form.";
      }
    }
    chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {
      if (msg?.type === "SUVIDHA_TRIGGER" || msg?.type === "SUVIDHA_AUTOFILL") {
        runAction(msg.profile || {}).then((resMsg) => {
          sendResponse({ message: resMsg });
        });
        return true;
      }
    });
    chrome.storage.local.get("profile", ({ profile }) => {
      const url = window.location.href;
      const isTargetPage = url.includes("slot-booking") || url.includes("wbifms.gov.in") || url.includes("g2-payment") || url.includes("epay.sbi.bank.in") || url.includes("sbiepay.sbi") || url.includes("AggregatorHostedListener") || Boolean(document.querySelector(".side_nav #activeNEFT, #activeNEFT, a.collapse5"));
      if (profile?.autoRun !== false && isTargetPage || profile?.autoRun && isTargetPage) {
        setTimeout(() => runAction(profile || {}), 600);
      }
    });
    new MutationObserver(() => {
      const text = norm(document.body?.textContent);
      if (text.includes("logo code does not match") || text.includes("captcha does not match")) {
        notice("Captcha verification failed. Please enter it again.", true);
      }
    }).observe(document.body, { subtree: true, childList: true });
  })();
})();
//# sourceMappingURL=content.js.map
