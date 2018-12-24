const ethers = require('ethers');
const CH = artifacts.require('STChannel');
const BigNumber = web3.BigNumber;

require('chai')
  .use(require('chai-bignumber')(BigNumber))
  .should();

const message = 'hello';

contract('Channel', accounts => {
  beforeEach(async () => {
    this.channel = await CH.new();
  });

  describe('basic channel test', () => {
    it('user case should be valid', async () => {
    	const key1 = '3a47c8d49718702fd6deac6c058369f1d7f6607d7dc4e8de1fcb2c8d978d5da7';
    	const key2 = 'ac577f0a4ff2629a3adb414014cd5c4b951aab22fb6851ddbf25228ac3077fe1';
    	const account1 = '0xE524114877281C3f2DbF78Ca7437BAA96f3e87e1'.toLowerCase();
    	const account2 = '0x55803d7122119c21db7E6da411677d159BCc715C'.toLowerCase();
    	const account3 = '0xC13a1978026E960f01719edcEa34b0321422cA88';

    	await this.channel.join({from: account1});
    	await this.channel.join({from: account2});
    	assert.equal(await this.channel.user1(), account1);
    	assert.equal(await this.channel.user2(), account2);

    	const wallet1 = new ethers.Wallet(key1);
    	const wallet2 = new ethers.Wallet(key2);

    	const signature1 = await getSignature(wallet1);
    	const signature2 = await getSignature(wallet2);
			const messageHash = ethers.utils.id(message);

			assert.ok(await this.channel.exit(
				account1,
				messageHash, 
				signature1.v, 
				signature1.r, 
				signature1.s, 
				{from: account1}));
			console.log('Signature 1 valid and signed by account 1');

			assert.ok(await this.channel.exit(
				account2,
				messageHash, 
				signature2.v, 
				signature2.r, 
				signature2.s, 
				{from: account2}));
			console.log('Signature 2 valid and signed by account 2');

			try {
				await this.channel.exit(
				account3,
				messageHash, 
				signature1.v, 
				signature1.r, 
				signature1.s, 
				{from: account3});
			} catch (err) {
				assert.ok(err);
				console.log('Signature 1 not valid and signed by account 1, but executed by account 3');
			}
    });
	});
});

async function getSignature(wallet) {
	const messageHash = ethers.utils.id(message);
	const messageHashBytes = ethers.utils.arrayify(messageHash);
	const flatSig = await wallet.signMessage(messageHashBytes);
	return ethers.utils.splitSignature(flatSig);
}
