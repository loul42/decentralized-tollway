Promise = require("bluebird");
Promise.allNamed = require("../utils/sequentialPromiseNamed.js");
const randomIntIn = require("../utils/randomIntIn.js");
const toBytes32 = require("../utils/toBytes32.js");

if (typeof web3.eth.getAccountsPromise === "undefined") {
    Promise.promisifyAll(web3.eth, { suffix: "Promise" });
}

const Regulator = artifacts.require("./Regulator.sol");
const TollBoothOperator = artifacts.require("./TollBoothOperator.sol");

contract('TollBoothOperator', function(accounts) {

    let owner0,owner1,booth1,booth2,
    vehicle1, vehicle2,
    regulator, operator;
    // price01 is the price of the road
    const price01 = randomIntIn(1, 1000);
    // Deposit 0 is the rin depo)
    const deposit0 = price01 + randomIntIn(1, 1000);
    const deposit1 = deposit0 + randomIntIn(1, 1000);
    const vehicleType1 = randomIntIn(1, 1000);
    const vehicleType2 = vehicleType1 + randomIntIn(1, 1000);
    // multiplier will be used to multiply the route price
    const multiplier1 = randomIntIn(1, 1000);
    const multiplier2 = multiplier1 + randomIntIn(1, 1000);
    const tmpSecret = randomIntIn(1, 1000);
    const secret0 = toBytes32(tmpSecret);
    const secret1 = toBytes32(tmpSecret + randomIntIn(1, 1000));
    const gasPriceWei = 10000; //web3.toWei(, "gwei");

    let hashed0, hashed1;

    before("should prepare", function() {
        assert.isAtLeast(accounts.length, 7);
        owner0 = accounts[0];
        owner1 = accounts[1];
        booth1 = accounts[2];
        booth2 = accounts[3];;
        vehicle1 = accounts[4];
        vehicle2 = accounts[5];
        return web3.eth.getBalancePromise(owner0)
        .then(balance => assert.isAtLeast(web3.fromWei(balance).toNumber(), 10));
    });


    describe("Vehicle Operations", function() {

        beforeEach("should deploy regulator and operator", function() {
            return Regulator.new({ from: owner0 })
            .then(instance => regulator = instance)
            .then(() => regulator.setVehicleType(vehicle1, vehicleType1, { from: owner0 }))
            .then(tx => {regulator.setVehicleType(vehicle2, vehicleType2, { from: owner0 })})
            .then(tx => regulator.createNewOperator(owner1, (price01 * multiplier1), { from: owner0 }))
            .then(tx => { operator = TollBoothOperator.at(tx.logs[1].args.newOperator)})
            .then(() => operator.addTollBooth(booth1, { from: owner1 }))
            .then(tx => operator.addTollBooth(booth2, { from: owner1 }))
            .then(tx => operator.setMultiplier(vehicleType1, multiplier1, { from: owner1 }))
            .then(tx => operator.setMultiplier(vehicleType2, multiplier2, { from: owner1 }))
                //.then(tx => operator.setRoutePrice(booth1, booth2, price01, { from: owner1 }))
                .then(tx => operator.setPaused(false, { from: owner1 }))
                .then(tx => operator.hashSecret(secret0))
                .then(hash => hashed0 = hash)
                .then(tx => operator.hashSecret(secret1))
                .then(hash => hashed1 = hash);
            });

        describe("Test different Scenarios", function() {

            console.log("min depo : "  + (price01 * multiplier1) );

            it("Scenario 1 - Check vehicle has no refund", function() {
                var gasUsedToEnterRoad = 110098;
                var gasCost =  gasPriceWei * gasUsedToEnterRoad;
                var routePriceWithMultp = (price01 * multiplier1);
                console.log("gasPriceWei:" + gasPriceWei);
                console.log("gasUsedToEnterRoad:" + gasUsedToEnterRoad);
                console.log("gascost:" + gasCost);
                console.log("deposited: " + ((price01 * multiplier1) + gasCost));
                console.log("true route price: " + price01 * multiplier1);
                return operator.setRoutePrice(booth1, booth2, price01, { from: owner1 })
                .then(() => operator.enterRoad.call(booth1, hashed0, { from: vehicle1, value: (routePriceWithMultp + gasCost), gasPrice : gasPriceWei}))
                .then(success => assert.isTrue(success))
                .then(() => {
                    return operator.enterRoad(
                        booth1, hashed0, { from: vehicle1, value: (routePriceWithMultp + gasCost), gasPrice : gasPriceWei});})
                .then(tx => {
                    console.log(tx);
                    assert.strictEqual(tx.receipt.logs.length, 1);
                    assert.strictEqual(tx.logs.length, 1);
                    const logEntered = tx.logs[0];
                    assert.strictEqual(logEntered.event, "LogRoadEntered");
                    assert.strictEqual(logEntered.args.vehicle, vehicle1);
                    assert.strictEqual(logEntered.args.entryBooth, booth1);
                    assert.strictEqual(logEntered.args.exitSecretHashed, hashed0);
                    assert.strictEqual(logEntered.args.depositedWeis.toNumber(), ((price01 * multiplier1) + gasCost));
                    assert.strictEqual(tx.receipt.gasUsed, gasUsedToEnterRoad);
                })
                .then(tx => operator.reportExitRoad.call(secret0, { from: booth2 }))
                .then(result => assert.strictEqual(result.toNumber(), 1))
                .then(() => operator.reportExitRoad(secret0, { from: booth2 }))
                .then(tx => {
                    assert.strictEqual(tx.receipt.logs.length, 1);
                    assert.strictEqual(tx.logs.length, 1);
                    const logExited = tx.logs[0];
                    assert.strictEqual(logExited.event, "LogRoadExited");
                    assert.strictEqual(logExited.args.exitBooth, booth2);
                    assert.strictEqual(logExited.args.exitSecretHashed, hashed0);

                    assert.strictEqual(logExited.args.finalFee.toNumber(), price01 * multiplier1);
                    assert.strictEqual(logExited.args.refundWeis.toNumber(), 0);
                            // console.log(tx.receipt.gasUsed);      
                        })
            });

        });
    });

});
