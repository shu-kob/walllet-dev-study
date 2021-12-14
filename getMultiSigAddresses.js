const bitcoin = require('bitcoinjs-lib');
const bip32 = require('bip32');
const bip39 = require('bip39');
const { xpub1, xpub2, xpub3 } = require('./xpubs.json');
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

let account = "0"

let externalAddress = 0;
let changeAddress = 1;

function getPublicKey(xpub, isChange, addressIndex){
    const pubkeyNode = bitcoin.bip32.fromBase58(xpub, bitcoinNetwork);
    const pubkey = pubkeyNode.derive(isChange).derive(addressIndex).publicKey;
    return pubkey
}

function getPubkeys(xpub1, xpub2, xpub3, isChange, addressIndex){
    const pubkeys = [
        getPublicKey(xpub1, isChange, addressIndex),
        getPublicKey(xpub2, isChange, addressIndex),
        getPublicKey(xpub3, isChange, addressIndex),
    ].map(Buffer => Buffer);
    return pubkeys
}

function getP2shAddress(xpub1, xpub2, xpub3, isChange, addressIndex){
    const pubkeys =  getPubkeys(xpub1, xpub2, xpub3, isChange, addressIndex);
    const address = bitcoin.payments.p2sh({
        redeem: bitcoin.payments.p2ms({ m: 2, pubkeys, network: bitcoinNetwork, }),
    }).address;
    return address;
}

function getP2shP2wshAddress(xpub1, xpub2, xpub3, isChange, addressIndex){
    const pubkeys =  getPubkeys(xpub1, xpub2, xpub3, isChange, addressIndex);
    const address = bitcoin.payments.p2sh({
        redeem: bitcoin.payments.p2wsh({
            redeem: bitcoin.payments.p2ms({ m: 2, pubkeys, network: bitcoinNetwork, })
        }),
    }).address;
    return address;
}

function getP2wshAddress(xpub1, xpub2, xpub3, isChange, addressIndex){
    const pubkeys =  getPubkeys(xpub1, xpub2, xpub3, isChange, addressIndex);
    const address = bitcoin.payments.p2wsh({
        redeem: bitcoin.payments.p2ms({ m: 2, pubkeys, network: bitcoinNetwork, }),
    }).address;
    return address;
}
let isChange = externalAddress;

console.log("External Addresses");

for (let addressIndex = 0; addressIndex < 5; addressIndex++){

    let addressPath = `m/${purpose}'/${coinType}'/${account}'/${isChange}/${addressIndex}`
    console.log("addressPath: " + addressPath);
    
    const p2shAddress = getP2shAddress(xpub1, xpub2, xpub3, isChange, addressIndex);
    console.log("P2SH:\n" + p2shAddress);

    const p2shP2wshAddress = getP2shP2wshAddress(xpub1, xpub2, xpub3, isChange, addressIndex);
    console.log("P2SH-P2WSH:\n" + p2shP2wshAddress);

    const p2wshAddress = getP2wshAddress(xpub1, xpub2, xpub3, isChange, addressIndex);
    console.log("P2WSH:\n" + p2wshAddress);
}

console.log("\n");

isChange = changeAddress;

console.log("Change Addresses");

for (let addressIndex = 0; addressIndex < 5; addressIndex++){

    let addressPath = `m/${purpose}'/${coinType}'/${account}'/${isChange}/${addressIndex}`
    console.log("addressPath: " + addressPath);

    const p2shAddress = getP2shAddress(xpub1, xpub2, xpub3, isChange, addressIndex);
    console.log("P2SH:\n" + p2shAddress);

    const p2shP2wshAddress = getP2shP2wshAddress(xpub1, xpub2, xpub3, isChange, addressIndex);
    console.log("P2SH-P2WSH:\n" + p2shP2wshAddress);

    const p2wshAddress = getP2wshAddress(xpub1, xpub2, xpub3, isChange, addressIndex);
    console.log("P2WSH:\n" + p2wshAddress);
}
