const { ethers } = require("hardhat");
const fs = require("fs");
const path = require("path");

async function main() {
  // Read deployed contract address
  const addressFile = path.join(__dirname, "../public/js/contract-address.js");
  if (!fs.existsSync(addressFile)) {
    console.error("❌ contract-address.js not found. Run npm run deploy first.");
    process.exit(1);
  }
  const content = fs.readFileSync(addressFile, "utf8");
  const match = content.match(/"(0x[a-fA-F0-9]+)"/);
  if (!match) {
    console.error("❌ Could not parse contract address. Run npm run deploy first.");
    process.exit(1);
  }
  const CONTRACT_ADDRESS = match[1];
  console.log("Using contract:", CONTRACT_ADDRESS);

  // Get signers — on Ganache these come from hardhat.config.js accounts[]
  const signers = await ethers.getSigners();
  if (signers.length < 1) {
    console.error("❌ No signers found. Add your Ganache private keys to hardhat.config.js → networks.ganache.accounts");
    process.exit(1);
  }

  const owner  = signers[0];
  // If only 1 account is configured, use owner for everything
  const admin1 = signers[1] || signers[0];
  const admin2 = signers[2] || signers[0];

  console.log("Owner  :", owner.address);
  console.log("Admin1 :", admin1.address);
  console.log("Admin2 :", admin2.address);

  const contract = await ethers.getContractAt("VehicleHistory", CONTRACT_ADDRESS);

  // Authorize admin wallets (skip if already admin to avoid revert)
  const admin1IsAdmin = await contract.isAdmin(admin1.address);
  if (!admin1IsAdmin) {
    await contract.connect(owner).addAdmin(admin1.address, "Garage Centrale Tunis");
    console.log("✅ Admin1 authorized");
  } else {
    console.log("ℹ️  Admin1 already authorized");
  }

  const admin2IsAdmin = await contract.isAdmin(admin2.address);
  if (!admin2IsAdmin) {
    await contract.connect(owner).addAdmin(admin2.address, "Centre Inspection Auto");
    console.log("✅ Admin2 authorized");
  } else {
    console.log("ℹ️  Admin2 already authorized");
  }

  // ── Vehicle 1: VW Golf 2019 (good history) ─────────────────────
  const vin1 = "WVWZZZ1JZ3W386752";
  const v1Exists = await contract.vehicleExists(vin1);
  if (!v1Exists) {
    await contract.connect(admin1).registerVehicle(vin1, "Volkswagen", "Golf", 2019, "Silver", "0 km");
    await contract.connect(admin1).addRecord(vin1, "Maintenance", "Premiere vidange + filtre a huile a 5000 km", "5000 km", "Huile Castrol 5W-30");
    await contract.connect(admin1).addRecord(vin1, "Repair", "Remplacement plaquettes de frein avant", "28000 km", "Plaquettes Bosch BP1234");
    await contract.connect(admin1).addRecord(vin1, "Maintenance", "Vidange + filtre + filtre a air + filtre habitacle", "30000 km", "Kit entretien complet VW");
    await contract.connect(admin2).addRecord(vin1, "Inspection", "Controle technique annuel - Resultat: CONFORME", "31000 km", "");
    await contract.connect(admin1).addRecord(vin1, "Part Replacement", "Remplacement batterie 12V", "44000 km", "Batterie Varta 60Ah");
    await contract.connect(admin1).addRecord(vin1, "Maintenance", "Vidange + remplacement courroie distribution", "50000 km", "Kit distribution OEM VW");
    console.log("✅ VW Golf seeded (6 records)");
  } else {
    console.log("ℹ️  VW Golf already exists, skipping");
  }

  // ── Vehicle 2: Renault Clio 2018 (accident history) ────────────
  const vin2 = "VF1RFB00061234567";
  const v2Exists = await contract.vehicleExists(vin2);
  if (!v2Exists) {
    await contract.connect(admin1).registerVehicle(vin2, "Renault", "Clio", 2018, "Red", "12000 km");
    await contract.connect(admin1).addRecord(vin2, "Maintenance", "Vidange huile moteur + filtre", "20000 km", "Huile Renault 5W-40");
    await contract.connect(admin2).addRecord(vin2, "Accident", "Collision frontale legere - Dommages: capot, pare-chocs avant, radiateur", "34000 km", "");
    await contract.connect(admin1).addRecord(vin2, "Repair", "Remplacement radiateur + pare-chocs avant + capot", "35000 km", "Pieces origine Renault");
    await contract.connect(admin2).addRecord(vin2, "Inspection", "Controle technique post-accident - Resultat: CONFORME apres reparations", "35500 km", "");
    console.log("✅ Renault Clio seeded (4 records, 1 accident)");
  } else {
    console.log("ℹ️  Renault Clio already exists, skipping");
  }

  // ── Vehicle 3: Skoda Octavia 2021 (excellent history) ──────────
  const vin3 = "TMBJP9NE4G0234567";
  const v3Exists = await contract.vehicleExists(vin3);
  if (!v3Exists) {
    await contract.connect(admin2).registerVehicle(vin3, "Skoda", "Octavia", 2021, "Black", "0 km");
    await contract.connect(admin2).addRecord(vin3, "Maintenance", "Premiere revision constructeur a 15000 km", "15000 km", "Kit revision Skoda OEM");
    await contract.connect(admin2).addRecord(vin3, "Inspection", "Controle technique - Resultat: CONFORME", "16000 km", "");
    await contract.connect(admin1).addRecord(vin3, "Maintenance", "Vidange + filtre a huile + filtre a air", "30000 km", "Huile Castrol 0W-30 LL");
    await contract.connect(admin1).addRecord(vin3, "Part Replacement", "Remplacement pneus avant (usure normale)", "38000 km", "Michelin Primacy 4 205/55 R16");
    await contract.connect(admin2).addRecord(vin3, "Inspection", "Controle technique annuel - Resultat: CONFORME", "40000 km", "");
    await contract.connect(admin1).addRecord(vin3, "Maintenance", "Revision 45000 km - vidange + filtres + bougies", "45000 km", "Bougies NGK ILFR6B");
    await contract.connect(admin2).addRecord(vin3, "Inspection", "Inspection pre-vente - Resultat: EXCELLENT ETAT", "46000 km", "");
    console.log("✅ Skoda Octavia seeded (7 records)");
  } else {
    console.log("ℹ️  Skoda Octavia already exists, skipping");
  }

  console.log("\n─── Demo VINs ─────────────────────────────────────────────────");
  console.log("VW Golf 2019 Silver:    WVWZZZ1JZ3W386752  (trust score ~88)");
  console.log("Renault Clio 2018 Red:  VF1RFB00061234567  (trust score ~52, accident)");
  console.log("Skoda Octavia 2021 Blk: TMBJP9NE4G0234567  (trust score ~97)");
  console.log("\n🎉 Seeding complete!");
}

main().catch((e) => { console.error(e); process.exitCode = 1; });
