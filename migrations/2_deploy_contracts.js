/*
Deploy a regulator,
TODO then call createNewOperator on it.
then resumes the newly created operator, which should be paused.
*/

var Regulator = artifacts.require("./Regulator.sol");

module.exports = function(deployer) {
  deployer.deploy(Regulator);
};