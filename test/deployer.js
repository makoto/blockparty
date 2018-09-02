import { toHex, toWei } from 'web3-utils'

import { getEvents } from './utils'

const Deployer = artifacts.require("Deployer.sol")
const Conference = artifacts.require("Conference.sol")


contract('Deployer', accounts => {
  let deployer

  beforeEach(async () => {
    deployer = await Deployer.new()
  })

  it('does not accept ETH', async () => {
    await deployer.send(1, { from: accounts[0] }).should.be.rejected
  })

  it('has an owner', async () => {
    await deployer.owner().should.eventually.eq(accounts[0])
  })

  it('is destructible', async () => {
    const { address } = deployer

    await deployer.destroy().should.be.fulfilled

    await Deployer.at(address).should.be.rejected
  })

  it('can deploy a Conference', async () => {
    const result = await deployer.deploy(
      'test',
      toHex(toWei('0.02')),
      toHex(2),
      toHex(60 * 60 * 24 * 7),
      'encKey'
    )

    const events = await getEvents(result, 'NewParty')

    assert.deepEqual(events.length, 1)

    const [ event ] = events

    assert.nestedInclude(event.args, {
      deployer: accounts[0]
    })

    const { deployedAddress } = event.args

    const conference = await Conference.at(deployedAddress)

    await conference.limitOfParticipants().should.eventually.eq(2)
  })

  it('when it deploys a Conference the owner is the caller', async () => {
    const result = await deployer.deploy(
      'test',
      toHex(toWei('0.02')),
      toHex(2),
      toHex(60 * 60 * 24 * 7),
      'encKey'
    )

    const [ { args: { deployedAddress} } ] = (await getEvents(result, 'NewParty'))

    const conference = await Conference.at(deployedAddress)

    await conference.owner().should.eventually.eq(accounts[0])
  })
})
