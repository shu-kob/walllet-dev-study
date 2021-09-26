const bip39 = require('bip39');
const fs = require("fs");

function mnemonicToXprivXpub() {
    const mnemonic = bip39.generateMnemonic(256);
    return mnemonic;
}

const mnemonic1 = mnemonicToXprivXpub();

const data1 = `{\n  "mnemonic": "${mnemonic1}"\n}`

fs.writeFile("mnemonic1.json", data1, (err) => {
    if (err) throw err;
    console.log("mnemonic1:\n" + mnemonic1);
});

const mnemonic2 = mnemonicToXprivXpub();

const data2 = `{\n  "mnemonic": "${mnemonic2}"\n}`

fs.writeFile("mnemonic2.json", data2, (err) => {
    if (err) throw err;
    console.log("mnemonic2:\n" + mnemonic2);
});

const mnemonic3 = mnemonicToXprivXpub();

const data3 = `{\n  "mnemonic": "${mnemonic3}"\n}`

fs.writeFile("mnemonic3.json", data3, (err) => {
    if (err) throw err;
    console.log("mnemonic3:\n" + mnemonic3);
});
