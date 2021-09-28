const bitcoin = require('bitcoinjs-lib');
const bip32 = require('bip32');
const bip39 = require('bip39');
const { xpub } = require('./xpub.json');
const MAINNET = bitcoin.networks.bitcoin;
const TESTNET = bitcoin.networks.testnet;
let bitcoinNetwork = TESTNET; // MAINNET or TESTNET

let purpose = "44"

let coinType = null;

if (bitcoinNetwork == MAINNET) {
    coinType = "0";
}
else if (bitcoinNetwork == TESTNET) {
    coinType = "1";
}

let account = "0"

let nonChangeAddress = 0;
let changeAddress = 1;

function getPublicKey(xpub, isChange, addressIndex){
    const pubkeyNode = bitcoin.bip32.fromBase58(xpub, bitcoinNetwork);
    const pubkey = pubkeyNode.derive(isChange).derive(addressIndex).publicKey;
    return pubkey
}

function getP2pkhAddress(xpub, isChange, addressIndex){
    const pubkey = getPublicKey(xpub, isChange, addressIndex);
    const address = bitcoin.payments.p2pkh({ pubkey: pubkey, network: bitcoinNetwork, }).address;
    return address;
}

function getP2shP2wpkhAddress(xpub, isChange, addressIndex){
    const pubkey = getPublicKey(xpub, isChange, addressIndex);
    const address = bitcoin.payments.p2sh({
        redeem: bitcoin.payments.p2wpkh({ pubkey: pubkey, network: bitcoinNetwork, })
    }).address;
    return address;
}

function getP2wpkhAddress(xpub, isChange, addressIndex){
    const pubkey = getPublicKey(xpub, isChange, addressIndex);
    const address = bitcoin.payments.p2wpkh({ pubkey: pubkey, network: bitcoinNetwork, }).address;
    return address;
}

let isChange = nonChangeAddress;

console.log("Non Change Addresses");

for (let addressIndex = 0; addressIndex < 5; addressIndex++){

    let addressPath = `m/${purpose}'/${coinType}'/${account}'/${isChange}/${addressIndex}`
    console.log("addressPath: " + addressPath);

    const p2pkhAddress = getP2pkhAddress(xpub, isChange, addressIndex);
    console.log("P2PKH:\n" + p2pkhAddress);

    const p2shP2wpkhAddress = getP2shP2wpkhAddress(xpub, isChange, addressIndex);
    console.log("P2SH-P2WPKH:\n" + p2shP2wpkhAddress);

    const p2wpkhAddress = getP2wpkhAddress(xpub, isChange, addressIndex);
    console.log("P2WPKH:\n" + p2wpkhAddress);
}

console.log("\n");

isChange = changeAddress;

console.log("Change Addresses");

for (let addressIndex = 0; addressIndex < 5; addressIndex++){

    let addressPath = `m/${purpose}'/${coinType}'/${account}'/${isChange}/${addressIndex}`
    console.log("addressPath: " + addressPath);

    const p2pkhAddress = getP2pkhAddress(xpub, isChange, addressIndex);
    console.log("P2PKH:\n" + p2pkhAddress);

    const p2shP2wpkhAddress = getP2shP2wpkhAddress(xpub, isChange, addressIndex);
    console.log("P2SH-P2WPKH:\n" + p2shP2wpkhAddress);

    const p2wpkhAddress = getP2wpkhAddress(xpub, isChange, addressIndex);
    console.log("P2WPKH:\n" + p2wpkhAddress);
}
