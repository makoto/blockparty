const Data = require('../src/components/Data.js')
const axios = require('axios');
const fs = require('fs');
let event, address, url, response, fileName;
module.exports = async function(callback) {
  // console.log(Data)
  for (var i = 0; i < Data.length; i++) {
    event = Data[i];
    address = event.address;
    console.log(event)
    console.log(address)
    url = `http://api.etherscan.io/api?module=account&action=txlist&address=${address}&startblock=2304161&endblock=latest&sort=asc&apikey=YourApiKeyToken`
    // url = `https://api.etherscan.io/api?module=logs&action=txlist&fromBlock=379224&toBlock=latest&address=${address}&apikey=YourApiKeyToken`
    console.log(url)
    response = await axios.get(url)
    fileName = `tmp/response-data-export-${address}.json`;
    fs.writeFileSync(fileName, JSON.stringify(response.data));
    console.log(JSON.stringify(response.data));
  }
}
