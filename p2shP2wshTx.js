const bitcoin = require('bitcoinjs-lib');
const bip32 = require('bip32');
const bip39 = require('bip39');
const wif = require('wif');
const {xpub1, xpub2, xpub3} = require('./xpubs.json');
const MAINNET = bitcoin.networks.bitcoin;
const TESTNET = bitcoin.networks.testnet;
// let bitcoinNetwork = MAINNET;
let bitcoinNetwork = TESTNET;

const xpriv1 = require('./xpriv1.json').xpriv;
const xpriv2 = require('./xpriv2.json').xpriv;
const xpriv3 = require('./xpriv3.json').xpriv;

let addressIndex = 0;

function getPrivkeyFromXpriv(xpriv, addressIndex) {
    const privkeyNode = bitcoin.bip32.fromBase58(xpriv, bitcoinNetwork);
    const privateKey_wif = privkeyNode.derive(0).derive(addressIndex).toWIF();
    console.log("privateKey_wif:");
    console.log(privateKey_wif);
    const obj = wif.decode(privateKey_wif);
    const privkey = bitcoin.ECPair.fromPrivateKey(obj.privateKey);
    return privkey;
}

const privkey1 = getPrivkeyFromXpriv(xpriv1, addressIndex);
const privkey2 = getPrivkeyFromXpriv(xpriv2, addressIndex);
const privkey3 = getPrivkeyFromXpriv(xpriv3, addressIndex);

function getPubkeyFromXpub(xpub, addressIndex) {
    const pubkeyNode = bitcoin.bip32.fromBase58(xpub, bitcoinNetwork);
    const pubkey = pubkeyNode.derive(0).derive(addressIndex).publicKey;
    return pubkey;
}

const pubkey1 = getPubkeyFromXpub(xpub1, addressIndex);
const pubkey2 = getPubkeyFromXpub(xpub2, addressIndex);
const pubkey3 = getPubkeyFromXpub(xpub3, addressIndex);

const pubkeys = [
    pubkey1,
    pubkey2,
    pubkey3,
].map(Buffer => Buffer);

const p2wsh =  bitcoin.payments.p2wsh({
        redeem: bitcoin.payments.p2ms({ m: 2, pubkeys, network: bitcoinNetwork, })
})

const p2sh = bitcoin.payments.p2sh({
    redeem: p2wsh
});

console.log('P2SH-P2WSH address')
console.log(p2sh.address) 

const psbt = new bitcoin.Psbt({ network: bitcoinNetwork });

const previousRawTx = '0200000000010142350237fe041333d6752c3de6215bfbab77f0fcc253442d96b66a1aabe7b6e60000000000feffffff02809698000000000017a914c2ecaf38fedd7e1d8a03f9dc5b93862b766716f987b9d3bc1801000000160014b7b79beb080954c426f94c04d87d2b3ba8ec7cff024730440220345801148d29a16afd2a7c853d9c6961bf23332c4327552960b53fe53541e1e7022035ce4a127517fb05d5741b3b93135e2f3d5841786587761f4dfa3e19353d84120121027d80bdf7d10867bf8cf14557a7ef229e301ab6c9ad4b2c6c84817047a43772405bd40000';

psbt.addInput({
    hash: 'e79030a76a99bc19d6ab9eb2491b33b0d310c16fc806723ae494acfc6d8edda1',
    index: 0,
    redeemScript: p2wsh.output,
    witnessScript: p2wsh.redeem.output,
    nonWitnessUtxo: Buffer.from(previousRawTx, 'hex'),
});
psbt.addOutput({
    address: "tb1qvn3uc6cguc0w9z2uzwsvwhm42aatqcsk880x9y",
    value: 3000000,
});
psbt.addOutput({
    address: "tb1qq40qn5k2gvlle8506tcyv8l2gmzfch6pmn9zj6",
    value: 6999788,
});

psbt.signInput(0, privkey2)
psbt.signInput(0, privkey3);

psbt.validateSignaturesOfInput(0, Buffer.from(pubkey2, 'hex'))
psbt.validateSignaturesOfInput(0, Buffer.from(pubkey3, 'hex'))

psbt.validateSignaturesOfInput(0);
psbt.finalizeAllInputs();
const txHex = psbt.extractTransaction().toHex();

console.log(txHex);
