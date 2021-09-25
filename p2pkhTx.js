const bitcoin = require('bitcoinjs-lib');
const bip32 = require('bip32');
const bip39 = require('bip39');
const wif = require('wif');
const { xpub } = require('./xpub.json');
const MAINNET = bitcoin.networks.bitcoin;
const TESTNET = bitcoin.networks.testnet;
// let bitcoinNetwork = MAINNET;
let bitcoinNetwork = TESTNET;

const { xpriv } = require('./xpriv.json');

function getPrivKey(xpriv, addressIndex){
    const privkeyNode = bitcoin.bip32.fromBase58(xpriv, bitcoinNetwork);
    const privateKey_wif = privkeyNode.derive(0).derive(addressIndex).toWIF();
    const obj = wif.decode(privateKey_wif);
    const privKey = bitcoin.ECPair.fromPrivateKey(obj.privateKey);
    return privKey;
}

const privkey = getPrivKey(xpriv, 0);

function getPubkeyFromXpub(xpub, addressIndex) {
    const pubkeyNode = bitcoin.bip32.fromBase58(xpub, bitcoinNetwork);
    const pubkey = pubkeyNode.derive(0).derive(addressIndex).publicKey;
    return pubkey;
}

const pubkey = getPubkeyFromXpub(xpub, 0);

const p2pkh = bitcoin.payments.p2pkh({ pubkey: pubkey, network: bitcoinNetwork, });

console.log('P2PKH address')
console.log(p2pkh.address) 

const psbt = new bitcoin.Psbt({ network: bitcoinNetwork });

const previousRawTx = '02000000000101f304b0cafd1952a5c7a3b6d619ae9173f424a4b7000afd3c89f1ac67c82110f80000000000feffffff024900db6e0000000016001409ca517ba74eda1fab54c0d0043b27c78210586c80969800000000001976a914fb23ae770e5d197906490e6c0f6ce0f8a6e4b37b88ac0247304402201315d79361737c2e3848fc517eabf5c6b99f1c26ec913281f2a280f5ace81929022041f24a6fc5bb28f16df7a44e9ecd0d4d3c87c960ec3e8733f8fde2244b07a892012103925f4130e79ad21f89cac35c00b0db53a3465387a388f04cb99ffdf07f3f65108dd50000';

psbt.addInput({
    hash: '41d06def7a269eb60c7a243a036948777d53ebfdf3ddf721333005d2724121bf',
    index: 1,
    nonWitnessUtxo: Buffer.from(previousRawTx, 'hex'),
});
psbt.addOutput({
    address: "tb1qktqcm9kwyw43scrxlwpkml94rgjh89xhs7sm37",
    value: 5000000,
});
psbt.addOutput({
    address: "tb1qu6am89dmhlz07fzsccak55vswp8lu97uv6w59m",
    value: 4999780,
});

psbt.signInput(0, privkey);

psbt.validateSignaturesOfInput(0);
psbt.finalizeAllInputs();
const txHex = psbt.extractTransaction().toHex();

console.log(txHex);