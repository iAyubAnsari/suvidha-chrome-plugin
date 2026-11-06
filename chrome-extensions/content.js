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
        if (p2 === 11) return p1;
        if (p1 === 11) return p2;
        return p1;
      }
      const num = parseInt(str, 10);
      if (!isNaN(num) && num >= 1 && num <= 31) return num;
      return null;
    }
    function findAvailableSlot(targetDay) {
      const slots = [...document.querySelectorAll(".slot_available, .slot_available_reschedule, [data-booking_date]")];
      if (slots.length > 0) {
        if (targetDay !== null) {
          const match = slots.find((s) => {
            const bd = (s.getAttribute("data-booking_date") || s.dataset?.booking_date || s.dataset?.bookingDate || "").trim();
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
        return slots[0];
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
      target.click();
      target.dispatchEvent(new EventCtor("click", { bubbles: true, cancelable: true, view: window }));
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
        const targetDay = extractDay(profile.slotDate) || extractDay(profile.lcDate);
        const slotElement = await waitFor(() => {
          return findAvailableSlot(targetDay);
        }, 8e3);
        if (slotElement) {
          notice(`Found available slot for ${targetDay ? "day " + targetDay : "date"}. Opening booking form...`, false);
          setTimeout(() => selectAndSubmitSlot(slotElement), 350);
          return `Slot selected for ${targetDay ? "day " + targetDay : "date"}. Opening booking form...`;
        } else {
          notice("Calendar loaded. Please click the desired slot (+).", false);
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
      if (p.autoCalc !== false) {
        const calculate = [...document.querySelectorAll("button, input[type=button], input[type=submit], a")].find((el) => {
          const txt = norm(el.innerText || el.value || "");
          return txt.includes("calculate") && (el.offsetWidth || el.offsetHeight);
        });
        if (calculate) {
          setTimeout(() => {
            const EventCtor = typeof MouseEvent !== "undefined" ? MouseEvent : Event;
            calculate.dispatchEvent(new EventCtor("mousedown", { bubbles: true, cancelable: true, view: window }));
            calculate.dispatchEvent(new EventCtor("mouseup", { bubbles: true, cancelable: true, view: window }));
            calculate.click();
            calculate.dispatchEvent(new EventCtor("click", { bubbles: true, cancelable: true, view: window }));
          }, 250);
          notice("Autofill complete. Calculate clicked. Enter CAPTCHA.", false);
        } else {
          notice("Autofill complete. Please click Calculate manually.", false);
        }
      } else {
        notice("Autofill complete. Enter CAPTCHA.", false);
      }
      const captcha = findInput(["captcha code", "captcha"]);
      if (captcha) {
        if (captcha.style) captcha.style.textTransform = "uppercase";
        captcha.addEventListener?.("input", () => {
          const start = captcha.selectionStart;
          const end = captcha.selectionEnd;
          const upper = captcha.value.toUpperCase();
          if (captcha.value !== upper) {
            captcha.value = upper;
            if (start !== null && end !== null) {
              captcha.setSelectionRange?.(start, end);
            }
          }
        });
        setTimeout(() => captcha.focus(), 350);
      }
      return filled;
    }
    async function runAction(profile) {
      const url = window.location.href;
      if (url.includes("avilable-slot")) {
        const res = await handleAvailableSlots(profile);
        return res;
      } else if (url.includes("slot-booking") || url.includes("booking")) {
        const filled = handleBookingForm(profile);
        return "Filled: " + (filled.join(", ") || "No matching fields found");
      } else {
        notice("Ready. Navigate to slot or booking page.", false);
        return "Current page is not recognized as slot or booking form.";
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
      if (profile?.autoRun) {
        setTimeout(() => runAction(profile), 600);
      }
    });
    new MutationObserver(() => {
      const text = norm(document.body?.textContent);
      if (text.includes("captcha code does not match")) {
        notice("CAPTCHA failed. Please check and enter it again.", true);
      }
    }).observe(document.body, { subtree: true, childList: true });
  })();
})();
//# sourceMappingURL=content.js.map
