const Deployer = require('./build/contracts/Deployer.json')
const Conference = require('./build/contracts/Conference.json')

module.exports = {
  Deployer,
  Conference,
  events: {
    /* when new party gets deployed */
    NewParty: Deployer.abi.find(({ type, name }) => type === 'event' && name === 'NewParty'),
    /* when someone registers for a party */
    Register: Conference.abi.find(({ type, name }) => type === 'event' && name === 'RegisterEvent'),
    /* when someone is marked as having attended a party */
    Attend: Conference.abi.find(({ type, name }) => type === 'event' && name === 'AttendEvent'),
    /* when someone withdraws their payout */
    Withdraw: Conference.abi.find(({ type, name }) => type === 'event' && name === 'WithdrawEvent'),
    /* when the party gets ended or cancelled */
    EndParty: Conference.abi.find(({ type, name }) => type === 'event' && (name === 'PaybackEvent' || name === 'CancelEvent')),
    /* when a new admin gets added */
    AdminAdded: Conference.abi.find(({ type, name }) => type === 'event' && name === 'AdminGranted'),
    /* when an admin gets removed */
    AdminRemoved: Conference.abi.find(({ type, name }) => type === 'event' && name === 'AdminRevoked'),
  }
}
