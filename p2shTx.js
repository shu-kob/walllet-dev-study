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

const pubkeys = [
    pubkey1,
    pubkey2,
    pubkey3,
].map(Buffer => Buffer);

const p2sh =  bitcoin.payments.p2sh({
        redeem: bitcoin.payments.p2ms({ m: 2, pubkeys, network: bitcoinNetwork, })
})

console.log('P2SH address:\n' + p2sh.address);

const psbt = new bitcoin.Psbt({ network: bitcoinNetwork });

const previousRawTx = '0200000000010174f8e00642b3c91d2a3b7a2abc998e56f7399beba68b52116ffc5e323bd87f240000000000feffffff02809698000000000017a91453dc808c188b858a547a20fa71dcc9244be5ef0a87ba4fc87a000000001600148ae980d5a64a7a6a9dba37c6319f42da05536e0002473044022019786ca335e19167dbf5d3f7399fdd898317640b6d2355cc05c3c765beeed194022039aecf113ce995fc32e5e2ced95f942f2684ded787f7fb7f445db0c40385f18e0121037e068b8fb794764449907cfc66a2afbe519f7426470603da296e81e075bcd5b94dd80000';

psbt.addInput({
    hash: '23ad496e82709072a0c26921dbef3a969f992880e6ce2937301430bf7eb7d132',
    index: 0,
    redeemScript: p2sh.redeem.output,
    nonWitnessUtxo: Buffer.from(previousRawTx, 'hex'),
});
psbt.addOutput({
    address: "tb1q6fjgxhd73fr9w7d60kp8aq9rf20sjyeep8ymx0",
    value: 3000000,
});
psbt.addOutput({
    address: "tb1q6j60yg0ru3vxxsmt7wka4c893pf9na2rlak87z",
    value: 6999631,
});

psbt.signInput(0, privkey2)
psbt.signInput(0, privkey3);

psbt.validateSignaturesOfInput(0, Buffer.from(pubkey2, 'hex'))
psbt.validateSignaturesOfInput(0, Buffer.from(pubkey3, 'hex'))

psbt.validateSignaturesOfInput(0);
psbt.finalizeAllInputs();
const txHex = psbt.extractTransaction().toHex();

console.log("RawTx:\n" + txHex);
