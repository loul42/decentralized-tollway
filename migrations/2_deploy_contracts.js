/*
Deploy a regulator,
TODO then call createNewOperator on it.
then resumes the newly created operator, which should be paused.
*/

var Regulator = artifacts.require("./Regulator.sol");

module.exports = function(deployer, network, accounts) {

  let regulatorAddress = accounts[0];
  let operatorAddress = accounts[1];
  let regulator;

  let regulatoyDeploy = deployer.deploy(Regulator, {from: regulatorAddress, gas: 4000000});

  regulatoyDeploy.then(() => {
  	Regulator.new()
  		.then(instance => regulator = instance)
  		.then(() => regulator.createNewOperator(operatorAddress, 1, {from: regulatorAddress}));
  });

};