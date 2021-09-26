const bitcoin = require('bitcoinjs-lib');
const bip32 = require('bip32');
const bip39 = require('bip39');
const MAINNET = bitcoin.networks.bitcoin;
const TESTNET = bitcoin.networks.testnet;
// let bitcoinNetwork = MAINNET;
let bitcoinNetwork = TESTNET;

function mnemonicToXprivXpub() {
    const mnemonic = bip39.generateMnemonic(256);
    const seed = bip39.mnemonicToSeedSync(mnemonic);
    const node = bip32.fromSeed(seed, bitcoinNetwork);
    const xpriv = node.derivePath("m/44'/1'/0'").toBase58();
    const xpub = node.derivePath("m/44'/1'/0'").neutered().toBase58();
    return { mnemonic, xpriv, xpub };
}

const { mnemonic, xpriv, xpub } = mnemonicToXprivXpub();
console.log("mnemonic:");
console.log(mnemonic);
console.log("xpriv:");
console.log(xpriv);
console.log("xpub:");
console.log(xpub);
