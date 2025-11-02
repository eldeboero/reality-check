# Reality Check

**Protect your most important relationships from impersonation attacks**

Reality Check helps you verify your most valuable, trusted contacts when you can't be physically together. You simply generate a shared secret once (in person or video) and add it to your authenticator app.  From then on, you'll both see matching 6-digit codes for each other. While talking or messaging in real-time, compare codes (ideally each person provides 3 of the 6 digits).  If they match, you're talking to the real person. Protects against SIM swaps, deepfakes, and impersonation.

---

> **⚠️ AI-Generated Code Disclosure**
>
> All code in this project was generated using AI assistance. **You should review the code before using it** and consider hosting your own instance. See [AI_DISCLOSURE.md](./AI_DISCLOSURE.md) for full transparency about development and recommendations.

---

## Documentation

**Getting Started**:
- **[README.md](./README.md)** (this file) - User guide and FAQ
- **[EXAMPLE_SCENARIO.md](./EXAMPLE_SCENARIO.md)** - Real conversation showing setup and verification

**Deployment**:
- **[DEPLOY.md](./DEPLOY.md)** - All deployment methods (GitHub Pages, Netlify, Vercel, Podman, etc.)

**Transparency**:
- **[AI_DISCLOSURE.md](./AI_DISCLOSURE.md)** - AI-generated code disclosure and legal disclaimer
- **[LICENSE](./LICENSE)** - AGPL v3 license terms

---

## Overview

Reality Check is a stateless Progressive Web App that acts as a **cryptographic ceremony broker** for one-time key exchanges. It generates ephemeral cryptographic keys that two parties exchange to derive a shared TOTP secret, which they then store in their authenticator apps (Authy, Google Authenticator, etc.) for ongoing verification.

### Key Features

- **🔐 Ephemeral Keys**: All keys exist only in memory while the page is open
- **🚫 No Data Storage**: Completely stateless - no localStorage, no encryption, no databases
- **🤝 Pure P2P**: Direct key exchange via QR codes (no servers, no intermediaries)
- **📱 Standard TOTP**: Works with any RFC 6238-compliant authenticator app
- **⏱️ 30-Second Window**: Standard TOTP period for code generation
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

## How It Works

1. **Generate Keys**: Each person generates an ephemeral P-256 ECDH keypair in their browser
2. **Exchange Keys**: Show/scan QR codes (in person or video call)
3. **Derive Secret**: Both browsers compute the same TOTP secret using ECDH + HKDF
4. **Add to Authenticator**: Both add the secret to their authenticator app (Authy, Google Authenticator, etc.)
5. **Discard Keys**: Close Reality Check → all cryptographic material is deleted
6. **Verify Anytime**: During future calls/messages, compare 6-digit codes from authenticator apps

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

## Deployment

See **[DEPLOY.md](./DEPLOY.md)** for comprehensive deployment instructions including:
- GitHub Pages (recommended)
- Netlify, Vercel, Cloudflare Pages
- Podman container
- Traditional web servers (nginx, Apache, Caddy)

---

## Usage Guide

### Setting Up a New Contact

**Do this in person or on video** (seeing faces). If your first exchange is intercepted, the attacker can impersonate you forever.

1. Both people open Reality Check
2. Person A: "Show My Key" → displays QR code
3. Person B: "Scan Their Key" → scans A's QR code
4. Person B: Copy secret → add to authenticator app (label: "RealityCheck: [Name]")
5. Reverse: Person B shows key, Person A scans and adds to authenticator
6. Test: Compare codes to verify they match

**Both must complete the exchange** or codes won't match!

### Verifying During Communications

During calls or messages, both people open their authenticator apps and compare codes:

**Best Practice**: Split the code (first 3 / last 3 digits). Example: "My first three: 742" / "My last three: 891"

**Any Channel Works**: Phone, video, text, email, Slack. The split pattern makes it conversational.

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

1. First exchange via video (see faces) or in person
2. Test immediately after setup
3. Lock your phone and authenticator app
4. Verify regularly on important calls
5. Sync device time to network
6. Don't share screens during verification

---

## Technical Details

**Cryptography**: P-256 ECDH key exchange → HKDF-SHA256 derivation → RFC 6238 TOTP (30-second window). All operations use the browser's native Web Crypto API.

**Architecture**: Completely stateless. Keys exist only in JavaScript memory during the page session. No localStorage, no persistence, no encryption layer. Single-screen UI with QR code exchange.

**Browser Support**: Chrome/Edge/Firefox 90+, Safari/iOS 14+. Requires Web Crypto API, getUserMedia (camera), and Service Workers (PWA).

**Why P-256?** Universal browser compatibility, especially iOS/Safari. X25519 would be faster but lacks Safari support as of 2025.

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
├── README.md                    # This file (user guide & FAQ)
├── AI_DISCLOSURE.md             # Transparency & legal disclaimer
├── DEPLOY.md                    # Deployment guide (all platforms)
├── EXAMPLE_SCENARIO.md          # Setup and verification walkthrough
├── CLAUDE.md                    # Developer guide (for code contributors)
├── Containerfile                # Podman container image definition
└── container.sh                 # Container management script
```

---

## FAQ

**Q: Do I need to keep Reality Check open after setup?**
A: No. Once you've added the TOTP secret to your authenticator app, close it. All keys are discarded.

**Q: What if I switch to a new phone?**
A: Restore your authenticator app backup, or re-exchange keys with all contacts.

**Q: Do I need internet for verification?**
A: No. Verification works completely offline once keys are exchanged.

**Q: What if someone steals my phone?**
A: They could see your verification codes. Use a strong lock screen PIN/biometric.

**Q: Where are keys stored?**
A: Nowhere. They exist only in JavaScript memory while the page is open.

**Q: Why not just use Signal safety numbers?**
A: Reality Check works outside of Signal - for phone calls, SMS, email, Slack, etc. It's complementary.

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

- The app automatically checks for updates and reloads when new versions are available
- To force a reload: click the "reload" link at the bottom of the page
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

Licensed under **AGPL v3** (GNU Affero General Public License). Free and open source. Modifications must be shared under the same license, even when running as a web service. See [LICENSE](./LICENSE) for full terms.

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

**Stay safe. Verify often. Trust cryptography, not voices.**
