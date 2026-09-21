require("@nomicfoundation/hardhat-toolbox");

/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
  solidity: "0.8.24",
  networks: {
    localhost: {
      url: "http://127.0.0.1:8545",
      chainId: 31337
    },
    ganache: {
      url: "http://127.0.0.1:7545",
      chainId: 1337,
      accounts: [
        "0x9f5f918525902fd5194fcfe04169d57ee0f78e142fea7d9ea5f1df51b26c3ea6",
        "0x668af3b069d1afe7013d410fc02734f7728be767023f01e3388fbea172c3c3ec",
        "0xb893f235d2e07d818ebe07f92bfc66e72d39fe99274ceeea0b10180c64a63458",
      ]
    }
  },
  paths: {
    artifacts: "./public/artifacts"
  }
};
