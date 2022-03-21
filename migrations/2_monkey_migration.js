const Monkeys = artifacts.require("Monkeys");

const mintPrice = 444000000000000000;
const baseUri = "";//your baseUri for your metadata
const uriExt = ".json"; 

module.exports = function (deployer) {
  deployer.deploy(Monkeys, mintPrice, baseUri, uriExt);
};