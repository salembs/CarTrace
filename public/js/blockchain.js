// ─── ABI ─────────────────────────────────────────────────────────
const CONTRACT_ABI = [
    {
      "inputs": [],
      "stateMutability": "nonpayable",
      "type": "constructor"
    },
    {
      "anonymous": false,
      "inputs": [
        {
          "indexed": false,
          "internalType": "address",
          "name": "admin",
          "type": "address"
        },
        {
          "indexed": false,
          "internalType": "string",
          "name": "organizationName",
          "type": "string"
        }
      ],
      "name": "AdminAdded",
      "type": "event"
    },
    {
      "anonymous": false,
      "inputs": [
        {
          "indexed": false,
          "internalType": "address",
          "name": "admin",
          "type": "address"
        }
      ],
      "name": "AdminRemoved",
      "type": "event"
    },
    {
      "anonymous": false,
      "inputs": [
        {
          "indexed": false,
          "internalType": "string",
          "name": "vin",
          "type": "string"
        },
        {
          "indexed": false,
          "internalType": "string",
          "name": "recordType",
          "type": "string"
        },
        {
          "indexed": false,
          "internalType": "address",
          "name": "addedBy",
          "type": "address"
        }
      ],
      "name": "RecordAdded",
      "type": "event"
    },
    {
      "anonymous": false,
      "inputs": [
        {
          "indexed": false,
          "internalType": "string",
          "name": "vin",
          "type": "string"
        },
        {
          "indexed": false,
          "internalType": "string",
          "name": "make",
          "type": "string"
        },
        {
          "indexed": false,
          "internalType": "string",
          "name": "model",
          "type": "string"
        },
        {
          "indexed": false,
          "internalType": "address",
          "name": "registeredBy",
          "type": "address"
        }
      ],
      "name": "VehicleRegistered",
      "type": "event"
    },
    {
      "inputs": [
        {
          "internalType": "address",
          "name": "_admin",
          "type": "address"
        },
        {
          "internalType": "string",
          "name": "_organizationName",
          "type": "string"
        }
      ],
      "name": "addAdmin",
      "outputs": [],
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "string",
          "name": "_vin",
          "type": "string"
        },
        {
          "internalType": "string",
          "name": "_recordType",
          "type": "string"
        },
        {
          "internalType": "string",
          "name": "_description",
          "type": "string"
        },
        {
          "internalType": "string",
          "name": "_mileage",
          "type": "string"
        },
        {
          "internalType": "string",
          "name": "_partDetails",
          "type": "string"
        }
      ],
      "name": "addRecord",
      "outputs": [],
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "address",
          "name": "",
          "type": "address"
        }
      ],
      "name": "adminNames",
      "outputs": [
        {
          "internalType": "string",
          "name": "",
          "type": "string"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "address",
          "name": "",
          "type": "address"
        }
      ],
      "name": "admins",
      "outputs": [
        {
          "internalType": "bool",
          "name": "",
          "type": "bool"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "uint256",
          "name": "",
          "type": "uint256"
        }
      ],
      "name": "allVINs",
      "outputs": [
        {
          "internalType": "string",
          "name": "",
          "type": "string"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "address",
          "name": "_address",
          "type": "address"
        }
      ],
      "name": "getAdminName",
      "outputs": [
        {
          "internalType": "string",
          "name": "",
          "type": "string"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [],
      "name": "getAllVINs",
      "outputs": [
        {
          "internalType": "string[]",
          "name": "",
          "type": "string[]"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "string",
          "name": "_vin",
          "type": "string"
        }
      ],
      "name": "getRecordCount",
      "outputs": [
        {
          "internalType": "uint256",
          "name": "",
          "type": "uint256"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "string",
          "name": "_vin",
          "type": "string"
        }
      ],
      "name": "getRecords",
      "outputs": [
        {
          "components": [
            {
              "internalType": "uint256",
              "name": "timestamp",
              "type": "uint256"
            },
            {
              "internalType": "string",
              "name": "recordType",
              "type": "string"
            },
            {
              "internalType": "string",
              "name": "description",
              "type": "string"
            },
            {
              "internalType": "string",
              "name": "mileage",
              "type": "string"
            },
            {
              "internalType": "string",
              "name": "partDetails",
              "type": "string"
            },
            {
              "internalType": "address",
              "name": "addedBy",
              "type": "address"
            },
            {
              "internalType": "string",
              "name": "organizationName",
              "type": "string"
            }
          ],
          "internalType": "struct VehicleHistory.Record[]",
          "name": "",
          "type": "tuple[]"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [],
      "name": "getTotalRecords",
      "outputs": [
        {
          "internalType": "uint256",
          "name": "",
          "type": "uint256"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [],
      "name": "getTotalVehicles",
      "outputs": [
        {
          "internalType": "uint256",
          "name": "",
          "type": "uint256"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "string",
          "name": "_vin",
          "type": "string"
        }
      ],
      "name": "getVehicle",
      "outputs": [
        {
          "components": [
            {
              "internalType": "string",
              "name": "vin",
              "type": "string"
            },
            {
              "internalType": "string",
              "name": "make",
              "type": "string"
            },
            {
              "internalType": "string",
              "name": "model",
              "type": "string"
            },
            {
              "internalType": "uint256",
              "name": "year",
              "type": "uint256"
            },
            {
              "internalType": "string",
              "name": "color",
              "type": "string"
            },
            {
              "internalType": "string",
              "name": "initialMileage",
              "type": "string"
            },
            {
              "internalType": "address",
              "name": "registeredBy",
              "type": "address"
            },
            {
              "internalType": "uint256",
              "name": "registeredAt",
              "type": "uint256"
            },
            {
              "internalType": "bool",
              "name": "exists",
              "type": "bool"
            }
          ],
          "internalType": "struct VehicleHistory.Vehicle",
          "name": "",
          "type": "tuple"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "address",
          "name": "_address",
          "type": "address"
        }
      ],
      "name": "isAdmin",
      "outputs": [
        {
          "internalType": "bool",
          "name": "",
          "type": "bool"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [],
      "name": "owner",
      "outputs": [
        {
          "internalType": "address",
          "name": "",
          "type": "address"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "string",
          "name": "_vin",
          "type": "string"
        },
        {
          "internalType": "string",
          "name": "_make",
          "type": "string"
        },
        {
          "internalType": "string",
          "name": "_model",
          "type": "string"
        },
        {
          "internalType": "uint256",
          "name": "_year",
          "type": "uint256"
        },
        {
          "internalType": "string",
          "name": "_color",
          "type": "string"
        },
        {
          "internalType": "string",
          "name": "_initialMileage",
          "type": "string"
        }
      ],
      "name": "registerVehicle",
      "outputs": [],
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "address",
          "name": "_admin",
          "type": "address"
        }
      ],
      "name": "removeAdmin",
      "outputs": [],
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "string",
          "name": "_vin",
          "type": "string"
        }
      ],
      "name": "vehicleExists",
      "outputs": [
        {
          "internalType": "bool",
          "name": "",
          "type": "bool"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "string",
          "name": "",
          "type": "string"
        }
      ],
      "name": "vehicles",
      "outputs": [
        {
          "internalType": "string",
          "name": "vin",
          "type": "string"
        },
        {
          "internalType": "string",
          "name": "make",
          "type": "string"
        },
        {
          "internalType": "string",
          "name": "model",
          "type": "string"
        },
        {
          "internalType": "uint256",
          "name": "year",
          "type": "uint256"
        },
        {
          "internalType": "string",
          "name": "color",
          "type": "string"
        },
        {
          "internalType": "string",
          "name": "initialMileage",
          "type": "string"
        },
        {
          "internalType": "address",
          "name": "registeredBy",
          "type": "address"
        },
        {
          "internalType": "uint256",
          "name": "registeredAt",
          "type": "uint256"
        },
        {
          "internalType": "bool",
          "name": "exists",
          "type": "bool"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    }
  ];

const NETWORK_URL = "http://127.0.0.1:7545";
const CHAIN_ID = 1337;

// ─── Read-only provider (no wallet needed) ────────────────────────
function getReadOnlyContract() {
  const provider = new ethers.JsonRpcProvider(NETWORK_URL);
  return new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, provider);
}

// ─── Signer provider (MetaMask) ───────────────────────────────────
async function getSignerContract() {
  if (!window.ethereum) throw new Error("MetaMask not installed");
  const provider = new ethers.BrowserProvider(window.ethereum);
  await provider.send("eth_requestAccounts", []);
  const signer = await provider.getSigner();
  return { contract: new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, signer), signer };
}

// ─── Format timestamp ─────────────────────────────────────────────
function formatDate(timestamp) {
  const d = new Date(Number(timestamp) * 1000);
  return d.toLocaleDateString("fr-TN", { year: "numeric", month: "long", day: "numeric" });
}

function formatDateTime(timestamp) {
  const d = new Date(Number(timestamp) * 1000);
  return d.toLocaleDateString("fr-TN", {
    year: "numeric", month: "long", day: "numeric",
    hour: "2-digit", minute: "2-digit"
  });
}

// ─── Shorten address ──────────────────────────────────────────────
function shortAddr(addr) {
  if (!addr) return "—";
  return addr.slice(0, 6) + "..." + addr.slice(-4);
}

// ─── Record type helpers ──────────────────────────────────────────
const RECORD_ICONS = {
  "Repair": "🔧",
  "Maintenance": "🛢️",
  "Accident": "💥",
  "Inspection": "✅",
  "Part Replacement": "🔩"
};

const RECORD_BADGE_CLASS = {
  "Repair": "badge-repair",
  "Maintenance": "badge-maintenance",
  "Accident": "badge-accident",
  "Inspection": "badge-inspection",
  "Part Replacement": "badge-part"
};

const RECORD_DOT_COLOR = {
  "Repair": "#ffb300",
  "Maintenance": "#00d4ff",
  "Accident": "#ff4444",
  "Inspection": "#b48aff",
  "Part Replacement": "#00e676"
};

// ─── Trust score calculation ──────────────────────────────────────
function calcTrustScore(records) {
  let score = 10; // Base: registered
  const types = records.map(r => r.recordType);
  const count = records.length;

  score += Math.min(count * 5, 40);  // +5 per record, max 40

  if (types.some(t => t === "Inspection")) score += 15;

  const accidents = types.filter(t => t === "Accident").length;
  score -= accidents * 20;

  return Math.max(0, Math.min(100, score));
}

function trustScoreColor(score) {
  if (score >= 70) return "#00e676";
  if (score >= 40) return "#ffb300";
  return "#ff4444";
}

function trustScoreLabel(score) {
  if (score >= 80) return "Excellent";
  if (score >= 60) return "Good";
  if (score >= 40) return "Average";
  return "Poor";
}

// ─── Copy to clipboard ────────────────────────────────────────────
async function copyToClipboard(text, btn) {
  try {
    await navigator.clipboard.writeText(text);
    const orig = btn.textContent;
    btn.textContent = "Copied!";
    setTimeout(() => { btn.textContent = orig; }, 1500);
  } catch {
    btn.textContent = "Error";
  }
}

// ─── Show toast notification ──────────────────────────────────────
function showToast(message, type = "info") {
  const existing = document.querySelector(".toast-notification");
  if (existing) existing.remove();

  const toast = document.createElement("div");
  toast.className = "toast-notification";
  toast.style.cssText = `
    position: fixed; bottom: 32px; right: 32px; z-index: 9999;
    padding: 14px 22px; border-radius: 10px; font-size: 14px;
    display: flex; align-items: center; gap: 10px;
    animation: fadeInUp 0.3s ease;
    font-family: var(--font-body);
    backdrop-filter: blur(16px);
    max-width: 400px;
  `;
  const colors = {
    success: { bg: "rgba(0,230,118,0.12)", border: "rgba(0,230,118,0.4)", color: "#00e676" },
    error:   { bg: "rgba(255,68,68,0.12)",  border: "rgba(255,68,68,0.4)",  color: "#ff4444" },
    info:    { bg: "rgba(0,212,255,0.12)",  border: "rgba(0,212,255,0.4)",  color: "#00d4ff" },
    warning: { bg: "rgba(255,179,0,0.12)", border: "rgba(255,179,0,0.4)", color: "#ffb300" }
  };
  const c = colors[type] || colors.info;
  toast.style.background = c.bg;
  toast.style.border = `1px solid ${c.border}`;
  toast.style.color = c.color;
  toast.textContent = message;
  document.body.appendChild(toast);
  setTimeout(() => { toast.style.opacity = "0"; toast.style.transition = "opacity 0.3s"; setTimeout(() => toast.remove(), 300); }, 4000);
}

// ─── Check if contract is deployed ───────────────────────────────
function isContractDeployed() {
  return CONTRACT_ADDRESS && CONTRACT_ADDRESS !== "DEPLOY_CONTRACT_FIRST";
}
