/*
Deploy a regulator,
TODO then call createNewOperator on it.
then resumes the newly created operator, which should be paused.
*/

var Regulator = artifacts.require("./Regulator.sol");
const TollBoothOperator = artifacts.require("./TollBoothOperator.sol");

module.exports = function(deployer, network, accounts) {

  console.log("============================================================================= ");
  console.log("These two accounts must be unlocked (and have funds) to deploy the contract: ");
  console.log(accounts[0]);
  console.log(accounts[1]);
  console.log("============================================================================= ");
  let regulatorOwnerAddress = accounts[0];
  let operatorOwnerAddress = accounts[1];
  let regulator;
  

 deployer.deploy(Regulator, {from: regulatorOwnerAddress, gas: 4000000}).then(() => {
    return Regulator.deployed();
   }).then((regulator) => {
    return regulator; 
   }).then((_regulator) => {
    return _regulator.createNewOperator(operatorOwnerAddress, 1, {from: regulatorOwnerAddress, gas: 4000000});
   }).then((tx) => {
    let operator;
    operator = TollBoothOperator.at(tx.logs[1].args.newOperator);
    return operator;
   }).then((_operator) => {
    return _operator.setPaused(false, { from: operatorOwnerAddress });
    });

};