# Reality Check

**Protect your most important relationships from impersonation attacks**

Reality Check helps you verify your most valuable, trusted contacts when you can't be physically together. You simply generate a shared secret once (in person or video) and add it to your authenticator app.  From then on, you'll both see matching 6-digit codes for each other. While talking or messaging in real-time, compare codes (ideally each person provides 3 of the 6 digits).  If they match, you're talking to the real person. Protects against SIM swaps, deepfakes, and impersonation.

---

> **⚠️ AI-Generated Code Disclosure**
>
> All code in this project was generated using AI assistance. While human-directed, the implementation has not been professionally audited. **You should review the code before using it** and consider hosting your own instance. See [AI_DISCLOSURE.md](./AI_DISCLOSURE.md) for full transparency about development and recommendations.

---

## Documentation

This project includes comprehensive documentation for different audiences:

**Getting Started**:
- **[README.md](./README.md)** (this file) - Complete user guide, setup instructions, FAQ
- **[EXAMPLE_SCENARIO.md](./EXAMPLE_SCENARIO.md)** - Real conversation showing initial setup and test verification call

**Technical Details**:
- **[EXECUTIVE_SUMMARY.md](./EXECUTIVE_SUMMARY.md)** - One-page technical overview (threat model, architecture, cryptography)

**Transparency**:
- **[AI_DISCLOSURE.md](./AI_DISCLOSURE.md)** - Full transparency about AI-generated code and recommendations
- **[LICENSE](./LICENSE)** - AGPL v3 license terms and rationale

**Deployment**:
- **[DEPLOY.md](./DEPLOY.md)** - Deployment guide for all platforms (GitHub Pages, Netlify, Vercel, Podman, etc.)
- **[CONTAINER.md](./CONTAINER.md)** - Podman container deployment details and troubleshooting

---

## Overview

Reality Check is a stateless Progressive Web App that acts as a **cryptographic ceremony broker** for one-time key exchanges. It generates ephemeral cryptographic keys that two parties exchange to derive a shared TOTP secret, which they then store in their authenticator apps (Authy, Google Authenticator, etc.) for ongoing verification.

### Key Features

- **🔐 Ephemeral Keys**: All keys exist only in memory while the page is open
- **🚫 No Data Storage**: Completely stateless - no localStorage, no encryption, no databases
- **🤝 Pure P2P**: Direct key exchange via QR codes (no servers, no intermediaries)
- **📱 Standard TOTP**: Works with any RFC 6238-compliant authenticator app
- **⏱️ 90-Second Window**: Comfortable margin for real-time human verification
- **🔒 Strong Crypto**: P-256 ECDH + HKDF-SHA256 (Web Crypto API)
- **✈️ Offline Capable**: PWA with service worker - works completely offline
- **🌐 Cross-Platform**: iOS, Android, desktop - single codebase

### What This Is

- ✅ A one-time key exchange tool for creating shared TOTP secrets
- ✅ A verification layer for voice calls, video chats, and live messaging
- ✅ Protection against impersonation, SIM swaps, and deepfakes

### What This Isn't

- ❌ A messaging app (use Signal, WhatsApp, etc.)
- ❌ A contact manager (no storage, no contact lists)
- ❌ An authenticator app (use Authy, Google Authenticator, etc.)
- ❌ A replacement for end-to-end encryption (complementary to, not instead of)

---

## What Reality Check Is NOT

Reality Check is **not** a general-purpose authentication system. Here's what it cannot do:

### ❌ Cannot Verify Strangers
- No "instant verification" of unknown callers
- Both parties must pre-exchange keys in person or video
- Requires pre-established trust relationship

### ❌ Cannot Scale to One-to-Many
- Not suitable for customer service (1 representative, many customers)
- Not suitable for IT departments (1 technician, hundreds of employees)
- Each relationship requires individual key exchange
- 10 people = 45 pairwise key exchanges needed

### ❌ Cannot Stop Random Scam Calls
- Only verifies people you've already set up with
- Cannot verify banks, government agencies, or businesses (unless you personally set it up with a specific representative)
- Cannot replace caller ID or other first-line defenses

### ❌ Not a Replacement for 2FA
- This is for human-to-human verification only
- Cannot authenticate you to websites or services
- Works alongside (not instead of) traditional 2FA

### ✅ What It IS Good For
- Verifying a trusted contact during remote communication
- Protecting against impersonation of people you already know
- Adding cryptographic certainty to voice/text conversations with specific individuals
- Small teams where everyone has met in person

---

## How It Works

### Cryptographic Flow

```
┌─────────────────────────────────────────────────────────────┐
│  1. Key Generation (P-256 ECDH)                             │
│     Each user generates ephemeral keypair in browser        │
│     Keys exist only in memory (never saved)                 │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│  2. Key Exchange (QR Codes)                                 │
│     Aisha shows QR → Raj scans                              │
│     Raj shows QR → Aisha scans                              │
│     (In person or via video call)                           │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│  3. Shared Secret (ECDH)                                    │
│     ECDH(Aisha's private, Raj's public) =                   │
│     ECDH(Raj's private, Aisha's public)                     │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│  4. TOTP Secret Derivation (HKDF-SHA256)                    │
│     HKDF(shared_secret, sorted_public_keys) → Base32        │
│     Deterministic: both parties derive identical secret     │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│  5. Add to Authenticator App                                │
│     Both users add TOTP secret to Authy/Google Auth/etc.    │
│     Close Reality Check → ephemeral keys discarded          │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│  6. Ongoing Verification (90-second window)                 │
│     During calls/chats: compare 6-digit codes               │
│     Match = verified identity ✓                             │
└─────────────────────────────────────────────────────────────┘
```

### Why 90 Seconds?

Unlike traditional TOTP (30 seconds), Reality Check uses a **90-second window** because:

- ✅ No automated endpoint to attack (human-in-the-loop verification)
- ✅ Comfortable margin for SMS, Slack, email exchanges
- ✅ Accounts for typing, network delays, and the inherently slower pace of human communication
- ✅ Still secure - no replay endpoint, both parties actively engaged

**It's synchronous, just with human latency.** Both parties must be present in real-time; codes from different time windows won't match.

---

## Quick Start

> **📝 Before You Start**: This code was AI-generated. We recommend reviewing the source (especially `crypto.js`) before using. See [AI_DISCLOSURE.md](./AI_DISCLOSURE.md).

### 1. Open the App

**Option A: Use the hosted version**

[https://eldeboero.github.io/reality-check/](https://eldeboero.github.io/reality-check/)


**Option B: Run locally (recommended for least trust)**
```bash
# Clone the repo
git clone https://github.com/eldeboero/reality-check.git
cd reality-check

# Review the code first
cat crypto.js   # Cryptographic implementation
cat app.js      # Application logic

# Serve with Python
python3 -m http.server 8080

# Open http://localhost:8080
```

### 2. Exchange Keys (One Time Per Contact)

**Meet in person or start a video call**, then:

1. **Aisha**: Click "🔑 Show My Key" → displays QR code
2. **Raj**: Click "📷 Scan Their Key" → scan Aisha's QR
3. **Raj**: Click "🔑 Show My Key" → displays QR code
4. **Aisha**: Click "📷 Scan Their Key" → scan Raj's QR

### 3. Add TOTP to Authenticator App

After scanning:

1. Click "📋 Copy Secret"
2. Open your authenticator app (Authy, Google Authenticator, etc.)
3. Add account manually
4. Name it: "RealityCheck: Aisha" (or whatever you prefer)
5. Paste the secret
6. Done! Close Reality Check (keys are automatically discarded)

### 4. Verify Anytime

During future phone calls, video chats, or live messages:

1. Both open authenticator apps
2. Find "RealityCheck: [Contact Name]"
3. Compare 6-digit codes
4. **Match = verified identity** ✅

---

## Deployment Options

### GitHub Pages (Recommended)

1. Fork this repository
2. Go to Settings → Pages
3. Deploy from `main` branch
4. Access at `https://yourusername.github.io/reality-check/`

### Self-Hosting

**Using the Podman container:**
```bash
# Build and run
./container.sh rebuild

# Access at http://localhost:8080
```

**Using Python:**
```bash
python3 -m http.server 8080
```

**Other static hosts:**
- Netlify (drag & drop)
- Vercel (connect Git repo)
- Cloudflare Pages
- Any static web server

**Important**: PWA features require HTTPS in production (localhost is exempt for development).

---

## Usage Guide

### Setting Up a New Contact

#### Step 1: Initial Key Exchange (In Person or Video)

**Why in person or video?**
This bootstraps trust. If someone intercepts your *first* exchange, they can impersonate you forever. Do it on a video call where you can see each other's faces, or in person.

**The Process:**

1. Both people open Reality Check
2. **Person A**: "Show My Key" → displays QR code
3. **Person B**: "Scan Their Key" → scans A's QR code
4. **Person B** sees: "✅ TOTP Secret Generated"
5. **Person B**: "Copy Secret" → adds to authenticator app
6. **Reverse**: Person B shows key, Person A scans
7. Both have now added the shared secret to their authenticator apps

**Both parties must complete the exchange!** Otherwise codes won't match.

#### Step 2: Name the Entry

In your authenticator app, label it clearly:
- ✅ "RealityCheck: Mom"
- ✅ "RC: Raj (Work)"
- ✅ "Verify: Aisha"

#### Step 3: Test It

Do a quick test:
1. Both open authenticator apps
2. Find the entry
3. Confirm you see the same 6-digit code
4. If they match, you're set! ✅

### Verifying During Communications

#### Phone Call Verification

```
Aisha: "Hey Raj, can you verify?"
Raj:   "Sure, let me check... my first three: 742"
Aisha: "And my last three: 891"
Raj:   "Perfect, that matches. Confirmed."
```

**Best practice**: Split the code (first 3 / last 3 digits). Each person recites half, making it conversational and easier to verify.

#### Text/Slack/Email Verification

```
Aisha: "Hey Raj - let's verify. My first three: 294"
(Raj checks authenticator app)
Raj: "Perfect. My last three: 817"
(Aisha verifies the full code: 294817)
Aisha: "Confirmed, that matches."
```

**Note**: You have 90 seconds, so this works fine for async channels. The split pattern (3+3) makes it conversational even over text.

#### Video Call Verification

Show each other your authenticator app screens (just the 6-digit code, not the whole screen).

### When Codes Don't Match

**🚨 If codes don't match:**

1. ❌ **Stop the conversation immediately**
2. 🔍 Check if either of you have the wrong time on your devices (sync with network time)
3. 🔍 Verify you're both using the correct contact entry in your authenticator apps
4. 🔄 If problem persists, **re-exchange keys** (meet in person or video call)

**Possible causes:**
- Device time is wrong (most common)
- Wrong entry in authenticator app
- Someone is impersonating one of you (serious)
- You didn't complete the initial exchange properly

---

## Security

### What This Protects Against

✅ **SIM Swap Attacks**: Attacker gets your phone number but can't generate matching codes
✅ **Voice Deepfakes**: AI clone of your voice won't have correct verification codes
✅ **Email/Text Impersonation**: Someone spoofing your contact info
✅ **Man-in-the-Middle**: If keys were intercepted, codes won't match

### What This Doesn't Protect Against

❌ **Compromised Initial Exchange**: If your first key exchange was intercepted, attacker has your shared secret
❌ **Stolen Authenticator App**: If attacker has your unlocked phone with authenticator app
❌ **Coercion**: Someone forcing you to verify them as someone else
❌ **Side-Channel Attacks**: Don't share your screen while showing codes

### Trust Model

**Trust Bootstrapping**: The first key exchange must happen on a trusted channel (in person or video where you can see faces).

**Ongoing Trust**: Once the shared secret is established, verification works over any channel (even unencrypted phone calls or plain SMS).

**No PKI, No CA, No Servers**: This is pure peer-to-peer trust. You trust who you exchange keys with, period.

### Best Practices

1. **🎥 First Exchange Via Video**: See each other's faces when exchanging keys
2. **🔢 Test Immediately**: Verify codes match right after setup
3. **📱 Lock Your Phone**: Protect your authenticator app with a strong PIN/biometric
4. **🔄 Verify Regularly**: Make it a habit on important calls
5. **⏰ Sync Device Time**: Ensure both devices use network time
6. **🚫 Don't Share Screens**: Keep TOTP codes private during verification
7. **👥 One Contact at a Time**: Don't try to verify multiple people simultaneously

---

## Technical Details

### Cryptographic Primitives

| Operation | Algorithm | Details |
|-----------|-----------|---------|
| **Key Generation** | P-256 (secp256r1) | NIST curve, universal browser support |
| **Key Exchange** | ECDH | Elliptic Curve Diffie-Hellman |
| **Key Derivation** | HKDF-SHA256 | 160 bits (20 bytes) for TOTP |
| **TOTP** | RFC 6238 | 90-second window, 6-digit codes |
| **Fingerprints** | SHA-256 | First 16 hex chars for verbal verification |

### Why P-256 Instead of X25519?

P-256 was chosen for **universal browser compatibility**, especially iOS/Safari. X25519 is faster and more modern, but not supported on all mobile browsers as of 2025.

### Architecture

**Stateless Design:**
- No `localStorage` usage
- No data persistence
- No encryption layer (nothing to encrypt)
- Keys exist only in JavaScript memory during page session

**Single Screen:**
- Two buttons: "Show My Key" and "Scan Their Key"
- Dynamic content area for QR codes, scanner, and results
- No navigation, no tabs, no complex UI

**Dependencies:**
- `jsQR` (QR code scanning from camera)
- `QRCode.js` (QR code generation)
- Web Crypto API (all cryptographic operations)
- getUserMedia (camera access)

### Browser Compatibility

**Minimum versions:**
- Chrome/Edge 90+
- Firefox 90+
- Safari 14+ (iOS 14+)
- Android Browser 90+

**Required APIs:**
- Web Crypto API (P-256 support)
- getUserMedia (camera access)
- Service Workers (for PWA)

---

## File Structure

```
reality-check/
├── index.html                   # Single-page HTML structure
├── styles.css                   # Application styling (~700 lines)
├── app.js                       # UI controller (~361 lines, stateless)
├── crypto.js                    # Pure crypto functions (~310 lines)
├── manifest.json                # PWA manifest
├── service-worker.js            # Offline caching
├── icon-192.png                 # PWA icon (192x192)
├── icon-512.png                 # PWA icon (512x512)
├── LICENSE                      # AGPL v3
├── README.md                    # This file (start here!)
├── EXECUTIVE_SUMMARY.md         # One-page technical overview
├── AI_DISCLOSURE.md             # Transparency about AI-generated code
├── DEPLOY.md                    # Deployment guide (all platforms)
├── CONTAINER.md                 # Podman deployment details
├── EXAMPLE_SCENARIO.md          # Setup and verification conversation example
├── Containerfile                # Podman container image definition
└── container.sh                 # Container management script
```

---

## FAQ

### General Usage

**Q: Do I need to keep Reality Check open after setup?**
A: No! Once you've added the TOTP secret to your authenticator app, you can close Reality Check. All keys are discarded.

**Q: How many contacts can I set up?**
A: Unlimited. Each contact gets their own entry in your authenticator app.

**Q: Can I verify multiple people at once?**
A: No. Verification is pairwise (Aisha↔Raj, Aisha↔Jordan, Raj↔Jordan).

**Q: What if I switch to a new phone?**
A: You'll need to:
1. Restore your authenticator app backup (most apps support cloud backup)
2. OR re-exchange keys with all your contacts

**Q: Do I need internet for verification?**
A: No. Once keys are exchanged, verification works completely offline.

**Q: Can I use this for initial contact with strangers?**
A: No. This assumes you already know the person. It's for ongoing verification, not initial identity establishment.

### Security

**Q: What if someone steals my phone?**
A: They could see your verification codes. Use a strong lock screen PIN/biometric. Consider this similar to someone stealing your physical ID.

**Q: Can quantum computers break this?**
A: Eventually, yes (P-256 is vulnerable to Shor's algorithm). But so is almost everything else. Post-quantum migration would require browser API updates.

**Q: Why not just use Signal safety numbers?**
A: Reality Check works *outside* of Signal - for phone calls, SMS, email, Slack, etc. It's complementary.

**Q: Is this better than end-to-end encryption?**
A: No, it's different. E2EE protects *content*; Reality Check verifies *identity*. Use both.

### Technical

**Q: Why 90 seconds instead of 30?**
A: Traditional TOTP uses 30s to protect automated server endpoints. Reality Check has no server to attack—codes are compared human-to-human. 90 seconds provides comfortable margin for real-time verification (SMS/Slack typing delays, network latency) without meaningful security trade-off.

**Q: Can I change the TOTP window?**
A: Yes, but you'd need to modify `crypto.js:13` and ensure your authenticator app supports custom periods.

**Q: Where are keys stored?**
A: Nowhere. They exist only in JavaScript memory while the page is open.

**Q: Can I audit the code?**
A: Yes! It's open source (AGPL v3). See [GitHub](https://github.com/eldeboero/reality-check).

**Q: Why P-256 instead of Ed25519/X25519?**
A: iOS Safari compatibility. P-256 is universally supported.

---

## Troubleshooting

### "Cannot access camera"

- Grant camera permissions in browser settings
- Ensure you're using HTTPS (or localhost)
- Try a different browser
- Check if another app is using the camera

### TOTP codes don't match

1. **Check device time**: Settings → Date & Time → Set Automatically
2. **Verify correct entry**: Ensure you're using the right contact in your authenticator app
3. **Wait for next code**: Current code might be expiring soon, wait for refresh
4. **Re-exchange keys**: If problem persists, do the key exchange again

### QR code won't scan

- Ensure good lighting
- Hold phone steady
- Try zooming in/out
- Use manual key entry instead (reveal secret text)
- Check if QR code is from Reality Check (should start with `REALITYCHECK:v1:`)

### PWA won't install

- Ensure using HTTPS
- Try visiting the site multiple times (some browsers require this)
- Check that `manifest.json` is accessible
- Try a different browser

### Service worker cache issues

- Click "🔄 Clear Cache" button in the app
- Or manually: DevTools → Application → Clear Storage

---

## Privacy

**This application:**

- ✅ Stores **nothing** - completely stateless
- ✅ Transmits **nothing** to servers (except CDN for jsQR/QRCode.js libraries)
- ✅ Has **no analytics**, no tracking, no telemetry
- ✅ Has **no accounts**, no authentication, no user database
- ✅ Is **100% open source** (AGPL v3)

**Your privacy is protected by design.** There's nothing to leak because nothing is stored.

---

## License

**GNU Affero General Public License v3.0 (AGPL-3.0)**

This project is licensed under AGPL v3, which means:

- ✅ **Free and open source** - anyone can use, modify, distribute
- ✅ **Strong copyleft** - modifications must be shared under same license
- ✅ **Network provision** - even running as a web service requires source disclosure
- ❌ **Cannot be proprietary** - can't be included in closed-source products

**Why AGPL?**

This license was deliberately chosen to:
- Protect the privacy-first mission
- Prevent commercial entities from building closed-source services around it
- Ensure any improvements benefit the community
- Maintain transparency and auditability of cryptographic implementation

See [LICENSE](./LICENSE) for full terms.

---

## Contributing

This project welcomes contributions:

- 🐛 **Bug reports**: Open an issue on GitHub
- 🔐 **Security audits**: Please report vulnerabilities responsibly
- 💡 **Feature suggestions**: Open an issue to discuss
- 🔧 **Code improvements**: Submit pull requests

**Important**: All code in this project was AI-generated. Review is especially encouraged! See [AI_DISCLOSURE.md](./AI_DISCLOSURE.md) for details.

**Security vulnerabilities**: Please report privately to the maintainer before public disclosure.

---

## Related Projects

- **Signal**: End-to-end encrypted messaging with safety numbers
- **Authy / Google Authenticator**: TOTP authenticator apps
- **Keybase**: Identity verification with cryptographic proofs
- **WireGuard**: VPN with noise protocol

---

## Support

**For issues:**
1. Check the [Troubleshooting](#troubleshooting) section
2. Review the [FAQ](#faq)
3. Ensure browser compatibility
4. Open an issue on [GitHub](https://github.com/eldeboero/reality-check/issues)

**This is a self-hosted, privacy-focused tool.** No support hotline, but the design is simple enough to troubleshoot independently.

---

## Acknowledgments

Built with:
- [Web Crypto API](https://developer.mozilla.org/en-US/docs/Web/API/Web_Crypto_API)
- [jsQR](https://github.com/cozmo/jsQR) by Cosmo Wolfe
- [QRCode.js](https://davidshimjs.github.io/qrcodejs/) by Sangmin Shim

Inspired by the need for lightweight, zero-trust identity verification in an era of deepfakes and SIM swaps.

---

**Stay safe. Verify often. Trust cryptography, not voices.**
