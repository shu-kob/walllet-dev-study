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
    return privateKey_wif;
}

const privateKey_wif = getPrivKey(xpriv, 0);

console.log("privateKey_wif:");
console.log(privateKey_wif);

function getPubkeyFromXpub(xpub, addressIndex) {
    const pubkeyNode = bitcoin.bip32.fromBase58(xpub, bitcoinNetwork);
    const pubkey = pubkeyNode.derive(0).derive(addressIndex).publicKey;
    return pubkey;
}

const pubkey = getPubkeyFromXpub(xpub, 0);

const p2wpkh = bitcoin.payments.p2wpkh({ pubkey: pubkey, network: bitcoinNetwork, });

console.log('Witness script:')
console.log(p2wpkh.output.toString('hex'))

console.log('P2WPKH address')
console.log(p2wpkh.address) 

const psbt = new bitcoin.Psbt({ network: bitcoinNetwork });

psbt.addInput({
    hash: '2d80282573483c86c5d7e23f6e1b364071a68a9b9432257de1bdba14b2df49d4',
    index: 1,
    sequence: 0xffffffff,
    witnessUtxo: {
    script: Buffer.from(p2wpkh.output.toString('hex'),'hex',),
    value: 10000000,
    },
});
psbt.addOutput({
    address: "tb1q37qtrf5gghczwczkmpnuemrlh8mxvm5s8tz2wz",
    value: 4999859,
});
psbt.addOutput({
    address: "tb1qhpcaf35sn0d780tjpyje6ykz2a4r73p6slfmue",
    value: 5000000,
});

const obj = wif.decode(privateKey_wif);

const privKey = bitcoin.ECPair.fromPrivateKey(obj.privateKey);

psbt.signInput(0, privKey);

psbt.validateSignaturesOfInput(0);
psbt.finalizeAllInputs();
const txHex = psbt.extractTransaction().toHex();

console.log(txHex);