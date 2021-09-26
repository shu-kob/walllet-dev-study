const bitcoin = require('bitcoinjs-lib');
const bip39 = require('bip39');

function mnemonicToXprivXpub() {
    const mnemonic = bip39.generateMnemonic(256);
    return mnemonic;
}

const mnemonic = mnemonicToXprivXpub();
console.log("mnemonic:");
console.log(mnemonic);
