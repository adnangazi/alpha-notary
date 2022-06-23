var Notarization = artifacts.require("./Notarization.sol");
var Notary = artifacts.require("./Notary.sol");

module.exports = function(deployer) {
  deployer.deploy(Notarization);
  deployer.deploy(Notary);
};
