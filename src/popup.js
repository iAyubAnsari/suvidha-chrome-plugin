const textIds = [
  "goods", "udin", "lcNumber", "lcDate", "importer", "vehicles"
];
const boolIds = ["autoCalc", "autoRun"];
const statusEl = document.getElementById("status");

// Format UDIN to format: 26-S-SE117906-C-1794750136885
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

function getProfile() {
  const p = {};
  textIds.forEach(id => {
    const el = document.getElementById(id);
    if (el) p[id] = (el.value || "").trim();
  });
  if (p.udin) {
    p.udin = formatUdin(p.udin);
  }
  if (p.lcNumber) {
    p.lcNumber = p.lcNumber.replace(/\s+/g, "").slice(0, 16);
  }
  boolIds.forEach(id => {
    const el = document.getElementById(id);
    if (el) p[id] = el.checked;
  });
  return p;
}

// Load saved profile on popup open
chrome.storage.local.get("profile", ({ profile }) => {
  if (!profile) return;
  textIds.forEach(id => {
    const el = document.getElementById(id);
    if (el && profile[id] !== undefined) {
      el.value = (id === "udin") ? formatUdin(profile[id]) : profile[id];
    }
  });
  boolIds.forEach(id => {
    const el = document.getElementById(id);
    if (el && profile[id] !== undefined) el.checked = Boolean(profile[id]);
  });
});

// Auto-formatting and length restrictions on inputs
const udinInput = document.getElementById("udin");
if (udinInput && typeof udinInput.addEventListener === "function") {
  udinInput.addEventListener("blur", () => {
    udinInput.value = formatUdin(udinInput.value);
  });
  udinInput.addEventListener("input", () => {
    const clean = udinInput.value.replace(/[^A-Za-z0-9]/g, "");
    if (clean.length === 25) {
      udinInput.value = formatUdin(udinInput.value);
    }
  });
}

const lcInput = document.getElementById("lcNumber");
if (lcInput && typeof lcInput.addEventListener === "function") {
  lcInput.addEventListener("input", () => {
    if (lcInput.value.length > 16) {
      lcInput.value = lcInput.value.slice(0, 16);
    }
  });
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
  }, 3000);
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
  }, response => {
    statusEl.textContent = chrome.runtime.lastError
      ? "Reload the page and try again."
      : (response?.message || "Action initiated.");
  });
};
