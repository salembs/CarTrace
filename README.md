# CarTrace 🔗

> Blockchain-Powered Vehicle History Platform

A decentralized web platform that stores and secures tamper-proof vehicle modification histories on the blockchain. Every repair, maintenance, inspection, and part replacement is recorded permanently and publicly accessible by VIN.

## 🛠️ Tech Stack

* **Smart Contract:** Solidity 0.8 + Hardhat

* **Blockchain Bridge:** ethers.js v6

* **Backend:** Node.js + Express.js + SQLite

* **Frontend:** HTML5, CSS3, Vanilla JavaScript, Google Fonts (Orbitron/Syne)

* **Wallet:** MetaMask

## 🚀 Quick Start (5 Minutes)

### 1. Install Dependencies

```
cd cartrace
npm install

```

### 2. Run Local Environment (3 Terminals)

* **Terminal 1 (Local Blockchain):**

  ```
  npm run chain
  
  ```

* **Terminal 2 (Deploy Contract):**

  ```
  npm run compile
  npm run deploy
  
  ```

* **Terminal 3 (Database & Server):**

  ```
  npm run setup-db
  npm run seed
  npm start
  
  ```

### 3. Configure MetaMask

* Add Local Network: RPC `http://127.0.0.1:8545`, Chain ID `31337`, Currency `ETH`.

* Import a test private key from Terminal 1 output.

## 🔗 Access & Demo Accounts

* **Public Portal:** `http://localhost:3000`

* **Admin Login:** `http://localhost:3000/admin/login.html`

| Username | Password | Role | 
 | ----- | ----- | ----- | 
| `garage_centrale` | `admin123` | Garage | 
| `inspect_auto` | `admin123` | Inspection Center | 
| `toyota_tn` | `admin123` | OEM | 

### Demo VINs

* `WVWZZZ1JZ3W386752` (VW Golf 2019)

* `VF1RFB00061234567` (Renault Clio 2018)

* `TMBJP9NE4G0234567` (Skoda Octavia 2021)
