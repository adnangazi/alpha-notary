App = {
  files: [],
  contractDecisor: true,
  contracts: {},

  load: async () => {
    if (typeof web3 !== 'undefined') {
      App.web3Provider = web3.currentProvider;
      web3 = new Web3(web3.currentProvider);
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

    App.account = web3.eth.accounts[0];
    document.getElementById('account').innerHTML = App.account;
    await web3.eth.getBalance(App.account, function(error, result){ 
      if(!error) {
        const walletValue = parseInt(result, 10) / 10 ** 18;
        document.getElementById('walletBase').innerHTML = walletValue + " Coin" + (walletValue != 1 && walletValue != 0 ? "s" : "");
      } else {
        console.error(error);
      }
    })

    App.contracts.Notarization = TruffleContract(await $.getJSON('Notarization.json'));
    App.contracts.Notary = TruffleContract(await $.getJSON('Notary.json'));
    App.contracts.Notarization.setProvider(App.web3Provider);
    App.contracts.Notary.setProvider(App.web3Provider);
    App.notarization = await App.contracts.Notarization.deployed();
    App.notary= await App.contracts.Notary.deployed();
    App.switchContract();

    web3.eth.defaultAccount = web3.eth.accounts[0];

    App.monitoring();
  },

  uploadDocument: async () => {
    if (App.files.length > 0 && GraphicsUpdater.nameNow != "") {
      await Utils.createHash(App.files)
        .then(async function (hash) {
          var n = GraphicsUpdater.nameNow.value;
          var c = GraphicsUpdater.commentsNow.value;
          await App.contract.upload(n, hash, c);
          GraphicsUpdater.notifierGUI(GraphicsUpdater.notifyArea1, ["The document have been " + (await App.contract.getUpdateStatus() ? "updated" : "uploaded") + " correctly!", "Name", n, "Comments", c, "Date", Utils.epochConverter(await App.contract.getCurrentDocumentDate()), "Hash", hash, "Owner", await App.contract.getCurrentDocumentOwner()], 1);
          
          GraphicsUpdater.resetLine(GraphicsUpdater.nameNow);
          GraphicsUpdater.resetLine(GraphicsUpdater.commentsNow);
          GraphicsUpdater.resetArea(GraphicsUpdater.progressArea1);
          GraphicsUpdater.resetArea(GraphicsUpdater.uploadedArea1);
          GraphicsUpdater.resetFiles();
          App.insertInteraction();
        })
        .catch(function (err) {
          console.error(err);
        });
    } else if (GraphicsUpdater.nameNow == "") {
      GraphicsUpdater.notifierGUI(GraphicsUpdater.notifyArea1, ["Empty name found!"], 1);
    } else {
      GraphicsUpdater.notifierGUI(GraphicsUpdater.notifyArea1, ["No document found!"], 1);
    }
  },

  checkDocument: async () => {
    if (App.files.length > 0) {
      await Utils.createHash(App.files)
        .then(async function (hash) {
          await App.contract.check(hash);
          var n = await App.contract.getCurrentDocumentName();
          GraphicsUpdater.notifierGUI(GraphicsUpdater.notifyArea2, ["The document have " + (n == "" ? "not " : "") + " been found!", "Name", n, "Comments", await App.contract.getCurrentDocumentComments(), "Date", Utils.epochConverter(await App.contract.getCurrentDocumentDate()), "Hash", hash, "Owner", await App.contract.getCurrentDocumentOwner()], 2);
          
          GraphicsUpdater.resetArea(GraphicsUpdater.progressArea2);
          GraphicsUpdater.resetArea(GraphicsUpdater.uploadedArea2);
          GraphicsUpdater.resetFiles();
          App.insertInteraction();
        })
        .catch(function (err) {
          console.error(err);
        });
    } else {
      GraphicsUpdater.notifierGUI(GraphicsUpdater.notifyArea2, ["No document found!"], 2);
    }
  },

  removeDocument: async () => {
    if (App.files.length > 0) {
      await Utils.createHash(App.files)
        .then(async function (hash) {
          await App.contract.remove(hash);
          GraphicsUpdater.notifierGUI(GraphicsUpdater.notifyArea3, ["The document have " + (await App.contract.getRemoveStatus() ? "" : "not ") + " been removed correctly!", "Name", await App.contract.getCurrentDocumentName(), "Comments", await App.contract.getCurrentDocumentComments(), "Date", Utils.epochConverter(await App.contract.getCurrentDocumentDate()), "Hash", hash, "Owner", await App.contract.getCurrentDocumentOwner()], 3);
          
          GraphicsUpdater.resetArea(GraphicsUpdater.progressArea3);
          GraphicsUpdater.resetArea(GraphicsUpdater.uploadedArea3);
          GraphicsUpdater.resetFiles();
          App.insertInteraction();
        })
        .catch(function (err) {
          console.error(err);
        });
    } else {
      GraphicsUpdater.notifierGUI(GraphicsUpdater.notifyArea3, ["No document found!"], 3);
    }
  },

  monitoring: async () => {
    var documents = await App.contract.getDocumentCount();
    var interactions = await App.contract.getInteractionCount();
    for (var d = 1; d < documents; d++) {
      console.log(await App.contract.documentMapping(d));
    }
    for (var i = 0; i < interactions; i++) {
      console.log(await App.contract.interactionMapping(i));
    }
  },

  insertInteraction: async () => {
  },

  switchContract: async() => {
    App.contract = App.contractDecisor ? App.notarization : App.notary;
    App.contractDecisor = !App.contractDecisor;
  }
}

Utils = {
  sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  },

  epochConverter(time) {
    var myDate = new Date(time * 1000);
    return "" + myDate.toGMTString();
  },

  createHash: (files) => {
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

    return new Promise(function (resolve, reject) {
      var reader = new FileReader();
      reader.onload = function () {
        crypto.subtle.digest('SHA-256', this.result)
          .then(function (hash) {
            resolve(toHex(hash));
          })
          .catch(function (err) {
            console.error(err);
          });
      };
      reader.onerror = reject;
      reader.readAsArrayBuffer(new Blob(files));
    });
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
  image1: "assets/img/material/vectorial/intro-img.svg",
  image2: "assets/img/material/vectorial/hero-carousel-2.svg",
  image3: "assets/img/material/vectorial/features-5.svg",
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

  notifierGUI: async (notifyArea, toNotify, idOperation) => {
    if (GraphicsUpdater.pastNotifyArea != null) {
      GraphicsUpdater.pastNotifyArea.innerHTML = "";
    }
    GraphicsUpdater.pastNotifyArea = notifyArea;

    notifyArea.innerHTML = '<div class="banner"><header id="section-header"><h2 data-aos="fade-up">Notification</h2><p data-aos="fade-up" data-aos-delay="100">View your transaction</p></header><div class="container" data-aos="fade-up" data-aos-delay="200"><div id="containerID" class="row g-5"></div></div></div>';
    var containerID = document.getElementById("containerID");
    var image = '<div class="col-lg-4 col-md-6 d-flex align-items-center aos-init aos-animate" data-aos="zoom-out" data-aos-delay="400"><div class="img"><img id="containerImage" class="img-fluid bottomSpace upperSpace"></div></div>';
    var lines = '<div class="col-lg-8 col-md-6 content d-flex flex-column justify-content-center"><h3 data-aos="fade-up" data-aos-delay="250" class="aos-init aos-animate">The followings are the recap information of the operation you just did</h3><h2 data-aos="fade-up" data-aos-delay="300" class="aos-init aos-animate">Some Blockchain stuff just happend!</h2><p id="containerLines"></p></div>';
    containerID.innerHTML = idOperation % 2 ? image + lines : lines + image;
    var containerImage = document.getElementById("containerImage");
    var containerLines = document.getElementById("containerLines");
    
    if (idOperation % 2) {
      containerImage.classList.add("floating");
    } else {
      containerImage.classList.add("antiFloating");
    }

    switch (idOperation) {
      case 1:
        containerImage.src = GraphicsUpdater.image1;
        break;
      case 2:
        containerImage.src = GraphicsUpdater.image2;
        break;
      default:
        containerImage.src = GraphicsUpdater.image3;
    }

    containerLines.innerHTML = '<b>' + toNotify[0] + '</b>';
    for (var i = 1; i < toNotify.length; i++) {
      if (i % 2) {
        containerLines.innerHTML += '</br><b>' + toNotify[i] + ':</b> ';
      } else {
        containerLines.innerHTML += toNotify[i];
      }
    }
    
    window.scrollTo(0, notifyArea.offsetTop-250);
  },

  animationUploading: async (file, progressArea, uploadedArea) => {
    function progressLoading(file, progressArea) {
      progressArea.innerHTML = '<li class="row"><i class="fas fa-file-alt"></i><div class="content"><div class="details"><span class="name" id="uploadingName"></span><span class="percent" id="percentValue"></span></div><div class="progress-bar"><div class="progress" id="progressWidth" style="width:0%"></div></div></div></li>';
      var uploadingName = document.getElementById("uploadingName");
      var progressWidth = document.getElementById("progressWidth");
      var percentValue = document.getElementById("percentValue");
      var percVal;
      for (let i = 1; i <= 100; i++) {
        Utils.sleep(i * 20).then(() => {
          percVal = i + "%";
          uploadingName.innerHTML = file.name;
          percentValue.innerHTML = percVal;
          progressWidth.style.width = percVal;
        });
      }
    }

    function uploadedLoading(file, uploadedArea) {
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

    App.files[GraphicsUpdater.numFiles++] = file;
    progressLoading(file, progressArea);
    uploadedLoading(file, uploadedArea);
  }
}

window.onload = () => {
  App.load();
  GraphicsUpdater.eventLoader();
}