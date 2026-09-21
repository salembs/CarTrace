let walletSigner = null;
let signerContract = null;

// ─── Load admin name ──────────────────────────────────────────────
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

// ─── VIN input live feedback ──────────────────────────────────────
const vinInput   = document.getElementById("vin");
const vinPreview = document.getElementById("vinPreview");
const vinCounter = document.getElementById("vinCounter");

vinInput.addEventListener("input", () => {
  vinInput.value = vinInput.value.toUpperCase().replace(/[^A-HJ-NPR-Z0-9]/g, "");
  const len = vinInput.value.length;
  vinCounter.textContent = `${len} / 17 characters`;
  vinCounter.className = "vin-counter " + (len === 17 ? "valid" : len > 0 ? "invalid" : "");

  if (len > 0) {
    vinPreview.textContent = vinInput.value;
    vinPreview.className = "vin-preview";
  } else {
    vinPreview.textContent = "VIN will appear here";
    vinPreview.className = "vin-preview empty";
  }
  vinInput.className = "form-control " + (len === 17 ? "is-valid" : len > 0 ? "is-invalid" : "");
});

// ─── Connect wallet ───────────────────────────────────────────────
const walletWarning = document.getElementById("walletWarning");
const connectBtn    = document.getElementById("connectWalletBtn");

async function connectWallet() {
  if (!window.ethereum) {
    showToast("MetaMask not installed", "error"); return;
  }
  connectBtn.disabled = true;
  connectBtn.textContent = "Connecting...";
  try {
    const result = await getSignerContract();
    walletSigner  = result.signer;
    signerContract = result.contract;
    const addr = await walletSigner.getAddress();

    const isAuth = await signerContract.isAdmin(addr);
    if (!isAuth) {
      walletWarning.className = "alert alert-danger";
      walletWarning.innerHTML = `⛔ Wallet ${shortAddr(addr)} is not authorized. Contact the system owner.`;
      walletSigner = null; signerContract = null;
      connectBtn.disabled = false; connectBtn.textContent = "Retry";
      return;
    }
    walletWarning.className = "alert alert-success";
    walletWarning.innerHTML = `✓ Wallet authorized: ${addr}`;
    showToast("Wallet connected and authorized", "success");
  } catch (e) {
    showToast(e.message || "Connection failed", "error");
    connectBtn.disabled = false;
    connectBtn.textContent = "Connect Wallet";
  }
}
connectBtn.addEventListener("click", connectWallet);

// ─── Step indicator ───────────────────────────────────────────────
function setStep(n) {
  [1,2,3].forEach(i => {
    const el = document.getElementById(`step${i}`);
    el.className = "step " + (i < n ? "done" : i === n ? "active" : "");
    if (i < n) el.querySelector(".step-num").textContent = "✓";
    else el.querySelector(".step-num").textContent = i;
  });
}

// ─── Validate ─────────────────────────────────────────────────────
function getFormValues() {
  return {
    vin:     document.getElementById("vin").value.trim().toUpperCase(),
    make:    document.getElementById("make").value.trim(),
    model:   document.getElementById("model").value.trim(),
    year:    parseInt(document.getElementById("year").value),
    color:   document.getElementById("color").value.trim(),
    mileage: document.getElementById("mileage").value.trim()
  };
}

function validate(f) {
  if (f.vin.length !== 17)       return "VIN must be exactly 17 characters.";
  if (!f.make)                   return "Vehicle make is required.";
  if (!f.model)                  return "Vehicle model is required.";
  if (!f.year || f.year < 1900 || f.year > new Date().getFullYear() + 1)
                                 return "Please enter a valid year.";
  if (!f.color)                  return "Vehicle color is required.";
  if (!f.mileage)                return "Initial mileage is required.";
  return null;
}

// ─── Submit ───────────────────────────────────────────────────────
const submitBtn  = document.getElementById("submitBtn");
const submitText = document.getElementById("submitText");
const resultCard = document.getElementById("resultCard");

submitBtn.addEventListener("click", async () => {
  const f = getFormValues();
  const err = validate(f);
  if (err) { showToast(err, "error"); return; }
  if (!signerContract) { showToast("Connect your wallet first", "error"); return; }

  submitBtn.disabled = true;
  submitText.innerHTML = '<span class="spinner"></span> Waiting for MetaMask...';
  setStep(2);

  try {
    // Check if VIN already exists
    const exists = await signerContract.vehicleExists(f.vin);
    if (exists) {
      showToast(`VIN ${f.vin} is already registered in the system.`, "error");
      submitBtn.disabled = false;
      submitText.textContent = "Register Vehicle on Blockchain";
      setStep(1); return;
    }

    const tx = await signerContract.registerVehicle(
      f.vin, f.make, f.model, f.year, f.color, f.mileage
    );
    submitText.innerHTML = '<span class="spinner"></span> Transaction processing...';

    const receipt = await tx.wait();
    setStep(3);

    // Show success
    resultCard.style.display = "block";
    resultCard.className = "result-card";
    document.getElementById("resultIcon").textContent = "✅";
    document.getElementById("resultTitle").textContent = `${f.make} ${f.model} ${f.year} registered successfully`;
    document.getElementById("resultBody").innerHTML = `
      <p style="color:var(--muted);font-size:14px;margin-bottom:12px;">VIN: <strong style="color:var(--cyan);font-family:var(--font-head);">${f.vin}</strong></p>
      <div class="result-tx">TX: ${receipt.hash}</div>
      <p style="color:var(--muted);font-size:12px;margin-top:8px;">Block #${receipt.blockNumber}</p>
    `;
    document.getElementById("resultViewBtn").href = `/vehicle.html?vin=${f.vin}`;
    resultCard.scrollIntoView({ behavior: "smooth", block: "start" });
    showToast("Vehicle registered on blockchain!", "success");

  } catch (e) {
    const msg = e?.reason || e?.message || "Transaction failed";
    showToast(msg, "error");
    resultCard.style.display = "block";
    resultCard.className = "result-card error";
    document.getElementById("resultIcon").textContent = "❌";
    document.getElementById("resultTitle").textContent = "Transaction Failed";
    document.getElementById("resultBody").innerHTML = `<p style="color:var(--danger);font-size:14px;">${msg}</p>`;
    setStep(1);
  }

  submitBtn.disabled = false;
  submitText.textContent = "Register Vehicle on Blockchain";
});

// ─── Reset ────────────────────────────────────────────────────────
function resetForm() {
  ["vin","make","model","year","color","mileage"].forEach(id => {
    document.getElementById(id).value = "";
    document.getElementById(id).className = "form-control";
  });
  vinPreview.textContent = "VIN will appear here";
  vinPreview.className = "vin-preview empty";
  vinCounter.textContent = "0 / 17 characters";
  vinCounter.className = "vin-counter";
  resultCard.style.display = "none";
  setStep(1);
  document.getElementById("vin").focus();
}
