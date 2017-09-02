const arg = require('yargs').argv;
const fs = require('fs');
const uuidV4 = require('uuid/v4');

if (!(arg.o && arg.n)) {
  throw('usage: truffle exec scripts/uuids.js -n 10 -o output_file_name');
}

module.exports = function() {
  let uuids = [];
  for (var i = 0; i < arg.n; i++) {
    var code = uuidV4();
    console.log(code)
    uuids.push();
  }
  fs.writeFileSync(arg.o, uuids.join('\n'));
}
