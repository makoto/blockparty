const packageExport = require('../')

contract('NPM exports', () => {
  it('exports contracts', () => {
    assert.isOk(packageExport.Deployer)
    assert.isOk(packageExport.Conference)
  })

  it('exports valid events', () => {
    assert.isOk(packageExport.events.NewParty.name)
  })
})
