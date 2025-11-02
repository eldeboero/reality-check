#!/bin/bash
# Reality Check PWA - Podman Container Management Script
# AGPL v3 License

set -e  # Exit on error

# Configuration
IMAGE_NAME="reality-check"
IMAGE_TAG="latest"
CONTAINER_NAME="reality-check"
DEFAULT_PORT="8080"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Helper functions
print_success() {
    echo -e "${GREEN}✓${NC} $1"
}

print_error() {
    echo -e "${RED}✗${NC} $1"
}

print_info() {
    echo -e "${BLUE}→${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}!${NC} $1"
}

# Check if podman is installed
check_podman() {
    if ! command -v podman &> /dev/null; then
        print_error "Podman is not installed. Please install podman first."
        exit 1
    fi
}

# Get container status
container_exists() {
    podman ps -a --format "{{.Names}}" | grep -q "^${CONTAINER_NAME}$"
}

container_running() {
    podman ps --format "{{.Names}}" | grep -q "^${CONTAINER_NAME}$"
}

# Build the container image
build() {
    print_info "Building container image: ${IMAGE_NAME}:${IMAGE_TAG}"

    if ! podman build -t "${IMAGE_NAME}:${IMAGE_TAG}" .; then
        print_error "Build failed"
        exit 1
    fi

    print_success "Container image built successfully"
}

# Run the container
run() {
    local PORT="${1:-$DEFAULT_PORT}"

    # Check if container already exists
    if container_exists; then
        if container_running; then
            print_warning "Container is already running"
            print_info "Use './container.sh stop' to stop it first"
            exit 1
        else
            print_warning "Container exists but is stopped"
            print_info "Starting existing container..."
            start
            return
        fi
    fi

    print_info "Running container on port ${PORT}"

    if ! podman run -d \
        --name "${CONTAINER_NAME}" \
        -p "${PORT}:80" \
        "${IMAGE_NAME}:${IMAGE_TAG}"; then
        print_error "Failed to run container"
        exit 1
    fi

    print_success "Container started successfully"
    show_access_info "$PORT"
}

# Stop the container
stop() {
    if ! container_exists; then
        print_warning "Container does not exist"
        exit 1
    fi

    if ! container_running; then
        print_warning "Container is already stopped"
        exit 0
    fi

    print_info "Stopping container..."

    if ! podman stop "${CONTAINER_NAME}"; then
        print_error "Failed to stop container"
        exit 1
    fi

    print_success "Container stopped"
}

# Start existing container
start() {
    if ! container_exists; then
        print_error "Container does not exist. Use './container.sh run' first"
        exit 1
    fi

    if container_running; then
        print_warning "Container is already running"
        exit 0
    fi

    print_info "Starting container..."

    if ! podman start "${CONTAINER_NAME}"; then
        print_error "Failed to start container"
        exit 1
    fi

    print_success "Container started"

    # Get the port mapping and show access info
    local PORT=$(podman port "${CONTAINER_NAME}" 80 2>/dev/null | cut -d':' -f2)
    if [ -n "$PORT" ]; then
        show_access_info "$PORT"
    fi
}

# Restart container
restart() {
    print_info "Restarting container..."
    stop
    start
    print_success "Container restarted"
}

# Remove container
remove() {
    if ! container_exists; then
        print_warning "Container does not exist"
        exit 0
    fi

    print_info "Removing container..."

    if ! podman rm -f "${CONTAINER_NAME}"; then
        print_error "Failed to remove container"
        exit 1
    fi

    print_success "Container removed"
}

# Rebuild: remove, rebuild image, and run
rebuild() {
    local PORT="${1:-$DEFAULT_PORT}"

    print_info "Rebuilding container..."

    # Remove existing container if it exists
    if container_exists; then
        remove
    fi

    # Build new image
    build

    # Run new container
    run "$PORT"

    print_success "Container rebuilt and running"
}

# Show container logs
logs() {
    if ! container_exists; then
        print_error "Container does not exist"
        exit 1
    fi

    print_info "Showing container logs (Ctrl+C to exit)..."
    podman logs -f "${CONTAINER_NAME}"
}

# Show container status
status() {
    print_info "Container Status:"
    echo ""

    if container_exists; then
        if container_running; then
            print_success "Container is RUNNING"

            # Get port mapping
            local PORT=$(podman port "${CONTAINER_NAME}" 80 2>/dev/null | cut -d':' -f2)
            if [ -n "$PORT" ]; then
                echo ""
                show_access_info "$PORT"
            fi

            # Show basic stats
            echo ""
            print_info "Container Details:"
            podman ps --filter "name=${CONTAINER_NAME}" --format "  ID: {{.ID}}\n  Created: {{.CreatedAt}}\n  Status: {{.Status}}"
        else
            print_warning "Container exists but is STOPPED"
            print_info "Use './container.sh start' to start it"
        fi
    else
        print_warning "Container does not exist"
        print_info "Use './container.sh run' to create and start it"
    fi
}

# Show access information
show_access_info() {
    local PORT="$1"
    echo ""
    print_success "Access the app at:"
    echo "  Local:   http://localhost:${PORT}"

    # Try to get IP address
    local IP=$(ip -4 addr show | grep -oP '(?<=inet\s)\d+(\.\d+){3}' | grep -v 127.0.0.1 | head -1)
    if [ -n "$IP" ]; then
        echo "  Network: http://${IP}:${PORT}"
    fi
}

# Clean up everything (container and image)
clean() {
    print_warning "This will remove the container AND the image"
    read -p "Are you sure? (y/N) " -n 1 -r
    echo

    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        print_info "Cancelled"
        exit 0
    fi

    # Remove container
    if container_exists; then
        remove
    fi

    # Remove image
    if podman images | grep -q "^${IMAGE_NAME}"; then
        print_info "Removing image..."
        podman rmi "${IMAGE_NAME}:${IMAGE_TAG}"
        print_success "Image removed"
    fi

    print_success "Cleanup complete"
}

# Show help
show_help() {
    cat << EOF
Reality Check PWA - Podman Container Management

Usage: ./container.sh <command> [options]

Commands:
  build              Build the container image
  run [PORT]         Run the container (default port: ${DEFAULT_PORT})
  stop               Stop the running container
  start              Start the stopped container
  restart            Restart the container
  remove             Remove the container
  rebuild [PORT]     Remove, rebuild, and run container
  logs               Show container logs (follow mode)
  status             Show container status
  clean              Remove container and image
  help               Show this help message

Examples:
  ./container.sh build                # Build the image
  ./container.sh run                  # Run on default port (${DEFAULT_PORT})
  ./container.sh run 9090             # Run on port 9090
  ./container.sh rebuild              # Rebuild everything
  ./container.sh status               # Check status
  ./container.sh logs                 # View logs

Development Workflow:
  1. Make code changes
  2. ./container.sh rebuild           # Rebuild and restart
  3. Click "reload" link in app       # Force reload (or wait for auto-update)

Notes:
  - Container runs nginx serving the PWA on port 80 internally
  - Port mapping allows access from host and network
  - Use Python HTTP server if Podman networking issues occur:
    python3 -m http.server 8080

EOF
}

# Main command dispatcher
main() {
    check_podman

    local COMMAND="${1:-help}"
    shift || true

    case "$COMMAND" in
        build)
            build
            ;;
        run)
            run "$@"
            ;;
        stop)
            stop
            ;;
        start)
            start
            ;;
        restart)
            restart
            ;;
        remove|rm)
            remove
            ;;
        rebuild)
            rebuild "$@"
            ;;
        logs)
            logs
            ;;
        status)
            status
            ;;
        clean)
            clean
            ;;
        help|--help|-h)
            show_help
            ;;
        *)
            print_error "Unknown command: $COMMAND"
            echo ""
            show_help
            exit 1
            ;;
    esac
}

# Run main function
main "$@"
