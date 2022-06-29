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
  forms: [document.querySelectorAll(".form")[0], document.querySelectorAll(".form")[1], document.querySelectorAll(".form")[2]],
  fileInputs: [document.querySelectorAll(".file-input")[0], document.querySelectorAll(".file-input")[1],  document.querySelectorAll(".file-input")[2]],
  dragTexts: [document.querySelectorAll(".dragText")[0], document.querySelectorAll(".dragText")[1], document.querySelectorAll(".dragText")[2]],
  progressAreas: [document.querySelectorAll(".progress-area")[0], document.querySelectorAll(".progress-area")[1], document.querySelectorAll(".progress-area")[2]],
  uploadedAreas: [document.querySelectorAll(".uploaded-area")[0], document.querySelectorAll(".uploaded-area")[1], document.querySelectorAll(".uploaded-area")[2]],
  numFiles: [0, 0, 0],
  files: [[], [], []],
  notifyAreas: [document.querySelectorAll(".notification")[0], document.querySelectorAll(".notification")[1], document.querySelectorAll(".notification")[2], document.querySelectorAll(".notification")[3]],
  colors: ["azure", "orange", "lightGreen", "strangeRed", "violet", "pink", "water", "newBlue"],
  altImages: ["Young boy hanging a dashboard", "People seated and standed around a desk with a computer talking. Plant and window aside and behind them", "Young girl fishing with the moon behind", "People stadend and interacting with social icons. Plants are aside", "Young boy illustrating a dashboard standed", "Young girl standed discovering the world map. Plant are aside", "Seated young girl on a stack using socials on her computer. Social icons, plants and buiding behind", "People interacting through devices creating a network with a server in the middle", "People carring cup-cakes. Detailed views, plants and decorations around", "Standed people taking important decisions. Sky, plants and a dog are around"],
  images: ["assets/img/material/vectorial/features-1.svg", "assets/img/material/vectorial/features-2.svg", "assets/img/material/vectorial/features-3.svg", "assets/img/material/vectorial/features-4.svg", "assets/img/material/vectorial/hero-carousel-1.svg", "assets/img/material/vectorial/features-6.svg", "assets/img/material/vectorial/hero-img56.svg", "assets/img/material/vectorial/intro-img.svg", "assets/img/material/vectorial/hero-carousel-2.svg", "assets/img/material/vectorial/features-5.svg"],
  otherValues: [null, document.getElementById("liteMode"), document.getElementById("monitoring"), document.getElementById("nameNow"), document.getElementById("commentsNow")],

  eventLoader: async () => {    
    View.forms[0].addEventListener("click", async () => {
      View.fileInputs[0].click();
    });

    View.forms[1].addEventListener("click", async () => {
      View.fileInputs[1].click();
    });

    View.forms[2].addEventListener("click", async () => {
      View.fileInputs[2].click();
    });

    View.fileInputs[0].onchange = async ({target}) => {
      if (target.files[0] != undefined) {
        View.animationUploading(target.files[0], 0);
      }
    }

    View.fileInputs[1].onchange = async ({target}) => {
      if (target.files[0] != undefined) {
        View.animationUploading(target.files[0], 1);
      }
    }

    View.fileInputs[2].onchange = async ({target}) => {
      if (target.files[0] != undefined) {
        View.animationUploading(target.files[0], 2);
      }
    }
    
    View.forms[0].addEventListener("dragover", async (event) => {
      event.preventDefault();
      View.openDrag(View.forms[0], View.dragTexts[0]);
    });
    
    View.forms[1].addEventListener("dragover", async (event) => {
      event.preventDefault();
      View.openDrag(View.forms[1], View.dragTexts[1]);
    });
    
    View.forms[2].addEventListener("dragover", async (event) => {
      event.preventDefault();
      View.openDrag(View.forms[2], View.dragTexts[2]);
    });
    
    View.forms[0].addEventListener("dragleave", async () => {
      View.closeDrag(View.forms[0], View.dragTexts[0]);
    });
    
    View.forms[1].addEventListener("dragleave", async () => {
      View.closeDrag(View.forms[1], View.dragTexts[1]);
    });
    
    View.forms[2].addEventListener("dragleave", async () => {
      View.closeDrag(View.forms[2], View.dragTexts[2]);
    });
    
    View.forms[0].addEventListener("drop", async (event) => {
      event.preventDefault();
      View.animationUploading(event.dataTransfer.files[0], 0);
      View.closeDrag(View.forms[0], View.dragTexts[0]);
    });
    
    View.forms[1].addEventListener("drop", async (event) => {
      event.preventDefault();
      View.animationUploading(event.dataTransfer.files[0], 1);
      View.closeDrag(View.forms[1], View.dragTexts[1]);
    });
    
    View.forms[2].addEventListener("drop", async (event) => {
      event.preventDefault();
      View.animationUploading(event.dataTransfer.files[0], 2);
      View.closeDrag(View.forms[2], View.dragTexts[2]);
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

  resetFile: async (i) => {
    View.numFiles[i] = 0;
    View.files[i] = [];
    View.fileInputs[i].value = "";    
  },

  liteModeMessage: async () => {
    var message = Controller.contractDecisor ? '' : '<span data-aos="fade-up"><b>* take care that AlphaDApp is currently on lite-mode, so you will not be able to monitor your transactions!</b></span>';
    document.querySelectorAll(".liteModeMessage")[0].innerHTML = message;
    document.querySelectorAll(".liteModeMessage")[1].innerHTML = message;
    document.querySelectorAll(".liteModeMessage")[2].innerHTML = message;
    document.querySelectorAll(".liteModeMessage")[3].innerHTML = message;
  },

  liteModeSwitcher: async () => {
    View.otherValues[1].title = Controller.contractDecisor ? 'Lite-mode off' : 'Lite-mode on';
  },

  insertLines: async (containerLines, toNotify, deleyer = 0) => {
    var amount = 50;
    var deley = deleyer + amount;
    containerLines.innerHTML = '<p data-aos="fade-up" data-aos-delay="' + deley + '"><b>' + toNotify[0] + '</b></p>';
    deley += amount;
    for (var i = 1; i < toNotify.length; i++) {
      if (i % 2) {
        containerLines.innerHTML += '</br><span data-aos="fade-up" data-aos-delay="' + deley + '"><b>' + toNotify[i] + ':</b> </span>';
      } else {
        containerLines.innerHTML += '<span data-aos="fade-up" data-aos-delay="' + deley + '">' + toNotify[i] + '</span>';
        deley += amount;
      }
    }
  },

  bannerNotify: async (toNotify, idOperation) => {
    if (View.otherValues[0] != null) {
      View.otherValues[0].innerHTML = "";
    }
    View.otherValues[0] = View.notifyAreas[idOperation];

    View.notifyAreas[idOperation].innerHTML = '<div class="banner"><header id="section-header"><h2 data-aos="fade-up">Notification</h2><p data-aos="fade-up" data-aos-delay="50">View your transaction</p></header><div class="container" data-aos="fade-up" data-aos-delay="100"><div id="containerID" class="row g-5"></div></div></div>';
    var image = '<div class="col-lg-4 col-md-6 d-flex align-items-center aos-init aos-animate" data-aos="zoom-out" data-aos-delay="200"><div class="img"><img id="containerImage" class="img-fluid bottomSpace upperSpace"></div></div>';
    var lines = '<div class="col-lg-8 col-md-6 content d-flex flex-column justify-content-center"><h3 data-aos="fade-up" data-aos-delay="150" class="aos-init aos-animate">The followings are the recap information of the operation you just did</h3><h2 data-aos="fade-up" data-aos-delay="200" class="aos-init aos-animate">Some Blockchain stuff just happend</h2><p id="containerLines"></p></div>';
    document.getElementById("containerID").innerHTML = idOperation % 2 ? image + lines : lines + image;
    var containerImage = document.getElementById("containerImage");
    
    if (idOperation % 2) {
      containerImage.classList.add("floating");
    } else {
      containerImage.classList.add("antiFloating");
    }

    containerImage.src = View.images[idOperation + 6];
    containerImage.alt = View.altImages[idOperation + 6];
    View.insertLines(document.getElementById("containerLines"), toNotify, 200);
    window.scrollTo(0, View.notifyAreas[idOperation].offsetTop-250);
  },

  animationUploading: async (file, num) => {
    function progressLoading(file, num) {
      View.progressAreas[num].innerHTML = '<li class="row"><i class="fas fa-file-alt"></i><div class="content"><div class="details"><span class="name" id="uploadingName"></span><span class="percent" id="percentValue"></span></div><div class="progress-bar"><div class="progress" id="progressWidth" style="width:0%"></div></div></div></li>';
      document.getElementById("uploadingName").innerHTML = file.name;
      var progressWidth = document.getElementById("progressWidth");
      var percentValue = document.getElementById("percentValue");
      var percVal;
      for (let i = 0; i <= 100; i++) {
        Utils.sleep(i * 20).then(() => {
          percVal = i + "%";
          percentValue.innerHTML = percVal;
          progressWidth.style.width = percVal;
        });
      }
    }

    function uploadedLoading(file, num) {
      let dim = "";
      let size = file.size / 1024;
      if (size <= 1024) {
        dim = size + "KB";
      } else {
        size /= 1024;
        dim = size + "MB";
      }
      Utils.sleep(2200).then(() => {
        View.progressAreas[num].innerHTML = '';
        View.uploadedAreas[num].innerHTML += '<li class="row"><div class="content"><i class="fas fa-file-alt"></i><div class="details"><span class="name">' + file.name + ' - uploaded</span><span class="size">' + dim + '</span></div></div><i class="fas fa-check"></i></li>';
      });
    }

    View.files[num][View.numFiles[num]++] = file;    
    progressLoading(file, num);
    uploadedLoading(file, num);
  },

  emptyMessageMonitor: async () => {
    var element = document.getElementById("emptyMessage");
    if (await Controller.notarization.getInteractionCount() == 0) {
      element.innerHTML = '<span data-aos="fade-up" data-aos-delay="350"><b>No interactions done yet! Start notaring now and monitor your transactions to watch them here!</b></span>';
    } else if (element.innerHTML != "") {
      element.innerHTML = "";
    }
  },

  insertInteraction: async (i, deleyer = 0) => {
    View.emptyMessageMonitor();
    View.otherValues[2].innerHTML = '<div class="col-lg-4 mt-4 upperSpace" data-aos="fade-up" data-aos-delay="' + deleyer + '"><div class="box ' + View.colors[i % 8] + '"><img alt="' + View.altImages[i % 6] + '" id="valueImg' + ((i % 6) + 1) + '" src="' + View.images[i % 6] + '" class="img-fluid ' + (i % 2 == 0 ? "floating" : "antiFloating") + '" data-aos="zoom-out" data-aos-delay="' + (deleyer + 100) + '"><div class="containerMessageMonitorInfo"></div></div></div>' + View.otherValues[2].innerHTML;
    var interaction = await Controller.notarization.getInteractionInfo(i);
    await View.insertLines(document.querySelectorAll(".containerMessageMonitorInfo")[0], [interaction[0], "Interaction date", Utils.epochConverter(interaction[1]), "Interaction owner", interaction[2], "Name", interaction[3], "Date", interaction[4] != 0 ? Utils.epochConverter(interaction[4]) : "", "Comments", interaction[5], "Owner", interaction[6]], deleyer);
  },

  monitoring: async () => {
    View.emptyMessageMonitor();
    var length = await Controller.notarization.getInteractionCount() - 1;
    for (var i = 0; i <= length; i++) {
      await View.insertInteraction(i, ((length - i) % 3) * 50);
    }
  },
}

Controller = {
  contractDecisor: true,

  load: async () => {
    View.eventLoader();

    if (typeof web3 !== 'undefined') {
      Controller.web3Provider = web3.currentProvider;
      web3 = new Web3(web3.currentProvider);
    } else {
      View.bannerNotify(["Please connect to Metamask!"], 0);
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
      View.bannerNotify(["Non-Ethereum browser detected. You should consider trying MetaMask!"], 0);
    }

    Controller.account = web3.eth.accounts[0];
    if (Controller.account != undefined) {
      document.getElementById('account').innerHTML = Controller.account;
    } else {
      View.bannerNotify(["Error getting account ID: MetMask account is not connected!"], 0);
    }

    await web3.eth.getBalance(Controller.account, function(error, result){ 
      if (!error) {
        const walletValue = parseInt(result, 10) / 10 ** 18;
        document.getElementById('walletBase').innerHTML = walletValue + " Coin" + (walletValue != 1 && walletValue != 0 ? "s" : "");
      } else {
        View.bannerNotify(["Error getting wallet base: " + error + "!"], 0);
      }
    })

    var Notarization = TruffleContract(await $.getJSON('Notarization.json'));
    Notarization.setProvider(Controller.web3Provider);
    Controller.notarization = await Notarization.deployed();

    web3.eth.defaultAccount = web3.eth.accounts[0];

    View.monitoring();
  },

  uploadDocument: async () => {
    if (View.files[0].length > 0 && View.otherValues[3] != "") {
      await Utils.createHash(View.files[0])
        .then(async function (hash) {
          var name = View.otherValues[3].value;
          var comments = View.otherValues[4].value;
          await Controller.notarization.upload(name, hash, comments, Controller.contractDecisor);

          View.bannerNotify(["The document have been " + (await Controller.notarization.getUploadResult() ? "updated " : "uploaded ") + "correctly", "Name", name, "Comments", comments, "Hash", hash, "Date", Utils.epochConverter(await Controller.notarization.getCurrentDocumentDate()), "Owner", await Controller.notarization.getCurrentDocumentOwner()], 1);
          
          View.resetLine(View.otherValues[3]);
          View.resetLine(View.otherValues[4]);
          View.resetArea(View.progressAreas[0]);
          View.resetArea(View.uploadedAreas[0]);
          View.resetFile(0);
          if (Controller.contractDecisor) {
            View.insertInteraction(await Controller.notarization.getInteractionCount() - 1);
          }
        })
        .catch(function (err) {
          console.error(err);
        });
    } else if (View.otherValues[3] == "") {
      View.bannerNotify(["Empty name found!"], 1);
    } else {
      View.bannerNotify(["No document found!"], 1);
    }
  },

  checkDocument: async () => {
    if (View.files[1].length > 0) {
      await Utils.createHash(View.files[1])
        .then(async function (hash) {
          await Controller.notarization.check(hash, Controller.contractDecisor);
          var date = await Controller.notarization.getCurrentDocumentDate();
          var owner = String(await Controller.notarization.getCurrentDocumentOwner());

          View.bannerNotify(["The document have " + (await Controller.notarization.getCheckResult() ? " " : "not ") + "been found!", "Name", await Controller.notarization.getCurrentDocumentName(), "Comments", await Controller.notarization.getCurrentDocumentComments(), "Hash", hash, "Date", (date != 0 ? Utils.epochConverter(date) : ""), "Owner", (owner != "0x0000000000000000000000000000000000000000" ? owner : ""), "Interaction date", Utils.epochConverter(await Controller.notarization.getCurrentInteractionDate()), "Interaction owner", await Controller.notarization.getCurrentInteractionOwner()], 2);
          
          View.resetArea(View.progressAreas[1]);
          View.resetArea(View.uploadedAreas[1]);
          View.resetFile(1);
          if (Controller.contractDecisor) {
            View.insertInteraction(await Controller.notarization.getInteractionCount() - 1);
          }
        })
        .catch(function (err) {
          console.error(err);
        });
    } else {
      View.bannerNotify(["No document found!"], 2);
    }
  },

  removeDocument: async () => {
    if (View.files[2].length > 0) {
      await Utils.createHash(View.files[2])
        .then(async function (hash) {
          await Controller.notarization.remove(hash, Controller.contractDecisor);
          var date = await Controller.notarization.getCurrentDocumentDate();
          var owner = String(await Controller.notarization.getCurrentDocumentOwner());

          View.bannerNotify(["The document have " + (await Controller.notarization.getRemoveResult() ? " " : "not ") + "been removed!", "Name", await Controller.notarization.getCurrentDocumentName(), "Comments", await Controller.notarization.getCurrentDocumentComments(), "Hash", hash, "Date", (date != 0 ? Utils.epochConverter(date) : ""), "Owner", (owner != "0x0000000000000000000000000000000000000000" ? owner : ""), "Interaction date", Utils.epochConverter(await Controller.notarization.getCurrentInteractionDate()), "Interaction owner", await Controller.notarization.getCurrentInteractionOwner()], 3);
          
          View.resetArea(View.progressAreas[2]);
          View.resetArea(View.uploadedAreas[2]);
          View.resetFile(2);
          if (Controller.contractDecisor) {
            View.insertInteraction(await Controller.notarization.getInteractionCount() - 1);
          }
        })
        .catch(function (err) {
          console.error(err);
        });
    } else {
      View.bannerNotify(["No document found!"], 3);
    }
  },

  switchContract: async() => {
    Controller.contractDecisor = !Controller.contractDecisor;
    View.liteModeMessage();
    View.liteModeSwitcher();
  }
}

window.onload = async () => {
  Controller.load();
}