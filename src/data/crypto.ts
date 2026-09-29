// WebCrypto AES-GCM + Data Sanitizer — pure TypeScript
// Aligns with ARCHITECTURE.md 7.2 & 9

const KEY_DB_NAME = 'nonetpay-keystore';
const KEY_STORE_NAME = 'keys';
const MASTER_KEY_ID = 'storage-aes-key';

// Sanitizer strips sensitive digit runs near "PIN", "OTP", "MPIN", "CVV", "PASSWORD"
export function sanitizeSensitiveText(text: string): string {
  if (!text) return '';
  return text
    // Replace 4-6 digit runs following PIN/OTP patterns
    .replace(/(?:pin|mpin|otp|password|cvv|passcode)[:=\s]*([0-9]{4,8})/gi, (match, digits) => {
      return match.replace(digits, '***[REDACTED]***');
    })
    // Strip isolated 4-6 digits if preceded by "enter" or "code"
    .replace(/(?:enter|code|auth)[:=\s]*([0-9]{4,6})/gi, (match, digits) => {
      return match.replace(digits, '***[REDACTED]***');
    });
}

// Get or generate a non-extractable WebCrypto AES-GCM 256-bit key
export async function getOrCreateCryptoKey(): Promise<CryptoKey> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(KEY_DB_NAME, 1);

    request.onupgradeneeded = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains(KEY_STORE_NAME)) {
        db.createObjectStore(KEY_STORE_NAME);
      }
    };

    request.onerror = () => reject(request.error);

    request.onsuccess = async () => {
      const db = request.result;
      const tx = db.transaction(KEY_STORE_NAME, 'readwrite');
      const store = tx.objectStore(KEY_STORE_NAME);

      const getReq = store.get(MASTER_KEY_ID);

      getReq.onsuccess = async () => {
        if (getReq.result) {
          resolve(getReq.result);
        } else {
          // Generate new non-extractable AES-GCM key
          try {
            const key = await window.crypto.subtle.generateKey(
              {
                name: 'AES-GCM',
                length: 256,
              },
              false, // non-extractable
              ['encrypt', 'decrypt']
            );

            const putTx = db.transaction(KEY_STORE_NAME, 'readwrite');
            putTx.objectStore(KEY_STORE_NAME).put(key, MASTER_KEY_ID);
            putTx.oncomplete = () => resolve(key);
            putTx.onerror = () => reject(putTx.error);
          } catch (err) {
            reject(err);
          }
        }
      };

      getReq.onerror = () => reject(getReq.error);
    };
  });
}

export interface EncryptedPayload {
  iv: string; // Base64
  data: string; // Base64
}

// Encrypt JSON object using WebCrypto AES-GCM
export async function encryptData<T>(data: T, key?: CryptoKey): Promise<EncryptedPayload> {
  const cryptoKey = key || (await getOrCreateCryptoKey());
  const iv = window.crypto.getRandomValues(new Uint8Array(12));
  const encoded = new TextEncoder().encode(JSON.stringify(data));

  const cipherBuffer = await window.crypto.subtle.encrypt(
    {
      name: 'AES-GCM',
      iv,
    },
    cryptoKey,
    encoded
  );

  return {
    iv: btoa(String.fromCharCode(...iv)),
    data: btoa(String.fromCharCode(...new Uint8Array(cipherBuffer))),
  };
}

// Decrypt JSON object using WebCrypto AES-GCM
export async function decryptData<T>(payload: EncryptedPayload, key?: CryptoKey): Promise<T> {
  const cryptoKey = key || (await getOrCreateCryptoKey());
  const iv = Uint8Array.from(atob(payload.iv), (c) => c.charCodeAt(0));
  const cipherBytes = Uint8Array.from(atob(payload.data), (c) => c.charCodeAt(0));

  const decryptedBuffer = await window.crypto.subtle.decrypt(
    {
      name: 'AES-GCM',
      iv,
    },
    cryptoKey,
    cipherBytes
  );

  const decodedString = new TextDecoder().decode(decryptedBuffer);
  return JSON.parse(decodedString) as T;
}
