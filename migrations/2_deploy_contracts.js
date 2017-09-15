/*
Deploy a regulator,
TODO then call createNewOperator on it.
then resumes the newly created operator, which should be paused.
*/

var Regulator = artifacts.require("./Regulator.sol");
var Owned = artifacts.require("./Owned.sol");
var Pausable = artifacts.require("./Pausable.sol");
var DepositHolder = artifacts.require("./DepositHolder.sol");

module.exports = function(deployer) {
  deployer.deploy(Regulator, {gas: 4000000});
  deployer.deploy(Owned, {gas: 4000000});
  deployer.deploy(Pausable, {gas: 4000000});
  deployer.deploy(DepositHolder, {gas: 4000000});
};