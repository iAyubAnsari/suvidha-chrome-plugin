(() => {
  // src/popup.js
  var textIds = [
    "goodsType",
    "goodsCategory",
    "slotMode",
    "slotDate",
    "goods",
    "udin",
    "lcNumber",
    "lcDate",
    "importer",
    "vehicles"
  ];
  var boolIds = ["autoSlot", "autoCalc", "autoRun"];
  var statusEl = document.getElementById("status");
  var slotModeEl = document.getElementById("slotMode");
  var slotDateWrapperEl = document.getElementById("slotDateWrapper");
  function syncSlotModeUI() {
    if (!slotModeEl) return;
    const isCustom = slotModeEl.value === "custom";
    if (slotDateWrapperEl && slotDateWrapperEl.style) {
      slotDateWrapperEl.style.display = isCustom ? "block" : "none";
    }
  }
  if (slotModeEl) {
    slotModeEl.onchange = syncSlotModeUI;
  }
  function getProfile() {
    const p = {};
    textIds.forEach((id) => {
      const el = document.getElementById(id);
      if (el) p[id] = (el.value || "").trim();
    });
    boolIds.forEach((id) => {
      const el = document.getElementById(id);
      if (el) p[id] = el.checked;
    });
    return p;
  }
  chrome.storage.local.get("profile", ({ profile }) => {
    if (!profile) {
      syncSlotModeUI();
      return;
    }
    textIds.forEach((id) => {
      const el = document.getElementById(id);
      if (el && profile[id] !== void 0) el.value = profile[id];
    });
    if (slotModeEl && !profile.slotMode) {
      slotModeEl.value = profile.slotDate ? "custom" : "first";
    }
    boolIds.forEach((id) => {
      const el = document.getElementById(id);
      if (el && profile[id] !== void 0) el.checked = Boolean(profile[id]);
    });
    syncSlotModeUI();
  });
  document.getElementById("save").onclick = async () => {
    const profile = getProfile();
    await chrome.storage.local.set({ profile });
    statusEl.textContent = "Profile saved locally.";
    setTimeout(() => {
      if (statusEl.textContent === "Profile saved locally.") statusEl.textContent = "";
    }, 3e3);
  };
  document.getElementById("fill").onclick = async () => {
    const profile = getProfile();
    await chrome.storage.local.set({ profile });
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    const tabUrl = tab?.url || tab?.pendingUrl || "";
    if (!tabUrl.startsWith("https://suvidha-mp.wb.gov.in/exporter-oth/")) {
      statusEl.textContent = "Open the Suvidha slot or booking page first.";
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
