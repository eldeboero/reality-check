# Deployment Guide

## What You're Deploying

Reality Check is a **stateless Progressive Web App** that facilitates one-time cryptographic key exchanges. It:

- ✅ Runs entirely in the browser (no backend needed)
- ✅ Stores no data (completely stateless)
- ✅ Requires only static file hosting
- ✅ Needs HTTPS for PWA features and camera access

**Important**: Users should be encouraged to fork and self-host rather than trusting third-party deployments. See [AI_DISCLOSURE.md](./AI_DISCLOSURE.md) for transparency about code generation.

---

## Requirements

### For All Deployments

- **Static web hosting** (any service that serves HTML/CSS/JS files)
- **HTTPS certificate** (required for PWA, camera access, Web Crypto API)
  - Localhost is exempt during development
  - Most hosting services provide HTTPS automatically

### For Self-Hosting with Podman (Optional)

If deploying via container:

- **Podman** installed on your system
  - Install: `sudo dnf install podman` (Fedora/RHEL)
  - Or: `sudo apt install podman` (Debian/Ubuntu)
  - Mac/Windows: Use Podman Desktop
- **Port 8080 available** (or another port of your choice)

See [CONTAINER.md](./CONTAINER.md) for detailed container deployment instructions.

---

## Deployment Options

### Option 1: GitHub Pages (Recommended)

**Best for**: Public deployment, automatic HTTPS, free hosting, version control

#### Initial Setup

1. **Fork or create a new repository**
   ```bash
   # If you haven't already:
   cd /home/bdeboer/realityCheck
   git init
   git add .
   git commit -m "Initial commit: Reality Check PWA"
   git branch -M main
   ```

2. **Create GitHub repository**
   - Go to https://github.com/new
   - Name it `reality-check` (or any name)
   - Make it **Public** (required for GitHub Pages free tier)
   - Don't initialize with README
   - Click "Create repository"

3. **Push your code**
   ```bash
   git remote add origin https://github.com/YOUR_USERNAME/reality-check.git
   git push -u origin main
   ```

4. **Enable GitHub Pages**
   - Go to repository on GitHub
   - Click **Settings** → **Pages**
   - Under "Source", select **Deploy from a branch**
   - Branch: **main**
   - Folder: **/ (root)**
   - Click **Save**

5. **Wait 2-5 minutes** for initial deployment

6. **Access your app**
   - URL: `https://YOUR_USERNAME.github.io/reality-check/`
   - Share this URL with users

#### Updating After Changes

```bash
git add .
git commit -m "Description of changes"
git push
```

GitHub Pages redeploys automatically (1-2 minutes).

---

### Option 2: Netlify

**Best for**: Drag-and-drop simplicity, automatic deploys, preview URLs

#### Method A: Drag and Drop

1. Go to https://netlify.com
2. Sign up (free)
3. Drag your `realityCheck` folder onto the deploy zone
4. Get instant URL like `https://random-name.netlify.app`
5. Customize domain in site settings

#### Method B: Git Integration (Recommended)

1. Push code to GitHub (see above)
2. Go to Netlify → **New site from Git**
3. Connect your GitHub account
4. Select your repository
5. Build settings:
   - Build command: (leave empty)
   - Publish directory: `/` (or leave empty)
6. Click **Deploy site**

**Benefits**: Automatic deployments on every push, instant preview URLs for branches.

---

### Option 3: Vercel

**Best for**: Fast global CDN, serverless functions (if needed later), GitHub integration

1. Push code to GitHub
2. Go to https://vercel.com
3. Sign up with GitHub
4. Click **Import Project**
5. Select your `reality-check` repository
6. Framework Preset: **Other**
7. Click **Deploy**

Automatic HTTPS, instant global deployment.

---

### Option 4: Cloudflare Pages

**Best for**: Ultra-fast CDN, unlimited bandwidth, DDoS protection

1. Push code to GitHub
2. Go to https://pages.cloudflare.com
3. Sign up (free)
4. Click **Create a project**
5. Connect GitHub account
6. Select your repository
7. Build settings:
   - Build command: (none)
   - Build output directory: `/`
8. Click **Save and Deploy**

Very fast, generous free tier.

---

### Option 5: Podman Container (Self-Hosting)

**Best for**: Local deployment, private networks, development, full control

#### Quick Start with Container Script

```bash
# Build and run on port 8080
./container.sh rebuild

# Check status
./container.sh status

# View logs
./container.sh logs

# Access at http://localhost:8080
```

#### Custom Port

```bash
./container.sh rebuild 9090
# Access at http://localhost:9090
```

#### Manual Podman Commands

```bash
# Build image
podman build -t reality-check:latest .

# Run container on port 8080
podman run -d --name reality-check -p 8080:80 reality-check:latest

# Access at http://localhost:8080 or http://YOUR_IP:8080
```

**Important**: See [CONTAINER.md](./CONTAINER.md) for:
- Detailed instructions
- Troubleshooting port forwarding issues
- Alternative Python HTTP server (if Podman networking fails)

**Note**: Podman deployment on localhost doesn't require HTTPS for development, but production deployments need HTTPS.

---

### Option 6: Traditional Web Server (Self-Hosting)

**Best for**: Existing infrastructure, custom domains, corporate environments

#### Requirements

- Web server (nginx, Apache, Caddy, etc.)
- HTTPS certificate (Let's Encrypt recommended)
- Static file serving enabled

#### Nginx Configuration

```nginx
server {
    listen 443 ssl http2;
    server_name realitycheck.yourdomain.com;

    ssl_certificate /path/to/fullchain.pem;
    ssl_certificate_key /path/to/privkey.pem;

    root /var/www/reality-check;
    index index.html;

    location / {
        try_files $uri $uri/ /index.html;
    }

    # Security headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header Referrer-Policy "no-referrer" always;
    add_header Permissions-Policy "camera=(self)" always;

    # Service worker requires proper MIME type
    location ~* \.js$ {
        add_header Content-Type application/javascript;
    }
}

# Redirect HTTP to HTTPS
server {
    listen 80;
    server_name realitycheck.yourdomain.com;
    return 301 https://$server_name$request_uri;
}
```

#### Apache Configuration

```apache
<VirtualHost *:443>
    ServerName realitycheck.yourdomain.com

    DocumentRoot /var/www/reality-check

    SSLEngine on
    SSLCertificateFile /path/to/fullchain.pem
    SSLCertificateKeyFile /path/to/privkey.pem

    <Directory /var/www/reality-check>
        Options -Indexes +FollowSymLinks
        AllowOverride All
        Require all granted

        # Fallback to index.html for SPA routing
        FallbackResource /index.html
    </Directory>

    # Security headers
    Header always set X-Frame-Options "SAMEORIGIN"
    Header always set X-Content-Type-Options "nosniff"
    Header always set Referrer-Policy "no-referrer"
    Header always set Permissions-Policy "camera=(self)"
</VirtualHost>

# Redirect HTTP to HTTPS
<VirtualHost *:80>
    ServerName realitycheck.yourdomain.com
    Redirect permanent / https://realitycheck.yourdomain.com/
</VirtualHost>
```

#### Caddy Configuration (Easiest)

```caddy
realitycheck.yourdomain.com {
    root * /var/www/reality-check
    file_server

    # Automatic HTTPS with Let's Encrypt

    header {
        X-Frame-Options "SAMEORIGIN"
        X-Content-Type-Options "nosniff"
        Referrer-Policy "no-referrer"
        Permissions-Policy "camera=(self)"
    }
}
```

---

## Custom Domain

All hosting services above support custom domains:

1. **Purchase a domain** (Google Domains, Namecheap, Cloudflare, etc.)
2. **Add custom domain** in your hosting service dashboard
3. **Update DNS settings** at your domain registrar:
   - For GitHub Pages/Netlify/Vercel: Add CNAME record
   - For self-hosting: Add A record pointing to your server IP
4. **Wait for DNS propagation** (5 minutes to 48 hours)

Most services provide automatic HTTPS via Let's Encrypt for custom domains.

---

## Creating App Icons

Before deploying, create proper PWA icons:

### Method 1: Online Generator (Easiest)

1. Go to https://realfavicongenerator.net
2. Upload a 1024x1024 source image
3. Download generated icons
4. Replace `icon-192.png` and `icon-512.png` in the project

### Method 2: Manual Creation

Use any image editor (Photoshop, GIMP, Figma, Canva, etc.):

- Create **192x192 PNG**: save as `icon-192.png`
- Create **512x512 PNG**: save as `icon-512.png`

**Design suggestions**:
- Shield icon (security/protection)
- Checkmark in a circle (verification)
- Lock + checkmark (secure verification)
- Simple, recognizable at small sizes
- High contrast colors
- Solid background (no transparency issues)

---

## Testing Your Deployment

After deployment, verify these features work correctly:

### ✅ Basic Functionality

- [ ] Page loads without errors
- [ ] Can click "Show My Key" button
- [ ] QR code displays correctly
- [ ] Can click "Scan Their Key" button
- [ ] Camera permission prompt appears
- [ ] "How does this work?" link opens instructions
- [ ] "Clear Cache" button works

### ✅ Key Generation

- [ ] Clicking "Show My Key" generates QR code
- [ ] Fingerprint displays below QR code
- [ ] Can display QR multiple times (regenerates or shows same?)
- [ ] No errors in browser console

### ✅ QR Scanning

- [ ] Camera video feed displays
- [ ] Can scan QR codes from another device
- [ ] After scanning, TOTP secret displays
- [ ] "Copy Secret" button works
- [ ] Can reveal secret text checkbox works
- [ ] No errors during scan process

### ✅ PWA Features

- [ ] "Install App" prompt appears (may require multiple visits)
- [ ] Can install to home screen (mobile)
- [ ] App works offline after first load
- [ ] Service worker registers successfully
  - Check: DevTools → Application → Service Workers
- [ ] Cache is populated with app files
  - Check: DevTools → Application → Cache Storage

### ✅ Camera Access

- [ ] Camera permission prompt appears on first use
- [ ] Video feed shows camera output
- [ ] Can scan QR codes in various lighting conditions
- [ ] "Stop Camera" button stops feed
- [ ] Camera releases properly when stopping

### ✅ Stateless Behavior

- [ ] Closing browser tab discards keys (no localStorage data)
- [ ] Reopening app shows fresh start (no persisted state)
- [ ] No data survives page refresh
- [ ] Check DevTools → Application → Local Storage (should be empty)

### ✅ TOTP Secret Generation

- [ ] After scanning contact's key, TOTP secret displays
- [ ] Secret is valid Base32 format
- [ ] Can copy secret to clipboard
- [ ] Secret works in authenticator apps (Authy, Google Auth, etc.)

### ✅ Browser Compatibility

Test on multiple platforms:

**Desktop**:
- [ ] Chrome/Edge 90+
- [ ] Firefox 90+
- [ ] Safari 14+

**Mobile** (primary target):
- [ ] Chrome (Android)
- [ ] Safari (iOS 14+)
- [ ] Firefox (Android)
- [ ] Samsung Internet

**Critical mobile tests**:
- [ ] QR scanning works on both devices
- [ ] Copy button works on mobile
- [ ] Can switch between apps (to authenticator) and return
- [ ] Camera doesn't lock up after repeated use

---

## Security Checklist for Production

Before publicizing your deployment:

- [ ] **HTTPS enabled** (required for PWA/camera/crypto)
- [ ] **Valid SSL certificate** (not self-signed, not expired)
- [ ] **Security headers configured** (see nginx/Apache examples above)
- [ ] **No analytics or tracking** added (respect privacy-first design)
- [ ] **CDN dependencies verified**:
  - jsQR: https://unpkg.com/jsqr@1.4.0/dist/jsQR.js
  - QRCode.js: https://cdnjs.cloudflare.com/ajax/libs/qrcodejs/1.0.0/qrcode.min.js
- [ ] **Source code is publicly accessible** (GitHub repo visible)
- [ ] **AI_DISCLOSURE.md included** (transparency)
- [ ] **LICENSE file present** (AGPL v3 compliance)

**Transparency Recommendations**:
- Link to source code repository in the app
- Display AI disclosure warning prominently
- Encourage users to review code before use
- Recommend users fork and self-host

---

## Maintenance

### Updating the App

When you make changes:

1. Test locally first (Python HTTP server or Podman)
2. Update service worker cache version:
   ```javascript
   // In service-worker.js
   const CACHE_NAME = 'reality-check-v15'; // Increment version
   ```
3. Commit and push changes
4. Wait for automatic deployment (or rebuild container)

**Important**: Changing `CACHE_NAME` forces all clients to download fresh files on next visit.

### Updating CDN Dependencies

The app uses two external libraries:

- **jsQR**: QR code scanning
- **QRCode.js**: QR code generation

To update versions, edit `index.html` and change CDN URLs. Test thoroughly after updates.

### Monitoring

Since the app is stateless and client-side only:

- No server logs to monitor
- No user data to back up
- No database to maintain

**Check these periodically**:
- SSL certificate expiration (auto-renewed with Let's Encrypt)
- Hosting service uptime (most have status pages)
- Browser compatibility (new browser versions)
- CDN availability (unpkg.com, cdnjs.com)

---

## Troubleshooting Deployment Issues

### "PWA not installable"

**Symptoms**: No "Install App" prompt, can't add to home screen

**Solutions**:
- ✅ Verify HTTPS is enabled (required)
- ✅ Check `manifest.json` is accessible at `/manifest.json`
- ✅ Verify icons exist: `/icon-192.png` and `/icon-512.png`
- ✅ Check manifest has all required fields:
  ```json
  {
    "name": "Reality Check",
    "short_name": "Reality Check",
    "start_url": "/",
    "display": "standalone",
    "icons": [...]
  }
  ```
- ✅ Service worker must register successfully
- ✅ Some browsers require multiple visits before showing prompt

### "Camera not working"

**Symptoms**: Permission denied, black screen, no video feed

**Solutions**:
- ✅ **HTTPS required** for `getUserMedia()` (except localhost)
- ✅ Grant camera permissions in browser settings
- ✅ Check if another app is using the camera
- ✅ Try a different browser
- ✅ On iOS: Settings → Safari → Camera (must be allowed)
- ✅ Check browser console for specific errors

### "Service worker not registering"

**Symptoms**: "Service Worker registered" doesn't appear in console, offline doesn't work

**Solutions**:
- ✅ HTTPS required (except localhost)
- ✅ Check browser console for errors
- ✅ Verify `service-worker.js` is at root path
- ✅ Check MIME type is `application/javascript` or `text/javascript`
- ✅ Clear cache and hard reload (Ctrl+Shift+R or Cmd+Shift+R)
- ✅ Unregister old service workers: DevTools → Application → Service Workers → Unregister

### "QR code won't scan"

**Symptoms**: Camera works but QR codes aren't detected

**Solutions**:
- ✅ Ensure good lighting on QR code
- ✅ Hold device steady, don't move too fast
- ✅ Try adjusting distance (closer/farther)
- ✅ Verify QR code is from Reality Check (`REALITYCHECK:v1:...`)
- ✅ Try manual key entry instead (reveal secret text)
- ✅ Check if QR code is high resolution and not blurry

### "Can't load page" / "404 errors"

**Symptoms**: Page won't load, resources missing

**Solutions**:
- ✅ Check all file paths are correct (relative, not absolute)
- ✅ Verify CDN libraries are accessible:
  - Open `https://unpkg.com/jsqr@1.4.0/dist/jsQR.js` in browser
  - Open `https://cdnjs.cloudflare.com/ajax/libs/qrcodejs/1.0.0/qrcode.min.js`
- ✅ Check browser console for specific missing files
- ✅ Verify web server is serving files from correct directory
- ✅ Check file permissions (must be readable by web server)

### "HTTPS certificate issues"

**Symptoms**: "Not secure" warning, certificate errors

**Solutions**:
- ✅ Use Let's Encrypt (free, automatic renewal)
- ✅ Verify certificate includes full chain
- ✅ Check certificate expiration date
- ✅ Ensure domain matches certificate
- ✅ For GitHub Pages/Netlify/Vercel: HTTPS is automatic

### Container-specific issues

See [CONTAINER.md](./CONTAINER.md) for detailed troubleshooting:
- Port forwarding not working
- Podman networking issues (pasta/slirp4netns)
- Container won't start
- Permission errors

---

## Support Resources

### Hosting Services Documentation

- **GitHub Pages**: https://docs.github.com/en/pages
- **Netlify**: https://docs.netlify.com
- **Vercel**: https://vercel.com/docs
- **Cloudflare Pages**: https://developers.cloudflare.com/pages

### Web Server Documentation

- **Nginx**: https://nginx.org/en/docs/
- **Apache**: https://httpd.apache.org/docs/
- **Caddy**: https://caddyserver.com/docs/

### Container Documentation

- **Podman**: https://docs.podman.io/
- See [CONTAINER.md](./CONTAINER.md) for Reality Check-specific instructions

### App-specific Issues

- Check [README.md](./README.md) troubleshooting section
- Check [FAQ](./README.md#faq) in README.md
- Open issue on GitHub repository

---

## Important Notes

### About Stateless Architecture

**Reality Check stores no data.** Unlike traditional web apps:

- ✅ No user accounts to manage
- ✅ No database to back up
- ✅ No localStorage/cookies with user data
- ✅ No GDPR compliance issues (no data collected)
- ✅ Users can switch deployments freely (nothing to migrate)

**This means:**
- Changing domains doesn't affect users (no data to lose)
- No backup/restore functionality needed
- Privacy-first by design (nothing to leak)

### About Trust

Users should be encouraged to:

1. **Review the code** before trusting any deployment
2. **Fork and self-host** rather than using third-party instances
3. **Verify the repository** is legitimate (check GitHub stars, forks, issues)
4. **Audit cryptographic implementation** in `crypto.js`

See [AI_DISCLOSURE.md](./AI_DISCLOSURE.md) for full transparency about code generation and recommendations.

### About AGPL License

If you modify Reality Check and deploy it publicly:

- ⚠️ **You must** make your source code available to users
- ⚠️ **You must** license it under AGPL v3
- ⚠️ **You must** preserve copyright notices and attribution

See [LICENSE](./LICENSE) for full terms.

---

**Deploy with confidence. Users' privacy depends on transparency.**
