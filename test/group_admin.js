const GroupAdmin = artifacts.require("GroupAdmin.sol");
contract('GrupAdmin', function(accounts) {
    let admin, operator, owner;
    beforeEach(async function(){
        owner = accounts[0];
        operator = accounts[1];
        non_operator = accounts[2];
        admin = await GroupAdmin.new();
    })

    describe('on new', function(){
        it('owner is admin', async function(){
            assert.strictEqual(await admin.isAdmin.call(owner), true);
        })
    })
    
    describe('on grant', function(){
        it('is added to admin', async function(){
            await admin.grant([operator], {from:owner});
            assert.strictEqual(await admin.isAdmin.call(operator), true);
            assert.strictEqual(await admin.isAdmin.call(non_operator), false);
        })

        it('cannot be added by non owner', async function(){
            await admin.grant([operator], {from:operator}).catch(function(){});
            assert.strictEqual(await admin.isAdmin.call(operator), false);
        })
    })

    describe('on revoke', function(){
        beforeEach(async function(){
            await admin.grant([operator], {from:owner});
            assert.strictEqual(await admin.isAdmin.call(operator), true);
        })
    
        it('is revoked from admin', async function(){
            await admin.revoke([operator], {from:owner});
            assert.strictEqual(await admin.isAdmin.call(operator), false);
        })

        it('cannot be revoked by non owner', async function(){
            await admin.revoke([operator], {from:operator}).catch(function(){});
            assert.strictEqual(await admin.isAdmin.call(operator), true);
        })
    })

    describe('admins', async function(){
        it('list number of admins', async function(){
            await admin.grant([operator], {from:owner})
            await admin.grant([non_operator], {from:owner})
            console.log('admin', await admin.getAdmins.call());
        })
    })
})
