const CryptoJS = require("crypto-js");

// Encrypt

// Decrypt

function encrypt(text) {
  const ciphertext = CryptoJS.AES.encrypt(text, "secret key 123").toString();
  return ciphertext;
}
function decrypt(ciphertext) {
  const bytes = CryptoJS.AES.decrypt(ciphertext, "secret key 123");
  const originalText = bytes.toString(CryptoJS.enc.Utf8);
  return originalText;
}
module.exports = { encrypt, decrypt };
