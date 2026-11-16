(() => {
  // src/popup.js
  var textIds = [
    "goods",
    "udin",
    "lcNumber",
    "lcDate",
    "importer",
    "vehicles"
  ];
  var boolIds = ["autoCalc", "autoRun"];
  var statusEl = document.getElementById("status");
  function formatUdinLive(val) {
    if (!val) return "";
    const clean = String(val).replace(/[^A-Za-z0-9]/g, "").toUpperCase().slice(0, 25);
    if (!clean) return "";
    const parts = [];
    if (clean.length > 0) parts.push(clean.slice(0, 2));
    if (clean.length > 2) parts.push(clean.slice(2, 3));
    if (clean.length > 3) parts.push(clean.slice(3, 11));
    if (clean.length > 11) parts.push(clean.slice(11, 12));
    if (clean.length > 12) parts.push(clean.slice(12, 25));
    return parts.join("-");
  }
  function updateUdinStatus() {
    const udinEl = document.getElementById("udin");
    const helper = document.getElementById("udinHelper");
    if (!udinEl || !helper) return;
    const val = (udinEl.value || "").trim().toUpperCase();
    const clean = val.replace(/[^A-Z0-9]/g, "");
    if (!val) {
      helper.textContent = "Format: 26-S-SE117906-C-1794750136885";
      if (helper.style) helper.style.color = "#64748b";
      if (udinEl.style) udinEl.style.borderColor = "#cbd5e1";
      return;
    }
    const isValid = /^[A-Z0-9]{2}-[A-Z0-9]-[A-Z0-9]{8}-[A-Z0-9]-[A-Z0-9]{13}$/.test(val);
    if (isValid) {
      helper.textContent = "\u2713 Correct UDIN format";
      if (helper.style) helper.style.color = "#16a34a";
      if (udinEl.style) udinEl.style.borderColor = "#16a34a";
    } else if (clean.length < 25) {
      helper.textContent = `Incomplete UDIN (${clean.length}/25 characters)`;
      if (helper.style) helper.style.color = "#d97706";
      if (udinEl.style) udinEl.style.borderColor = "#d97706";
    } else {
      helper.textContent = "\u2717 Invalid format (must be 26-S-SE117906-C-1794750136885)";
      if (helper.style) helper.style.color = "#dc2626";
      if (udinEl.style) udinEl.style.borderColor = "#dc2626";
    }
  }
  function updateLcStatus() {
    const lcEl = document.getElementById("lcNumber");
    const helper = document.getElementById("lcHelper");
    if (!lcEl || !helper) return;
    const val = (lcEl.value || "").trim();
    if (!val) {
      helper.textContent = "Must be 12 to 16 digits";
      if (helper.style) helper.style.color = "#64748b";
      if (lcEl.style) lcEl.style.borderColor = "#cbd5e1";
      return;
    }
    if (val.length >= 12 && val.length <= 16) {
      helper.textContent = `\u2713 Valid LC Number (${val.length} digits)`;
      if (helper.style) helper.style.color = "#16a34a";
      if (lcEl.style) lcEl.style.borderColor = "#16a34a";
    } else {
      helper.textContent = `Incomplete: ${val.length}/12 digits minimum`;
      if (helper.style) helper.style.color = "#d97706";
      if (lcEl.style) lcEl.style.borderColor = "#d97706";
    }
  }
  function getProfile() {
    const p = {};
    textIds.forEach((id) => {
      const el = document.getElementById(id);
      if (el) p[id] = (el.value || "").trim();
    });
    if (p.udin) {
      p.udin = formatUdinLive(p.udin);
    }
    if (p.lcNumber) {
      p.lcNumber = p.lcNumber.replace(/\s+/g, "").slice(0, 16);
    }
    boolIds.forEach((id) => {
      const el = document.getElementById(id);
      if (el) p[id] = el.checked;
    });
    return p;
  }
  chrome.storage.local.get("profile", ({ profile }) => {
    if (!profile) return;
    textIds.forEach((id) => {
      const el = document.getElementById(id);
      if (el && profile[id] !== void 0) {
        el.value = id === "udin" ? formatUdinLive(profile[id]) : profile[id];
      }
    });
    boolIds.forEach((id) => {
      const el = document.getElementById(id);
      if (el && profile[id] !== void 0) el.checked = Boolean(profile[id]);
    });
    updateUdinStatus();
    updateLcStatus();
  });
  var udinInput = document.getElementById("udin");
  if (udinInput && typeof udinInput.addEventListener === "function") {
    udinInput.addEventListener("keydown", (e) => {
      if (e.key === "Backspace") {
        const pos = udinInput.selectionStart;
        if (pos > 0 && udinInput.selectionStart === udinInput.selectionEnd) {
          if (udinInput.value[pos - 1] === "-") {
            e.preventDefault();
            udinInput.value = udinInput.value.slice(0, pos - 2) + udinInput.value.slice(pos);
            const newPos = pos - 2;
            udinInput.value = formatUdinLive(udinInput.value);
            try {
              udinInput.setSelectionRange(newPos, newPos);
            } catch (err) {
            }
            updateUdinStatus();
          }
        }
      }
    });
    udinInput.addEventListener("input", () => {
      const prevPos = udinInput.selectionStart;
      const prevLen = udinInput.value.length;
      udinInput.value = formatUdinLive(udinInput.value);
      if (prevPos !== null) {
        const diff = udinInput.value.length - prevLen;
        const targetPos = Math.max(0, prevPos + diff);
        try {
          udinInput.setSelectionRange(targetPos, targetPos);
        } catch (err) {
        }
      }
      updateUdinStatus();
    });
    udinInput.addEventListener("blur", () => {
      udinInput.value = formatUdinLive(udinInput.value);
      updateUdinStatus();
    });
  }
  var lcInput = document.getElementById("lcNumber");
  if (lcInput && typeof lcInput.addEventListener === "function") {
    lcInput.addEventListener("input", () => {
      if (lcInput.value.length > 16) {
        lcInput.value = lcInput.value.slice(0, 16);
      }
      updateLcStatus();
    });
    lcInput.addEventListener("blur", updateLcStatus);
  }
  document.getElementById("save").onclick = async () => {
    const profile = getProfile();
    if (profile.lcNumber && (profile.lcNumber.length < 12 || profile.lcNumber.length > 16)) {
      statusEl.textContent = "LC Number must be between 12 and 16 digits.";
      if (statusEl?.style) statusEl.style.color = "#c0392b";
      return;
    }
    if (statusEl?.style) statusEl.style.color = "#475569";
    await chrome.storage.local.set({ profile });
    statusEl.textContent = "Profile saved locally.";
    setTimeout(() => {
      if (statusEl.textContent === "Profile saved locally.") statusEl.textContent = "";
    }, 3e3);
  };
  document.getElementById("fill").onclick = async () => {
    const profile = getProfile();
    if (profile.lcNumber && (profile.lcNumber.length < 12 || profile.lcNumber.length > 16)) {
      statusEl.textContent = "LC Number must be between 12 and 16 digits.";
      if (statusEl?.style) statusEl.style.color = "#c0392b";
      return;
    }
    if (statusEl?.style) statusEl.style.color = "#475569";
    await chrome.storage.local.set({ profile });
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    const tabUrl = tab?.url || tab?.pendingUrl || "";
    if (!tabUrl.includes("slot-booking") && !tabUrl.includes("wbifms.gov.in") && !tabUrl.includes("epay.sbi.bank.in")) {
      statusEl.textContent = "Open the Suvidha slot booking or payment page first.";
      return;
    }
    chrome.tabs.sendMessage(tab.id, {
      type: "SUVIDHA_TRIGGER",
      profile
    }, (response) => {
      statusEl.textContent = chrome.runtime.lastError ? "Reload the page and try again." : response?.message || "Action initiated.";
    });
  };
})();
//# sourceMappingURL=popup.js.map
