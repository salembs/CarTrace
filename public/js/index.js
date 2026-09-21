// ─── Search ───────────────────────────────────────────────────────
const vinInput  = document.getElementById("vinInput");
const searchBtn = document.getElementById("searchBtn");
const searchErr = document.getElementById("searchError");

function doSearch() {
  const vin = vinInput.value.trim().toUpperCase();
  searchErr.textContent = "";

  if (!vin) {
    searchErr.textContent = "Please enter a VIN number.";
    return;
  }
  if (vin.length !== 17) {
    searchErr.textContent = `VIN must be exactly 17 characters (you entered ${vin.length}).`;
    return;
  }
  if (!isContractDeployed()) {
    searchErr.textContent = "Blockchain not connected. Run npm run deploy first.";
    return;
  }
  window.location.href = `/vehicle.html?vin=${vin}`;
}

searchBtn.addEventListener("click", doSearch);
vinInput.addEventListener("keydown", (e) => { if (e.key === "Enter") doSearch(); });

// Auto-uppercase and format input
vinInput.addEventListener("input", () => {
  const pos = vinInput.selectionStart;
  vinInput.value = vinInput.value.toUpperCase().replace(/[^A-HJ-NPR-Z0-9]/g, "");
  vinInput.setSelectionRange(pos, pos);
});

// ─── Live stats from blockchain ───────────────────────────────────
async function loadStats() {
  if (!isContractDeployed()) return;
  try {
    const contract = getReadOnlyContract();
    const [vehicles, records] = await Promise.all([
      contract.getTotalVehicles(),
      contract.getTotalRecords()
    ]);
    animateCounter("stat-vehicles", Number(vehicles));
    animateCounter("stat-records", Number(records));
  } catch (e) {
    console.warn("Could not load stats:", e.message);
  }
}

function animateCounter(id, target) {
  const el = document.getElementById(id);
  if (!el || target === 0) { el.textContent = "0"; return; }
  let current = 0;
  const step = Math.ceil(target / 40);
  const timer = setInterval(() => {
    current = Math.min(current + step, target);
    el.textContent = current;
    if (current >= target) clearInterval(timer);
  }, 40);
}

loadStats();
