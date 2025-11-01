# AI Disclosure

## Full Transparency About This Project

**Reality Check** was created through a collaboration between human direction and AI assistance. This disclosure provides complete transparency about how this project was built.

---

## What Was Human-Generated

✅ **Core Concept**: The idea of using shared TOTP codes for identity verification
✅ **Architecture Decisions**: Stateless design, ephemeral keys, P-256 choice, standard 30-second TOTP period
✅ **Design Philosophy**: Privacy-first, zero-trust, no intermediaries
✅ **Security Model**: Threat model, trust bootstrapping approach
✅ **User Experience**: Workflow, interaction patterns

---

## What Was AI-Generated

🤖 **All Code**: 100% of the code (HTML, CSS, JavaScript) was written by AI (Claude Code)
🤖 **Documentation**: README.md, technical documentation, inline comments
🤖 **Implementation Details**: Cryptographic implementation, UI rendering, QR handling
🤖 **Service Worker**: PWA offline functionality
🤖 **Container Setup**: Podman deployment configuration

---

## Why This Matters

### Code Review is Essential

Since all code was AI-generated, **you should review it before trusting it with your security**. While AI can write syntactically correct code that follows best practices, it can also introduce subtle bugs or security issues.

**We strongly encourage:**
- 🔍 **Review the source code** - It's intentionally kept simple (~1,400 lines total)
- 🛠️ **Improve it** - Found an issue? Submit a PR or fork and fix
- 🔐 **Audit the crypto** - Check `crypto.js` (310 lines) for cryptographic correctness
- 🧪 **Test thoroughly** - Verify behavior matches documentation

### Self-Hosting is Recommended

Even though this app stores no data, you should consider:

1. **Fork and host your own instance** - Don't trust random deployments
2. **Review the code first** - Understand what you're running
3. **Build from source** - Ensure no modifications were made
4. **Control your deployment** - GitHub Pages, your own server, or local container

**How to self-host:**
```bash
# Fork the repo on GitHub, then:
git clone https://github.com/YOURUSERNAME/reality-check.git
cd reality-check

# Review the code
cat crypto.js   # Review cryptographic implementation
cat app.js      # Review application logic

# Run locally
python3 -m http.server 8080

# Or build container
./container.sh rebuild
```

### No Data = Minimal Trust Required

**However**, because Reality Check is stateless:
- ❌ No keys are stored
- ❌ No logs are kept
- ❌ No data is transmitted
- ❌ No user accounts exist

**The only trust required is during the page load:**
- You trust the code running in your browser
- You can audit that code by viewing source
- Keys exist only in memory during your session
- Close the tab = everything is discarded

---

## AGPL License Compliance

This project is licensed under **AGPL v3**, which means:

### You Are Free To:

✅ **Use it** - Run your own instance for personal or organizational use
✅ **Modify it** - Change anything you want
✅ **Distribute it** - Share your version with others
✅ **Host it as a service** - Run it for others to use

### You Must:

⚠️ **Share your modifications** - If you modify and deploy, you must make source available
⚠️ **Use the same license** - Your version must also be AGPL v3
⚠️ **Disclose source for network services** - Even if you just host it, users must be able to get the source
⚠️ **Preserve copyright notices** - Don't remove attribution

### You Cannot:

❌ **Make it proprietary** - Can't close-source it or integrate into proprietary products
❌ **Remove the license** - AGPL stays with any derivative work

**See [LICENSE](./LICENSE) for full legal terms.**

---

## Recommendations for Users

### Before Using Reality Check:

1. **🔍 Review the code** - Start with `crypto.js` and `app.js`
2. **📖 Read the documentation** - Understand how it works and what it protects against
3. **🔨 Fork and host your own** - Don't rely on third-party deployments
4. **🧪 Test with a trusted contact** - Verify the key exchange works as documented
5. **🔐 Understand the limitations** - Know what it does and doesn't protect against

### If You Find Issues:

- **Security vulnerabilities**: Report privately to the maintainer first
- **Bugs**: Open an issue on GitHub
- **Improvements**: Submit a pull request
- **Questions**: Check FAQ, then open a discussion

---

## Why AI-Generated Code?

**Advantages:**
- ✅ Rapid prototyping and iteration
- ✅ Consistent code style and documentation
- ✅ Good adherence to best practices (when properly directed)
- ✅ Comprehensive documentation generation

**Risks:**
- ⚠️ Potential for subtle bugs or logic errors
- ⚠️ May not catch edge cases a human would
- ⚠️ Could implement insecure patterns if not carefully reviewed
- ⚠️ Requires human oversight for security-critical code

**Our Approach:**
- Human provided architecture, security model, and crypto decisions
- AI implemented according to those specifications
- Code is intentionally simple to facilitate review
- Community is encouraged to audit and improve

---

## Commitment to Transparency

This disclosure will be maintained for the life of the project. Any changes to the development process will be documented here.

**Last Updated**: 2025-10-26

---

## Questions?

If you have questions about this disclosure or the development process:
- Open an issue on [GitHub](https://github.com/eldeboero/reality-check/issues)
- Review the code directly - it's all open source
- Check the [FAQ in README.md](./README.md#faq)

---

**Trust, but verify. Review the code. Host your own instance.**
