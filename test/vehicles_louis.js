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
            .then(tx => regulator.createNewOperator(owner1, price01, { from: owner0 }))
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

            it("Scenario 1 - Check vehicle has no refund if route price = deposit", function() {
                var routePriceWithMultp = (price01 * multiplier1);

                return operator.setRoutePrice(booth1, booth2, price01, { from: owner1 })
                .then(() => operator.enterRoad.call(booth1, hashed0, { from: vehicle1, value: routePriceWithMultp, gasPrice : gasPriceWei}))
                .then(success => assert.isTrue(success))
                .then(() => {
                    return operator.enterRoad(
                        booth1, hashed0, { from: vehicle1, value: routePriceWithMultp, gasPrice : gasPriceWei});})
                .then(tx => {
                    assert.strictEqual(tx.receipt.logs.length, 1);
                    assert.strictEqual(tx.logs.length, 1);
                    const logEntered = tx.logs[0];
                    assert.strictEqual(logEntered.event, "LogRoadEntered");
                    assert.strictEqual(logEntered.args.vehicle, vehicle1);
                    assert.strictEqual(logEntered.args.entryBooth, booth1);
                    assert.strictEqual(logEntered.args.exitSecretHashed, hashed0);
                    assert.strictEqual(logEntered.args.depositedWeis.toNumber(), ((price01 * multiplier1)));
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
                })
            });

            it("Scenario 2 - Check vehicle has no refund if route price is > deposit amount", function() {

                const extraRoutePrice = randomIntIn(1, 1000);
                var routePriceWithMultp = (price01 * multiplier1);

                return operator.setRoutePrice(booth1, booth2, price01 + extraRoutePrice, { from: owner1 })
                .then(() => operator.enterRoad.call(booth1, hashed0, { from: vehicle1, value: routePriceWithMultp, gasPrice : gasPriceWei}))
                .then(success => assert.isTrue(success))
                .then(() => {
                    return operator.enterRoad(
                        booth1, hashed0, { from: vehicle1, value: routePriceWithMultp, gasPrice : gasPriceWei});})
                .then(tx => {
                    assert.strictEqual(tx.receipt.logs.length, 1);
                    assert.strictEqual(tx.logs.length, 1);
                    const logEntered = tx.logs[0];
                    assert.strictEqual(logEntered.event, "LogRoadEntered");
                    assert.strictEqual(logEntered.args.vehicle, vehicle1);
                    assert.strictEqual(logEntered.args.entryBooth, booth1);
                    assert.strictEqual(logEntered.args.exitSecretHashed, hashed0);
                    assert.strictEqual(logEntered.args.depositedWeis.toNumber(), ((price01 * multiplier1)));
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
                    assert.strictEqual(logExited.args.finalFee.toNumber(), (price01 + extraRoutePrice) * multiplier1);
                    assert.strictEqual(logExited.args.refundWeis.toNumber(), 0); 
                })
            });


            it("Scenario 3 - Check vehicle gets refunded if route price less than required deposit", function() {

                const lessRoutePrice = randomIntIn(1, price01-1);
                var routePriceWithMultp = (price01 * multiplier1);

                return operator.setRoutePrice(booth1, booth2, price01-lessRoutePrice, { from: owner1 })
                .then(() => operator.enterRoad.call(booth1, hashed0, { from: vehicle1, value: routePriceWithMultp , gasPrice : gasPriceWei}))
                .then(success => assert.isTrue(success))
                .then(() => {
                    return operator.enterRoad(
                        booth1, hashed0, { from: vehicle1, value: routePriceWithMultp, gasPrice : gasPriceWei});})
                .then(tx => {
                    assert.strictEqual(tx.receipt.logs.length, 1);
                    assert.strictEqual(tx.logs.length, 1);
                    const logEntered = tx.logs[0];
                    assert.strictEqual(logEntered.event, "LogRoadEntered");
                    assert.strictEqual(logEntered.args.vehicle, vehicle1);
                    assert.strictEqual(logEntered.args.entryBooth, booth1);
                    assert.strictEqual(logEntered.args.exitSecretHashed, hashed0);
                    assert.strictEqual(logEntered.args.depositedWeis.toNumber(), ((price01 * multiplier1)));
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
                    assert.strictEqual(logExited.args.finalFee.toNumber(), (price01-lessRoutePrice) * multiplier1);
                    assert.strictEqual(logExited.args.refundWeis.toNumber(), (routePriceWithMultp - ((price01-lessRoutePrice) * multiplier1) )); 
                })
            });

            it("Scenario 4 - Check vehicle gets refunded if deposit amount > route price", function() {

                const extraDeposit = randomIntIn(1, 1000);
                var routePriceWithMultp = (price01 * multiplier1);

                return operator.setRoutePrice(booth1, booth2, price01, { from: owner1 })
                .then(() => operator.enterRoad.call(booth1, hashed0, { from: vehicle1, value: routePriceWithMultp + extraDeposit, gasPrice : gasPriceWei}))
                .then(success => assert.isTrue(success))
                .then(() => {
                    return operator.enterRoad(
                        booth1, hashed0, { from: vehicle1, value: routePriceWithMultp + extraDeposit, gasPrice : gasPriceWei});})
                .then(tx => {
                    assert.strictEqual(tx.receipt.logs.length, 1);
                    assert.strictEqual(tx.logs.length, 1);
                    const logEntered = tx.logs[0];
                    assert.strictEqual(logEntered.event, "LogRoadEntered");
                    assert.strictEqual(logEntered.args.vehicle, vehicle1);
                    assert.strictEqual(logEntered.args.entryBooth, booth1);
                    assert.strictEqual(logEntered.args.exitSecretHashed, hashed0);
                    assert.strictEqual(logEntered.args.depositedWeis.toNumber(), ((price01 * multiplier1) + extraDeposit));
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
                    assert.strictEqual(logExited.args.finalFee.toNumber(), (price01) * multiplier1);
                    assert.strictEqual(logExited.args.refundWeis.toNumber(), extraDeposit); 
                })
            });

            it("Scenario 5 - Check vehicle gets refunded after setting route price", function() {

                const extraDeposit = randomIntIn(1, 1000);
                var routePriceWithMultp = (price01 * multiplier1);
                // Route price should be less than what the vehicle deposited
                const routePrice = randomIntIn(1, price01);

                return operator.enterRoad.call(booth1, hashed0, { from: vehicle1, value: price01 * multiplier1 + extraDeposit, gasPrice : gasPriceWei})
                .then(success => assert.isTrue(success))
                .then(() => {
                    return operator.enterRoad(
                        booth1, hashed0, { from: vehicle1, value: price01*multiplier1 + extraDeposit, gasPrice : gasPriceWei});})
                .then(tx => {
                    assert.strictEqual(tx.receipt.logs.length, 1);
                    assert.strictEqual(tx.logs.length, 1);
                    const logEntered = tx.logs[0];
                    assert.strictEqual(logEntered.event, "LogRoadEntered");
                    assert.strictEqual(logEntered.args.vehicle, vehicle1);
                    assert.strictEqual(logEntered.args.entryBooth, booth1);
                    assert.strictEqual(logEntered.args.exitSecretHashed, hashed0);
                    assert.strictEqual(logEntered.args.depositedWeis.toNumber(), ((price01 * multiplier1) + extraDeposit));
                })
                .then(tx => operator.reportExitRoad.call(secret0, { from: booth2 }))
                .then(result => assert.strictEqual(result.toNumber(), 2))
                .then(() => operator.reportExitRoad(secret0, { from: booth2 }))
                .then(tx => {
                    assert.strictEqual(tx.receipt.logs.length, 1);
                    assert.strictEqual(tx.logs.length, 1);
                    const logPending = tx.logs[0];
                    assert.strictEqual(logPending.event, "LogPendingPayment");
                    assert.strictEqual(logPending.args.exitSecretHashed, hashed0);
                    assert.strictEqual(logPending.args.entryBooth, booth1);
                    assert.strictEqual(logPending.args.exitBooth, booth2);
                }) //One payment is pending we set the route price but less than the deposit
                .then(() => {
                    return operator.setRoutePrice.call(booth1, booth2, routePrice, { from: owner1 });
                })
                .then(success => assert.isTrue(success))
                .then(() => operator.setRoutePrice(booth1, booth2, routePrice, { from: owner1 }))
                .then(tx => {
                    assert.strictEqual(tx.receipt.logs.length, 2);
                    assert.strictEqual(tx.logs.length, 2);
                    const logPriceSet = tx.logs[0];
                    assert.strictEqual(logPriceSet.event, "LogRoutePriceSet");
                    assert.strictEqual(logPriceSet.args.sender, owner1);
                    assert.strictEqual(logPriceSet.args.entryBooth, booth1);
                    assert.strictEqual(logPriceSet.args.exitBooth, booth2);
                    assert.strictEqual(logPriceSet.args.priceWeis.toNumber(), routePrice);
                    const logExited = tx.logs[1];
                    assert.strictEqual(logExited.event, "LogRoadExited");
                    assert.strictEqual(logExited.args.exitBooth, booth2);
                    assert.strictEqual(logExited.args.exitSecretHashed, hashed0);
                    assert.strictEqual(logExited.args.finalFee.toNumber(), routePrice * multiplier1);
                    assert.strictEqual(
                        logExited.args.refundWeis.toNumber(),
                        ((price01 * multiplier1 + extraDeposit) - (routePrice * multiplier1)));
                        return Promise.allNamed({
                            hashed: () => operator.getVehicleEntry(hashed0),
                            pendingCount: () => operator.getPendingPaymentCount(booth1, booth2)
                        });
                    })
                .then(info => {
                    assert.strictEqual(info.hashed[0], vehicle1);
                    assert.strictEqual(info.hashed[1], booth1);
                    assert.strictEqual(info.hashed[2].toNumber(), 0);
                    assert.strictEqual(info.pendingCount.toNumber(), 0);
                });
            });

            
            describe("Scenario 6", function() {

                const extraDeposit1 = randomIntIn(1, 1000);
                var routePriceWithMultp1 = (price01 * multiplier1);
                var routePriceWithMultp2 = (price01 * multiplier2);
                let vehicle1InitBal, vehicle2InitBal;
                const routePrice = randomIntIn(1, price01);

                beforeEach("Vehicle 1 & 2 enter on the same unknown route", function() {
                    return operator.enterRoad(
                            booth1, hashed0, { from: vehicle1, value: routePriceWithMultp1 + extraDeposit1 })
                        .then(tx => operator.enterRoad(
                            booth1, hashed1, { from: vehicle2, value: routePriceWithMultp2 }))
                        .then(tx => web3.eth.getBalancePromise(vehicle1))
                        .then(balance => vehicle1InitBal = balance)
                        .then(() => web3.eth.getBalancePromise(vehicle2))
                        .then(balance => vehicle2InitBal = balance)
                        .then(() => operator.reportExitRoad(secret0, { from: booth2 }))
                        .then(tx => operator.reportExitRoad(secret1, { from: booth2 }));
                });

                it("We update the route price and it should clean a pending payment and clean also another one after", function() {
                    return operator.setRoutePrice.call(booth1, booth2, routePrice, { from: owner1 })
                        .then(success => assert.isTrue(success))
                        .then(() => operator.setRoutePrice(booth1, booth2, routePrice, { from: owner1 }))
                        .then(tx => {
                            assert.strictEqual(tx.receipt.logs.length, 2);
                            assert.strictEqual(tx.logs.length, 2);
                            const logPriceSet = tx.logs[0];
                            assert.strictEqual(logPriceSet.event, "LogRoutePriceSet");
                            assert.strictEqual(logPriceSet.args.sender, owner1);
                            assert.strictEqual(logPriceSet.args.entryBooth, booth1);
                            assert.strictEqual(logPriceSet.args.exitBooth, booth2);
                            assert.strictEqual(logPriceSet.args.priceWeis.toNumber(), routePrice);
                            const logExited = tx.logs[1];
                            assert.strictEqual(logExited.event, "LogRoadExited");
                            assert.strictEqual(logExited.args.exitBooth, booth2);
                            assert.strictEqual(logExited.args.exitSecretHashed, hashed0);
                            assert.strictEqual(logExited.args.finalFee.toNumber(), routePrice * multiplier1);
                            assert.strictEqual(
                                logExited.args.refundWeis.toNumber(),
                                ((routePriceWithMultp1 + extraDeposit1) - (routePrice * multiplier1)));
                            // console.log(tx.receipt.gasUsed);
                            return Promise.allNamed({
                                hashed0: () => operator.getVehicleEntry(hashed0),
                                hashed1: () => operator.getVehicleEntry(hashed1),
                                pendingCount: () => operator.getPendingPaymentCount(booth1, booth2)
                            });
                        })
                        .then(info => {
                            assert.strictEqual(info.hashed0[0], vehicle1);
                            assert.strictEqual(info.hashed0[1], booth1);
                            assert.strictEqual(info.hashed0[2].toNumber(), 0);
                            assert.strictEqual(info.hashed1[0], vehicle2);
                            assert.strictEqual(info.hashed1[1], booth1);
                            assert.strictEqual(info.pendingCount.toNumber(), 1);
    
                            // clear on more pending payment
                            return operator.clearSomePendingPayments(booth1, booth2, 1, { from: owner0 });
                        })
                         .then(tx => {
                            assert.strictEqual(tx.receipt.logs.length, 1);
                            assert.strictEqual(tx.logs.length, 1);
                            const logExited = tx.logs[0];
                            assert.strictEqual(logExited.event, "LogRoadExited");
                            assert.strictEqual(logExited.args.exitBooth, booth2);
                            assert.strictEqual(logExited.args.exitSecretHashed, hashed1);
                            assert.strictEqual(logExited.args.finalFee.toNumber(), routePrice * multiplier2 );
                            assert.strictEqual(
                                logExited.args.refundWeis.toNumber(),
                                (routePriceWithMultp2-routePrice * multiplier2));
                            return operator.getPendingPaymentCount(booth1, booth2);
                        })
                        .then(info => {
                            assert.strictEqual(info.toNumber(), 0);
                            return Promise.allNamed({
                                operator: () => web3.eth.getBalancePromise(operator.address),
                                collected: () => operator.getCollectedFeesAmount(),
                                vehicle1: () => web3.eth.getBalancePromise(vehicle1),
                                vehicle2: () => web3.eth.getBalancePromise(vehicle2)
                            });
                        })
                        .then(balances => {
                            assert.strictEqual(
                                balances.operator.toNumber(),
                                routePrice * multiplier1 + routePrice * multiplier2);
                            assert.strictEqual(balances.collected.toNumber(), routePrice * multiplier1 + routePrice * multiplier2);
                            assert.strictEqual(
                                balances.vehicle1.toString(10),
                                vehicle1InitBal.plus(((routePriceWithMultp1 + extraDeposit1) - (routePrice * multiplier1))).toString(10));
                            assert.strictEqual(
                                balances.vehicle2.toString(10),
                                vehicle2InitBal.plus((routePriceWithMultp2-routePrice * multiplier2)).toString(10));
                        });




                    });

                });
             });

        });
});