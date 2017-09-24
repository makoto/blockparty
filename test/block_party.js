const BlockParty = artifacts.require("BlockParty.sol");

contract('BlockParty', function(accounts) {
  const owner = accounts[0];
  let instance;

  beforeEach(async function(){
    instance = await BlockParty.new();
  })

  describe('BlockParty', function(){
    let name = 'Test';
    let deposit = web3.toWei(0.05, "ether");
    let participants = 10;
    let slug = 'test';
    let startDate = 0;
    let mapUrl = 'https://maps.google.com/maps?f=q&hl=en&q=Huxley+Building%2C+Imperial+College+%2C+London+SW7+2AZ%2C+gb';
    let locationTest = 'Clore Lecture Theatre, Huxley Building, Imperial College, London (SW7 2AZ)';
    let description = 'Some description';

    it('creates a party', async function(){
      await instance.createParty(
        name,
        deposit,
        participants,
        slug,
        startDate,
        mapUrl,
        locationTest,
        description
      );
      var party = await instance.parties.call(0);
      console.log(party)
      assert.strictEqual(web3.toUtf8(party[1]), slug);
    })
  })
})
