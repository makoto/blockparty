const ENSRegistry = artifacts.require('ENSRegistry.sol');
const PublicResolver = artifacts.require('PublicResolver.sol');
const ReverseRegistrar = artifacts.require('ReverseRegistrar.sol');
const namehash = require('eth-ens-namehash');
const yargs = require('yargs');

let arg = yargs
    .usage('Usage: truffle exec scripts/ens.js -n $DOMAIN_NAME -a $ADDRESS')
    // avoid address to hex conversion
    .coerce(['a'], function (arg) { return arg})
    .demandOption(['n', 'a'])
    .argv;

let address = arg.a;
let name = arg.n;
let tld = 'eth';
let hashedname = namehash.hash(`${name}.eth`);
module.exports = async function(callback) {
    let ens = await ENSRegistry.deployed();
    let resolver = await PublicResolver.deployed();
    let reverseresolver = await ReverseRegistrar.deployed();
    let owner = web3.eth.accounts[0];
    await ens.setSubnodeOwner(namehash.hash(tld), web3.sha3(name), owner, {from: owner});
    await ens.setResolver(hashedname, PublicResolver.address, {from: owner});
    await resolver.setAddr(hashedname, address, {from:owner})
    let res1 = await resolver.addr.call(hashedname);
    console.log(res1, '==', address)
    await reverseresolver.setName(`${name}.eth`, { from: address});
    let res2 = await resolver.name.call(namehash.hash(`${address.slice(2)}.addr.reverse`));
    console.log(res2, '==', `${name}.eth`)
}
