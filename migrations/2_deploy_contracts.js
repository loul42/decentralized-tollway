/*
Deploy a regulator,
TODO then call createNewOperator on it.
then resumes the newly created operator, which should be paused.
*/

var Regulator = artifacts.require("./Regulator.sol");
const TollBoothOperator = artifacts.require("./TollBoothOperator.sol");

module.exports = function(deployer, network, accounts) {

  let regulatorOwnerAddress = accounts[0];
  let operatorOwnerAddress = accounts[1];
  let regulator;
  let operator;

  let regulatoyDeploy = deployer.deploy(Regulator, {from: regulatorOwnerAddress, gas: 4000000});

  regulatoyDeploy.then(() => {
  	Regulator.new()
  		.then(instance => regulator = instance)
  		.then(() => regulator.createNewOperator(operatorOwnerAddress, 1, {from: regulatorOwnerAddress}))
  		.then(tx => operator = TollBoothOperator.at(tx.logs[0].args.newOperator))
  		.then(tx => operator.setPaused(false, { from: operatorOwnerAddress }));
  });

};