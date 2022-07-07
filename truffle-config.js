const HDWalletProvider = require('@truffle/hdwallet-provider');
const fs = require('fs');
const lines = fs.readFileSync(".secret", 'utf-8').split('\n');
const mnemonic = lines[0].trim();
const infuraKey = lines[1];

module.exports = {
  networks: {
    polygon: {
      provider: () => new HDWalletProvider(mnemonic, `https://polygon-mainnet.infura.io/v3/${infuraKey}`),
      network_id: 137
    },
    mainnet: {
      provider: () => new HDWalletProvider(mnemonic, `https://mainnet.infura.io/v3/${infuraKey}`),
      network_id: 1
    },
    palm: {
      provider: () => new HDWalletProvider(mnemonic, `https://palm-mainnet.infura.io/v3/${infuraKey}`),
      network_id: 11297108109
    },
    aurora: {
      provider: () => new HDWalletProvider(mnemonic, `https://aurora-mainnet.infura.io/v3/${infuraKey}`),
      network_id: 1313161554
    },
    near: {
      provider: () => new HDWalletProvider(mnemonic, `https://near-mainnet.infura.io/v3/${infuraKey}`),
      network_id: 1313161554
    },
    development: {
      host: "127.0.0.1",
      port: 8545,
      network_id: "*" // Match any network id
    },
    mumbai: {
      provider: () => new HDWalletProvider(mnemonic, `https://polygon-mumbai.infura.io/v3/${infuraKey}`),
      network_id: 80001
    },
    ropsten: {
      provider: () => new HDWalletProvider(mnemonic, `https://ropsten.infura.io/v3/${infuraKey}`),
      network_id: 3
    },
    kovan: {
      provider: () => new HDWalletProvider(mnemonic, `https://kovan.infura.io/v3/${infuraKey}`),
      network_id: 42
    },
    rinkeby: {
      provider: () => new HDWalletProvider(mnemonic, `https://rinkeby.infura.io/v3/${infuraKey}`),
      network_id: 4
    },
    gorli: {
      provider: () => new HDWalletProvider(mnemonic, `https://goerli.infura.io/v3/${infuraKey}`),
      network_id: 5
    },
    palmtestnet: {
      provider: () => new HDWalletProvider(mnemonic, `https://palm-testnet.infura.io/v3/${infuraKey}`),
      network_id: 11297108099
    },
    auroratestnet: {
      provider: () => new HDWalletProvider(mnemonic, `https://aurora-testnet.infura.io/v3/${infuraKey}`),
      network_id: 1313161555
    },
    neartestnet: {
      provider: () => new HDWalletProvider(mnemonic, `https://near-testnet.infura.io/v3/${infuraKey}`),
      network_id: 1313161555
    }
  },
  compilers: {
    solc: {
      optimizer: {
        enabled: true,
        runs: 200
      }
    }
  }
}