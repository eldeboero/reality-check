# Running Reality Check PWA with Podman

This guide shows how to run Reality Check PWA in a Podman container on localhost:80.

## Prerequisites

- Podman installed on your system
- Port 80 available (or use a different port)

## Quick Start (Using the Script)

**The easiest way to manage the container is with the included `container.sh` script:**

```bash
# Build and run on default port (8080)
./container.sh rebuild

# Or run on a custom port
./container.sh rebuild 9090

# Check status
./container.sh status

# View logs
./container.sh logs

# Stop container
./container.sh stop

# See all available commands
./container.sh help
```

The script handles all the common tasks: build, run, stop, restart, rebuild, logs, and cleanup.

## Manual Commands (Alternative)

If you prefer to run Podman commands directly:

### 1. Build the Container Image

```bash
podman build -t reality-check:latest .
```

### 2. Run the Container

```bash
# Run on port 8080 (accessible from your network)
podman run -d --name reality-check -p 8080:80 reality-check:latest

# Or run on port 80 (requires root or port configuration)
# podman run -d --name reality-check -p 80:80 reality-check:latest
```

### 3. Access the App

**From your local machine:**
```
http://localhost:8080
```

**From other devices on your network:**
```
http://YOUR_IP_ADDRESS:8080
```

To find your IP address:
```bash
ip -4 addr show | grep -oP '(?<=inet\s)\d+(\.\d+){3}' | grep -v 127.0.0.1 | head -1
```

## Container Management

### Stop the Container
```bash
podman stop reality-check
```

### Start the Container Again
```bash
podman start reality-check
```

### Remove the Container
```bash
podman rm -f reality-check
```

### View Container Logs
```bash
podman logs reality-check
```

### Rebuild After Changes
```bash
# Stop and remove old container
podman rm -f reality-check

# Rebuild image
podman build -t reality-check:latest .

# Run new container
podman run -d --name reality-check -p 80:80 reality-check:latest
```

## Network Access

By default, `-p 8080:80` binds to all network interfaces (0.0.0.0), making the app accessible:
- From the host: `http://localhost:8080`
- From other devices on your network: `http://YOUR_IP_ADDRESS:8080`

To restrict to localhost only:
```bash
podman run -d --name reality-check -p 127.0.0.1:8080:80 reality-check:latest
```

## Rootless Mode

Podman can run rootless, but ports below 1024 require special configuration.

### Option 1: Use Port Mapping Above 1024
```bash
podman run -d --name reality-check -p 8080:80 reality-check:latest
```

### Option 2: Allow Rootless Port 80 (Linux)
```bash
# Allow unprivileged users to bind to port 80
sudo sysctl -w net.ipv4.ip_unprivileged_port_start=80

# Make permanent
echo 'net.ipv4.ip_unprivileged_port_start=80' | sudo tee -a /etc/sysctl.conf
```

## Using Podman Compose (Optional)

Create a `podman-compose.yml` or `docker-compose.yml`:

```yaml
version: '3'
services:
  reality-check:
    build: .
    ports:
      - "80:80"
    container_name: reality-check
    restart: unless-stopped
```

Run with:
```bash
podman-compose up -d
```

## Development Workflow

When making changes to the PWA:

1. Edit your source files (index.html, app.js, etc.)
2. Rebuild and restart:
   ```bash
   podman rm -f reality-check
   podman build -t reality-check:latest .
   podman run -d --name reality-check -p 8080:80 reality-check:latest
   ```
3. If service worker is caching old files, use the **"🔄 Clear Cache"** button in the app

## Troubleshooting

### Port 80 Permission Denied
- Use a higher port (8080) or enable rootless port binding (see above)

### Container Won't Start
```bash
# Check logs
podman logs reality-check

# Check if port is in use
sudo ss -tulpn | grep :80
```

### Networking Issues / Port Forwarding Not Working
**Symptoms:**
- Container is running but `curl http://localhost:8080` fails or returns "Empty reply" or "Connection reset"
- `podman exec reality-check curl localhost:80` works inside container
- Logs show nginx running but no requests received

**Cause:** Podman networking issues with pasta/slirp4netns on some systems.

**Solutions:**

1. **Use Python HTTP Server Instead (Recommended for Development):**
   ```bash
   # Stop the container
   podman rm -f reality-check

   # Use Python's built-in HTTP server
   python3 -m http.server 8080

   # Access at http://localhost:8080
   ```

2. **Try Podman with Host Networking (requires root for port 80):**
   ```bash
   podman rm -f reality-check
   podman run -d --name reality-check --network=host reality-check:latest
   # Access at http://localhost:80
   ```
   Note: This may fail with "Permission denied" on port 80 in rootless mode.

3. **Use a Different Port:**
   ```bash
   # Try a different high port
   podman run -d --name reality-check -p 9090:80 reality-check:latest
   ```

4. **Check Podman Network Backend:**
   ```bash
   # Check which network backend is in use
   podman info | grep -i network

   # Try switching between pasta and slirp4netns in containers.conf
   # Location: ~/.config/containers/containers.conf or /etc/containers/containers.conf
   ```

For development purposes, **Python's HTTP server is the most reliable option** and requires no container setup.

### Camera Not Working
- Camera access requires either HTTPS or localhost
- Since this runs on localhost, camera should work
- Ensure browser has camera permissions granted

### Service Worker Not Registering
- Check browser console for errors
- Service workers work on localhost without HTTPS
- Use the **"🔄 Clear Cache"** button in the app (available on all screens)

### Changes Not Appearing / Stuck on Old Version
**Easy fix:** Use the **"🔄 Clear Cache"** button on any screen:
- Setup screen (bottom)
- Lock screen (bottom)
- Main screen (header)

**Manual fix:**
- Rebuild the container image
- Clear browser cache (Ctrl+Shift+R / Cmd+Shift+R)
- DevTools → Application → Service Workers → Unregister

### Testing Offline Capability
Service worker is now enabled for offline PWA functionality:
```bash
# Visit the app once with container running
# Then stop the container
podman stop reality-check

# App should still work completely offline!
```

## Container Size

The built image is approximately 25-30 MB (nginx:alpine base + PWA files).

## Security Notes

- This setup is for local development/private use only
- No HTTPS is configured (not needed for localhost)
- For production deployment, use HTTPS (see DEPLOY.md)
- Consider using podman's built-in security features (SELinux, seccomp, etc.)
