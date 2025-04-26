import CryptoJS from "crypto-js";
const SECRET_KEY = process.env.NEXT_PUBLIC_PASSKEY_SECRET;

export const encryptFile = async (file, passkey) => {
  const salt = crypto.getRandomValues(new Uint8Array(16));
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const key = await deriveKey(passkey, salt);

  const fileBuffer = await file.arrayBuffer();
  const encryptedFile = await crypto.subtle.encrypt(
    { name: "AES-GCM", iv },
    key,
    fileBuffer
  );

  const verificationText = "verify-token";
  const enc = new TextEncoder();
  const verificationData = enc.encode(verificationText);

  const verificationIV = crypto.getRandomValues(new Uint8Array(12));
  const encryptedVerification = await crypto.subtle.encrypt(
    { name: "AES-GCM", iv: verificationIV },
    key,
    verificationData
  );

  return {
    encryptedFile: new Uint8Array(encryptedFile),
    encryptedVerification: new Uint8Array(encryptedVerification),
    salt,
    iv,
    verificationIV,
  };
};

export const verifyPasskey = async (
  passkey,
  salt,
  verificationIV,
  encryptedVerification
) => {
  try {
    const key = await deriveKey(passkey, salt);
    const decrypted = await crypto.subtle.decrypt(
      { name: "AES-GCM", iv: verificationIV },
      key,
      encryptedVerification
    );
    const text = new TextDecoder().decode(decrypted);
    return text === "verify-token";
  } catch (err) {
    return false;
  }
};

export const decryptFile = async (encryptedFile, passkey, salt, iv) => {
  const key = await deriveKey(passkey, salt);

  const decrypted = await crypto.subtle.decrypt(
    { name: "AES-GCM", iv },
    key,
    encryptedFile
  );

  return new Blob([decrypted]);
};

const deriveKey = async (passkey, salt) => {
  const enc = new TextEncoder();
  const passkeyData = enc.encode(passkey);

  const keyMaterial = await crypto.subtle.importKey(
    "raw",
    passkeyData,
    "PBKDF2",
    false,
    ["deriveKey"]
  );

  return await crypto.subtle.deriveKey(
    {
      name: "PBKDF2",
      salt,
      iterations: 100_000,
      hash: "SHA-256",
    },
    keyMaterial,
    { name: "AES-GCM", length: 256 },
    false,
    ["encrypt", "decrypt"]
  );
};

export const fromBase64 = (base64) => {
  const binaryString = atob(base64);
  const bytes = new Uint8Array(binaryString.length);
  for (let i = 0; i < binaryString.length; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes;
};

export const toBase64 = (buffer) => {
  return btoa(String.fromCharCode(...new Uint8Array(buffer)));
};

export const encryptPasskey = (passkey) => {
  const encrypted = CryptoJS.AES.encrypt(passkey, SECRET_KEY).toString();
  return encrypted;
};

export const decryptPasskey = (encryptedPasskey) => {
  const bytes = CryptoJS.AES.decrypt(encryptedPasskey, SECRET_KEY);
  const decrypted = bytes.toString(CryptoJS.enc.Utf8);
  return decrypted;
};
