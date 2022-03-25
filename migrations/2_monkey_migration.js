const Monkeys = artifacts.require("Monkeys");

const mintPrice = 444000000000000000;
const baseUri = "https://ipfs.moralis.io:2053/ipfs/QmRzsuNrQm6GAE5BmtbpkbGFftgwvShTExCBsoHzKubHP7/metadata/";//your baseUri for your metadata
const uriExt = ".json"; 

module.exports = function (deployer) {
  deployer.deploy(Monkeys, mintPrice, baseUri, uriExt);
};