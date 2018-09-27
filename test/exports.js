const packageExport = require('../')

contract('NPM exports', () => {
  it('exports contracts', () => {
    assert.isOk(packageExport.Deployer)
    assert.isOk(packageExport.Conference)
  })

  it('exports valid events', () => {
    assert.isOk(packageExport.events.NewParty.name)
    assert.isOk(packageExport.events.Register.name)
    assert.isOk(packageExport.events.Attend.name)
    assert.isOk(packageExport.events.Withdraw.name)
    assert.isOk(packageExport.events.EndParty.name)
    assert.isOk(packageExport.events.CancelParty.name)
    assert.isOk(packageExport.events.AddAdmin.name)
    assert.isOk(packageExport.events.RemoveAdmin.name)
    assert.isOk(packageExport.events.ChangeOwner.name)
  })
})
