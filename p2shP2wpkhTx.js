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

const p2wpkh = bitcoin.payments.p2wpkh({ pubkey: pubkey, network: bitcoinNetwork, });

const p2sh = bitcoin.payments.p2sh({
    redeem: p2wpkh
});

console.log('P2SH-P2WPKH address')
console.log(p2sh.address) 

const psbt = new bitcoin.Psbt({ network: bitcoinNetwork });

const previousRawTx = '0200000000010171ddd098f38f5d505907fc981c85027d2935cb66a558bfdd010159ff1b89d8e20000000000feffffff0256caa8ab000000001600144dcc600a84cbf35fa6b44ad2ec5ba3dc6cd55034809698000000000017a914d2a8c75cc68bf3e5be639a9ed433631585538a5787024730440220169792f348182b450cf75e011c88586bdf0bcb4d0093c6d9b059b846a4c3422602207762963678c9836df3729f1a7adee12cadc34b7389dd659c170d0ec7813e61cc012102099874d0b4dbfcba94fe4f84f6def3d4bb0cd56b76ca9cba1476b95df46f9530e6d30000';

psbt.addInput({
    hash: 'b95edf41c5326c6e5836db49242a949be1161bbce327c2599cef89d5773fd1fa',
    index: 1,
    redeemScript: p2wpkh.output,
    nonWitnessUtxo: Buffer.from(previousRawTx, 'hex'),
});
psbt.addOutput({
    address: "tb1qh9em5av6lqzhkf3jjpv447r4zqfxp36fg79c9y",
    value: 5000000,
});
psbt.addOutput({
    address: "tb1qs0yawew4wp90rxtspwzugen077h5anh5xf5al9",
    value: 4999836,
});

psbt.signInput(0, privkey);

psbt.validateSignaturesOfInput(0);
psbt.finalizeAllInputs();
const txHex = psbt.extractTransaction().toHex();

console.log(txHex);