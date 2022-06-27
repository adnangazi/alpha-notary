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
      var padding;
      var hexCodes = [];
      var view = new DataView(buffer);
      for (var i = 0, n = view.byteLength, k = Uint32Array.BYTES_PER_ELEMENT; i < n; i += k) {
        padding = '00000000';
        hexCodes.push((padding + (view.getUint32(i)).toString(16)).slice(-padding.length));
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

View = {
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
  numFiles1: 0,
  numFiles2: 0,
  numFiles3: 0,
  files1: [],
  files2: [],
  files3: [],
  nameNow: document.getElementById("nameNow"),
  commentsNow: document.getElementById("commentsNow"),
  notifyArea0: document.querySelectorAll(".notification")[0],
  notifyArea1: document.querySelectorAll(".notification")[1],
  notifyArea2: document.querySelectorAll(".notification")[2],
  notifyArea3: document.querySelectorAll(".notification")[3],
  image0: "assets/img/material/vectorial/hero-img56.svg",
  image1: "assets/img/material/vectorial/intro-img.svg",
  image2: "assets/img/material/vectorial/hero-carousel-2.svg",
  image3: "assets/img/material/vectorial/features-5.svg",
  pastNotifyArea: null,
  container1: document.querySelectorAll(".liteModeMessage")[0],
  container2: document.querySelectorAll(".liteModeMessage")[1],
  container3: document.querySelectorAll(".liteModeMessage")[2],
  switcherLiteMode: document.getElementById("liteMode"),

  eventLoader: async () => {
    View.form1.addEventListener("click", async () => {
      View.fileInput1.click();
    });

    View.form2.addEventListener("click", async () => {
      View.fileInput2.click();
    });

    View.form3.addEventListener("click", async () => {
      View.fileInput3.click();
    });

    View.fileInput1.onchange = async ({target}) => {
      if (target.files[0] != undefined) {
        View.animationUploading(target.files[0], View.files1, View.progressArea1, View.uploadedArea1, View.numFiles1++);
      }
    }

    View.fileInput2.onchange = async ({target}) => {
      if (target.files[0] != undefined) {
        View.animationUploading(target.files[0], View.files2, View.progressArea2, View.uploadedArea2, View.numFiles2++);
      }
    }

    View.fileInput3.onchange = async ({target}) => {
      if (target.files[0] != undefined) {
        View.animationUploading(target.files[0], View.files3, View.progressArea3, View.uploadedArea3, View.numFiles3++);
      }
    }
    
    View.form1.addEventListener("dragover", async (event) => {
      event.preventDefault();
      View.openDrag(View.form1, View.dragText1);
    });
    
    View.form2.addEventListener("dragover", async (event) => {
      event.preventDefault();
      View.openDrag(View.form2, View.dragText2);
    });
    
    View.form3.addEventListener("dragover", async (event) => {
      event.preventDefault();
      View.openDrag(View.form3, View.dragText3);
    });
    
    View.form1.addEventListener("dragleave", async () => {
      View.closeDrag(View.form1, View.dragText1);
    });
    
    View.form2.addEventListener("dragleave", async () => {
      View.closeDrag(View.form2, View.dragText2);
    });
    
    View.form3.addEventListener("dragleave", async () => {
      View.closeDrag(View.form3, View.dragText3);
    });
    
    View.form1.addEventListener("drop", async (event) => {
      event.preventDefault();
      View.animationUploading(event.dataTransfer.files[0], View.files1, View.progressArea1, View.uploadedArea1, View.numFiles1++);
      View.closeDrag(View.form1, View.dragText1);
    });
    
    View.form2.addEventListener("drop", async (event) => {
      event.preventDefault();
      View.animationUploading(event.dataTransfer.files[0], View.files2, View.progressArea2, View.uploadedArea2, View.numFiles2++);
      View.closeDrag(View.form2, View.dragText2);
    });
    
    View.form3.addEventListener("drop", async (event) => {
      event.preventDefault();
      View.animationUploading(event.dataTransfer.files[0], View.files3, View.progressArea3, View.uploadedArea3, View.numFiles3++);
      View.closeDrag(View.form3, View.dragText3);
    });
  },

  openDrag: async (form, dragText) => {
    form.classList.add("activeForm");
    dragText.innerHTML = "Release to Upload File";
  },

  closeDrag: async (form, dragText) => {
    if (form != undefined) {
      form.classList.remove("activeForm");
      dragText.innerHTML = "Browse or drag &amp; drop";
    }
  },

  resetLine: async (e) => {
    e.value = "";
  },

  resetArea: async (e) => {
    e.innerHTML = "";
  },

  resetFiles1: async () => {
    View.numFiles1 = 0;
    View.files1 = [];
  },

  resetFiles2: async () => {
    View.numFiles2 = 0;
    View.files2 = [];
  },

  resetFiles3: async () => {
    View.numFiles3 = 0;
    View.files3 = [];
  },

  liteModeMessage: async () => {
    var message = Controller.contractDecisor ? '' : '<b>* take care that AlphaDApp is currently on lite-mode, so you will not be able to monitor your transactions!</b>';
    View.container1.innerHTML = message;
    View.container2.innerHTML = message;
    View.container3.innerHTML = message;
  },

  liteModeSwitcher: async () => {
    View.switcherLiteMode.title = Controller.contractDecisor ? 'Lite-mode off' : 'Lite-mode on';
  },

  notifierGUI: async (notifyArea, toNotify, idOperation) => {
    if (View.pastNotifyArea != null) {
      View.pastNotifyArea.innerHTML = "";
    }
    View.pastNotifyArea = notifyArea;

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
      case 0:
        containerImage.src = View.image0;
        break;
      case 1:
        containerImage.src = View.image1;
        break;
      case 2:
        containerImage.src = View.image2;
        break;
      default:
        containerImage.src = View.image3;
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

  animationUploading: async (file, files, progressArea, uploadedArea, numFiles) => {
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

    files[numFiles] = file;
    progressLoading(file, progressArea);
    uploadedLoading(file, uploadedArea);
  }
}

Controller = {
  contracts: {},

  load: async () => {
    if (typeof web3 !== 'undefined') {
      Controller.web3Provider = web3.currentProvider;
      web3 = new Web3(web3.currentProvider);
    } else {
      View.notifierGUI(View.notifyArea0, ["Please connect to Metamask!"], 0);
    }
    
    if (window.ethereum) {
      window.web3 = new Web3(ethereum);
      try {
        await ethereum.enable();
        web3.eth.sendTransaction({/* ... */ });
      } catch (error) {
        console.log('Non-Ethereum Blockchain operations ongoing...');
      }
    } else if (window.web3) {
      Controller.web3Provider = web3.currentProvider;
      window.web3 = new Web3(web3.currentProvider);
      web3.eth.sendTransaction({/* ... */ });
    } else {
      View.notifierGUI(View.notifyArea0, ["Non-Ethereum browser detected. You should consider trying MetaMask!"], 0);
    }

    Controller.account = web3.eth.accounts[0];
    if (Controller.account != undefined) {
      document.getElementById('account').innerHTML = Controller.account;
    } else {
      View.notifierGUI(View.notifyArea0, ["Error getting account ID: MetMask account is not connected!"], 0);
    }

    await web3.eth.getBalance(Controller.account, function(error, result){ 
      if (!error) {
        const walletValue = parseInt(result, 10) / 10 ** 18;
        document.getElementById('walletBase').innerHTML = walletValue + " Coin" + (walletValue != 1 && walletValue != 0 ? "s" : "");
      } else {
        View.notifierGUI(View.notifyArea0, ["Error getting wallet base: " + error + "!"], 0);
      }
    })

    Controller.contracts.Notarization = TruffleContract(await $.getJSON('Notarization.json'));
    Controller.contracts.Notarization.setProvider(Controller.web3Provider);
    Controller.notarization = await Controller.contracts.Notarization.deployed();
    Controller.contractDecisor = true;

    web3.eth.defaultAccount = web3.eth.accounts[0];

    Controller.monitoring();
  },

  uploadDocument: async () => {
    if (View.files1.length > 0 && View.nameNow != "") {
      await Utils.createHash(View.files1)
        .then(async function (hash) {
          var name = View.nameNow.value;
          var comments = View.commentsNow.value;
          var result = await Controller.notarization.upload(name, hash, comments, Controller.contractDecisor);

          View.notifierGUI(View.notifyArea1, ["The document have " + (result == undefined ? "not " : "") + "been " + (result ? "updated " : "uploaded ") + "correctly", "Name", name, "Comments", comments, "Hash", hash, "Date", Utils.epochConverter(await Controller.notarization.getCurrentDocumentDate()), "Owner", await Controller.notarization.getCurrentDocumentOwner()], 1);
          
          View.resetLine(View.nameNow);
          View.resetLine(View.commentsNow);
          View.resetArea(View.progressArea1);
          View.resetArea(View.uploadedArea1);
          View.resetFiles1();
          Controller.insertInteraction();
        })
        .catch(function (err) {
          console.error(err);
        });
    } else if (View.nameNow == "") {
      View.notifierGUI(View.notifyArea1, ["Empty name found!"], 1);
    } else {
      View.notifierGUI(View.notifyArea1, ["No document found!"], 1);
    }
  },

  checkDocument: async () => {
    if (View.files2.length > 0) {
      await Utils.createHash(View.files2)
        .then(async function (hash) {
          var result = await Controller.notarization.check(hash, Controller.contractDecisor);
          var date = await Controller.notarization.getCurrentDocumentDate();

          View.notifierGUI(View.notifyArea2, ["The document have " + (!result ? "not " : "" + "been found") + (result == undefined ? ", because of error during the operation!" : "!"), "Name", await Controller.notarization.getCurrentDocumentName(), "Comments", await Controller.notarization.getCurrentDocumentComments(), "Hash", hash, "Date", (date != 0 ? Utils.epochConverter(date) : ""), "Owner", await Controller.notarization.getCurrentDocumentOwner(), "Interaction date", Utils.epochConverter(await Controller.notarization.getCurrentInteractionDate()), "Interaction owner", await Controller.notarization.getCurrentInteractionOwner()], 2);
          
          View.resetArea(View.progressArea2);
          View.resetArea(View.uploadedArea2);
          View.resetFiles2();
          Controller.insertInteraction();
        })
        .catch(function (err) {
          console.error(err);
        });
    } else {
      View.notifierGUI(View.notifyArea2, ["No document found!"], 2);
    }
  },

  removeDocument: async () => {
    if (View.files3.length > 0) {
      await Utils.createHash(View.files3)
        .then(async function (hash) {
          var result = await Controller.notarization.remove(hash, Controller.contractDecisor);
          var date = await Controller.notarization.getCurrentDocumentDate();

          View.notifierGUI(View.notifyArea3, ["The document have " + (!result ? "not " : "") + "been removed" + (result == undefined ? ", because of error during the operation!" : "!"), "Name", await Controller.notarization.getCurrentDocumentName(), "Comments", await Controller.notarization.getCurrentDocumentComments(), "Hash", hash, "Date", (date != 0 ? Utils.epochConverter(date) : ""), "Owner", await Controller.notarization.getCurrentDocumentOwner(), "Interaction date", Utils.epochConverter(await Controller.notarization.getCurrentInteractionDate()), "Interaction owner", await Controller.notarization.getCurrentInteractionOwner()], 3);
          
          View.resetArea(View.progressArea3);
          View.resetArea(View.uploadedArea3);
          View.resetFiles3();
          Controller.insertInteraction();
        })
        .catch(function (err) {
          console.error(err);
        });
    } else {
      View.notifierGUI(View.notifyArea3, ["No document found!"], 3);
    }
  },

  monitoring: async () => {
    var interactionNumber = await Controller.notarization.getInteractionCount();
    for (var i = 0; i < interactionNumber; i++) {
      
      console.log(await Controller.notarization.interactionMapping(i));
    }
  },

  insertInteraction: async () => {
  },

  switchContract: async() => {
    Controller.contractDecisor = !Controller.contractDecisor;
    View.liteModeMessage();
    View.liteModeSwitcher();
  }
}

window.onload = async () => {
  Controller.load();
  View.eventLoader();
}