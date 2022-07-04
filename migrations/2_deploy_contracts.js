var Notarization = artifacts.require("Notarization.sol");

/**
* deploy the Notarization Smart Contract
* 
* @param deployer Truffle interface for API that deploys to Blockchain
*/
module.exports = function(deployer) {
  deployer.deploy(Notarization);
};