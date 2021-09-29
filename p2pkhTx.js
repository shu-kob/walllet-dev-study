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
    console.log("privateKey_wif:\n" + privateKey_wif);
    const obj = wif.decode(privateKey_wif);
    const privKey = bitcoin.ECPair.fromPrivateKey(obj.privateKey);
    return privKey;
}

const privkey0 = getPrivKey(xpriv, 0);
const privkey1 = getPrivKey(xpriv, 1);
const privkey2 = getPrivKey(xpriv, 2);

function getPubkeyFromXpub(xpub, addressIndex) {
    const pubkeyNode = bitcoin.bip32.fromBase58(xpub, bitcoinNetwork);
    const pubkey = pubkeyNode.derive(0).derive(addressIndex).publicKey;
    return pubkey;
}

const pubkey0 = getPubkeyFromXpub(xpub, 0);
const pubkey1 = getPubkeyFromXpub(xpub, 1);
const pubkey2 = getPubkeyFromXpub(xpub, 2);

const psbt = new bitcoin.Psbt({ network: bitcoinNetwork });

const previousRawTx = '020000000001019a4a640a5af86e82d5b8b9339156cc24fb5f290e19b99b58aa20508fd3cf31f10000000023220020b9489d2d8d91400a0fe666c32f7f5efe371334ae85382eb27f3fce2aaa6f0935ffffffff0400093d00000000001976a9148a7089ae260d6d5d3922d642ea05b577ae0bf8ba88aca0f01900000000001976a914263764c95da84aa2324ff65ec092f1d4d1af60d888ac400d0300000000001976a9146fbfb9e2b678fea2b9300ae8285ec6e01855ee9088ac848501000000000017a9144927691d3824f9906de54aaded6d08c7d44421008704004830450221008c8454354cbdcb426acdc5934c224704916c45d10ea6eeb2b74b13e71385ad8502204fd58d62fc2a8de9ab39245479a5217f6a7558a137c8a47f1226ac35b127b8fa01483045022100c1615d91a2dbacff54d346079aae66fdac265ef37bbe815b7fe1310a34548ad202207abf2facf05dd3da880b0e06c8bb7e20e605365725d694a76a9d9a9d1411626f01695221021d0abb918de315b7714b97d37a8105a271ad2d291e2c4eb5042ab50ab545494f2102bc527ea1d670def3afc5f60b36b7f194510c8d54568468845f061f77e4bf2a032102d0a09bd913cb01f44a7c656bab9a8b80b648c24139d039af8d01aed5679f8e6153ae00000000';

psbt.addInput({
    hash: '900b72ca70b8fea9cea4dd8fa0cbb3650da0a4a5ac04f18f1c5048d2c853cd8d',
    index: 0,
    nonWitnessUtxo: Buffer.from(previousRawTx, 'hex'),
});
psbt.addInput({
    hash: '900b72ca70b8fea9cea4dd8fa0cbb3650da0a4a5ac04f18f1c5048d2c853cd8d',
    index: 1,
    nonWitnessUtxo: Buffer.from(previousRawTx, 'hex'),
});
psbt.addInput({
    hash: '900b72ca70b8fea9cea4dd8fa0cbb3650da0a4a5ac04f18f1c5048d2c853cd8d',
    index: 2,
    nonWitnessUtxo: Buffer.from(previousRawTx, 'hex'),
});
psbt.addOutput({
    address: "2N55dKSbYKmt75dvbr4pYjBu1JLfeSy3rz9",
    value: 5000000,
});
psbt.addOutput({
    address: "n1kUSYA5CNJrLMCfLLAmKyCkDLuCZCRqoH",
    value: 89900,
});

psbt.signInput(0, privkey0);
psbt.signInput(1, privkey1);
psbt.signInput(2, privkey2);

psbt.validateSignaturesOfInput(0);
psbt.finalizeAllInputs();
const txHex = psbt.extractTransaction().toHex();

console.log("RawTx:\n" + txHex);
