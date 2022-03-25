const Marketplace = artifacts.require("Marketplace");

const publisherWallet = 0x9cbA6C997fAc9d0f600a8e0CCB20473c0c4bE9f1;
const feeAmount = 5;

module.exports = function (deployer) {
  deployer.deploy(Marketplace, publisherWallet, feeAmount);
};