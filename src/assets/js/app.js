App = {
  loading: false,
  contracts: {},

  load: async () => {
    await App.loadWeb3()
    await App.loadAccount()
    await App.loadContract()
    await App.render()
    web3.eth.defaultAccount = web3.eth.accounts[0]
  },

  loadWeb3: async () => {
    if (typeof web3 !== 'undefined') {
      App.web3Provider = web3.currentProvider
      web3 = new Web3(web3.currentProvider)
    } else {
      window.alert("Please connect to Metamask.")
    }
    // Modern dapp browsers...
    if (window.ethereum) {
      window.web3 = new Web3(ethereum)
      try {
        // Request account access if needed
        await ethereum.enable()
        // Acccounts now exposed
        web3.eth.sendTransaction({/* ... */ })
      } catch (error) {
        // User denied account access...
        console.log('User denied account access!')
      }
    }
    // Legacy dapp browsers...
    else if (window.web3) {
      App.web3Provider = web3.currentProvider
      window.web3 = new Web3(web3.currentProvider)
      // Acccounts always exposed
      web3.eth.sendTransaction({/* ... */ })
    }
    // Non-dapp browsers...
    else {
      console.log('Non-Ethereum browser detected. You should consider trying MetaMask!')
    }
  },

  loadAccount: async () => {
    // Set the current blockchain account
    App.account = web3.eth.accounts[0]
  },

  loadContract: async () => {
    // Create a JavaScript version of the smart contract
    const notarization = await $.getJSON('Notarization.json')
    App.contracts.Notarization = TruffleContract(notarization)
    App.contracts.Notarization.setProvider(App.web3Provider)

    // Hydrate the smart contract with values from the blockchain
    App.notarization = await App.contracts.Notarization.deployed()
  },

  render: async () => {
    // Prevent double render
    if (App.loading) {
      return
    }

    // Render Account
    $('#account').html(App.account)
  },

  uploadDocument: async () => {
    if (document.querySelector('#upload').files.length > 0) {
      var file = document.querySelector('#upload').files[0];
      createHash(file)
        .then(async function (hash) {
          console.log("Upload hash: " + hash);
          await App.notarization.upload("nome", hash, "commenti");
          console.log("Il documento è stato " + (await App.notarization.getUpdateStatus() ? "aggiornato" : "caricato") + " correttamente\nNome: " + "nome" + "\nData: " + await App.notarization.getCurrentDocumentDate() + "\nCommenti: " + "commenti" + "\nHash: " + hash + "\nProprietario: " + await App.notarization.getCurrentDocumentOwner());
        })
        .catch(function (err) {
          console.error(err);
        });
    } else {
      console.log("There was no file selected!");
    }
  },

  checkDocument: async () => {
    if (document.querySelector('#check').files.length > 0) {
      var file = document.querySelector('#check').files[0];
      createHash(file)
        .then(async function (hash) {
          console.log("Check hash: " + hash);
          await App.notarization.check(hash);
          console.log("Il documento cercato " + (await App.notarization.getCurrentDocumentName() == "" ? "non " : "") + "è stato trovato\nNome: " + await App.notarization.getCurrentDocumentName() + "\nData: " + await App.notarization.getCurrentDocumentDate() + "\nCommenti: " + await App.notarization.getCurrentDocumentComments() + "\nHash: " + await App.notarization.getCurrentDocumentHashValue() + "\nProprietario: " + await App.notarization.getCurrentDocumentOwner());
        })
        .catch(function (err) {
          console.error(err);
        });
    } else {
      console.log("There was no file selected!");
    }
  },

  removeDocument: async () => {
    if (document.querySelector('#remove').files.length > 0) {
      var file = document.querySelector('#remove').files[0];
      createHash(file)
        .then(async function (hash) {
          console.log("Remove hash: " + hash);
          await App.notarization.remove(hash);
          console.log("Il documento " + (await App.notarization.getRemoveStatus() ? "" : "non ") + "è stato rimosso correttamente\nNome: " + await App.notarization.getCurrentDocumentName() + "\nData: " + await App.notarization.getCurrentDocumentDate() + "\nCommenti: " + await App.notarization.getCurrentDocumentComments() + "\nHash: " + await App.notarization.getCurrentDocumentHashValue() + "\nProprietario: " + await App.notarization.getCurrentDocumentOwner());
        })
        .catch(function (err) {
          console.error(err);
        });
    } else {
      console.log("There was no file selected!");
    }
  },

  watchAll: async () => {
    var documents = await App.notarization.getDocumentCount();
    var interactions = await App.notarization.getInteractionCount();
    for (var d = 1; d < documents; d++) {
      console.log(await App.notarization.documentMapping(d));
    }
    for (var i = 0; i < interactions; i++) {
      console.log(await App.notarization.interactionMapping(i));
    }
  }
}

$(() => {
  $(window).load(() => {
    App.load()
  })
})

function createHash(file) {
  return new Promise(function (resolve, reject) {
    var reader = new FileReader();
    reader.onload = function () {
      var buffer = this.result;
      crypto.subtle.digest('SHA-256', buffer)
        .then(function (hash) {
          resolve(toHex(hash));
        })
        .catch(reject);
    };
    reader.onerror = reject;
    reader.readAsArrayBuffer(file);
  });
}

function toHex(buffer) {
  var i, n, k, value, stringValue, padding, paddedValue;
  var hexCodes = [];
  var view = new DataView(buffer);
  for (i = 0, n = view.byteLength, k = Uint32Array.BYTES_PER_ELEMENT; i < n; i += k) {
    value = view.getUint32(i);
    stringValue = value.toString(16);
    padding = '00000000';
    paddedValue = (padding + stringValue).slice(-padding.length);
    hexCodes.push(paddedValue);
  }
  var hash = hexCodes.join('');
  if (hash.substring(0, 2) !== '0x') {
    hash = "0x" + hash;
  }
  return hash;
}
