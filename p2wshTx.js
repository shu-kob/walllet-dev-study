const bitcoin = require('bitcoinjs-lib');
const bip32 = require('bip32');
const bip39 = require('bip39');
const wif = require('wif');
const { xpub1, xpub2, xpub3 } = require('./xpubs.json');
const MAINNET = bitcoin.networks.bitcoin;
const TESTNET = bitcoin.networks.testnet;
// let bitcoinNetwork = MAINNET;
let bitcoinNetwork = TESTNET;

const { xpriv1 } = require('./xpriv1.json');
const { xpriv2 } = require('./xpriv2.json');
const { xpriv3 } = require('./xpriv3.json');

let addressIndex = 0;

function getPrivkeyFromXpriv(xpriv, addressIndex) {
    const privkeyNode = bitcoin.bip32.fromBase58(xpriv, bitcoinNetwork);
    const privateKey_wif = privkeyNode.derive(0).derive(addressIndex).toWIF();
    console.log("privateKey_wif:\n" + privateKey_wif);
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

const p2ms = bitcoin.payments.p2ms({
    m: 2, pubkeys: [
      Buffer.from(pubkey1, 'hex'),
      Buffer.from(pubkey2, 'hex'),
      Buffer.from(pubkey3, 'hex'),
    ], network: bitcoinNetwork})

const p2wsh = bitcoin.payments.p2wsh({redeem: p2ms, network: bitcoinNetwork})
console.log('P2WSH address:\n' + p2wsh.address);

const psbt = new bitcoin.Psbt({ network: bitcoinNetwork });
psbt.addInput({
    hash: '5ff70114e63214da1d1385935118cfb8791c17efffbdef88b3babd0ebc167839',
    index: 0,
    witnessScript: p2wsh.redeem.output,
    witnessUtxo: {
    script: Buffer.from('0020' + bitcoin.crypto.sha256(p2ms.output).toString('hex'), 'hex'),
    value: 8000000,
    },
});
psbt.addOutput({
    address: "2MwZhrfcLDFJX1PG2LhuUJPzDiqMFxzSQ4G",
    value: 6000000,
});
psbt.addOutput({
    address: "tb1qgxxkdf0undcc9l4eyz5grxxaw4dateuf0etze5d688prd2g6r07qgq9jdr",
    value: 1999810,
});

psbt.signInput(0, privkey1)
psbt.signInput(0, privkey2);

psbt.validateSignaturesOfInput(0, Buffer.from(pubkey1, 'hex'))
psbt.validateSignaturesOfInput(0, Buffer.from(pubkey2, 'hex'))
psbt.finalizeAllInputs();

const txHex = psbt.extractTransaction().toHex();

console.log("RawTx:\n" + txHex);
