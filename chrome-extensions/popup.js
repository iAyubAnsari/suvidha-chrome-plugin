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
    if (!profile) return;
    textIds.forEach((id) => {
      const el = document.getElementById(id);
      if (el && profile[id] !== void 0) el.value = profile[id];
    });
    boolIds.forEach((id) => {
      const el = document.getElementById(id);
      if (el && profile[id] !== void 0) el.checked = Boolean(profile[id]);
    });
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
