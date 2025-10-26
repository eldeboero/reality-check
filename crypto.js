/**
 * Reality Check - Cryptography Module
 * All cryptographic operations using Web Crypto API
 */

const RealityCrypto = {
    /**
     * Generate a new ECDH keypair (P-256 for broad compatibility)
     * @returns {Promise<{privateKey: CryptoKey, publicKey: CryptoKey}>}
     */
    async generateKeypair() {
        const keypair = await crypto.subtle.generateKey(
            {
                name: 'ECDH',
                namedCurve: 'P-256'  // Universal support (iOS, Android, desktop)
            },
            true, // extractable
            ['deriveKey', 'deriveBits']
        );
        return keypair;
    },

    /**
     * Export public key to base64 string for sharing
     * @param {CryptoKey} publicKey
     * @returns {Promise<string>}
     */
    async exportPublicKey(publicKey) {
        const exported = await crypto.subtle.exportKey('raw', publicKey);
        return this.arrayBufferToBase64(exported);
    },

    /**
     * Import public key from base64 string
     * @param {string} base64Key
     * @returns {Promise<CryptoKey>}
     */
    async importPublicKey(base64Key) {
        const keyData = this.base64ToArrayBuffer(base64Key);
        return await crypto.subtle.importKey(
            'raw',
            keyData,
            {
                name: 'ECDH',
                namedCurve: 'P-256'
            },
            true,
            []
        );
    },

    /**
     * Export private key to base64 string (for storage)
     * @param {CryptoKey} privateKey
     * @returns {Promise<string>}
     */
    async exportPrivateKey(privateKey) {
        const exported = await crypto.subtle.exportKey('pkcs8', privateKey);
        return this.arrayBufferToBase64(exported);
    },

    /**
     * Import private key from base64 string
     * @param {string} base64Key
     * @returns {Promise<CryptoKey>}
     */
    async importPrivateKey(base64Key) {
        const keyData = this.base64ToArrayBuffer(base64Key);
        return await crypto.subtle.importKey(
            'pkcs8',
            keyData,
            {
                name: 'ECDH',
                namedCurve: 'P-256'
            },
            true,
            ['deriveKey', 'deriveBits']
        );
    },

    /**
     * Perform ECDH to derive shared secret
     * @param {CryptoKey} privateKey - Your private key
     * @param {CryptoKey} publicKey - Their public key
     * @returns {Promise<ArrayBuffer>} - Shared secret (32 bytes)
     */
    async deriveSharedSecret(privateKey, publicKey) {
        const sharedSecret = await crypto.subtle.deriveBits(
            {
                name: 'ECDH',
                public: publicKey
            },
            privateKey,
            256 // 32 bytes
        );
        return sharedSecret;
    },

    /**
     * HKDF to derive TOTP secret from shared secret
     * @param {ArrayBuffer} sharedSecret
     * @param {string} contextInfo - Contextual info (sorted public key hashes)
     * @returns {Promise<ArrayBuffer>} - 20 byte TOTP secret
     */
    async deriveTotpSecret(sharedSecret, contextInfo) {
        // Import shared secret as key material
        const keyMaterial = await crypto.subtle.importKey(
            'raw',
            sharedSecret,
            'HKDF',
            false,
            ['deriveBits']
        );

        // Derive 20 bytes using HKDF (standard TOTP secret length)
        const salt = new TextEncoder().encode('RealityCheck');
        const info = new TextEncoder().encode(contextInfo);

        const derivedBits = await crypto.subtle.deriveBits(
            {
                name: 'HKDF',
                hash: 'SHA-256',
                salt: salt,
                info: info
            },
            keyMaterial,
            160 // 20 bytes = 160 bits for TOTP
        );

        return derivedBits;
    },

    /**
     * Generate TOTP secret for a contact
     * @param {CryptoKey} myPrivateKey
     * @param {CryptoKey} theirPublicKey
     * @param {string} myPublicKeyB64
     * @param {string} theirPublicKeyB64
     * @returns {Promise<string>} - Base32 encoded TOTP secret
     */
    async generateTotpSecret(myPrivateKey, theirPublicKey, myPublicKeyB64, theirPublicKeyB64) {
        // Derive shared secret via ECDH
        const sharedSecret = await this.deriveSharedSecret(myPrivateKey, theirPublicKey);

        // Create deterministic context by sorting public keys
        const sortedKeys = [myPublicKeyB64, theirPublicKeyB64].sort();
        const context = `TOTP:${sortedKeys[0]}:${sortedKeys[1]}`;

        // Derive TOTP secret using HKDF
        const totpSecret = await this.deriveTotpSecret(sharedSecret, context);

        // Encode as base32 (required for TOTP)
        return this.base32Encode(new Uint8Array(totpSecret));
    },

    /**
     * Calculate fingerprint (first 8 chars of SHA-256 hash) of public key
     * @param {string} publicKeyB64
     * @returns {Promise<string>}
     */
    async calculateFingerprint(publicKeyB64) {
        const keyData = this.base64ToArrayBuffer(publicKeyB64);
        const hash = await crypto.subtle.digest('SHA-256', keyData);
        const hashB64 = this.arrayBufferToBase64(hash);
        return hashB64.substring(0, 16).toUpperCase();
    },

    /**
     * Derive encryption key from passphrase using PBKDF2
     * @param {string} passphrase
     * @param {Uint8Array} salt - 16 byte salt
     * @returns {Promise<CryptoKey>}
     */
    async deriveEncryptionKey(passphrase, salt) {
        const encoder = new TextEncoder();
        const passphraseKey = await crypto.subtle.importKey(
            'raw',
            encoder.encode(passphrase),
            'PBKDF2',
            false,
            ['deriveKey']
        );

        return await crypto.subtle.deriveKey(
            {
                name: 'PBKDF2',
                salt: salt,
                iterations: 600000, // OWASP recommendation
                hash: 'SHA-256'
            },
            passphraseKey,
            {
                name: 'AES-GCM',
                length: 256
            },
            false,
            ['encrypt', 'decrypt']
        );
    },

    /**
     * Encrypt data with AES-GCM
     * @param {CryptoKey} key
     * @param {string} data - JSON string to encrypt
     * @returns {Promise<{iv: Uint8Array, ciphertext: ArrayBuffer}>}
     */
    async encrypt(key, data) {
        const encoder = new TextEncoder();
        const plaintext = encoder.encode(data);

        // Generate random IV (12 bytes for GCM)
        const iv = crypto.getRandomValues(new Uint8Array(12));

        const ciphertext = await crypto.subtle.encrypt(
            {
                name: 'AES-GCM',
                iv: iv
            },
            key,
            plaintext
        );

        return { iv, ciphertext };
    },

    /**
     * Decrypt data with AES-GCM
     * @param {CryptoKey} key
     * @param {Uint8Array} iv
     * @param {ArrayBuffer} ciphertext
     * @returns {Promise<string>} - Decrypted JSON string
     */
    async decrypt(key, iv, ciphertext) {
        const plaintext = await crypto.subtle.decrypt(
            {
                name: 'AES-GCM',
                iv: iv
            },
            key,
            ciphertext
        );

        const decoder = new TextDecoder();
        return decoder.decode(plaintext);
    },

    /**
     * Generate random salt for PBKDF2
     * @returns {Uint8Array} - 16 byte salt
     */
    generateSalt() {
        return crypto.getRandomValues(new Uint8Array(16));
    },

    /**
     * Base32 encoding (for TOTP secrets)
     * @param {Uint8Array} bytes
     * @returns {string}
     */
    base32Encode(bytes) {
        const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567';
        let bits = 0;
        let value = 0;
        let output = '';

        for (let i = 0; i < bytes.length; i++) {
            value = (value << 8) | bytes[i];
            bits += 8;

            while (bits >= 5) {
                output += alphabet[(value >>> (bits - 5)) & 31];
                bits -= 5;
            }
        }

        if (bits > 0) {
            output += alphabet[(value << (5 - bits)) & 31];
        }

        return output;
    },

    /**
     * Base64 encode ArrayBuffer
     * @param {ArrayBuffer} buffer
     * @returns {string}
     */
    arrayBufferToBase64(buffer) {
        const bytes = new Uint8Array(buffer);
        let binary = '';
        for (let i = 0; i < bytes.length; i++) {
            binary += String.fromCharCode(bytes[i]);
        }
        return btoa(binary);
    },

    /**
     * Base64 decode to ArrayBuffer
     * @param {string} base64
     * @returns {ArrayBuffer}
     */
    base64ToArrayBuffer(base64) {
        const binary = atob(base64);
        const bytes = new Uint8Array(binary.length);
        for (let i = 0; i < binary.length; i++) {
            bytes[i] = binary.charCodeAt(i);
        }
        return bytes.buffer;
    }
};
