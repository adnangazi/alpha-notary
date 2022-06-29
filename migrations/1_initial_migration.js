const Migrations = artifacts.require("Migrations");

/**
* deploy the Migration Smart Contract
* 
* @param deployer Truffle interface for API that deploys to Blockchain
*/
module.exports = function(deployer) {
  deployer.deploy(Migrations);
};