#!/bin/bash
#===============================================================================
# DHTI E2E Test Suite
#
# Comprehensive end-to-end testing for DHTI CLI, Docker containers, and browser
# automation. Tests all CLI commands, container lifecycle, UI interactions, and
# integration workflows.
#
# Usage: ./e2e.sh [options]
#
# Options:
#   -h, --help              Show this help message
#   -d, --dir DIR           Test directory (default: ~/dhti-e2e-test)
#   -c, --cleanup           Enable cleanup after tests (default: true)
#   -n, --no-browser        Skip browser tests
#   -N, --no-docker         Skip Docker tests
#   -w, --no-workflow       Skip workflow tests
#   -f, --fast              Run only fast tests (< 5 min)
#   -v, --verbose           Verbose output
#
# Examples:
#   ./e2e.sh                      # Run all tests with cleanup
#   ./e2e.sh --fast               # Run only fast tests
#   ./e2e.sh --no-browser         # Skip browser automation
#   ./e2e.sh --dir /tmp/dhti-test # Use custom test directory
#
# Expected Duration:
#   --fast:      < 5 minutes
#   Default:     20-30 minutes
#   Full suite:  25-35 minutes
#
# Prerequisites:
#   - Node.js >= 18.0.0
#   - Docker (running daemon)
#   - npm dependencies installed
#   - CLI built and linked
#===============================================================================

set -euo pipefail  # Exit on error, undefined vars, pipe failures

#-------------------------------------------------------------------------------
# Configuration
#-------------------------------------------------------------------------------

# Test directory (expanded ~ to home directory)
TEST_DIR="${TEST_DIR:-$HOME/dhti-e2e-test}"
TEST_DIR=$(eval echo "$TEST_DIR")  # Expand ~

# Test modes
CLEANUP="${CLEANUP:-true}"
BROWSER_TESTS="${BROWSER_TESTS:-true}"
DOCKER_TESTS="${DOCKER_TESTS:-true}"
WORKFLOW_TESTS="${WORKFLOW_TESTS:-true}"
FAST_MODE="${FAST_MODE:-false}"
VERBOSE="${VERBOSE:-false}"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

# Test counters
TESTS_PASSED=0
TESTS_FAILED=0
TESTS_SKIPPED=0

#-------------------------------------------------------------------------------
# Logging Functions
#-------------------------------------------------------------------------------

# Log informational message (green)
log_info() {
  echo -e "${GREEN}✓ INFO:${NC} $1"
}

# Log warning message (yellow)
log_warn() {
  echo -e "${YELLOW}⚠ WARN:${NC} $1"
}

# Log error message (red)
log_error() {
  echo -e "${RED}✗ ERROR:${NC} $1" >&2
}

# Log success message (cyan)
log_success() {
  echo -e "${CYAN}✓ SUCCESS:${NC} $1"
}

# Log section header
log_section() {
  echo ""
  echo -e "${CYAN}========================================${NC}"
  echo -e "${CYAN}$1${NC}"
  echo -e "${CYAN}========================================${NC}"
  echo ""
}

# Log test result
log_test() {
  local status=$1
  local message=$2

  if [ "$status" = "PASS" ]; then
    log_success "TEST: $message"
    ((TESTS_PASSED++))
  elif [ "$status" = "FAIL" ]; then
    log_error "TEST: $message"
    ((TESTS_FAILED++))
  else
    log_warn "TEST: $message"
    ((TESTS_SKIPPED++))
  fi
}

#-------------------------------------------------------------------------------
# Usage and Help
#-------------------------------------------------------------------------------

usage() {
  cat << EOF
DHTI E2E Test Suite

Usage: $0 [options]

Options:
  -h, --help              Show this help message
  -d, --dir DIR           Test directory (default: ~/dhti-e2e-test)
  -c, --cleanup           Enable cleanup after tests (default: true)
  -n, --no-browser        Skip browser tests
  -N, --no-docker         Skip Docker tests
  -w, --no-workflow       Skip workflow tests
  -f, --fast              Run only fast tests (< 5 min)
  -v, --verbose           Verbose output

Examples:
  $0                      # Run all tests with cleanup
  $0 --fast               # Run only fast tests
  $0 --no-browser         # Skip browser automation
  $0 --dir /tmp/dhti-test # Use custom test directory

Expected Duration:
  --fast:      < 5 minutes
  Default:     20-30 minutes
  Full suite:  25-35 minutes

EOF
}

#-------------------------------------------------------------------------------
# Argument Parsing
#-------------------------------------------------------------------------------

while [[ $# -gt 0 ]]; do
  case $1 in
    -h|--help)
      usage
      exit 0
      ;;
    -d|--dir)
      TEST_DIR="$2"
      TEST_DIR=$(eval echo "$TEST_DIR")  # Expand ~
      shift 2
      ;;
    -c|--cleanup)
      CLEANUP="true"
      shift
      ;;
    -n|--no-browser)
      BROWSER_TESTS="false"
      shift
      ;;
    -N|--no-docker)
      DOCKER_TESTS="false"
      shift
      ;;
    -w|--no-workflow)
      WORKFLOW_TESTS="false"
      shift
      ;;
    -f|--fast)
      FAST_MODE="true"
      # Fast mode skips slow tests
      WORKFLOW_TESTS="false"
      shift
      ;;
    -v|--verbose)
      VERBOSE="true"
      set -x
      shift
      ;;
    *)
      log_error "Unknown option: $1"
      usage
      exit 1
      ;;
  esac
done

#-------------------------------------------------------------------------------
# Prerequisite Checks
#-------------------------------------------------------------------------------

check_prerequisites() {
  log_section "Checking Prerequisites"

  # Check Node.js
  if ! command -v node &> /dev/null; then
    log_error "Node.js is not installed. Please install Node.js >= 18.0.0"
    exit 1
  fi

  local node_version=$(node --version | cut -d'v' -f2 | cut -d'.' -f1)
  if [ "$node_version" -lt 18 ]; then
    log_error "Node.js version must be >= 18.0.0 (current: v$node_version)"
    exit 1
  fi
  log_info "Node.js: $(node --version)"

  # Check npm
  if ! command -v npm &> /dev/null; then
    log_error "npm is not installed"
    exit 1
  fi
  log_info "npm: $(npm --version)"

  # Check Docker (if running Docker tests)
  if [ "$DOCKER_TESTS" = "true" ]; then
    if ! command -v docker &> /dev/null; then
      log_error "Docker is not installed. Required for Docker tests."
      exit 1
    fi

    if ! docker info &> /dev/null; then
      log_error "Docker daemon is not running. Please start Docker."
      exit 1
    fi
    log_info "Docker: $(docker --version)"
  else
    log_warn "Docker tests skipped"
  fi

  # Check if CLI is built
  if [ ! -f "dist/index.js" ]; then
    log_warn "CLI not built. Running 'npm run build'..."
    npm run build
  fi

  # Check if CLI is linked
  if ! command -v dhti-cli &> /dev/null; then
    log_warn "dhti-cli not found in PATH. Running 'npm link'..."
    npm link
  fi
  log_info "dhti-cli: $(dhti-cli --version)"

  # Check Playwright (if running browser tests)
  if [ "$BROWSER_TESTS" = "true" ]; then
    if ! command -v npx &> /dev/null; then
      log_error "npx is not available. Required for Playwright tests."
      exit 1
    fi

    # Check if Playwright is installed
    if [ ! -d "node_modules/@playwright" ]; then
      log_warn "Playwright not installed. Installing..."
      npm install -D @playwright/test playwright --legacy-peer-deps
    fi

    # Check if Chromium is installed
    if [ ! -d "$HOME/.cache/ms-playwright/chromium-"* ]; then
      log_warn "Chromium browser not installed. Installing..."
      npx playwright install chromium || {
        log_warn "Failed to install Chromium. Skipping browser tests."
        BROWSER_TESTS="false"
      }
    fi
  else
    log_warn "Browser tests skipped"
  fi

  log_success "All prerequisites met"
}

#-------------------------------------------------------------------------------
# Setup Functions
#-------------------------------------------------------------------------------

setup_test_environment() {
  log_section "Setting Up Test Environment"

  # Create test directory
  log_info "Creating test directory: $TEST_DIR"
  mkdir -p "$TEST_DIR"

  # Create subdirectories
  local subdirs=("elixirs" "conches" "docker" "temp" "logs")
  for subdir in "${subdirs[@]}"; do
    mkdir -p "$TEST_DIR/$subdir"
  done

  log_success "Test environment created: $TEST_DIR"
}

#-------------------------------------------------------------------------------
# Cleanup Functions
#-------------------------------------------------------------------------------

cleanup_docker() {
  log_section "Cleaning Up Docker Resources"

  if [ "$DOCKER_TESTS" = "false" ]; then
    log_warn "Docker tests were skipped, skipping Docker cleanup"
    return
  fi

  # Stop all DHTI containers
  log_info "Stopping DHTI containers..."
  docker stop $(docker ps -q --filter "name=dhti_") 2>/dev/null || true

  # Remove all DHTI containers
  log_info "Removing DHTI containers..."
  docker rm $(docker ps -aq --filter "name=dhti_") 2>/dev/null || true

  # Remove test images
  log_info "Removing test images..."
  docker rmi $(docker images -q --filter "reference=*test*" --filter "reference=*dhti-e2e*") 2>/dev/null || true

  # Remove test networks
  log_info "Removing test networks..."
  docker network rm $(docker network ls -q --filter "name=dhti_") 2>/dev/null || true

  log_success "Docker cleanup complete"
}

cleanup_test_environment() {
  log_section "Cleaning Up Test Environment"

  if [ "$CLEANUP" = "false" ]; then
    log_warn "Cleanup disabled. Test directory preserved at: $TEST_DIR"
    return
  fi

  # Remove test directory
  log_info "Removing test directory: $TEST_DIR"
  rm -rf "$TEST_DIR"

  log_success "Test environment cleaned up"
}

#-------------------------------------------------------------------------------
# Test Functions
#-------------------------------------------------------------------------------

# Test: CLI Help Command
test_cli_help() {
  log_section "Testing CLI Help"

  local output=$(dhti-cli --help 2>&1)

  if echo "$output" | grep -q "dhti-cli"; then
    log_test "PASS" "CLI help command works"
  else
    log_test "FAIL" "CLI help command failed"
    return 1
  fi
}

# Test: Compose Add Command
test_compose_add() {
  log_section "Testing Compose Add Command"

  cd "$TEST_DIR"

  # Test adding langserve module
  local output=$(dhti-cli compose add -m langserve 2>&1)

  if echo "$output" | grep -q "Writing file"; then
    log_test "PASS" "Compose add -m langserve"
  else
    log_test "FAIL" "Compose add -m langserve"
    return 1
  fi

  # Test adding multiple modules
  output=$(dhti-cli compose add -m openmrs -m redis 2>&1)

  if echo "$output" | grep -q "Writing file"; then
    log_test "PASS" "Compose add -m openmrs -m redis"
  else
    log_test "FAIL" "Compose add -m openmrs -m redis"
    return 1
  fi

  # Verify docker-compose.yml exists
  if [ -f "docker-compose.yml" ]; then
    log_test "PASS" "docker-compose.yml created"
  else
    log_test "FAIL" "docker-compose.yml not created"
    return 1
  fi
}

# Test: Elixir Install Command
test_elixir_install() {
  log_section "Testing Elixir Install Command"

  cd "$TEST_DIR"

  # Test installing elixir from GitHub
  local output=$(dhti-cli elixir install \
    -g https://github.com/dermatologist/dhti-elixir-template.git \
    -n dhti-elixir-template \
    --dry-run 2>&1)

  if echo "$output" | grep -q "elixir"; then
    log_test "PASS" "Elixir install --dry-run"
  else
    log_test "FAIL" "Elixir install --dry-run"
    return 1
  fi
}

# Test: Conch Install Command
test_conch_install() {
  log_section "Testing Conch Install Command"

  cd "$TEST_DIR"

  # Test installing conch from GitHub
  local output=$(dhti-cli conch install \
    -g https://github.com/dermatologist/openmrs-esm-dhti-template.git \
    -n openmrs-esm-dhti-template \
    --dry-run 2>&1)

  if echo "$output" | grep -q "conch"; then
    log_test "PASS" "Conch install --dry-run"
  else
    log_test "FAIL" "Conch install --dry-run"
    return 1
  fi
}

# Test: Docker Build Command
test_docker_build() {
  log_section "Testing Docker Build Command"

  if [ "$DOCKER_TESTS" = "false" ]; then
    log_test "SKIP" "Docker build (Docker tests disabled)"
    return
  fi

  cd "$TEST_DIR"

  # Test building elixir image (dry-run)
  local output=$(dhti-cli docker -n test-elixir:1.0 -t elixir --dry-run 2>&1)

  if echo "$output" | grep -q "docker"; then
    log_test "PASS" "Docker build elixir --dry-run"
  else
    log_test "FAIL" "Docker build elixir --dry-run"
    return 1
  fi

  # Test building conch image (dry-run)
  output=$(dhti-cli docker -n test-conch:1.0 -t conch --dry-run 2>&1)

  if echo "$output" | grep -q "docker"; then
    log_test "PASS" "Docker build conch --dry-run"
  else
    log_test "FAIL" "Docker build conch --dry-run"
    return 1
  fi
}

# Test: Docker Start Services
test_docker_start() {
  log_section "Testing Docker Start Services"

  if [ "$DOCKER_TESTS" = "false" ]; then
    log_test "SKIP" "Docker start (Docker tests disabled)"
    return
  fi

  cd "$TEST_DIR"

  # Ensure compose file exists
  if [ ! -f "docker-compose.yml" ]; then
    dhti-cli compose add -m langserve -m openmrs
  fi

  # Start services
  log_info "Starting Docker services..."
  local output=$(dhti-cli docker -u 2>&1)

  if echo "$output" | grep -qi "started\|created"; then
    log_test "PASS" "Docker start services"
  else
    log_test "FAIL" "Docker start services"
    log_warn "Output: $output"
    # Don't fail the test, continue
  fi

  # Wait for services to be ready
  log_info "Waiting for services to be ready..."
  sleep 10

  # Check if services are running
  local running_containers=$(docker ps --filter "name=dhti_" --format "{{.Names}}")

  if [ -n "$running_containers" ]; then
    log_test "PASS" "Services are running"
    log_info "Running containers: $running_containers"
  else
    log_test "FAIL" "Services failed to start"
  fi
}

# Test: Service Health Checks
test_service_health() {
  log_section "Testing Service Health"

  if [ "$DOCKER_TESTS" = "false" ]; then
    log_test "SKIP" "Service health (Docker tests disabled)"
    return
  fi

  # Test LangServe endpoint
  if curl -s http://localhost:8001/langserve > /dev/null 2>&1; then
    log_test "PASS" "LangServe health check"
  else
    log_test "FAIL" "LangServe health check"
  fi

  # Test OpenMRS endpoint
  if curl -s http://localhost:80/openmrs > /dev/null 2>&1; then
    log_test "PASS" "OpenMRS health check"
  else
    log_test "FAIL" "OpenMRS health check"
  fi

  # Test Gateway
  if curl -s http://localhost:80 > /dev/null 2>&1; then
    log_test "PASS" "Gateway health check"
  else
    log_test "FAIL" "Gateway health check"
  fi
}

# Test: Browser Automation
test_browser_automation() {
  log_section "Testing Browser Automation"

  if [ "$BROWSER_TESTS" = "false" ]; then
    log_test "SKIP" "Browser automation (browser tests disabled)"
    return
  fi

  # Run Playwright tests
  log_info "Running Playwright browser tests..."

  if npx playwright test test/e2e/browser/ --grep "@browser" 2>&1; then
    log_test "PASS" "Browser automation tests"
  else
    log_test "FAIL" "Browser automation tests"
    log_warn "Playwright tests failed. Check logs for details."
  fi
}

# Test: Integration Workflows
test_integration_workflows() {
  log_section "Testing Integration Workflows"

  if [ "$WORKFLOW_TESTS" = "false" ]; then
    log_test "SKIP" "Integration workflows (workflow tests disabled)"
    return
  fi

  # Run workflow tests
  log_info "Running integration workflow tests..."

  if npx playwright test test/e2e/workflows/ --grep "@workflow" 2>&1; then
    log_test "PASS" "Integration workflow tests"
  else
    log_test "FAIL" "Integration workflow tests"
    log_warn "Workflow tests failed. Check logs for details."
  fi
}

# Test: Docker Stop Services
test_docker_stop() {
  log_section "Testing Docker Stop Services"

  if [ "$DOCKER_TESTS" = "false" ]; then
    log_test "SKIP" "Docker stop (Docker tests disabled)"
    return
  fi

  cd "$TEST_DIR"

  # Stop services
  log_info "Stopping Docker services..."
  local output=$(dhti-cli docker -d 2>&1)

  if echo "$output" | grep -qi "stopped\|removed"; then
    log_test "PASS" "Docker stop services"
  else
    log_test "FAIL" "Docker stop services"
    log_warn "Output: $output"
  fi

  # Verify containers are stopped
  local running_containers=$(docker ps --filter "name=dhti_" --format "{{.Names}}")

  if [ -z "$running_containers" ]; then
    log_test "PASS" "All containers stopped"
  else
    log_test "FAIL" "Some containers still running: $running_containers"
  fi
}

#-------------------------------------------------------------------------------
# Main Test Execution
#-------------------------------------------------------------------------------

main() {
  log_section "DHTI E2E Test Suite"
  log_info "Test directory: $TEST_DIR"
  log_info "Cleanup: $CLEANUP"
  log_info "Browser tests: $BROWSER_TESTS"
  log_info "Docker tests: $DOCKER_TESTS"
  log_info "Workflow tests: $WORKFLOW_TESTS"
  log_info "Fast mode: $FAST_MODE"

  # Check prerequisites
  check_prerequisites

  # Setup test environment
  setup_test_environment

  # Run tests
  log_section "Running Tests"

  # CLI tests (always run)
  test_cli_help
  test_compose_add
  test_elixir_install
  test_conch_install
  test_docker_build

  # Docker tests (if enabled)
  if [ "$DOCKER_TESTS" = "true" ]; then
    test_docker_start
    test_service_health

    # Browser tests (if enabled and services are running)
    if [ "$BROWSER_TESTS" = "true" ]; then
      test_browser_automation
    fi

    # Workflow tests (if enabled and not in fast mode)
    if [ "$WORKFLOW_TESTS" = "true" ]; then
      test_integration_workflows
    fi

    # Stop services
    test_docker_stop
  fi

  # Cleanup
  if [ "$CLEANUP" = "true" ]; then
    cleanup_docker
    cleanup_test_environment
  fi

  # Summary
  log_section "Test Summary"
  log_info "Passed: $TESTS_PASSED"
  log_info "Failed: $TESTS_FAILED"
  log_info "Skipped: $TESTS_SKIPPED"

  if [ "$TESTS_FAILED" -gt 0 ]; then
    log_error "Some tests failed. Check logs above for details."
    exit 1
  else
    log_success "All tests passed!"
    exit 0
  fi
}

# Run main function
main