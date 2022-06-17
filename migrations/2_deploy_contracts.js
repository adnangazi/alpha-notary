var Notarization = artifacts.require("./Notarization.sol");

module.exports = function(deployer) {
  deployer.deploy(Notarization);
};
