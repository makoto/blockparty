const GroupAdmin = artifacts.require("GroupAdmin.sol");
contract('GroupAdmin', function(accounts) {
    let admin, operator, owner, another_operator, one_more_operator, non_operator;

    beforeEach(async function(){
        owner = accounts[0];
        operator = accounts[1];
        another_operator = accounts[2];
        one_more_operator = accounts[3];
        non_operator = accounts[4];
        admin = await GroupAdmin.new();
    })

    describe('on new', function(){
        it('owner is admin', async function(){
            assert.strictEqual(await admin.isAdmin.call(owner), true);
        })
    })

    describe('on grant', function(){
        it('is added to admin', async function(){
            await admin.grant([operator, another_operator], {from:owner});
            assert.strictEqual(await admin.isAdmin.call(operator), true);
            assert.strictEqual(await admin.isAdmin.call(another_operator), true);
            assert.strictEqual(await admin.isAdmin.call(non_operator), false);
        })

        it('cannot be added by non owner', async function(){
            await admin.grant([operator], {from:operator}).catch(function(){});
            assert.strictEqual(await admin.isAdmin.call(operator), false);
        })
    })

    describe('on revoke', function(){
        beforeEach(async function(){
            await admin.grant([operator, another_operator, one_more_operator], {from:owner});
            assert.strictEqual(await admin.isAdmin.call(operator), true);
            assert.strictEqual(await admin.isAdmin.call(another_operator), true);
            assert.strictEqual(await admin.isAdmin.call(one_more_operator), true);
            assert.strictEqual((await admin.numOfAdmins.call()).toNumber(), 3);
        })

        it('is revoked from admin', async function(){
            await admin.revoke([operator, one_more_operator], {from:owner});
            assert.strictEqual(await admin.isAdmin.call(operator), false);
            assert.strictEqual(await admin.isAdmin.call(another_operator), true);
            assert.strictEqual(await admin.isAdmin.call(one_more_operator), false);
            assert.strictEqual((await admin.numOfAdmins.call()).toNumber(), 1);
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
            let admins = await admin.getAdmins.call();
            assert.strictEqual(admins[0], operator);
            assert.strictEqual(admins[1], non_operator);
            assert.strictEqual((await admin.numOfAdmins.call()).toNumber(), 2);
        })
    })
})
