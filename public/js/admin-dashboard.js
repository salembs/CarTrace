let adminData = null;
let walletAddress = null;
let isAuthorized = false;

// ─── Load admin info ──────────────────────────────────────────────
async function loadAdminInfo() {
  try {
    const res = await fetch("/api/admin/me");
    if (!res.ok) { window.location.href = "/admin/login.html"; return; }
    const data = await res.json();
    adminData = data.admin;

    document.getElementById("adminNameDisplay").textContent = adminData.organization_name;
    document.getElementById("orgName").textContent = adminData.organization_name;

    if (adminData.wallet_address) {
      walletAddress = adminData.wallet_address;
      document.getElementById("walletDisplay").textContent = shortAddr(walletAddress);
    }
  } catch {
    window.location.href = "/admin/login.html";
  }
}

// ─── Load blockchain stats ────────────────────────────────────────
async function loadStats() {
  if (!isContractDeployed()) {
    document.getElementById("statVehicles").textContent = "—";
    document.getElementById("statRecords").textContent = "—";
    return;
  }
  try {
    const contract = getReadOnlyContract();
    const [vehicles, records] = await Promise.all([
      contract.getTotalVehicles(),
      contract.getTotalRecords()
    ]);
    document.getElementById("statVehicles").textContent = Number(vehicles);
    document.getElementById("statRecords").textContent = Number(records);
    loadDemoTable(contract);
  } catch (e) {
    console.warn("Blockchain stats error:", e.message);
  }
}

// ─── Demo vehicles table ──────────────────────────────────────────
async function loadDemoTable(contract) {
  const vins = [
    "WVWZZZ1JZ3W386752",
    "VF1RFB00061234567",
    "TMBJP9NE4G0234567"
  ];
  const tbody = document.getElementById("demoBody");
  tbody.innerHTML = "";

  for (const vin of vins) {
    try {
      const [v, count] = await Promise.all([
        contract.getVehicle(vin),
        contract.getRecordCount(vin)
      ]);
      if (!v.exists) continue;
      const tr = document.createElement("tr");
      tr.innerHTML = `
        <td>${vin}</td>
        <td>${v.make} ${v.model} ${v.year}</td>
        <td><span class="badge badge-maintenance">${Number(count)} records</span></td>
        <td><a href="/vehicle.html?vin=${vin}" class="btn btn-outline" style="padding:6px 14px;font-size:9px;" target="_blank">View ↗</a></td>
      `;
      tbody.appendChild(tr);
    } catch {}
  }

  if (!tbody.children.length) {
    tbody.innerHTML = '<tr><td colspan="4" style="text-align:center;color:var(--muted);padding:24px;">No demo vehicles found. Run: npm run seed</td></tr>';
  }
}

// ─── Wallet connection ────────────────────────────────────────────
async function connectWallet() {
  const btn = document.getElementById("connectWalletBtn");
  const bar = document.getElementById("walletBar");
  const msg = document.getElementById("walletMsg");

  if (!window.ethereum) {
    showToast("MetaMask not installed. Install it from metamask.io", "error");
    return;
  }

  btn.disabled = true;
  btn.textContent = "Connecting...";

  try {
    const { contract, signer } = await getSignerContract();
    walletAddress = await signer.getAddress();
    document.getElementById("walletDisplay").textContent = shortAddr(walletAddress);

    // Check authorization on blockchain
    isAuthorized = await contract.isAdmin(walletAddress);

    // Save wallet address to DB
    await fetch("/api/admin/wallet", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ walletAddress })
    });

    if (isAuthorized) {
      bar.className = "wallet-bar authorized";
      msg.textContent = `✓ Wallet authorized — ${walletAddress}`;
      btn.textContent = "Connected ✓";
      document.getElementById("statWalletStatus").textContent = "✓";
      document.getElementById("statWalletStatus").style.color = "var(--success)";
    } else {
      bar.className = "wallet-bar not-authorized";
      msg.textContent = `Wallet ${shortAddr(walletAddress)} is not authorized. Ask the system owner to run: contract.addAdmin("${walletAddress}", "Your Org")`;
      btn.textContent = "Not Authorized";
    }
  } catch (e) {
    showToast(e.message || "MetaMask connection failed", "error");
    btn.disabled = false;
    btn.textContent = "Connect Wallet";
  }
}

// ─── Logout ───────────────────────────────────────────────────────
document.getElementById("logoutBtn").addEventListener("click", async () => {
  await fetch("/api/admin/logout", { method: "POST" });
  window.location.href = "/admin/login.html";
});

document.getElementById("connectWalletBtn").addEventListener("click", connectWallet);

// ─── Init ─────────────────────────────────────────────────────────
(async () => {
  await loadAdminInfo();
  await loadStats();

  // If wallet already stored in DB, try to reflect status
  if (adminData && adminData.wallet_address && isContractDeployed()) {
    try {
      const contract = getReadOnlyContract();
      const auth = await contract.isAdmin(adminData.wallet_address);
      const bar = document.getElementById("walletBar");
      const msg = document.getElementById("walletMsg");
      if (auth) {
        bar.className = "wallet-bar authorized";
        msg.textContent = `✓ Wallet authorized — ${adminData.wallet_address}`;
        document.getElementById("connectWalletBtn").textContent = "Reconnect";
        document.getElementById("statWalletStatus").textContent = "✓";
        document.getElementById("statWalletStatus").style.color = "var(--success)";
      }
    } catch {}
  }
})();
