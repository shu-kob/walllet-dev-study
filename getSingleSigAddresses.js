const bitcoin = require('bitcoinjs-lib');
const bip32 = require('bip32');
const bip39 = require('bip39');
const { xpub } = require('./xpub.json');
const MAINNET = bitcoin.networks.bitcoin;
const TESTNET = bitcoin.networks.testnet;

const LITECOIN = {
    messagePrefix: '\x19Litecoin Signed Message:\n',
    bech32: 'ltc',
    bip32: {
      public: 0x019da462,
      private: 0x019d9cfe,
    },
    pubKeyHash: 0x30,
    scriptHash: 0x32,
    wif: 0xb0,
};

const DOGECOIN = {
    messagePrefix: '\x19Dogecoin Signed Message:\n',
    bip32: {
      public: 0x02facafd,
      private: 0x02fac398
    },
    pubKeyHash: 0x1e,
    scriptHash: 0x16,
    wif: 0x9e
};

let bitcoinNetwork = TESTNET; // MAINNET, TESTNET, LITECOIN or DOGECOIN

let purpose = "44"

let coinType = null;

if (bitcoinNetwork == MAINNET) {
    coinType = "0";
}
else if (bitcoinNetwork == TESTNET) {
    coinType = "1";
}
else if (bitcoinNetwork == LITECOIN) {
    coinType = "2";
}
else if (bitcoinNetwork == DOGECOIN) {
    coinType = "3";
}

let account = "0"

let externalAddress = 0;
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

let isChange = externalAddress;

console.log("External Addresses");

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
