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

const p2wpkh0 = bitcoin.payments.p2wpkh({ pubkey: pubkey0, network: bitcoinNetwork, });
const p2wpkh1 = bitcoin.payments.p2wpkh({ pubkey: pubkey1, network: bitcoinNetwork, });
const p2wpkh2 = bitcoin.payments.p2wpkh({ pubkey: pubkey2, network: bitcoinNetwork, });

const psbt = new bitcoin.Psbt({ network: bitcoinNetwork });

const previousRawTx0 = '02000000038dcd53c8d248501c8ff104aca5a4a00d65b3cba08fdda4cea9feb870ca720b90000000006b483045022100c92f732163673451a2c36cfa579ea4ad63263e1b08134e316027978fd49de483022070ebfb336a65915ee9354163736793780e7f225c09eb596b1efad64f808ec4d6012102fc637ace8e2141d73bbb4bf68a8963ac60521d11a7b35fdaf1cf8d292f84ae94ffffffff8dcd53c8d248501c8ff104aca5a4a00d65b3cba08fdda4cea9feb870ca720b90010000006a47304402203fea4ab3d595fc0191f7e4cd96fa52077151af4a2ebc0f99a3036fbbaa8c77360220734d2326eded69a0427b0e730a72d60f5da696d248179d1d22d3b385e29111090121032b52523688e27b11be112aa333f1f0630a07eb69343c1ec078804a2f58881774ffffffff8dcd53c8d248501c8ff104aca5a4a00d65b3cba08fdda4cea9feb870ca720b90020000006b483045022100b9391528fcf9475a7bc06f6750aa1e3e800d2e6164a0a1630004d9fd6ee2b13902207453e59b6e36a8bd2b9091c53671a9fe249a3769936f762a571ecd84bf91372d012103fdfd0ee8cb92501b13115a55276ff83f990edede02e41dcc464b559d49d0dbfcffffffff02404b4c000000000017a91481d0d330105cddcdfdbd3f0dd776145cf8751c35872c5f0100000000001976a914ddf11688a05eda9b14e38ea91937b7472ab6809e88ac00000000';
const previousRawTx1 = '02000000000101d03f1761db9435e7850869cfb3ea88bbe61739b38e9c414e8c7da7e184f45bd80000000000feffffff02a08601000000000017a9148790ebefb4f0aa206513790325ca08a7ce2f239a87683f2c0000000000160014af8b9968894a2bc669abcaa6c70d3b7f52ff70e202473044022052bd7ea37ae47f7daae4cbf59c68114e3c96460833d5005731ddc77b7024918602205f368b42b6fe032207a9b7d68ae00657bdde688caf68dce317b9a871fdd73e44012103d41d10a07fb9b54f76b5300adbebb46ded4d5b45ab7431fc230bb165a80416862ce10000'
const previousRawTx2 = '020000000001010e002f708a6f48b2fba0345e6b30884c46e042eb7804272af24feb6ab5f184560000000000feffffff02683f2c0000000000160014ba1b55a3ad0b8d834583fb6645623724cee7f240a08601000000000017a9148176744ed5882a31998eb114ba4ed94903afcc78870247304402205bee371a3a6d29239d4e5d7d832394e5b96e1200f3578c9bb189b62aed04d23f0220029381e9ef194f23cd055ea6e0c1c6cd6397c99e6fc7534773c71e15c4f3da27012103fb083aeeedd05e33f338181efbd2a8776810a0fd893716950290a81138d9b488f2e00000'

psbt.addInput({
    hash: '15552e62bb92a84a7209cf16f51c2ac65fe5a4e2cfe1acbe2fb067326acf4619',
    index: 0,
    redeemScript: p2wpkh0.output,
    nonWitnessUtxo: Buffer.from(previousRawTx0, 'hex'),
});
psbt.addInput({
    hash: 'fc7761613d70ae9f5aadc345cf6da9af8759470879599a173febb05de7af9b68',
    index: 0,
    redeemScript: p2wpkh1.output,
    nonWitnessUtxo: Buffer.from(previousRawTx1, 'hex'),
});
psbt.addInput({
    hash: '7d96a28f00d91ee0d9959a309e21e367ed29414af534671f6daf70d7c7f62925',
    index: 1,
    redeemScript: p2wpkh2.output,
    nonWitnessUtxo: Buffer.from(previousRawTx2, 'hex'),
});
psbt.addOutput({
    address: "2MzX5zHJkZX3GyrD92ijvT7FyEXiTajud1d",
    value: 5150000,
});
psbt.addOutput({
    address: "2N1YL3hm9fKcTP84cT761eTjc8er9tQieXv",
    value: 49652,
});

psbt.signInput(0, privkey0);
psbt.signInput(1, privkey1);
psbt.signInput(2, privkey2);

psbt.validateSignaturesOfInput(0);
psbt.validateSignaturesOfInput(1);
psbt.validateSignaturesOfInput(2);
psbt.finalizeAllInputs();
const txHex = psbt.extractTransaction().toHex();

console.log("RawTx:\n" + txHex);
