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

const p2ms = bitcoin.payments.p2ms({
    m: 2, pubkeys: [
      Buffer.from(pubkey1, 'hex'),
      Buffer.from(pubkey2, 'hex'),
      Buffer.from(pubkey3, 'hex'),
    ], network: bitcoinNetwork})

console.log('Witness script:')
console.log(p2ms.output.toString('hex'))

const p2wsh = bitcoin.payments.p2wsh({redeem: p2ms, network: bitcoinNetwork})
console.log('P2WSH address')
console.log(p2wsh.address) 

console.log("p2wsh.redeem.output")
console.log(p2wsh.redeem.output)

const psbt = new bitcoin.Psbt({ network: bitcoinNetwork });
psbt.addInput({
    hash: '22ed59b3f8443a45fcdb80f3d4121b38876a4ff30e31b77e96b9aca62b24892f',
    index: 1,
    witnessScript: p2wsh.redeem.output,
    witnessUtxo: {
    script: Buffer.from('0020' + bitcoin.crypto.sha256(p2ms.output).toString('hex'), 'hex'),
    value: 10000000,
    },
});
psbt.addOutput({
    address: "tb1q8zgpsl7qvcr6ye0c6njmutshr688whtd2jpdjd",
    value: 3000000,
});
psbt.addOutput({
    address: "tb1q77hfx3crqmpjntkshv7ssyaz85lepe4x7mwurk",
    value: 6999823,
});

psbt.signInput(0, privkey1)
psbt.signInput(0, privkey2);

psbt.validateSignaturesOfInput(0, Buffer.from(pubkey1, 'hex'))
psbt.validateSignaturesOfInput(0, Buffer.from(pubkey2, 'hex'))
psbt.finalizeAllInputs();

console.log(JSON.stringify(psbt))

const txHex = psbt.extractTransaction().toHex();

console.log(txHex);
