App = {
  loading: false,
  contracts: {},

  load: async () => {
    await App.loadWeb3()
    await App.loadAccount()
    await App.loadContract()
    await App.render()
    web3.eth.defaultAccount = web3.eth.accounts[0]
    await App.watchAll()
  },

  connection: async () => {
  },

  loadWeb3: async () => {
    if (typeof web3 !== 'undefined') {
      App.web3Provider = web3.currentProvider
      web3 = new Web3(web3.currentProvider)
    } else {
      window.alert("Please connect to Metamask!")
    }
    
    if (window.ethereum) {
      window.web3 = new Web3(ethereum)
      try {
        await ethereum.enable()
        web3.eth.sendTransaction({/* ... */ })
      } catch (error) {
        console.log('Non-Ethereum Blockchain operations ongoing...')
      }
    } else if (window.web3) {
      App.web3Provider = web3.currentProvider
      window.web3 = new Web3(web3.currentProvider)
      web3.eth.sendTransaction({/* ... */ })
    } else {
      window.alert('Non-Ethereum browser detected. You should consider trying MetaMask!')
    }
  },

  loadAccount: async () => {
    App.account = web3.eth.accounts[0]
    document.getElementById('account').innerHTML = App.account
    await web3.eth.getBalance(App.account, function(error, result){ 
      if(!error) {
        const walletValue = parseInt(result, 10) / 10 ** 18
        document.getElementById('walletBase').innerHTML = walletValue + " Coin" + (walletValue != 1 && walletValue != 0 ? "s" : "")
      } else 
        console.error(error); 
    })
  },

  loadContract: async () => {
    const notarization = await $.getJSON('Notarization.json')
    App.contracts.Notarization = TruffleContract(notarization)
    App.contracts.Notarization.setProvider(App.web3Provider)
    App.notarization = await App.contracts.Notarization.deployed()
  },

  render: async () => {
    if (App.loading) {
      return
    }
    $('#account').html(App.account)
  },

  uploadDocument: async () => {
    if (document.querySelector('#uploadNow').files.length > 0) {
      var file = document.querySelector('#uploadNow').files[0];
      await Hasher.createHash(file)
        .then(async function (hash) {
          console.log("Upload hash: " + hash);
          await App.notarization.upload(document.getElementById("nameNow").value, hash,document.getElementById("commentsNow").value);
          console.log("Il documento è stato " + (await App.notarization.getUpdateStatus() ? "aggiornato" : "caricato") + " correttamente\nNome: " + "nome" + "\nData: " + await App.notarization.getCurrentDocumentDate() + "\nCommenti: " + "commenti" + "\nHash: " + hash + "\nProprietario: " + await App.notarization.getCurrentDocumentOwner());
        })
        .catch(function (err) {
          console.error(err);
        });
    } else {
      window.alert("There was no file selected!");
    }
  },

  checkDocument: async () => {
    if (document.querySelector('#checkNow').files.length > 0) {
      var file = document.querySelector('#checkNow').files[0];
      await Hasher.createHash(file)
        .then(async function (hash) {
          console.log("Check hash: " + hash);
          await App.notarization.check(hash);
          console.log("Il documento cercato " + (await App.notarization.getCurrentDocumentName() == "" ? "non " : "") + "è stato trovato\nNome: " + await App.notarization.getCurrentDocumentName() + "\nData: " + await App.notarization.getCurrentDocumentDate() + "\nCommenti: " + await App.notarization.getCurrentDocumentComments() + "\nHash: " + await App.notarization.getCurrentDocumentHashValue() + "\nProprietario: " + await App.notarization.getCurrentDocumentOwner());
        })
        .catch(function (err) {
          console.error(err);
        });
    } else {
      window.alert("There was no file selected!");
    }
  },

  removeDocument: async () => {
    if (document.querySelector('#removeNow').files.length > 0) {
      var file = document.querySelector('#removeNow').files[0];
      await Hasher.createHash(file)
        .then(async function (hash) {
          console.log("Remove hash: " + hash);
          await App.notarization.remove(hash);
          console.log("Il documento " + (await App.notarization.getRemoveStatus() ? "" : "non ") + "è stato rimosso correttamente\nNome: " + await App.notarization.getCurrentDocumentName() + "\nData: " + await App.notarization.getCurrentDocumentDate() + "\nCommenti: " + await App.notarization.getCurrentDocumentComments() + "\nHash: " + await App.notarization.getCurrentDocumentHashValue() + "\nProprietario: " + await App.notarization.getCurrentDocumentOwner());
        })
        .catch(function (err) {
          console.error(err);
        });
    } else {
      window.alert("There was no file selected!");
    }
  },

  updateTransactions: async () => {
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

Hasher = {
  createHash: async (file) => {
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

    function calculateHash(file) {
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

    return calculateHash(file)
  }
}

Utils = {
  sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

FileUploader = {
  form: document.querySelector(".form"),
  dragText: document.querySelector(".messageDD"),
  fileInput: document.querySelector(".file-input"),
  progressArea: document.querySelector(".progress-area"),
  uploadedArea: document.querySelector(".uploaded-area"),

  eventLoader: async () => {
    FileUploader.form.addEventListener("click", () => {
      FileUploader.fileInput.click();
    });
    
    FileUploader.fileInput.onchange = ({target}) => {
      let file = target.files[0];
      FileUploader.animationUploading(file);
    }
    
    FileUploader.form.addEventListener("dragover", (event) => {
      event.preventDefault();
      FileUploader.form.classList.add("activeForm");
      FileUploader.dragText.innerHTML = "Release to Upload File";
    });
    
    
    FileUploader.form.addEventListener("dragleave", () => {
      FileUploader.closeDrag();
    });
    
    
    FileUploader.form.addEventListener("drop", (event) => {
      event.preventDefault();
      let file = event.dataTransfer.files[0];
      FileUploader.animationUploading(file);
      FileUploader.closeDrag();
    });
  },

  closeDrag: async () => {
    FileUploader.form.classList.remove("activeForm");
    FileUploader.dragText.innerHTML = "Browse or drag &amp; drop";
  },

  animationUploading: async (file) => {
    for (let i = 1; i <= 100; i++) {
      Utils.sleep(i * 20).then(() => {
        FileUploader.progressArea.innerHTML = '<li class="row"><i class="fas fa-file-alt"></i><div class="content"><div class="details"><span class="name">' + file.name + ' - uploading</span><span class="percent">' + i + '%</span></div><div class="progress-bar"><div class="progress" style="width:' + i + '%"></div></div></div></li>';
      });
    }
    let dim = "";
    let size = file.size / 1024;
    if (size <= 1024) {
      dim = size + "KB";
    } else {
      size /= 1024;
      dim = size + "MB";
    }
    Utils.sleep(2200).then(() => {
      FileUploader.uploadedArea.innerHTML += '<li class="row"><div class="content"><i class="fas fa-file-alt"></i><div class="details"><span class="name">' + file.name + ' - uploaded</span><span class="size">' + dim + '</span></div></div><i class="fas fa-check"></i></li>';
      FileUploader.progressArea.innerHTML = '';
    });
  }
}

window.onload = () => {
  App.load()
  FileUploader.eventLoader();
}
