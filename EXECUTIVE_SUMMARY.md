# Reality Check - Executive Summary

**Version**: 2.0 (Stateless Architecture)
**Last Updated**: October 2025
**License**: AGPL v3

---

## Overview

Reality Check is a privacy-focused Progressive Web App that enables identity verification during remote communications through shared TOTP codes. It acts as a **cryptographic ceremony broker** for one-time key exchanges, allowing two parties who already know each other to establish a shared secret for ongoing authentication without relying on centralized infrastructure.

**Key Principle**: Generate ephemeral keys once, derive a shared TOTP secret, then discard all cryptographic material. The TOTP secret persists only in users' existing authenticator apps.

---

## Problem Statement

### The Threat Landscape

Modern communication faces identity threats that traditional methods cannot address:

- **SIM Swap Attacks**: Attacker gains control of phone number, impersonates victim
- **Voice Deepfakes**: AI-generated voice clones convincingly mimic real people
- **Account Compromise**: Email/messaging accounts hacked, used for impersonation
- **Social Engineering**: Attackers exploit trust in familiar communication channels

### Existing Solutions Are Inadequate

- **Caller ID**: Trivially spoofed
- **Email headers**: Easily forged
- **Voice recognition**: Defeated by deepfakes
- **"Security questions"**: Vulnerable to research/social engineering
- **Signal/WhatsApp safety numbers**: Tied to specific messaging app, require manual verification per message thread

### The Gap

What's missing is a **lightweight, app-agnostic, human-verifiable authentication layer** that works across any communication channel (calls, SMS, email, Slack, etc.) without requiring complex infrastructure or trusting third parties.

---

## Solution Architecture

### Design Philosophy

**Stateless & Ephemeral**
- No data persistence (no localStorage, no databases, no files)
- Cryptographic keys exist only in JavaScript memory during active session
- Close the browser → all keys immediately discarded
- Zero attack surface for stored data compromise

**Ceremony Broker Model**
- Reality Check facilitates a one-time cryptographic key exchange
- The resulting TOTP secret is the only persistent artifact
- Users store the secret in existing authenticator apps (Authy, Google Authenticator, etc.)
- Reality Check itself becomes disposable after the exchange

**Privacy-First**
- No user accounts, no authentication, no tracking
- No telemetry, no analytics, no external data transmission (except CDN libraries)
- No network communication after initial page load
- Fully functional offline (PWA with service worker)

### Cryptographic Flow

```
┌─────────────────────────────────────────────────────────────────┐
│ 1. Ephemeral Key Generation                                     │
│    • Each party generates P-256 ECDH keypair in browser         │
│    • Keys exist only in memory (never saved)                    │
│    • Web Crypto API (crypto.subtle)                             │
└─────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│ 2. Key Exchange (Trust Bootstrap)                               │
│    • Alice and Bob meet in person or on trusted video call      │
│    • Exchange public keys via QR codes (bidirectional)          │
│    • QR format: REALITYCHECK:v1:<base64_public_key>             │
└─────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│ 3. Shared Secret Derivation (ECDH)                              │
│    • ECDH(Alice_private, Bob_public) = Shared_Secret            │
│    • ECDH(Bob_private, Alice_public) = Same_Shared_Secret       │
│    • Elliptic Curve Diffie-Hellman on P-256 curve              │
└─────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│ 4. TOTP Secret Derivation (HKDF)                                │
│    • Sort public keys alphabetically (determinism)              │
│    • Context: "TOTP:<sorted_key1>:<sorted_key2>"                │
│    • HKDF-SHA256(shared_secret, context) → 160 bits             │
│    • Base32 encode → RFC 6238 TOTP secret                       │
└─────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│ 5. Store in Authenticator App                                   │
│    • Both parties add secret to Authy/Google Auth/1Password     │
│    • Label: "RealityCheck: [Contact Name]"                      │
│    • 90-second TOTP window (customizable, see rationale below)  │
│    • Close Reality Check → ephemeral keys discarded             │
└─────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│ 6. Ongoing Verification (Any Communication Channel)             │
│    • During call/message: both check authenticator app          │
│    • Compare 6-digit codes                                      │
│    • Match = verified identity                                  │
│    • No match = potential impersonation                         │
└─────────────────────────────────────────────────────────────────┘
```

### Technology Stack

| Layer | Technology | Rationale |
|-------|------------|-----------|
| **Frontend** | Vanilla JavaScript | No build tools, "view source" transparency |
| **Crypto** | Web Crypto API | Browser-native, hardware-accelerated |
| **Key Exchange** | P-256 ECDH | Universal browser support (iOS/Safari compatible) |
| **Key Derivation** | HKDF-SHA256 | RFC 5869 standard, deterministic |
| **TOTP** | RFC 6238 | Standard protocol, 90s window |
| **QR Codes** | jsQR (scan) + QRCode.js (generate) | Widely-used, well-tested libraries |
| **PWA** | Service Worker | Offline capability, installable |
| **Deployment** | Static hosting | No backend, no server-side logic |

### Why P-256 Instead of X25519?

**Decision**: P-256 (NIST secp256r1) over X25519 (Curve25519)

**Reasoning**:
- **Browser compatibility**: P-256 universally supported (Chrome, Firefox, Safari, iOS)
- **X25519 limitations**: Not supported in Safari/iOS as of 2025
- **Security**: Both are strong; P-256 is NIST-approved, X25519 is modern/faster
- **Trade-off**: Chose compatibility over marginal performance gains

**Future**: Migrate to X25519 when browser support matures.

---

## Why Use Existing Authenticator Apps?

### Strategic Decision

Rather than building yet another TOTP app, Reality Check leverages existing, battle-tested authenticator infrastructure.

### Rationale

**1. User Trust & Familiarity**
- Users already trust their authenticator apps (Authy, Google Authenticator, 1Password)
- No learning curve for TOTP mechanics
- Leverage existing backup/sync mechanisms (Authy cloud backup, 1Password vaults)

**2. Separation of Concerns**
- Reality Check: Key exchange ceremony (one-time use)
- Authenticator app: TOTP secret storage and code generation (ongoing use)
- Clean architectural boundary

**3. Platform Ubiquity**
- Authenticator apps exist on all platforms (iOS, Android, desktop, browser extensions)
- Multi-device sync handled by authenticator app (not our problem)
- Works across device upgrades, migrations

**4. Reduced Attack Surface**
- We don't store secrets → we can't leak them
- Authenticator apps are hardened for secret storage (OS keychains, biometric locks)
- Users already protect authenticator apps (device PIN, biometrics)

**5. Interoperability**
- Standard RFC 6238 TOTP secrets work in any compliant app
- Users can switch authenticator apps freely
- No vendor lock-in

**6. Simplicity**
- ~1,400 lines of code total (vs. thousands for full authenticator app)
- Easier to audit, easier to trust
- Focus on one thing: secure key exchange

---

## Threat Model

### What Reality Check Protects Against

| Threat | Protection Mechanism |
|--------|---------------------|
| **SIM Swap Attack** | TOTP codes independent of phone number; attacker can't generate valid codes |
| **Voice Deepfake** | AI clone can't derive cryptographic secrets; codes won't match |
| **Email Account Compromise** | Verification works over any channel; compromised email can't forge codes |
| **Man-in-the-Middle (Remote)** | Initial key exchange on trusted channel; MitM can't derive shared secret |
| **Impersonation (General)** | Shared secret known only to original parties; impersonator can't generate matching codes |

### What Reality Check Does NOT Protect Against

| Threat | Why Not Protected | Mitigation |
|--------|------------------|------------|
| **Compromised Initial Exchange** | If first key exchange intercepted, attacker has shared secret forever | Bootstrap trust via in-person meeting or video call with visual confirmation |
| **Stolen Authenticator App** | Attacker with unlocked phone has TOTP codes | Lock device with strong PIN/biometric; use authenticator app locks |
| **Coercion** | Victim forced to verify attacker as legitimate | No technical solution; inherent human factor vulnerability |
| **Side-Channel (Screen Share)** | Accidental screen sharing exposes codes | User training: never share screen during verification |
| **Quantum Computing (Future)** | P-256 vulnerable to Shor's algorithm | Migrate to post-quantum algorithms when browser APIs available |

### Trust Model

**Trust Bootstrapping**:
- First key exchange MUST occur on a **trusted channel** (in-person or video with face verification)
- This establishes the "root of trust"
- All subsequent verifications rely on this initial exchange being authentic

**Ongoing Trust**:
- After bootstrap, verification works over **any channel** (even insecure/unencrypted)
- TOTP codes prove identity even on compromised channels
- No need to trust intermediaries, servers, or infrastructure

**No PKI, No CA, No Central Authority**:
- Pure peer-to-peer trust
- You trust who you exchange keys with, period
- No third-party attestation or verification

---

## Why 90-Second TOTP Window?

### Standard vs. Reality Check

- **Standard TOTP**: 30 seconds (protects automated server endpoints)
- **Reality Check**: 90 seconds (optimizes for human-in-the-loop verification)

### Reasoning

**Traditional TOTP Threat Model**:
- Automated server login endpoint
- Attacker can repeatedly hammer endpoint with guesses
- Short window limits replay attack window
- 30 seconds is critical

**Reality Check's Threat Model**:
- Human-to-human comparison (no automated endpoint)
- Both parties actively engaged (synchronous communication)
- Real-time or near-real-time exchange (SMS, Slack, calls)
- Humans need time to: unlock phone → open app → find entry → read code → type/speak it

**Attack Analysis**:
- **Replay attacks**: No automated endpoint to replay against
- **Brute force**: 1 million possibilities, human would notice repeated guesses
- **Within-window replay**: Requires two verification requests within 90 seconds (inherently suspicious)

**Real-World Human Timing**:
```
Alice: "What's your code?"
  ↓ (5-15s: message transit, notification)
Bob unlocks phone
  ↓ (3-5s: context switch)
Bob opens authenticator
  ↓ (5-10s: scroll, find entry)
Bob reads code: "294817"
  ↓ (5-10s: typing)
Bob: "294817"
  ↓ (5-15s: message transit)
Alice receives

Total: 28-55 seconds (best case)
```

With 30 seconds, codes frequently expire during typing. With 90 seconds, comfortable margin without meaningful security loss.

**Result**: Better UX, no practical security reduction given the threat model.

---

## Transparency & Code Disclosure

### AI-Generated Code

**Full Disclosure**: 100% of code was generated using AI assistance (Claude Code).

**Implications**:
- Human-directed architecture and design decisions
- AI-implemented according to specifications
- **No professional security audit conducted**

**User Recommendations**:
1. **Review the code** before trusting any deployment (~1,400 lines total)
2. **Audit crypto.js** (310 lines) for cryptographic correctness
3. **Fork and self-host** rather than trusting third-party instances
4. **Test key exchange** with trusted contact before relying on it

See [AI_DISCLOSURE.md](./AI_DISCLOSURE.md) for full details.

### Open Source & License

**License**: AGPL v3 (GNU Affero General Public License)

**Why AGPL**:
- **Strong copyleft**: Modifications must be shared under same license
- **Network provision**: Even running as web service requires source disclosure
- **Prevents proprietary forks**: Can't be included in closed-source products
- **Ensures transparency**: All deployments must make source available

**Compliance Requirements**:
- If you modify and deploy Reality Check, you must provide source code to users
- Preserve copyright notices and attribution
- License derivative works under AGPL v3

---

## Data Retention & Privacy

### What We Store

**Answer**: **Nothing.**

- ✅ No localStorage
- ✅ No cookies
- ✅ No IndexedDB
- ✅ No server-side storage
- ✅ No analytics
- ✅ No telemetry
- ✅ No logs (static hosting = no server logs)

### What Users Store

**Only the TOTP secret**, in their existing authenticator app:
- Backed up according to their authenticator app's policy (Authy cloud, 1Password vault, etc.)
- Protected by their device security (PIN, biometric, authenticator app lock)
- Managed entirely by user (we never see it after generation)

### Privacy Properties

| Aspect | Reality Check Approach |
|--------|----------------------|
| **User Accounts** | None |
| **Authentication** | None |
| **Data Collection** | None |
| **Third-Party Tracking** | None |
| **External Requests** | CDN libraries only (jsQR, QRCode.js) |
| **GDPR Compliance** | No personal data = no compliance burden |
| **Data Breach Risk** | No data = nothing to breach |

### Deployment Privacy

**Self-Hosting Recommended**:
- Users should fork and deploy their own instance
- GitHub Pages ideal: source code = deployed code (full transparency)
- No need to trust third-party deployments (nothing to steal anyway)

**Domain Changes**:
- Switching deployments doesn't affect users (no data to migrate)
- Users can use multiple deployments simultaneously (stateless)

---

## Use Cases

### Primary: Remote Identity Verification

**Scenario**: Two people who know each other need to verify identity during remote communication.

**Examples**:
- **Phone calls**: "Before we discuss this sensitive matter, let's verify. What's your code?"
- **SMS/iMessage**: Text-based verification when voice isn't available
- **Slack/Teams**: Verify identity in workplace messaging
- **Email**: Confirm email sender is legitimate (not compromised account)
- **Video calls**: Supplement visual confirmation with cryptographic proof

### Who Benefits

**1. Individuals in High-Risk Situations**
- Journalists communicating with sources
- Activists coordinating in hostile environments
- High-net-worth individuals (targets for fraud)
- Family members protecting against elder scams

**2. Organizations**
- IT support verifying user identity before password resets
- Finance teams confirming wire transfer requests
- Legal teams verifying document signers
- HR departments confirming employee identity remotely

**3. Paranoid Realists**
- Anyone concerned about deepfakes
- People with high-value accounts (crypto, banking)
- Individuals targeted by sophisticated social engineering
- Those who value defense-in-depth security

### What It's NOT For

- ❌ Initial identity establishment (assumes pre-existing relationship)
- ❌ Group authentication (pairwise only)
- ❌ Continuous monitoring (discrete verification events)
- ❌ Replacing end-to-end encryption (complementary, not substitute)

---

## Deployment & Operations

### Hosting Requirements

**Minimal**:
- Static file hosting (any HTTP server, CDN, or PaaS)
- HTTPS certificate (required for camera, crypto, PWA)
- No backend, no database, no server-side logic

**Recommended Platforms**:
- **GitHub Pages**: Free, automatic HTTPS, source transparency
- **Netlify/Vercel**: Fast deployment, automatic SSL
- **Podman container**: Self-hosting, local deployment
- **Traditional web servers**: Nginx, Apache, Caddy

### Operational Overhead

**None**:
- No databases to maintain
- No user accounts to manage
- No backups to take (nothing to back up)
- No compliance audits (no data collected)
- No monitoring needed (client-side only)
- No scaling concerns (static files)

### Maintenance

**Minimal**:
- Increment service worker cache version when updating files
- Monitor browser compatibility (new versions)
- Update CDN library URLs if needed (jsQR, QRCode.js)
- SSL certificate renewal (automatic with Let's Encrypt)

---

## Security Considerations

### Cryptographic Strength

- **P-256**: 128-bit security level (NIST approved)
- **ECDH**: Proven key exchange protocol
- **HKDF-SHA256**: Standard key derivation (RFC 5869)
- **TOTP**: Industry-standard (RFC 6238)
- **Web Crypto API**: Browser-native, hardware-accelerated where available

### Key Security Properties

- **Forward secrecy**: Lose device = old secrets invalid (need to re-exchange keys)
- **Replay protection**: TOTP codes change every 90 seconds
- **MitM resistance**: If initial exchange is trusted, subsequent codes verify authenticity
- **No central point of failure**: Pure P2P, no servers to compromise

### Attack Surface

**Minimal**:
- Client-side JavaScript only
- No network attack surface (except initial page load)
- No stored secrets to extract
- No authentication to bypass
- No database to SQL inject

**Risks**:
- Browser/OS compromise (affects all web crypto)
- Supply chain (CDN compromise of jsQR/QRCode.js)
- User device theft (affects authenticator app, not Reality Check specifically)

---

## Success Metrics

Given the stateless, privacy-first design, traditional metrics don't apply:

**Not Measured**:
- ❌ User registrations (no accounts)
- ❌ Active users (no tracking)
- ❌ Session duration (stateless)
- ❌ Feature usage (no telemetry)

**Success Indicators**:
- GitHub stars, forks, issues (community engagement)
- Third-party security audits (community-driven)
- Adoption by privacy-focused organizations
- Integration into security best-practices guides
- Derivative works / improvements (AGPL ecosystem)

---

## Future Considerations

### Potential Enhancements

1. **Post-Quantum Cryptography**: Migrate to quantum-resistant algorithms when browser APIs available
2. **X25519 Support**: Use faster curve when Safari/iOS support arrives
3. **Group Verification**: Extend to n-party scenarios (technical challenges)
4. **Biometric Binding**: Tie TOTP secret to device biometric (platform-specific)

### Intentional Non-Features

**These will NOT be added** (violate design principles):

- ❌ User accounts / authentication
- ❌ Cloud storage / backups
- ❌ Contact management
- ❌ Analytics / telemetry
- ❌ Built-in TOTP generation (use authenticator apps)
- ❌ Persistent state / localStorage

---

## Conclusion

Reality Check demonstrates that **robust identity verification doesn't require complex infrastructure or privacy trade-offs**. By leveraging existing authenticator apps, Web Crypto APIs, and a stateless architecture, it provides a lightweight, auditable, privacy-preserving solution to the growing problem of remote identity verification.

**Core Strengths**:
- **Simple**: 1,400 lines of vanilla JavaScript
- **Transparent**: Open source, AI-generated code disclosed
- **Private**: No data collection, no tracking, fully stateless
- **Practical**: Works with existing authenticator apps and workflows
- **Trustworthy**: Self-hostable, auditable, no third-party dependencies

**Ideal For**: Privacy-conscious individuals, organizations requiring lightweight identity verification, and anyone concerned about deepfakes, SIM swaps, or impersonation attacks in an era of sophisticated social engineering.

---

**Status**: Production-ready v2.0 (Stateless Architecture)
**Repository**: https://github.com/eldeboero/reality-check
**License**: AGPL v3
**Documentation**: [README.md](./README.md) | [AI_DISCLOSURE.md](./AI_DISCLOSURE.md) | [DEPLOY.md](./DEPLOY.md)
