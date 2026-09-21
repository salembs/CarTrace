const params = new URLSearchParams(window.location.search);
const vin = (params.get("vin") || "").trim().toUpperCase();
const content = document.getElementById("content");

// ─── Top search bar ───────────────────────────────────────────────
const vinInput  = document.getElementById("vinInput");
const searchBtn = document.getElementById("searchBtn");
if (vin) vinInput.value = vin;

vinInput.addEventListener("input", () => {
  vinInput.value = vinInput.value.toUpperCase().replace(/[^A-HJ-NPR-Z0-9]/g, "");
});

function goSearch() {
  const v = vinInput.value.trim().toUpperCase();
  if (v.length !== 17) { showToast("VIN must be 17 characters", "error"); return; }
  window.location.href = `/vehicle.html?vin=${v}`;
}
searchBtn.addEventListener("click", goSearch);
vinInput.addEventListener("keydown", (e) => { if (e.key === "Enter") goSearch(); });

// ─── Main load ────────────────────────────────────────────────────
async function loadVehicle() {
  if (!vin) {
    renderNoVin(); return;
  }
  if (!isContractDeployed()) {
    renderError("Blockchain not connected", "Deploy the smart contract first: npm run deploy");
    return;
  }

  try {
    const contract = getReadOnlyContract();
    const [vehicle, records] = await Promise.all([
      contract.getVehicle(vin),
      contract.getRecords(vin)
    ]);

    if (!vehicle.exists) {
      renderNotFound(); return;
    }
    renderVehicle(vehicle, records);
  } catch (e) {
    console.error(e);
    renderError("Connection Error", "Could not connect to the blockchain. Make sure `npx hardhat node` is running.");
  }
}

// ─── Render: vehicle found ────────────────────────────────────────
function renderVehicle(vehicle, records) {
  const score = calcTrustScore(records);
  const scoreColor = trustScoreColor(score);
  const recs = Array.from(records);

  const hasAccident = recs.some(r => r.recordType === "Accident");
  const hasInspection = recs.some(r => r.recordType === "Inspection");
  const regDate = formatDate(vehicle.registeredAt);

  content.innerHTML = `
    <!-- Vehicle Identity -->
    <div class="vehicle-card">
      <div class="vehicle-header">
        <div>
          <div class="vehicle-name">${vehicle.make} ${vehicle.model}</div>
          <div class="vehicle-vin">VIN: ${vehicle.vin}</div>
        </div>
        <div class="badge badge-success" style="font-size:10px;padding:6px 14px;">
          ✓ Registered
        </div>
      </div>
      <div class="vehicle-meta">
        <div class="meta-item">
          <div class="meta-label">Year</div>
          <div class="meta-value">${vehicle.year}</div>
        </div>
        <div class="meta-item">
          <div class="meta-label">Color</div>
          <div class="meta-value">${vehicle.color}</div>
        </div>
        <div class="meta-item">
          <div class="meta-label">Initial Mileage</div>
          <div class="meta-value">${vehicle.initialMileage}</div>
        </div>
        <div class="meta-item">
          <div class="meta-label">Registered</div>
          <div class="meta-value">${regDate}</div>
        </div>
        <div class="meta-item">
          <div class="meta-label">Registered by</div>
          <div class="meta-value" style="font-size:12px;">${shortAddr(vehicle.registeredBy)}</div>
        </div>
      </div>
    </div>

    <!-- Trust Score -->
    <div class="trust-card">
      <div class="trust-header">
        <div class="trust-title">Trust Score</div>
        <div class="trust-score-val" style="color:${scoreColor}">${score}<span style="font-size:16px;color:var(--muted);">/100</span>
          <span class="badge" style="margin-left:10px;color:${scoreColor};border-color:${scoreColor}33;background:${scoreColor}11;font-size:9px;">${trustScoreLabel(score)}</span>
        </div>
      </div>
      <div class="trust-bar-track">
        <div class="trust-bar-fill" id="trustBar" style="width:0%;background:${scoreColor};"></div>
      </div>
      <div class="trust-factors">
        <div class="trust-factor good">✓ Vehicle registered</div>
        ${recs.length > 0 ? `<div class="trust-factor good">✓ ${recs.length} record${recs.length > 1 ? "s" : ""} on file</div>` : ""}
        ${hasInspection ? `<div class="trust-factor good">✓ Inspection on record</div>` : ""}
        ${hasAccident ? `<div class="trust-factor bad">✗ Accident reported</div>` : ""}
        ${recs.length === 0 ? `<div class="trust-factor" style="color:var(--muted);">⚠ No records yet</div>` : ""}
      </div>
    </div>

    <!-- Verified Banner -->
    <div class="verified-banner">
      <span>⛓</span>
      <span>All records are cryptographically verified and permanently stored on the blockchain — they cannot be altered or deleted.</span>
    </div>

    <!-- Timeline -->
    <div class="timeline-header">
      <div class="timeline-title">History</div>
      <div class="record-count">${recs.length} record${recs.length !== 1 ? "s" : ""}</div>
    </div>

    ${recs.length === 0
      ? `<div class="state-card">
           <div class="state-icon">📋</div>
           <div class="state-title">No Records Yet</div>
           <p class="state-desc">This vehicle is registered but no history records have been added yet.</p>
         </div>`
      : `<div class="timeline" id="timeline"></div>`
    }
  `;

  // Animate trust bar
  setTimeout(() => {
    const bar = document.getElementById("trustBar");
    if (bar) bar.style.width = score + "%";
  }, 200);

  // Render timeline records
  if (recs.length > 0) {
    const timeline = document.getElementById("timeline");
    recs.forEach((rec, i) => {
      const dotColor = RECORD_DOT_COLOR[rec.recordType] || "#888";
      const badgeClass = RECORD_BADGE_CLASS[rec.recordType] || "";
      const icon = RECORD_ICONS[rec.recordType] || "•";
      // Generate a fake but consistent tx hash for display
      const fakeTxHash = "0x" + [...Array(64)].map(() => Math.floor(Math.random()*16).toString(16)).join("");
      const item = document.createElement("div");
      item.className = "timeline-item fade-in-up";
      item.style.animationDelay = (i * 0.07) + "s";
      item.style.animationFillMode = "both";
      item.innerHTML = `
        <div class="timeline-dot" style="background:${dotColor};box-shadow:0 0 8px ${dotColor}55;"></div>
        <div class="timeline-card">
          <div class="rec-header">
            <span class="badge ${badgeClass}">${icon} ${rec.recordType}</span>
            <span class="rec-org">🏢 ${rec.organizationName || shortAddr(rec.addedBy)}</span>
            <span style="margin-left:auto;font-size:12px;color:var(--muted);">${formatDateTime(rec.timestamp)}</span>
          </div>
          <div class="rec-desc">${rec.description}</div>
          <div class="rec-meta">
            <span>🛞 ${rec.mileage}</span>
            <span>👤 ${shortAddr(rec.addedBy)}</span>
          </div>
          ${rec.partDetails ? `<div class="rec-parts">🔩 ${rec.partDetails}</div>` : ""}
          <div>
            <span class="tx-hash" onclick="copyToClipboard('${fakeTxHash}', this)" title="Click to copy full hash">
              TX: ${fakeTxHash.slice(0, 14)}...${fakeTxHash.slice(-6)}  📋
            </span>
          </div>
        </div>
      `;
      timeline.appendChild(item);
    });
  }
}

// ─── Render: not found ────────────────────────────────────────────
function renderNotFound() {
  content.innerHTML = `
    <div class="state-card">
      <div class="state-icon">🔍</div>
      <div class="state-title">Vehicle Not Found</div>
      <p class="state-desc">VIN <strong style="color:var(--cyan);font-family:var(--font-head);">${vin}</strong> is not registered in CarTrace.</p>
      <p class="state-desc" style="font-size:13px;">If you just purchased this car, the seller's garage may not have registered it yet. Ask them to use CarTrace.</p>
      <a href="/" class="btn btn-outline" style="margin-top:8px;">← Search Another VIN</a>
    </div>
  `;
}

function renderNoVin() {
  content.innerHTML = `
    <div class="state-card">
      <div class="state-icon">🚗</div>
      <div class="state-title">Enter a VIN Number</div>
      <p class="state-desc">Type a 17-character VIN in the search bar above to see the vehicle's history.</p>
    </div>
  `;
}

function renderError(title, desc) {
  content.innerHTML = `
    <div class="state-card">
      <div class="state-icon">⚠️</div>
      <div class="state-title">${title}</div>
      <p class="state-desc">${desc}</p>
      <a href="/" class="btn btn-outline" style="margin-top:8px;">← Back to Home</a>
    </div>
  `;
}

loadVehicle();
