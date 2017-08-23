require('babel-polyfill');
const uuidV4 = require('uuid/v4');

let InvitationRepository = artifacts.require("./InvitationRepository.sol");

contract('InvitationRepository', function(accounts) {
  var owner = accounts[0];
  var non_owner = accounts[1];

  describe('Add', function(){
    it("non owner cannot add", async function() {
      let invitation_code =  web3.fromUtf8('1234567890');
      let instance = await InvitationRepository.new()
      let encrypted_code = await instance.encrypt.call(invitation_code);
      await instance.add(encrypted_code, {from:non_owner}).catch(function(){});
      let result = await instance.verify.call(invitation_code);
      assert.equal(result, false);
    });

    it("can add multiple", async function(){
      let instance = await InvitationRepository.new();
      var uuids = [];
      for (var i = 0; i < 100; i++) {
        uuids.push(uuidV4());
      }
      var encryptions = []
      for (var i = 0; i < uuids.length; i++) {
        var encrypted = await instance.encrypt.call(uuids[i]);
        encryptions.push(encrypted);
      }
      await instance.addMultiple(encryptions, {from:owner});
      for (var i = 0; i < uuids.length; i++) {
        var result = await instance.verify.call(uuids[i]);
        assert.equal(result, true);
      }
    })
  })

  describe('Verify', function(){
    it("can verify", async function() {
      let invitation_code = web3.fromUtf8('1234567890');
      let instance = await InvitationRepository.new()
      let encrypted_code = await instance.encrypt.call(invitation_code);
      await instance.add(encrypted_code, {from:owner});
      await instance.add('other_code', {from:owner});
      let result = await instance.verify.call(invitation_code);
      assert.equal(result, true);
    });
  })

  describe('Claim', function(){
    let invited_person = accounts[2];
    let not_invited_person = accounts[3];

    it("non owner cannot claim", async function() {
      let invitation_code =  web3.fromUtf8('1234567890');
      let instance = await InvitationRepository.new()
      let encrypted_code = await instance.encrypt.call(invitation_code);
      await instance.add(encrypted_code, {from:owner})
      await instance.claim(invitation_code, {from:invited_person}).catch(function(){});
      let result = await instance.report.call(invitation_code);
      assert.notEqual(result, invited_person);
    });

    it("can claim", async function() {
      let invitation_code = web3.fromUtf8('1234567890');
      let instance = await InvitationRepository.new()
      let encrypted_code = await instance.encrypt.call(invitation_code);
      await instance.add(encrypted_code, {from:owner});
      await instance.claim(invitation_code, invited_person, {from:owner});
      let result = await instance.report.call(invitation_code);
      assert.equal(result, invited_person);
    });

    it("cannot claim multiple times", async function() {
      let invitation_code = web3.fromUtf8('1234567890');
      let instance = await InvitationRepository.new()
      let encrypted_code = await instance.encrypt.call(invitation_code);
      await instance.add(encrypted_code, {from:owner});
      await instance.claim(invitation_code, invited_person, {from:owner});
      await instance.claim(invitation_code, not_invited_person, {from:owner}).catch(function(){});
      let result = await instance.report.call(invitation_code);
      assert.equal(result, invited_person);
    });
  })
});
