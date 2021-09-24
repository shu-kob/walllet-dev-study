const bitcoin = require('bitcoinjs-lib');
const bip32 = require('bip32');
const bip39 = require('bip39');
const { xpub1, xpub2, xpub3 } = require('./xpubs.json');
const MAINNET = bitcoin.networks.bitcoin;
const TESTNET = bitcoin.networks.testnet;
// let bitcoinNetwork = MAINNET;
let bitcoinNetwork = TESTNET;

function getPublicKey(xpub, isChange, addressIndex){
    const pubkeyNode = bitcoin.bip32.fromBase58(xpub, bitcoinNetwork);
    const pubkey = pubkeyNode.derive(isChange).derive(addressIndex).publicKey;
    return pubkey
}

let nonChangeAddress = 0;
let changeAddress = 1;

function getP2shAddress(xpub1, xpub2, xpub3, isChange, addressIndex){
    const pubkeys = [
        getPublicKey(xpub1, isChange, addressIndex),
        getPublicKey(xpub2, isChange, addressIndex),
        getPublicKey(xpub3, isChange, addressIndex),
    ].map(Buffer => Buffer);
    const address = bitcoin.payments.p2sh({
        redeem: bitcoin.payments.p2ms({ m: 2, pubkeys, network: bitcoinNetwork, }),
    }).address;
    return address;
}

function getP2shP2wshAddress(xpub1, xpub2, xpub3, isChange, addressIndex){
    const pubkeys = [
        getPublicKey(xpub1, isChange, addressIndex),
        getPublicKey(xpub2, isChange, addressIndex),
        getPublicKey(xpub3, isChange, addressIndex),
    ].map(Buffer => Buffer);
    const address = bitcoin.payments.p2sh({
        redeem: bitcoin.payments.p2wsh({
            redeem: bitcoin.payments.p2ms({ m: 2, pubkeys, network: bitcoinNetwork, })
        }),
    }).address;
    return address;
}

function getP2wshAddress(xpub1, xpub2, xpub3, isChange, addressIndex){
    const pubkeys = [
        getPublicKey(xpub1, isChange, addressIndex),
        getPublicKey(xpub2, isChange, addressIndex),
        getPublicKey(xpub3, isChange, addressIndex),
    ].map(Buffer => Buffer);
    const address = bitcoin.payments.p2wsh({
        redeem: bitcoin.payments.p2ms({ m: 2, pubkeys, network: bitcoinNetwork, }),
    }).address;
    return address;
}

for (let addressIndex = 0; addressIndex < 5; addressIndex++){
    console.log("addressIndex: " + addressIndex);
    
    const p2shAddress = getP2shAddress(xpub1, xpub2, xpub3, nonChangeAddress, addressIndex);
    console.log("P2SH:");
    console.log(p2shAddress);

    const p2shChangeAddress = getP2shAddress(xpub1, xpub2, xpub3, changeAddress, addressIndex);
    console.log("change:");
    console.log(p2shChangeAddress);

    const p2shP2wshAddress = getP2shP2wshAddress(xpub1, xpub2, xpub3, nonChangeAddress, addressIndex);
    console.log("P2SH-P2WSH:");
    console.log(p2shP2wshAddress);

    const p2shP2wshChangeAddress = getP2shP2wshAddress(xpub1, xpub2, xpub3, changeAddress, addressIndex);
    console.log("change:");
    console.log(p2shP2wshChangeAddress);

    const p2wshAddress = getP2wshAddress(xpub1, xpub2, xpub3, nonChangeAddress, addressIndex);
    console.log("P2WSH:");
    console.log(p2wshAddress);

    const p2wshChangeAddress = getP2wshAddress(xpub1, xpub2, xpub3, changeAddress, addressIndex);
    console.log("change:");
    console.log(p2wshChangeAddress);
}