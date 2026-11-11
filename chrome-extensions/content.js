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
    async function extractLogoText() {
      const img = document.getElementById("captcha");
      if (!img) {
        notice("Logo image element not found.", true);
        return null;
      }
      notice("Solving captcha via Vision API...", false);
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
        console.log({ base64Image });
        if (response?.error) {
          throw new Error(response.error);
        }
        let cleaned = (response?.text || "").replace(/[^a-zA-Z0-9]/g, "").trim().toUpperCase();
        if (cleaned.length > 6) {
          cleaned = cleaned.substring(0, 6);
        }
        console.log("[API OCR Result]:", cleaned);
        notice(`API Solved: ${cleaned}`, false);
        return cleaned;
      } catch (err) {
        console.error("API Vision error:", err);
        notice("Failed to solve captcha via API.", true);
        return null;
      }
    }
    function setValue(el, value) {
      if (!el || value === void 0 || value === null || value === "") return false;
      const proto = el instanceof HTMLTextAreaElement ? HTMLTextAreaElement.prototype : el instanceof HTMLSelectElement ? HTMLSelectElement.prototype : HTMLInputElement.prototype;
      const setter = Object.getOwnPropertyDescriptor(proto, "value")?.set;
      if (setter) setter.call(el, String(value));
      else el.value = String(value);
      el.dispatchEvent(new Event("input", { bubbles: true }));
      el.dispatchEvent(new Event("change", { bubbles: true }));
      return true;
    }
    function findInput(terms) {
      const inputs = [...document.querySelectorAll("input:not([type=hidden]), textarea")].filter(
        (el) => el.offsetWidth || el.offsetHeight
      );
      const directMatch = inputs.find((el) => {
        const directContext = norm([
          el.id,
          el.name,
          el.placeholder,
          el.getAttribute("aria-label"),
          [...el.labels || []].map((x) => x.innerText || x.textContent).join(" ")
        ].join(" "));
        return terms.some((t) => directContext.includes(t));
      });
      if (directMatch) return directMatch;
      return inputs.find((el) => {
        const parent = el.closest && el.closest(".form-group, .form-row, td, tr, label") || el.parentElement;
        if (!parent || parent === document.body || parent.tagName === "FORM") return false;
        const parentText = norm(parent.innerText || parent.textContent);
        return terms.some((t) => parentText.includes(t));
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
    function extractDay(dateStr) {
      if (!dateStr) return null;
      const str = String(dateStr).trim();
      const ymd = str.match(/^(\d{4})-(\d{1,2})-(\d{1,2})$/);
      if (ymd) return parseInt(ymd[3], 10);
      const slash = str.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/);
      if (slash) {
        const p1 = parseInt(slash[1], 10);
        const p2 = parseInt(slash[2], 10);
        if (p1 > 12) return p1;
        if (p2 > 12) return p2;
        return p1;
      }
      const num = parseInt(str, 10);
      if (!isNaN(num) && num >= 1 && num <= 31) return num;
      return null;
    }
    function findAvailableSlot(targetDay, targetDateIso = null) {
      const slots = [...document.querySelectorAll(".slot_available, .slot_available_reschedule, [data-booking_date]")];
      if (targetDay === null && !targetDateIso) {
        if (slots.length > 0) return slots[0];
        const cells2 = [...document.querySelectorAll("td, div[class*='cell'], div[class*='day']")];
        for (const cell of cells2) {
          const action = cell.querySelector("a, button, [class*='badge'], [class*='slot'], i.fa, i[class*='plus']");
          if (action) return action.closest && action.closest("a, button, [onclick]") || action;
        }
        return null;
      }
      if (slots.length > 0) {
        const match = slots.find((s) => {
          const bd = (s.getAttribute("data-booking_date") || s.dataset?.booking_date || s.dataset?.bookingDate || "").trim();
          if (targetDateIso && bd) {
            return bd === targetDateIso;
          }
          const ymd = bd.match(/^(\d{4})-(\d{1,2})-(\d{1,2})$/);
          if (ymd && parseInt(ymd[3], 10) === targetDay) return true;
          const cell = s.closest && s.closest("td, div[class*='cell'], div[class*='day']") || s.parentElement;
          if (cell) {
            const txt = (cell.innerText || cell.textContent || "").trim();
            const tokens = txt.split(/[\s\n\r\t]+/);
            if (tokens.some((t) => t.replace(/\D/g, "") === String(targetDay))) return true;
          }
          return false;
        });
        if (match) return match;
      }
      const cells = [...document.querySelectorAll("td, div[class*='cell'], div[class*='day']")];
      if (targetDay !== null) {
        const targetCell = cells.find((cell) => {
          const txt = (cell.innerText || cell.textContent || "").trim();
          const tokens = txt.split(/[\s\n\r\t]+/);
          return tokens.some((t) => t.replace(/\D/g, "") === String(targetDay));
        });
        if (targetCell) {
          const action = targetCell.querySelector("a, button, [class*='badge'], [class*='slot'], i.fa, i[class*='plus']");
          return action && action.closest && action.closest("a, button, [onclick]") || action || targetCell;
        }
      }
      return null;
    }
    function selectAndSubmitSlot(slotElement) {
      if (!slotElement) return false;
      try {
        slotElement.scrollIntoView?.({ behavior: "smooth", block: "center" });
        const bookingDate = (slotElement.getAttribute("data-booking_date") || slotElement.dataset?.booking_date || slotElement.dataset?.bookingDate || "").trim();
        const eventDateInputs = document.querySelectorAll(".event-date, input[name='event_date'], input[name='booking_date']");
        eventDateInputs.forEach((input) => {
          if (bookingDate) input.value = bookingDate;
          input.dispatchEvent(new Event("input", { bubbles: true }));
          input.dispatchEvent(new Event("change", { bubbles: true }));
        });
        const target = slotElement.closest && slotElement.closest(".slot_available") || slotElement;
        const EventCtor = typeof MouseEvent !== "undefined" ? MouseEvent : Event;
        target.dispatchEvent(new EventCtor("mousedown", { bubbles: true, cancelable: true, view: window }));
        target.dispatchEvent(new EventCtor("mouseup", { bubbles: true, cancelable: true, view: window }));
        try {
          if (typeof PointerEvent !== "undefined") {
            const clickEvent = new PointerEvent("click", {
              bubbles: true,
              cancelable: true,
              view: window
            });
            target.dispatchEvent(clickEvent);
          } else {
            target.click?.();
          }
        } catch (clickErr) {
          if (typeof target.onclick === "function") {
            target.onclick();
          } else {
            target.click?.();
          }
        }
        const form = target.closest && target.closest("form") || document.querySelector("form");
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
      } catch (globalErr) {
        console.error("[Suvidha Assistant] Safe slot selection error handled:", globalErr);
        return false;
      }
    }
    async function handleAvailableSlots(profile) {
      notice("Processing slot selection...");
      const typeSelect = [...document.querySelectorAll("select")].find((sel) => {
        const context = norm([
          sel.id,
          sel.name,
          [...sel.labels || []].map((x) => x.innerText).join(" "),
          sel.parentElement?.innerText
        ].join(" "));
        return context.includes("type of goods") && (sel.offsetWidth || sel.offsetHeight);
      }) || document.querySelector("select");
      if (typeSelect && profile.goodsType) {
        const targetOption = [...typeSelect.options].find(
          (opt) => norm(opt.text).includes(norm(profile.goodsType))
        );
        if (targetOption && typeSelect.value !== targetOption.value) {
          typeSelect.value = targetOption.value;
          setValue(typeSelect, targetOption.value);
          notice(`Selected Type: ${targetOption.text}`);
        }
      }
      const goodsSelect = await waitFor(() => {
        const selects = [...document.querySelectorAll("select")].filter(
          (s) => s !== typeSelect && (s.offsetWidth || s.offsetHeight)
        );
        return selects.find((s) => s.options.length > 1) || null;
      }, 6e3);
      if (goodsSelect && profile.goodsCategory) {
        const targetCat = norm(profile.goodsCategory);
        const catOption = [...goodsSelect.options].find((opt) => {
          const txt = norm(opt.text);
          return txt.includes(targetCat) || targetCat.includes(txt);
        });
        if (catOption && goodsSelect.value !== catOption.value) {
          goodsSelect.value = catOption.value;
          setValue(goodsSelect, catOption.value);
          notice(`Selected Category: ${catOption.text}`);
        }
      }
      if (profile.autoSlot !== false) {
        const isFirstAvailable = profile.slotMode === "first" || !profile.slotMode && !profile.slotDate;
        const rawSlotDate = isFirstAvailable ? "" : (profile.slotDate || "").trim();
        const targetDateIso = /^\d{4}-\d{2}-\d{2}$/.test(rawSlotDate) ? rawSlotDate : null;
        const targetDay = isFirstAvailable ? null : extractDay(rawSlotDate);
        const slotElement = await waitFor(() => {
          return findAvailableSlot(targetDay, targetDateIso);
        }, 8e3);
        if (slotElement) {
          const label = targetDateIso || (targetDay ? `day ${targetDay}` : "first available date");
          notice(`Found available slot for ${label}. Opening booking form...`, false);
          setTimeout(() => selectAndSubmitSlot(slotElement), 350);
          return `Slot selected for ${label}. Opening booking form...`;
        } else {
          const msg = rawSlotDate ? `Selected date (${rawSlotDate}) is not available. Please click a slot (+) manually.` : "Calendar loaded. Please click the desired slot (+).";
          notice(msg, Boolean(rawSlotDate));
          return "Waiting for manual slot click.";
        }
      }
      return "Slot selection complete.";
    }
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
        if (val === void 0 || val === null || val === "") return;
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
      const calculate = [...document.querySelectorAll("button, input[type=button], input[type=submit], a")].find((el) => {
        const txt = norm(el.innerText || el.value || "");
        return txt.includes("calculate") && (el.offsetWidth || el.offsetHeight);
      });
      if (calculate) {
        calculate.addEventListener?.("click", async () => {
          const text = await extractLogoText();
          const logoInput = findInput(["captchavalue", "captchaValue", "captcha"]);
          if (logoInput) {
            logoInput.scrollIntoView?.({ behavior: "smooth", block: "center" });
            logoInput.focus();
            const extractedText = (text || "").toUpperCase();
            if (extractedText) {
              logoInput.value = "";
              let index = 0;
              notice(`Typing code: ${extractedText}`, false);
              const typingInterval = setInterval(() => {
                if (index < extractedText.length) {
                  const char = extractedText[index];
                  logoInput.value += char;
                  logoInput.dispatchEvent(new KeyboardEvent("keydown", { key: char, bubbles: true }));
                  logoInput.dispatchEvent(new KeyboardEvent("keypress", { key: char, bubbles: true }));
                  logoInput.dispatchEvent(new Event("input", { bubbles: true }));
                  logoInput.dispatchEvent(new KeyboardEvent("keyup", { key: char, bubbles: true }));
                  logoInput.dispatchEvent(new Event("change", { bubbles: true }));
                  index++;
                } else {
                  clearInterval(typingInterval);
                  notice("Typing complete! Proceeding...", false);
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
                  }, 200);
                }
              }, 150);
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
          notice("Review step completed. Loading Payment Mode selection...", false);
        }
      }
      notice("Loading Payment Mode & Bank Selection...", false);
      await new Promise((r) => setTimeout(r, 800));
      const paymentModeSelect = await waitFor(() => {
        const byLabel = document.querySelector("mat-select[aria-labelledby*='mat-form-field-label-1'], #mat-select-0");
        if (byLabel && (byLabel.offsetWidth || byLabel.offsetHeight)) return byLabel;
        const allSelects = [...document.querySelectorAll("mat-select, [role='combobox']")].filter(
          (el) => el.offsetWidth || el.offsetHeight
        );
        const match = allSelects.find((el) => {
          const labelText = norm(el.closest(".mat-form-field")?.querySelector(".mat-form-field-label")?.innerText || "");
          return labelText.includes("payment mode");
        });
        return match || allSelects[0] || null;
      }, 1e4, 200);
      if (paymentModeSelect) {
        notice("Selecting Payment Mode: SBI Epay...", false);
        const paymentModeTarget = profile.paymentMode || "SBI Epay";
        await selectDropdownOption(paymentModeSelect, paymentModeTarget);
        await new Promise((r) => setTimeout(r, 1200));
        const payThroughSelect = await waitFor(() => {
          const byLabel = document.querySelector("mat-select[aria-labelledby*='mat-form-field-label-3'], #mat-select-2");
          if (byLabel && (byLabel.offsetWidth || byLabel.offsetHeight)) return byLabel;
          const allSelects = [...document.querySelectorAll("mat-select, [role='combobox']")].filter(
            (el) => (el.offsetWidth || el.offsetHeight) && el !== paymentModeSelect
          );
          const match = allSelects.find((el) => {
            const labelText = norm(el.closest(".mat-form-field")?.querySelector(".mat-form-field-label")?.innerText || "");
            return labelText.includes("pay through") || labelText.includes("bank");
          });
          return match || allSelects[0] || null;
        }, 8e3, 200);
        if (payThroughSelect) {
          notice("Selecting Pay through: Payment Gateway/Bank...", false);
          const payThroughTarget = profile.payThrough || "Payment Gateway";
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
            notice("Selected SBI Epay & Payment Gateway. Clicked Next.", false);
          }
        }
      }
      notice("Waiting for Transaction Details & Pay Now button...", false);
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
        notice("Pay Now clicked! Redirecting to Payment Gateway...", false);
        return "Pay Now clicked. Final payment redirect in progress.";
      }
      return "GRIPS payment automation in progress.";
    }
    async function handleSbiEpay() {
      notice("SBI ePay gateway detected. Selecting NEFT tab...", false);
      const neftTab = await waitFor(() => {
        const direct = document.querySelector("#activeNEFT a, li#activeNEFT, a.collapse5");
        if (direct && (direct.offsetWidth || direct.offsetHeight)) return direct;
        const navLinks = [...document.querySelectorAll(".side_nav a, .side_nav li, a, button")].filter(
          (el) => el.offsetWidth || el.offsetHeight
        );
        return navLinks.find((el) => {
          const txt = norm(el.innerText || el.textContent || "");
          return txt === "neft" || txt.includes("neft");
        }) || null;
      }, 1e4, 200);
      if (neftTab) {
        await new Promise((r) => setTimeout(r, 400));
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
    chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {
      if (msg?.type === "SUVIDHA_TRIGGER" || msg?.type === "SUVIDHA_AUTOFILL") {
        runAction(msg.profile || {}).then((resMsg) => {
          sendResponse({ message: resMsg });
        });
        return true;
      }
    });
    chrome.storage.local.get("profile", ({ profile }) => {
      const isPaymentPortal = window.location.href.includes("wbifms.gov.in") || window.location.href.includes("g2-payment") || window.location.href.includes("epay.sbi.bank.in");
      if (profile?.autoRun || isPaymentPortal) {
        setTimeout(() => runAction(profile || {}), 600);
      }
    });
    new MutationObserver(() => {
      const text = norm(document.body?.textContent);
      if (text.includes("logo code does not match")) {
        notice("logo failed. Please check and enter it again.", true);
      }
    }).observe(document.body, { subtree: true, childList: true });
  })();
})();
//# sourceMappingURL=content.js.map
