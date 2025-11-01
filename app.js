/**
 * Reality Check - Simplified Stateless Application
 *
 * Design: Ephemeral key exchange for TOTP secret generation
 * No persistence, no encryption, no contact storage
 * Keys exist only in memory during the session
 */

// Version should match service-worker.js CACHE_NAME
const APP_VERSION = 'v20';

class RealityCheckApp {
    constructor() {
        // Ephemeral state (memory only, never persisted)
        this.state = {
            privateKey: null,
            publicKey: null,
            publicKeyB64: null
        };

        this.qrScanner = null;
        this.init();
    }

    async init() {
        // Register service worker for offline capability
        if ('serviceWorker' in navigator) {
            try {
                const registration = await navigator.serviceWorker.register('/service-worker.js');
                console.log('Service Worker registered');

                // Check for updates on page load
                registration.update();

                // Listen for service worker updates
                registration.addEventListener('updatefound', () => {
                    const newWorker = registration.installing;

                    newWorker.addEventListener('statechange', () => {
                        if (newWorker.state === 'activated' && navigator.serviceWorker.controller) {
                            // New service worker activated, reload to get fresh content
                            console.log('New version available, reloading...');
                            this.showToast('Update available! Reloading...', 'info');
                            setTimeout(() => {
                                window.location.reload();
                            }, 1000);
                        }
                    });
                });

                // Also check for updates periodically (every 10 minutes)
                setInterval(() => {
                    registration.update();
                }, 10 * 60 * 1000);

            } catch (error) {
                console.error('Service Worker registration failed:', error);
            }
        }

        this.attachEventListeners();
        this.showWelcomeMessage();
        this.displayVersion();
    }

    displayVersion() {
        const versionElement = document.getElementById('app-version');
        if (versionElement) {
            versionElement.textContent = APP_VERSION;
        }
    }

    showWelcomeMessage() {
        const status = document.getElementById('status-area');
        status.innerHTML = '';  // Clear the status area
    }

    async ensureKeypairGenerated() {
        if (!this.state.privateKey) {
            const keypair = await RealityCrypto.generateKeypair();
            this.state.privateKey = keypair.privateKey;
            this.state.publicKey = keypair.publicKey;
            this.state.publicKeyB64 = await RealityCrypto.exportPublicKey(keypair.publicKey);
            console.log('Ephemeral keypair generated');
        }
    }

    showInstructions() {
        const status = document.getElementById('status-area');
        status.innerHTML = `
            <div class="instructions-page">
                <h2>How It Works</h2>
                <p>Reality Check verifies identities while communicating remotely. You and a contact exchange keys once (in person or video) to create a shared secret. Add it to your authenticator app, and you'll both see matching 6-digit codes. While talking or messaging in real-time, compare codes—if they match, you're talking to the real person. Protects against SIM swaps, deepfakes, and impersonation.</p>

                <p style="margin-top: 1.5rem;">
                    <a href="https://github.com/eldeboero/reality-check" target="_blank" rel="noopener noreferrer" class="documentation-link">
                        📖 Documentation
                    </a>
                </p>

                <button id="back-btn" class="btn-primary" style="margin-top: 1.5rem;">Got It</button>
            </div>
        `;

        // Back button
        document.getElementById('back-btn').addEventListener('click', () => {
            this.showWelcomeMessage();
        });
    }

    attachEventListeners() {
        // Main action buttons
        document.getElementById('show-key-btn').addEventListener('click', () => this.showMyKey());
        document.getElementById('scan-key-btn').addEventListener('click', () => this.startQrScanner());

        // Instructions link
        document.getElementById('instructions-link').addEventListener('click', (e) => {
            e.preventDefault();
            this.showInstructions();
        });

        // Reload link
        document.getElementById('reload-link').addEventListener('click', (e) => {
            e.preventDefault();
            window.location.reload();
        });
    }

    async showMyKey() {
        try {
            // Generate ephemeral keypair if not already generated
            if (!this.state.privateKey) {
                this.showToast('Generating ephemeral key...', 'info');
            }
            await this.ensureKeypairGenerated();

            // Calculate fingerprint for verification
            const fingerprint = await RealityCrypto.calculateFingerprint(this.state.publicKeyB64);

            // Display QR code and key info
            const statusArea = document.getElementById('status-area');
            statusArea.innerHTML = `
                <div class="key-display-section">
                    <h2>Your Key</h2>
                    <p>Share this QR code with someone in person:</p>
                    <div id="my-qr-code" class="qr-display"></div>
                    <div class="key-fingerprint">
                        <small>Fingerprint (for verbal verification):</small>
                        <code>${fingerprint}</code>
                    </div>
                    <div class="info-box">
                        <p><strong>Next step:</strong> Click "Scan Their Key" to scan their code.</p>
                    </div>
                </div>
            `;

            // Generate QR code
            const qrContainer = document.getElementById('my-qr-code');
            const qrData = `REALITYCHECK:v1:${this.state.publicKeyB64}`;
            new QRCode(qrContainer, {
                text: qrData,
                width: 256,
                height: 256,
                correctLevel: QRCode.CorrectLevel.M
            });

        } catch (error) {
            console.error('Error generating key:', error);
            this.showToast(`Error: ${error.message}`, 'error');
        }
    }

    async startQrScanner() {
        // Generate ephemeral keypair if not already generated
        if (!this.state.privateKey) {
            this.showToast('Generating your key...', 'info');
        }
        await this.ensureKeypairGenerated();

        const statusArea = document.getElementById('status-area');
        statusArea.innerHTML = `
            <div class="scanner-section">
                <h2>Scan Contact's Key</h2>
                <p>Point your camera at their QR code:</p>
                <video id="qr-video" class="qr-video" autoplay playsinline webkit-playsinline></video>
                <canvas id="qr-canvas" class="hidden"></canvas>
                <button id="stop-camera-btn" class="btn-secondary" style="margin-top: 1rem;">⏸ Stop Camera</button>
            </div>
        `;

        // Attach stop button listener
        document.getElementById('stop-camera-btn').addEventListener('click', () => {
            this.stopQrScanner();
            this.showWelcomeMessage();
        });

        try {
            const video = document.getElementById('qr-video');
            const stream = await navigator.mediaDevices.getUserMedia({
                video: { facingMode: 'environment' }
            });
            video.srcObject = stream;
            await video.play();

            this.qrScanner = setInterval(() => this.scanQrFrame(), 500);

        } catch (error) {
            console.error('Camera error:', error);
            this.showToast('Cannot access camera', 'error');
            this.showWelcomeMessage();
        }
    }

    stopQrScanner() {
        const video = document.getElementById('qr-video');
        if (video && video.srcObject) {
            video.srcObject.getTracks().forEach(track => track.stop());
            video.srcObject = null;
        }

        if (this.qrScanner) {
            clearInterval(this.qrScanner);
            this.qrScanner = null;
        }
    }

    async scanQrFrame() {
        const video = document.getElementById('qr-video');
        const canvas = document.getElementById('qr-canvas');

        if (!video || !canvas) return;

        const context = canvas.getContext('2d');

        if (video.readyState === video.HAVE_ENOUGH_DATA) {
            canvas.width = video.videoWidth;
            canvas.height = video.videoHeight;
            context.drawImage(video, 0, 0, canvas.width, canvas.height);

            const imageData = context.getImageData(0, 0, canvas.width, canvas.height);
            const code = jsQR(imageData.data, imageData.width, imageData.height);

            if (code) {
                await this.handleScannedQr(code.data);
            }
        }
    }

    async handleScannedQr(data) {
        this.stopQrScanner();

        try {
            // Parse QR data: REALITYCHECK:v1:base64_public_key
            if (!data.startsWith('REALITYCHECK:v1:')) {
                throw new Error('Invalid QR code format');
            }

            const parts = data.split(':');
            if (parts.length !== 3) {
                throw new Error('Invalid QR code format');
            }
            const publicKeyB64 = parts[2];

            // Validate the key
            const theirPublicKey = await RealityCrypto.importPublicKey(publicKeyB64);

            // Generate TOTP secret
            this.showToast('Generating TOTP secret...', 'info');
            const totpSecret = await RealityCrypto.generateTotpSecret(
                this.state.privateKey,
                theirPublicKey,
                this.state.publicKeyB64,
                publicKeyB64
            );

            // Display TOTP result
            await this.displayTotpResult(totpSecret);

        } catch (error) {
            console.error('Error processing QR code:', error);
            this.showToast(`Error: ${error.message}`, 'error');
            this.showWelcomeMessage();
        }
    }

    async displayTotpResult(totpSecret) {
        const statusArea = document.getElementById('status-area');

        statusArea.innerHTML = `
            <div class="totp-result-section">
                <h2>✅ TOTP Secret Generated</h2>

                <div class="totp-manual">
                    <button id="copy-totp-btn" class="btn-copy-large">📋 Copy Secret</button>

                    <div class="instructions">
                        <p><strong>Next steps:</strong></p>
                        <ol>
                            <li>Click "📋 Copy Secret" above</li>
                            <li>Open your authenticator app (Authy, Google Authenticator, etc.)</li>
                            <li>Add account manually (you can name it whatever you like)</li>
                            <li>Paste the secret when prompted</li>
                        </ol>
                    </div>

                    <div class="reveal-secret">
                        <label>
                            <input type="checkbox" id="reveal-secret-checkbox">
                            Show secret text (optional)
                        </label>
                        <div id="secret-text-container" class="hidden">
                            <textarea id="totp-secret-display" readonly>${totpSecret}</textarea>
                            <p class="help-text">You can copy this manually if needed</p>
                        </div>
                    </div>
                </div>

                <div class="info-box" style="margin-top: 2rem;">
                    <p><strong>🔒 Security Note:</strong> Once you've added this to your authenticator app, you don't need to keep this secret. All cryptographic keys are ephemeral and will be automatically discarded when you close this page.</p>
                </div>

                <button id="done-btn" class="btn-primary" style="margin-top: 1rem;">Done</button>
            </div>
        `;

        // Copy button
        document.getElementById('copy-totp-btn').addEventListener('click', () => {
            navigator.clipboard.writeText(totpSecret);
            this.showToast('✅ Copied! Now paste in your authenticator app.', 'success');
        });

        // Reveal secret checkbox
        document.getElementById('reveal-secret-checkbox').addEventListener('change', (e) => {
            const container = document.getElementById('secret-text-container');
            if (e.target.checked) {
                container.classList.remove('hidden');
            } else {
                container.classList.add('hidden');
            }
        });

        // Done button
        document.getElementById('done-btn').addEventListener('click', () => {
            this.showWelcomeMessage();
        });
    }

    showToast(message, type = 'info') {
        const container = document.getElementById('toast-container');
        const toast = document.createElement('div');
        toast.className = `toast ${type}`;
        toast.textContent = message;

        container.appendChild(toast);

        setTimeout(() => {
            toast.remove();
        }, 3000);
    }
}

// Initialize app when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    window.app = new RealityCheckApp();
});
