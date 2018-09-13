const Deployer = require('./build/contracts/Deployer.json')
const Conference = require('./build/contracts/Conference.json')

module.exports = {
  Deployer,
  Conference,
  events: {
    /* when new Party gets deployed */
    NewParty: Deployer.abi.find(({ type, name }) => type === 'event' && name === 'NewParty')
  }
}
