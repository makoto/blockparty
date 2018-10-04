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
    /* when party attendance is finalized and payout is enabled */
    Finalize: Conference.abi.find(({ type, name }) => type === 'event' && name === 'FinalizeEvent'),
    /* when the party has ended */
    EndParty: Conference.abi.find(({ type, name }) => type === 'event' && name === 'PaybackEvent'),
    /* when the party gets cancelled */
    CancelParty: Conference.abi.find(({ type, name }) => type === 'event' && name === 'CancelEvent'),
    /* when a new admin gets added */
    AddAdmin: Conference.abi.find(({ type, name }) => type === 'event' && name === 'AdminGranted'),
    /* when an admin gets removed */
    RemoveAdmin: Conference.abi.find(({ type, name }) => type === 'event' && name === 'AdminRevoked'),
    /* when ownership gets tranferred */
    ChangeOwner: Conference.abi.find(({ type, name }) => type === 'event' && name === 'OwnershipTransferred'),
  }
}
