# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Reality Check is a **stateless Progressive Web App** for identity verification during remote communications. It acts as a cryptographic ceremony broker for one-time P2P key exchanges, generating ephemeral ECDH keys to derive shared TOTP secrets that users store in their authenticator apps.

**Core Principle**: Generate ephemeral keys, exchange them via QR codes, derive a shared TOTP secret, then discard all cryptographic material. No data persistence, no storage, no servers.

**Use Case**: Two people who already know each other exchange keys once (in person or video). From then on, they can verify each other's identity during phone calls, messages, or video chats by comparing matching 6-digit TOTP codes from their authenticator apps.

## Development Commands

### Local Development

```bash
# Serve locally with Python (recommended for quick testing)
python3 -m http.server 8080
# Access at http://localhost:8080

# OR use any static file server
npx serve -p 8080
```

### Container Development

```bash
# Build and run Podman container
./container.sh rebuild

# Stop container
./container.sh stop

# View logs
./container.sh logs

# Clean everything
./container.sh clean
```

### Testing Deployment

Since this is a static PWA with no build process, testing is straightforward:
- Open in browser
- Test QR code generation ("Show My Key")
- Test QR code scanning ("Scan Their Key") - requires camera access
- Verify service worker registration in DevTools → Application → Service Workers
- Test offline functionality by disconnecting network

## Architecture

### File Structure

```
/
├── index.html          # Single-page HTML shell
├── app.js              # UI controller and state management (~368 lines)
├── crypto.js           # Pure cryptographic functions (~310 lines)
├── styles.css          # Application styling
├── service-worker.js   # PWA offline caching
├── manifest.json       # PWA manifest
├── icon-*.png          # PWA icons
├── container.sh        # Podman container management script
├── Containerfile       # Container image definition (nginx-based)
└── nginx.conf          # nginx configuration for container
```

### Application Design

**Stateless Architecture**:
- NO localStorage usage
- NO sessionStorage usage
- NO IndexedDB
- NO cookies
- Keys exist ONLY in JavaScript memory (`RealityCheckApp.state`)
- Closing the page immediately destroys all cryptographic material

**Single-Screen UI**:
- Two main actions: "Show My Key" and "Scan Their Key"
- Dynamic content area that morphs based on state
- No navigation, no tabs, no multi-page flow
- Toast notifications for transient feedback

**State Management**:
The `RealityCheckApp` class maintains minimal ephemeral state:
```javascript
this.state = {
    privateKey: null,    // CryptoKey object (never exported/saved)
    publicKey: null,     // CryptoKey object
    publicKeyB64: null   // Base64 string for QR code generation
};
```

### Cryptographic Implementation

**Module**: `crypto.js` (`RealityCrypto` object)

Key operations:
- `generateKeypair()`: P-256 ECDH keypair generation
- `exportPublicKey()` / `importPublicKey()`: Public key serialization
- `deriveSharedSecret()`: ECDH operation
- `deriveTotpSecret()`: HKDF-SHA256 with deterministic context
- `generateTotpSecret()`: End-to-end TOTP secret generation
- `calculateFingerprint()`: SHA-256 hash for verbal verification
- `base32Encode()`: Manual Base32 encoding for TOTP compatibility

**Critical Details**:
- P-256 (secp256r1) chosen for universal browser support (iOS Safari compatibility)
- TOTP uses standard 30-second window for universal authenticator app compatibility
- Shared secret context uses sorted public keys for determinism: `TOTP:<sorted_key1>:<sorted_key2>`
- HKDF salt: `"RealityCheck"` (fixed string)
- Output: 160 bits (20 bytes) → Base32 encoded

### Security Model

**Trust Bootstrap**: First key exchange MUST happen on a trusted channel (in-person or video where faces are visible). If this exchange is compromised, the attacker can impersonate parties forever.

**Threat Model**:
- ✅ Protects against: SIM swaps, voice deepfakes, email/SMS impersonation, MITM attacks
- ❌ Does NOT protect against: Compromised initial exchange, stolen authenticator app, coercion, quantum attacks (P-256 is Shor-vulnerable)

**Privacy Guarantees**:
- Zero data collection
- Zero network communication (after initial page load)
- Zero telemetry or analytics
- Fully open source (AGPL v3)

## Important Implementation Constraints

### What NOT to Add

1. **NO Data Persistence**: Do NOT add localStorage, sessionStorage, IndexedDB, cookies, or file storage. The stateless design is a core security feature.

2. **NO Encryption of Keys**: There is nothing to encrypt - keys are ephemeral and discarded. Do NOT add encryption layers.

3. **NO Contact Management**: This is not a contact list app. Each relationship is independent.

4. **NO Server Communication**: The app must remain fully client-side. Do NOT add API calls, websockets, or server dependencies (except CDN libraries).

5. **NO Complex UI**: The single-screen design is intentional. Avoid multi-page flows or complex navigation.

### Dependencies

**External Libraries** (loaded from CDN):
- `jsQR` (v1.4.0): QR code scanning from camera
- `QRCode.js` (v1.0.0): QR code generation for display

**Browser APIs**:
- Web Crypto API (`crypto.subtle`) - core cryptography
- getUserMedia - camera access for QR scanning
- Service Workers - offline PWA functionality
- Web App Manifest - PWA installation

**Minimum Browser Support**:
- Chrome/Edge 90+
- Firefox 90+
- Safari 14+ (iOS 14+)
- Android Browser 90+

## Common Development Tasks

### Modifying TOTP Parameters

TOTP configuration is in `crypto.js`. To change:
- **Window period**: Use the standard 30-second period for compatibility (both parties' authenticator apps must match)
- **Output length**: Change HKDF deriveBits parameter (line 127: currently 160 bits = 20 bytes)
- **Salt**: Modify `'RealityCheck'` string (line 116)

⚠️ **Warning**: Changing these breaks compatibility with existing TOTP secrets.

### Testing Cryptographic Functions

Since `crypto.js` is a pure module with no side effects, you can test in browser console:

```javascript
// Generate keypair
const kp1 = await RealityCrypto.generateKeypair();
const kp2 = await RealityCrypto.generateKeypair();

// Export public keys
const pub1 = await RealityCrypto.exportPublicKey(kp1.publicKey);
const pub2 = await RealityCrypto.exportPublicKey(kp2.publicKey);

// Generate TOTP secret
const secret = await RealityCrypto.generateTotpSecret(
    kp1.privateKey, kp2.publicKey, pub1, pub2
);
console.log(secret); // Base32 string
```

### Adding New UI States

All UI rendering happens in `app.js` by injecting HTML into `#status-area`. Pattern:

```javascript
async displayNewState() {
    const statusArea = document.getElementById('status-area');
    statusArea.innerHTML = `
        <div class="new-state-section">
            <h2>State Title</h2>
            <!-- content -->
            <button id="action-btn" class="btn-primary">Action</button>
        </div>
    `;

    // Attach event listeners
    document.getElementById('action-btn').addEventListener('click', () => {
        this.handleAction();
    });
}
```

### Camera Permissions

QR scanning requires camera access. Testing tips:
- HTTPS is required in production (localhost exempt)
- Use `facingMode: 'environment'` for rear camera
- Handle permission denial gracefully
- Stop video stream when done to free camera: `track.stop()`

### Service Worker Updates

Service worker (`service-worker.js`) caches all static assets. After code changes:
1. User must click "Clear Cache" button, OR
2. Manually clear in DevTools → Application → Clear Storage

Cache strategy: Cache-first with network fallback for offline support.

## QR Code Format

QR codes encode public keys in this format:
```
REALITYCHECK:v1:<base64_public_key>
```

Version prefix (`v1`) allows future protocol changes. Parsing logic in `app.js:handleScannedQr()`.

## Deployment

### GitHub Pages (Recommended)
1. Enable Pages in repo settings
2. Deploy from `main` branch
3. Access at `https://<username>.github.io/reality-check/`

### Container Deployment
```bash
./container.sh rebuild  # Builds nginx-based container
./container.sh start    # Starts on port 8080
```

Container uses nginx with:
- HTTPS headers for security
- Service worker support
- Proper MIME types for PWA manifest

### Other Static Hosts
Works on any static host (Netlify, Vercel, Cloudflare Pages). No build step required.

## TOTP Integration Details

**Standard 30-second period**:
Reality Check uses the standard 30-second TOTP period for maximum compatibility with all authenticator apps. This ensures that users can use any RFC 6238-compliant authenticator app without needing to configure custom periods.

**Authenticator App Compatibility**:
All standard authenticator apps work with the default 30-second period:
- Authy: Full support
- Google Authenticator: Full support
- 1Password: Full support
- Aegis: Full support
- Any RFC 6238-compliant app: Full support

## AI Disclosure

All code in this project was AI-generated (see `AI_DISCLOSURE.md`). When making changes:
- Prioritize security review of cryptographic code
- Test thoroughly across browsers
- Document assumptions and trade-offs
- Follow the stateless design philosophy

## License

AGPL v3 - All modifications must be open source and disclosed when running as a network service.
