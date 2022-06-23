App = {
  files: [],
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
    if (App.files.length > 0 && GraphicsUpdater.nameNow != "") {
      await Hasher.createHash(App.files)
        .then(async function (hash) {
          var n = GraphicsUpdater.nameNow.value;
          var c = GraphicsUpdater.commentsNow.value;
          await App.notarization.upload(n, hash, c);
          GraphicsUpdater.notifications(GraphicsUpdater.notifyArea1, ["The document have been " + (await App.notarization.getUpdateStatus() ? "updated" : "uploaded") + " correctly!", n, c, Utils.epochConverter(await App.notarization.getCurrentDocumentDate()), hash, await App.notarization.getCurrentDocumentOwner()]);
          
          GraphicsUpdater.resetLine(GraphicsUpdater.nameNow);
          GraphicsUpdater.resetLine(GraphicsUpdater.commentsNow);
          GraphicsUpdater.resetArea(GraphicsUpdater.progressArea1);
          GraphicsUpdater.resetArea(GraphicsUpdater.uploadedArea1);
          GraphicsUpdater.resetFiles();
        })
        .catch(function (err) {
          console.error(err);
        });
    } else if (GraphicsUpdater.nameNow == "") {
      GraphicsUpdater.errorMessage(GraphicsUpdater.notifyArea1, "Empty name found!");
    } else {
      GraphicsUpdater.errorMessage(GraphicsUpdater.notifyArea1, "No document found!");
    }
  },

  checkDocument: async () => {
    if (App.files.length > 0) {
      await Hasher.createHash(App.files)
        .then(async function (hash) {
          await App.notarization.check(hash);
          var n = await App.notarization.getCurrentDocumentName();
          GraphicsUpdater.notifications(GraphicsUpdater.notifyArea2, ["The document have " + (n == "" ? "not " : "") + " been found!", n, await App.notarization.getCurrentDocumentComments(), Utils.epochConverter(await App.notarization.getCurrentDocumentDate()), hash, await App.notarization.getCurrentDocumentOwner()]);
          
          GraphicsUpdater.resetArea(GraphicsUpdater.progressArea2);
          GraphicsUpdater.resetArea(GraphicsUpdater.uploadedArea2);
          GraphicsUpdater.resetFiles();
        })
        .catch(function (err) {
          console.error(err);
        });
    } else {
      GraphicsUpdater.errorMessage(GraphicsUpdater.notifyArea2, "No document found!");
    }
  },

  removeDocument: async () => {
    if (App.files.length > 0) {
      await Hasher.createHash(App.files)
        .then(async function (hash) {
          await App.notarization.remove(hash);
          GraphicsUpdater.notifications(GraphicsUpdater.notifyArea3, ["The document have " + (await App.notarization.getRemoveStatus() ? "" : "not ") + " been removed correctly!", await App.notarization.getCurrentDocumentName(), await App.notarization.getCurrentDocumentComments(), Utils.epochConverter(await App.notarization.getCurrentDocumentDate()), hash, await App.notarization.getCurrentDocumentOwner()]);
          
          GraphicsUpdater.resetArea(GraphicsUpdater.progressArea3);
          GraphicsUpdater.resetArea(GraphicsUpdater.uploadedArea3);
          GraphicsUpdater.resetFiles();
        })
        .catch(function (err) {
          console.error(err);
        });
    } else {
      GraphicsUpdater.errorMessage(GraphicsUpdater.notifyArea3, "No document found!");
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
  createHash: async (files) => {
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

    function calculateHash(files) {
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
        reader.readAsArrayBuffer(new Blob(files));
      });
    }

    return calculateHash(files)
  }
}

Utils = {
  sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  },

  epochConverter(time) {
    var myDate = new Date(time * 1000);
    return "" + myDate.toGMTString();
  }
}

GraphicsUpdater = {
  form1: document.querySelectorAll(".form")[0],
  dragText1: document.querySelectorAll(".dragText")[0],
  fileInput1: document.querySelectorAll(".file-input")[0],
  progressArea1: document.querySelectorAll(".progress-area")[0],
  uploadedArea1: document.querySelectorAll(".uploaded-area")[0],
  form2: document.querySelectorAll(".form")[1],
  dragText2: document.querySelectorAll(".dragText")[1],
  fileInput2: document.querySelectorAll(".file-input")[1],
  progressArea2: document.querySelectorAll(".progress-area")[1],
  uploadedArea2: document.querySelectorAll(".uploaded-area")[1],
  form3: document.querySelectorAll(".form")[2],
  dragText3: document.querySelectorAll(".dragText")[2],
  fileInput3: document.querySelectorAll(".file-input")[2],
  progressArea3: document.querySelectorAll(".progress-area")[2],
  uploadedArea3: document.querySelectorAll(".uploaded-area")[2],
  numFiles: 0,
  nameNow: document.getElementById("nameNow"),
  commentsNow: document.getElementById("commentsNow"),
  notifyArea1: document.querySelectorAll(".notification")[0],
  notifyArea2: document.querySelectorAll(".notification")[1],
  notifyArea3: document.querySelectorAll(".notification")[2],
  pastNotifyArea: null,

  eventLoader: async () => {
    GraphicsUpdater.form1.addEventListener("click", async () => {
      GraphicsUpdater.fileInput1.click();
    });

    GraphicsUpdater.form2.addEventListener("click", async () => {
      GraphicsUpdater.fileInput2.click();
    });

    GraphicsUpdater.form3.addEventListener("click", async () => {
      GraphicsUpdater.fileInput3.click();
    });

    GraphicsUpdater.fileInput1.onchange = async ({target}) => {
      GraphicsUpdater.animationUploading(target.files[0], GraphicsUpdater.progressArea1, GraphicsUpdater.uploadedArea1);
    }

    GraphicsUpdater.fileInput2.onchange = async ({target}) => {
      GraphicsUpdater.animationUploading(target.files[0], GraphicsUpdater.progressArea2, GraphicsUpdater.uploadedArea2);
    }

    GraphicsUpdater.fileInput3.onchange = async ({target}) => {
      GraphicsUpdater.animationUploading(target.files[0], GraphicsUpdater.progressArea3, GraphicsUpdater.uploadedArea3);
    }
    
    GraphicsUpdater.form1.addEventListener("dragover", async (event) => {
      event.preventDefault();
      GraphicsUpdater.openDrag(GraphicsUpdater.form1, GraphicsUpdater.dragText1);
    });
    
    GraphicsUpdater.form2.addEventListener("dragover", async (event) => {
      event.preventDefault();
      GraphicsUpdater.openDrag(GraphicsUpdater.form2, GraphicsUpdater.dragText2);
    });
    
    GraphicsUpdater.form3.addEventListener("dragover", async (event) => {
      event.preventDefault();
      GraphicsUpdater.openDrag(GraphicsUpdater.form3, GraphicsUpdater.dragText3);
    });
    
    GraphicsUpdater.form1.addEventListener("dragleave", async () => {
      GraphicsUpdater.closeDrag();
    });
    
    GraphicsUpdater.form2.addEventListener("dragleave", async () => {
      GraphicsUpdater.closeDrag();
    });
    
    GraphicsUpdater.form3.addEventListener("dragleave", async () => {
      GraphicsUpdater.closeDrag();
    });
    
    GraphicsUpdater.form1.addEventListener("drop", async (event) => {
      event.preventDefault();
      GraphicsUpdater.animationUploading(event.dataTransfer.files[0], GraphicsUpdater.progressArea1, GraphicsUpdater.uploadedArea1);
      GraphicsUpdater.closeDrag(GraphicsUpdater.form1, GraphicsUpdater.dragText1);
    });
    
    GraphicsUpdater.form2.addEventListener("drop", async (event) => {
      event.preventDefault();
      GraphicsUpdater.animationUploading(event.dataTransfer.files[0], GraphicsUpdater.progressArea2, GraphicsUpdater.uploadedArea2);
      GraphicsUpdater.closeDrag(GraphicsUpdater.form2, GraphicsUpdater.dragText2);
    });
    
    GraphicsUpdater.form3.addEventListener("drop", async (event) => {
      event.preventDefault();
      GraphicsUpdater.animationUploading(event.dataTransfer.files[0], GraphicsUpdater.progressArea3, GraphicsUpdater.uploadedArea3);
      GraphicsUpdater.closeDrag(GraphicsUpdater.form3, GraphicsUpdater.dragText3);
    });
  },

  openDrag: async (form, dragText) => {
    form.classList.add("activeForm");
    dragText.innerHTML = "Release to Upload File";
  },

  closeDrag: async (form, dragText) => {
    form.classList.remove("activeForm");
    dragText.innerHTML = "Browse or drag &amp; drop";
  },

  resetLine: async (e) => {
    e.value = "";
  },

  resetArea: async (e) => {
    e.innerHTML = "";
  },

  resetFiles: async () => {
    GraphicsUpdater.numFiles = 0;
    App.files = [];
  },

  bannerCreator: async () => {

  },

  errorMessage: async (notifyArea, toNotify, idOperation) => {
    switch (idOperation) {
      case 1:

        break;
      case 2:

        break;
      default:

    }

  },

  notifications1: async (toNotify, image) => {
    GraphicsUpdater.pastNotifyArea.innerHTML = "";
    GraphicsUpdater.notifyArea1.innerHTML = '<div class="banner"><header id="section-header"><h2 data-aos="fade-up">Notification</h2><p data-aos="fade-up" data-aos-delay="100">View your transaction</p></header><div class="container" data-aos="fade-up" data-aos-delay="200"><div class="row g-5"><div class="col-lg-4 col-md-6 order-first order-md-last d-flex align-items-center"></div></div><div class="col-lg-8 col-md-6 content d-flex flex-column justify-content-center order-last order-md-first"><h3 data-aos="fade-up" data-aos-delay="250">The followings are the recap information of the operation you just did</h3><h2 data-aos="fade-up" data-aos-delay="300">Some Blockchain stuff just happend!</h2>';
    for (var i = 0; i < toNotify.length; i++) {
      GraphicsUpdater.notifyArea1.innerHTML += '<span data-aos="fade-up" data-aos-delay="350">' + toNotify[i] + "</span></br>";
    }
    GraphicsUpdater.notifyArea1 += '</div></div></div><div class="img"><img src="assets/img/material/vectorial/' + image + '" class="img-fluid antiFloating bottomSpace upperSpace" data-aos="zoom-out" data-aos-delay="400"></div></div>';
    GraphicsUpdater.notifyArea1.scrollIntoView();
    GraphicsUpdater.pastNotifyArea = GraphicsUpdater.notifyArea1;
  },

  notifications2: async (toNotify) => {
    GraphicsUpdater.pastNotifyArea.innerHTML = "";
    GraphicsUpdater.notifyArea2.innerHTML = '<div class="banner"><header id="section-header"><h2 data-aos="fade-up">Notification</h2><p data-aos="fade-up" data-aos-delay="100">View your transaction</p></header><div class="container" data-aos="fade-up" data-aos-delay="200"><div class="row g-5"><div class="col-lg-4 col-md-6 order-first order-md-last d-flex align-items-center"><div class="img"><img src="assets/img/material/vectorial/hero-carousel-2.svg" class="img-fluid antiFloating bottomSpace upperSpace" data-aos="zoom-out" data-aos-delay="400"></div></div><div class="col-lg-8 col-md-6 content d-flex flex-column justify-content-center order-last order-md-first"><h3 data-aos="fade-up" data-aos-delay="250">The followings are the recap information of the operation you just did</h3><h2 data-aos="fade-up" data-aos-delay="300">Some Blockchain stuff just happend!</h2>';
    for (var i = 0; i < toNotify.length; i++) {
      GraphicsUpdater.notifyArea2.innerHTML += '<span data-aos="fade-up" data-aos-delay="350">' + toNotify[i] + "</span></br>";
    }
    GraphicsUpdater.notifyArea2 += '</div></div></div></div></div>';
    GraphicsUpdater.notifyArea2.scrollIntoView();
    GraphicsUpdater.pastNotifyArea = GraphicsUpdater.notifyArea2;
  },

  animationUploading: async (file, progressArea, uploadedArea) => {
    App.files[GraphicsUpdater.numFiles++] = file;
    for (let i = 1; i <= 100; i++) {
      Utils.sleep(i * 20).then(() => {
        progressArea.innerHTML = '<li class="row"><i class="fas fa-file-alt"></i><div class="content"><div class="details"><span class="name">' + file.name + ' - uploading</span><span class="percent">' + i + '%</span></div><div class="progress-bar"><div class="progress" style="width:' + i + '%"></div></div></div></li>';
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
      uploadedArea.innerHTML += '<li class="row"><div class="content"><i class="fas fa-file-alt"></i><div class="details"><span class="name">' + file.name + ' - uploaded</span><span class="size">' + dim + '</span></div></div><i class="fas fa-check"></i></li>';
      progressArea.innerHTML = '';
    });
  }
}

window.onload = () => {
  App.load()
  GraphicsUpdater.eventLoader();
}