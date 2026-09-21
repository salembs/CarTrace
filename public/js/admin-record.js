let signerContract = null;
let lockedVin = null;

// ─── Load admin ───────────────────────────────────────────────────
fetch("/api/admin/me").then(r => {
  if (!r.ok) { window.location.href = "/admin/login.html"; return; }
  return r.json();
}).then(d => {
  if (d) document.getElementById("adminNameDisplay").textContent = d.admin.organization_name;
}).catch(() => { window.location.href = "/admin/login.html"; });

document.getElementById("logoutBtn").addEventListener("click", async () => {
  await fetch("/api/admin/logout", { method: "POST" });
  window.location.href = "/admin/login.html";
});

// ─── VIN input ────────────────────────────────────────────────────
const vinInput = document.getElementById("vin");
vinInput.addEventListener("input", () => {
  vinInput.value = vinInput.value.toUpperCase().replace(/[^A-HJ-NPR-Z0-9]/g, "");
  document.getElementById("vehicleFound").className = "vehicle-found-card";
  document.getElementById("vinError").textContent = "";
  lockedVin = null;
  vinInput.className = "form-control scan-wrap";
});

vinInput.addEventListener("keydown", (e) => { if (e.key === "Enter") doLookup(); });

// ─── VIN Lookup ───────────────────────────────────────────────────
const lookupBtn  = document.getElementById("lookupBtn");
const lookupText = document.getElementById("lookupText");
const vinError   = document.getElementById("vinError");

async function doLookup() {
  const vin = vinInput.value.trim().toUpperCase();
  vinError.textContent = "";
  document.getElementById("vehicleFound").className = "vehicle-found-card";

  if (vin.length !== 17) {
    vinError.textContent = "VIN must be exactly 17 characters.";
    return;
  }
  if (!isContractDeployed()) {
    vinError.textContent = "Blockchain not connected. Deploy contract first.";
    return;
  }

  lookupBtn.disabled = true;
  lookupText.innerHTML = '<span class="spinner"></span>';

  try {
    const contract = getReadOnlyContract();
    const vehicle = await contract.getVehicle(vin);

    if (!vehicle.exists) {
      vinError.textContent = `VIN ${vin} is not registered. Register it first.`;
      vinInput.className = "form-control scan-wrap is-invalid";
    } else {
      vinInput.className = "form-control scan-wrap is-valid";
      lockedVin = vin;
      document.getElementById("vehicleName").textContent = `${vehicle.make} ${vehicle.model} ${vehicle.year} — ${vehicle.color}`;
      document.getElementById("vehicleVin").textContent = vin;
      document.getElementById("vehicleFound").className = "vehicle-found-card visible";
      document.getElementById("resultViewBtn").href = `/vehicle.html?vin=${vin}`;
    }
  } catch (e) {
    vinError.textContent = "Blockchain connection error. Make sure 'npx hardhat node' is running.";
  }

  lookupBtn.disabled = false;
  lookupText.textContent = "Lookup";
}

lookupBtn.addEventListener("click", doLookup);

// ─── Description counter ──────────────────────────────────────────
const descEl    = document.getElementById("description");
const descCount = document.getElementById("descCount");
descEl.addEventListener("input", () => {
  descCount.textContent = descEl.value.length;
  descCount.style.color = descEl.value.length >= 490 ? "var(--danger)" : "var(--muted)";
});

// ─── Connect wallet ───────────────────────────────────────────────
const walletWarning = document.getElementById("walletWarning");
const connectBtn    = document.getElementById("connectWalletBtn");

async function connectWallet() {
  if (!window.ethereum) { showToast("MetaMask not installed", "error"); return; }
  connectBtn.disabled = true;
  connectBtn.textContent = "Connecting...";

  try {
    const result = await getSignerContract();
    signerContract = result.contract;
    const addr = await result.signer.getAddress();
    const isAuth = await signerContract.isAdmin(addr);

    if (!isAuth) {
      walletWarning.className = "alert alert-danger";
      walletWarning.innerHTML = `⛔ Wallet ${shortAddr(addr)} is not authorized.`;
      signerContract = null;
      connectBtn.disabled = false;
      connectBtn.textContent = "Retry";
      return;
    }
    walletWarning.className = "alert alert-success";
    walletWarning.innerHTML = `✓ Authorized: ${addr}`;
    showToast("Wallet connected!", "success");
  } catch (e) {
    showToast(e.message || "Connection failed", "error");
    connectBtn.disabled = false;
    connectBtn.textContent = "Connect Wallet";
  }
}
connectBtn.addEventListener("click", connectWallet);

// ─── Submit ───────────────────────────────────────────────────────
const submitBtn  = document.getElementById("submitBtn");
const submitText = document.getElementById("submitText");
const resultCard = document.getElementById("resultCard");

submitBtn.addEventListener("click", async () => {
  const selectedType = document.querySelector('input[name="recordType"]:checked');
  const description  = document.getElementById("description").value.trim();
  const mileage      = document.getElementById("mileage").value.trim();
  const partDetails  = document.getElementById("partDetails").value.trim();

  if (!lockedVin) {
    showToast("Look up and verify a VIN first", "error"); return;
  }
  if (!selectedType) {
    showToast("Select a record type", "error"); return;
  }
  if (description.length < 10) {
    showToast("Description must be at least 10 characters", "error"); return;
  }
  if (!mileage) {
    showToast("Current mileage is required", "error"); return;
  }
  if (!signerContract) {
    showToast("Connect your MetaMask wallet first", "error"); return;
  }

  submitBtn.disabled = true;
  submitText.innerHTML = '<span class="spinner"></span> Waiting for MetaMask...';

  try {
    const tx = await signerContract.addRecord(
      lockedVin,
      selectedType.value,
      description,
      mileage,
      partDetails
    );
    submitText.innerHTML = '<span class="spinner"></span> Processing transaction...';
    const receipt = await tx.wait();

    resultCard.style.display = "block";
    resultCard.className = "result-card";
    document.getElementById("resultIcon").textContent = "✅";
    document.getElementById("resultTitle").textContent = `${selectedType.value} record added successfully`;
    document.getElementById("resultBody").innerHTML = `
      <p style="color:var(--muted);font-size:14px;margin-bottom:12px;">
        Vehicle: <strong style="color:var(--white);">${document.getElementById("vehicleName").textContent}</strong>
      </p>
      <div class="result-tx">TX: ${receipt.hash}</div>
      <p style="color:var(--muted);font-size:12px;margin-top:8px;">Block #${receipt.blockNumber}</p>
    `;
    resultCard.scrollIntoView({ behavior: "smooth", block: "start" });
    showToast("Record saved to blockchain!", "success");
  } catch (e) {
    const msg = e?.reason || e?.message || "Transaction failed";
    showToast(msg, "error");
    resultCard.style.display = "block";
    resultCard.className = "result-card error";
    document.getElementById("resultIcon").textContent = "❌";
    document.getElementById("resultTitle").textContent = "Transaction Failed";
    document.getElementById("resultBody").innerHTML = `<p style="color:var(--danger);font-size:14px;">${msg}</p>`;
  }

  submitBtn.disabled = false;
  submitText.textContent = "Submit Record to Blockchain";
});

// ─── Reset ────────────────────────────────────────────────────────
function resetForm() {
  vinInput.value = "";
  vinInput.className = "form-control scan-wrap";
  document.getElementById("vehicleFound").className = "vehicle-found-card";
  vinError.textContent = "";
  lockedVin = null;
  document.querySelector('input[name="recordType"]:checked')?.setAttribute("checked", "");
  document.querySelectorAll('input[name="recordType"]').forEach(el => el.checked = false);
  descEl.value = "";
  descCount.textContent = "0";
  document.getElementById("mileage").value = "";
  document.getElementById("partDetails").value = "";
  resultCard.style.display = "none";
  vinInput.focus();
}
