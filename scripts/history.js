// https://api.etherscan.io/api?module=logs&action=getLogs&fromBlock=379224&toBlock=latest&address=0x33990122638b9132ca29c723bdf037f1a891a70c&topic0=0xf63780e752c6a54a94fc52715dbc5518a3b4c3c2833d301a204226548a2a8545&apikey=YourApiKeyToken
let fs = require('fs');
let setGas = require('./util/set_gas');
let setContract = require('./util/set_contract');
let fileName = 'tmp/response-data-export';
let content = JSON.parse(fs.readFileSync(fileName, 'utf8'));
let InputDataDecoder = require('ethereum-input-data-decoder');
let conference;
Conference.deployed().then((i)=> conference = i)

let decoder = new InputDataDecoder(conference.abi);
let owner =

content.result[0]
content.result[2].input

decoder.decodeData(content.result[2].input);
