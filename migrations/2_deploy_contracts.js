/*
Deploy a regulator,
TODO then call createNewOperator on it.
then resumes the newly created operator, which should be paused.
*/

var Regulator = artifacts.require("./Regulator.sol");

module.exports = function(deployer, network, accounts) {

  let regulatorAddress = accounts[0];
  let operatorAddress = accounts[1];

  let regulator = deployer.deploy(Regulator, {from: regulatorAddress, gas: 4000000});

  console.log(regulator);
  regulator.createNewOperator(operatorAddress, 1)
  .then(tx => console.log(tx,err));
};