# Legal Disclaimer

## No Warranty

DISCLAIMER: This software is provided "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, including but not limited to the warranties of merchantability, fitness for a particular purpose, and noninfringement. In no event shall the authors or copyright holders be liable for any claim, damages, or other liability, whether in an action of contract, tort, or otherwise, arising from, out of, or in connection with the software or the use or other dealings in the software.

## User Responsibilities

This cryptographic tool is intended for identity verification between parties who already know each other. Users are solely responsible for:

- **Auditing the source code before use** - Do not trust; verify
- **Understanding the cryptographic implementation** - Know what you're running
- **Securing their TOTP secrets in authenticator apps** - Back up your authenticator app
- **Verifying the authenticity of the code** - We recommend forking and self-hosting

## Recommendations

For maximum security and trust:

1. **Fork this repository** - Don't trust third-party hosts (including the original)
2. **Audit the code** - Review all cryptographic operations in `crypto.js`
3. **Self-host** - Deploy on your own infrastructure (GitHub Pages, your own server, etc.)
4. **Keep it simple** - The lack of build process means "view source" shows actual running code

## License

This project is licensed under the **GNU Affero General Public License v3.0 (AGPL v3)**.

See the `LICENSE` file for complete terms.

Key points:
- Free and open source
- Strong copyleft - modifications must be shared under same license
- Network provision - Even running as a service requires source disclosure
- Cannot be included in proprietary/commercial products

---

**By using this software, you acknowledge that you have read, understood, and agree to these terms.**
