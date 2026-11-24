# DHTI E2E Testing Guide

## Overview

This document provides comprehensive documentation for the DHTI E2E test suite. The suite tests all aspects of the DHTI CLI, Docker container lifecycle, browser automation, and integration workflows.

### Test Scope

The E2E test suite covers:

1. **CLI Command Tests** - All 9 CLI commands with various options
2. **Docker Integration Tests** - Container build, start, health checks, stop
3. **Browser Automation Tests** - UI interactions with Playwright
4. **Integration Workflows** - End-to-end workflows combining multiple components

### Test Duration

| Test Mode  | Duration  | Description                   |
| ---------- | --------- | ----------------------------- |
| `--fast`   | < 5 min   | CLI commands only             |
| Default    | 20-30 min | CLI + Docker + Browser        |
| Full suite | 25-35 min | All tests including workflows |

---

## Prerequisites

### System Requirements

- **Operating System**: Ubuntu 20.04+ (tested on 20.04.6 LTS)
- **Node.js**: >= 18.0.0
- **npm**: Latest stable version
- **Docker**: Latest stable version (for Docker tests)
- **Docker Compose**: Latest stable version

### Installation Steps

```bash
# 1. Install project dependencies
npm install

# 2. Build the CLI
npm run build

# 3. Link CLI globally
npm link

# 4. Install Playwright (for browser tests)
npm install -D @playwright/test@1.40.0 playwright@1.40.0 --legacy-peer-deps

# 5. Install Chromium browser
npx playwright install chromium

# 6. Verify installation
dhti-cli --version
npx playwright --version
```

### Troubleshooting Prerequisites

**Issue**: Playwright installation fails

```bash
# Solution: Use compatible version for Ubuntu 20.04
npm install -D @playwright/test@1.40.0 playwright@1.40.0 --legacy-peer-deps
npx playwright install chromium
```

**Issue**: Docker daemon not running

```bash
# Solution: Start Docker
sudo systemctl start docker
```

**Issue**: CLI not found

```bash
# Solution: Rebuild and link
npm run build
npm link
```

---

## Running Tests

### Basic Usage

```bash
# Run all tests (default)
./e2e.sh

# Run fast tests only (CLI commands)
./e2e.sh --fast

# Skip browser tests
./e2e.sh --no-browser

# Skip Docker tests
./e2e.sh --no-docker

# Skip workflow tests
./e2e.sh --no-workflow

# Verbose output
./e2e.sh --verbose

# Disable cleanup (for debugging)
./e2e.sh --no-cleanup

# Use custom test directory
./e2e.sh --dir /tmp/dhti-test
```

### Command-Line Options

| Option              | Description                | Default           |
| ------------------- | -------------------------- | ----------------- |
| `-h, --help`        | Show help message          | -                 |
| `-d, --dir DIR`     | Test directory             | `~/dhti-e2e-test` |
| `-c, --cleanup`     | Enable cleanup after tests | `true`            |
| `-n, --no-browser`  | Skip browser tests         | `false`           |
| `-N, --no-docker`   | Skip Docker tests          | `false`           |
| `-w, --no-workflow` | Skip workflow tests        | `false`           |
| `-f, --fast`        | Run only fast tests        | `false`           |
| `-v, --verbose`     | Verbose output             | `false`           |

### Test Output

The test script uses colored output for easy reading:

- **✓ INFO** (green) - Informational messages
- **⚠ WARN** (yellow) - Warnings
- **✗ ERROR** (red) - Errors
- **✓ SUCCESS** (cyan) - Success messages

Example output:

```
========================================
DHTI E2E Test Suite
========================================

✓ INFO: Test directory: /home/user/dhti-e2e-test
✓ INFO: Cleanup: true
✓ INFO: Browser tests: true
✓ INFO: Docker tests: true
✓ INFO: Workflow tests: true
✓ INFO: Fast mode: false

========================================
Checking Prerequisites
========================================

✓ INFO: Node.js: v18.19.0
✓ INFO: npm: 10.2.3
✓ INFO: Docker: Docker version 24.0.7
✓ INFO: dhti-cli: 1.0.0
✓ SUCCESS: All prerequisites met

========================================
Running Tests
========================================

✓ SUCCESS: TEST: CLI help command works
✓ SUCCESS: TEST: Compose add -m langserve
...
```

---

## Test Categories

### 1. CLI Command Tests

Tests all CLI commands without requiring Docker or browser.

**Test Cases**:

- `test_cli_help` - Verify CLI help command
- `test_compose_add` - Test compose add with various modules
- `test_elixir_install` - Test elixir install (dry-run)
- `test_conch_install` - Test conch install (dry-run)
- `test_docker_build` - Test docker build (dry-run)

**Duration**: 2-3 minutes

**Run**:

```bash
./e2e.sh --fast
```

### 2. Docker Integration Tests

Tests Docker container lifecycle with real services.

**Test Cases**:

- `test_docker_start` - Start Docker services
- `test_service_health` - Health check endpoints
- `test_docker_stop` - Stop and cleanup services

**Duration**: 5-10 minutes

**Run**:

```bash
./e2e.sh --no-browser
```

**Endpoints Tested**:

- LangServe: `http://localhost:8001/langserve`
- OpenMRS: `http://localhost:80/openmrs`
- Gateway: `http://localhost:80`

### 3. Browser Automation Tests

Tests UI interactions using Playwright.

**Test Cases**:

- OpenMRS login and navigation
- CDS-Hook sandbox interaction
- LangServe API endpoint validation
- Widget rendering verification

**Duration**: 3-5 minutes

**Run**:

```bash
./e2e.sh --no-docker
```

**Prerequisites**:

- Docker services must be running
- Playwright installed with Chromium

### 4. Integration Workflows

Tests end-to-end workflows combining multiple components.

**Test Cases**:

- Elixir workflow (install → build → start → test)
- Conch workflow (install → start → verify)
- Full stack integration (elixir + conch + OpenMRS)
- Synthea workflow (patient generation → import)

**Duration**: 15-20 minutes

**Run**:

```bash
./e2e.sh
```

---

## Test Structure

### Directory Structure

```
test/
├── e2e/
│   ├── helpers.ts              # Shared test utilities
│   ├── docker-utils.ts         # Docker lifecycle management
│   ├── browser/                # Browser automation tests
│   │   ├── openmrs.spec.ts
│   │   ├── cds-hook.spec.ts
│   │   └── langserve.spec.ts
│   └── workflows/              # Integration workflow tests
│       ├── elixir-workflow.spec.ts
│       ├── conch-workflow.spec.ts
│       ├── integration.spec.ts
│       └── synthea-workflow.spec.ts
└── playwright.config.ts        # Playwright configuration
```

### Helper Functions

**test/e2e/helpers.ts** provides:

- `log(level, message)` - Colored console output
- `waitForService(url, timeout)` - Health check with retry
- `runCommand(command, options)` - CLI execution
- `validateCLIOutput(output, expected)` - Output validation
- `setupTestEnvironment(testDir)` - Directory setup
- `teardownTestEnvironment(testDir)` - Cleanup
- `retry(fn, retries, delay)` - Retry logic
- `isDockerRunning()` - Docker daemon check

**test/e2e/docker-utils.ts** provides:

- `buildImage(imageName, context, dockerfile)` - Build Docker images
- `startServices(composeFile, detached)` - Start services
- `stopServices(composeFile, removeVolumes)` - Stop services
- `checkServiceHealth(serviceName, port, timeout)` - Health checks
- `getContainerLogs(containerName, tail)` - Log retrieval
- `cleanupAll()` - Remove all test containers/images

---

## Cleanup

### Automatic Cleanup

By default, the test suite automatically cleans up:

- All Docker containers created during tests
- All Docker images created during tests
- Test directory and all subdirectories
- Temporary files and logs

### Disable Cleanup

For debugging purposes, you can disable cleanup:

```bash
./e2e.sh --no-cleanup
```

This preserves:

- Test directory at `~/dhti-e2e-test`
- Docker containers (for inspection)
- Logs and temporary files

### Manual Cleanup

If cleanup fails or is disabled, manually clean up:

```bash
# Stop all DHTI containers
docker stop $(docker ps -q --filter "name=dhti_")

# Remove all DHTI containers
docker rm $(docker ps -aq --filter "name=dhti_")

# Remove test images
docker rmi $(docker images -q --filter "reference=*dhti-e2e*")

# Remove test directory
rm -rf ~/dhti-e2e-test
```

---

## Troubleshooting

### Common Issues

**Issue**: Docker daemon not running

```bash
# Check Docker status
sudo systemctl status docker

# Start Docker
sudo systemctl start docker

# Verify
docker info
```

**Issue**: Port already in use

```bash
# Find process using port
sudo lsof -i :80

# Kill process
sudo kill -9 <PID>

# Or stop existing DHTI services
dhti-cli docker -d
```

**Issue**: Playwright browser not installed

```bash
# Install Chromium
npx playwright install chromium

# Verify installation
npx playwright install --with-deps chromium
```

**Issue**: CLI commands not found

```bash
# Rebuild CLI
npm run build

# Re-link CLI
npm link

# Verify
dhti-cli --version
```

**Issue**: Test timeout

```bash
# Increase timeout (edit playwright.config.ts)
timeout: 60000,  # 60 seconds

# Or run with verbose output
./e2e.sh --verbose
```

### Debug Mode

Enable verbose output for debugging:

```bash
./e2e.sh --verbose
```

This shows:

- All command executions
- Full output from commands
- Detailed error messages
- Environment variables

### Test Logs

Logs are stored in:

```
~/dhti-e2e-test/logs/
├── cli-commands.log
├── docker-operations.log
├── browser-tests.log
└── workflow-tests.log
```

---

## CI/CD Integration

### GitHub Actions

Example workflow for CI:

```yaml
name: E2E Tests

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main]

jobs:
  e2e-tests:
    runs-on: ubuntu-latest

    steps:
      - uses: actions/checkout@v3

      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'

      - name: Install dependencies
        run: npm install

      - name: Build CLI
        run: npm run build

      - name: Link CLI
        run: npm link

      - name: Install Playwright
        run: npm install -D @playwright/test@1.40.0 playwright@1.40.0 --legacy-peer-deps

      - name: Install Chromium
        run: npx playwright install chromium

      - name: Run E2E tests (fast)
        run: ./e2e.sh --fast

      - name: Upload test results
        uses: actions/upload-artifact@v3
        if: always()
        with:
          name: test-results
          path: test-results/
```

### Test Reporting

Playwright generates HTML reports:

```bash
# View test report
npx playwright show-report
```

Reports include:

- Test execution timeline
- Screenshots on failure
- Console logs
- Network requests

---

## Contributing New Tests

### Adding CLI Tests

1. Create test function in `e2e.sh`:

```bash
test_my_command() {
  log_section "Testing My Command"

  local output=$(dhti-cli my-command --option 2>&1)

  if echo "$output" | grep -q "expected output"; then
    log_test "PASS" "My command works"
  else
    log_test "FAIL" "My command failed"
    return 1
  fi
}
```

2. Add to main test execution:

```bash
test_my_command
```

### Adding Browser Tests

1. Create test file in `test/e2e/browser/`:

```typescript
import {test, expect} from '@playwright/test'

test.describe('My Feature', () => {
  test('@browser should test my feature', async ({page}) => {
    await page.goto('http://localhost:80')

    // Test logic here
    const element = await page.locator('.my-element')
    await expect(element).toBeVisible()
  })
})
```

2. Use `@browser` tag for categorization

### Adding Workflow Tests

1. Create test file in `test/e2e/workflows/`:

```typescript
import {test, expect} from '@playwright/test'

test.describe('My Workflow', () => {
  test('@workflow should complete my workflow', async ({page}) => {
    // Setup
    await setupWorkflow()

    // Execute workflow
    await executeWorkflow()

    // Verify results
    await verifyResults(page)
  })
})
```

2. Use `@workflow` tag for categorization

---

## Test Maintenance

### Regular Updates

- **Update test expectations** when CLI output changes
- **Update health check endpoints** when services change
- **Update browser selectors** when UI changes
- **Review test timeouts** for slow operations

### Performance Optimization

- Use `--fast` mode for quick feedback
- Skip browser tests in CI if not needed
- Use Docker volumes for faster builds
- Cache Playwright browsers

### Test Coverage

Track test coverage:

```bash
# Run tests with coverage
npx playwright test --coverage

# View coverage report
npx playwright show-report
```

---

## Appendix

### A. Environment Variables

| Variable         | Description        | Default           |
| ---------------- | ------------------ | ----------------- |
| `TEST_DIR`       | Test directory     | `~/dhti-e2e-test` |
| `CLEANUP`        | Enable cleanup     | `true`            |
| `BROWSER_TESTS`  | Run browser tests  | `true`            |
| `DOCKER_TESTS`   | Run Docker tests   | `true`            |
| `WORKFLOW_TESTS` | Run workflow tests | `true`            |
| `FAST_MODE`      | Fast mode          | `false`           |
| `VERBOSE`        | Verbose output     | `false`           |

### B. Docker Services

The test suite uses these Docker services:

| Service   | Port  | Purpose                |
| --------- | ----- | ---------------------- |
| gateway   | 80    | Nginx reverse proxy    |
| openmrs   | 8080  | OpenMRS EMR            |
| langserve | 8001  | LangServe API          |
| ollama    | 11434 | Ollama LLM             |
| fhir      | 8080  | HAPI FHIR server       |
| mcp-fhir  | 8002  | MCP FHIR server        |
| cql-elm   | 8080  | CQL to ELM compiler    |
| langfuse  | 3000  | Langfuse observability |
| redis     | 6379  | Redis cache            |

### C. Test Tags

- `@cli` - CLI command tests
- `@docker` - Docker integration tests
- `@browser` - Browser automation tests
- `@workflow` - Integration workflow tests

### D. Quick Reference

```bash
# Run all tests
./e2e.sh

# Run fast tests
./e2e.sh --fast

# Skip browser tests
./e2e.sh --no-browser

# Skip Docker tests
./e2e.sh --no-docker

# Verbose output
./e2e.sh --verbose

# Disable cleanup
./e2e.sh --no-cleanup

# Custom test directory
./e2e.sh --dir /tmp/dhti-test
```

---

## Support

For issues or questions:

1. Check this documentation
2. Review test logs in `~/dhti-e2e-test/logs/`
3. Run with verbose output: `./e2e.sh --verbose`
4. Check GitHub issues: `https://github.com/dermatologist/dhti/issues`

Tests all DHTI CLI commands without requiring Docker or browser automation.

**Commands tested:**

- `compose` - Docker Compose management
- `elixir` - Backend elixir management
- `conch` - Frontend conch management
- `docker` - Docker image building and container management
- `docktor` - MCPX pipeline management
- `synthea` - Synthetic patient generation
- `synthetic` - LLM-based data generation

**Run CLI tests:**

```bash
# Run all CLI tests
npm test

# Run specific command tests
npm test -- --grep "compose"
npm test -- --grep "elixir"
npm test -- --grep "conch"
```

**Expected duration:** 2-3 minutes

### 2. Docker Integration Tests

Tests real Docker container lifecycle (build, start, health check, stop).

**Tests include:**

- Building elixir and conch Docker images
- Starting Docker Compose services
- Health checks for all 13 services
- Service restart and bootstrap modes
- Complete cleanup after tests

**Run Docker tests:**

```bash
# Via e2e.sh script
./e2e.sh --no-browser

# Or directly with Playwright
npx playwright test --grep "@docker"
```

**Expected duration:** 5-10 minutes (depends on image build times)

**Resource requirements:**

- > = 4GB RAM available
- > = 10GB disk space
- Docker daemon running

### 3. Browser Automation Tests

Tests UI interactions using Playwright with Chromium browser.

**Tests include:**

- OpenMRS SPA login and navigation
- Conch widget rendering in patient dashboard
- CDS-Hook sandbox message submission
- LangServe API endpoint validation
- Response card display and content

**Run browser tests:**

```bash
# Via e2e.sh script
./e2e.sh --no-docker

# Or directly with Playwright
npx playwright test --grep "@browser"

# With HTML report
npx playwright test --grep "@browser" --reporter=html
```

**Expected duration:** 3-5 minutes

**Prerequisites:**

- Docker services must be running (OpenMRS, LangServe)
- Start services first: `./e2e.sh --no-browser`

### 4. Integration Workflow Tests

End-to-end tests covering complete development workflows.

**Workflows tested:**

1. **Elixir Development** - init → build → start → test → cleanup (3-5 min)
2. **Conch Development** - init → build → start → UI test → cleanup (2-3 min)
3. **Full Stack Integration** - Elixir↔Conch↔OpenMRS data flow (5-7 min)
4. **Synthea Pipeline** - generate → upload → verify → cleanup (5-7 min, optional)

**Run workflow tests:**

```bash
# Via e2e.sh script (runs all workflows)
./e2e.sh

# Or specific workflow
npx playwright test test/e2e/workflows/elixir-workflow.spec.ts
npx playwright test test/e2e/workflows/integration.spec.ts
```

**Expected duration:** 15-20 minutes

## Running Tests

### Quick Start

```bash
# Run all tests with cleanup
./e2e.sh

# Run only fast tests (< 5 min)
./e2e.sh --fast

# Run with verbose output
./e2e.sh --verbose
```

### Test Selection

```bash
# Skip browser tests
./e2e.sh --no-browser

# Skip Docker tests
./e2e.sh --no-docker

# Skip workflow tests
./e2e.sh --no-workflow

# Custom test directory
./e2e.sh --dir /tmp/dhti-test

# Disable cleanup (for debugging)
./e2e.sh --no-cleanup
```

### Command-Line Options

| Option              | Description                | Default           |
| ------------------- | -------------------------- | ----------------- |
| `-h, --help`        | Show help message          | -                 |
| `-d, --dir DIR`     | Test directory             | `~/dhti-e2e-test` |
| `-c, --cleanup`     | Enable cleanup after tests | `true`            |
| `-n, --no-browser`  | Skip browser tests         | `false`           |
| `-N, --no-docker`   | Skip Docker tests          | `false`           |
| `-w, --no-workflow` | Skip workflow tests        | `false`           |
| `-f, --fast`        | Run only fast tests        | `false`           |
| `-v, --verbose`     | Verbose output             | `false`           |

### Environment Variables

| Variable         | Description                                | Default           |
| ---------------- | ------------------------------------------ | ----------------- |
| `TEST_DIR`       | Test directory path                        | `~/dhti-e2e-test` |
| `TEST_TIMEOUT`   | Test timeout in ms                         | `300000`          |
| `VERBOSE`        | Enable verbose logging                     | `false`           |
| `OPENAI_API_KEY` | OpenAI API key (for real LLM tests)        | Mocked            |
| `GOOGLE_API_KEY` | Google Gemini API key (for real LLM tests) | Mocked            |

## Test Output

### Console Output

Tests produce colored console output:

- `✓ INFO` - Informational messages (green)
- `⚠ WARN` - Warnings (yellow)
- `✗ ERROR` - Errors (red)
- `✓ SUCCESS` - Success messages (cyan)

Example:

```
[14:30:15] ✓ INFO Setting up test environment...
[14:30:16] ✓ SUCCESS Created test directory: /home/user/dhti-e2e-test
[14:30:20] ✓ INFO Executing: dhti-cli compose add -m langserve
[14:30:21] ✓ SUCCESS Command completed successfully
[14:30:45] ✓ SUCCESS Service healthy: http://localhost:8001/langserve
```

### HTML Reports

Playwright generates HTML reports for browser tests:

```bash
# Generate HTML report
npx playwright test --reporter=html

# Open report in browser
npx playwright show-report
```

Report location: `playwright-report/index.html`

### JSON Reports

For CI/CD integration:

```bash
# Generate JSON report
npx playwright test --reporter=json --output=test-results.json
```

## Troubleshooting

### Common Issues

#### 1. Docker Not Running

**Error:** `Cannot connect to the Docker daemon`

**Solution:**

```bash
# Start Docker daemon
sudo systemctl start docker

# Verify Docker is running
docker info
```

#### 2. Port Already in Use

**Error:** `Port 80 is already allocated`

**Solution:**

```bash
# Stop existing DHTI containers
dhti-cli docker -d

# Or kill processes on specific ports
sudo lsof -ti:80 | xargs kill -9
sudo lsof -ti:8080 | xargs kill -9
```

#### 3. Playwright Browser Not Installed

**Error:** `Chromium is not installed`

**Solution:**

```bash
# Install Playwright browsers
npx playwright install chromium

# Install with system dependencies
npx playwright install-deps chromium
```

#### 4. Test Timeout

**Error:** `Test timeout of 300000ms exceeded`

**Solution:**

```bash
# Increase timeout
export TEST_TIMEOUT=600000
./e2e.sh

# Or use verbose mode to see progress
./e2e.sh --verbose
```

#### 5. Insufficient Disk Space

**Error:** `No space left on device`

**Solution:**

```bash
# Clean up Docker system
docker system prune -a --volumes

# Remove old test directories
rm -rf ~/dhti-e2e-test
```

#### 6. Image Build Failures

**Error:** `ERROR: failed to build image`

**Solution:**

```bash
# Check Dockerfile exists
ls -la src/resources/genai/Dockerfile

# Verify build context
docker build -t test:1.0 src/resources/genai/

# Check Docker logs
docker logs <container-id>
```

### Debugging Failed Tests

#### 1. Enable Verbose Mode

```bash
./e2e.sh --verbose
```

#### 2. Disable Cleanup

```bash
./e2e.sh --no-cleanup
```

This preserves containers and logs for inspection.

#### 3. Inspect Container Logs

```bash
# List running containers
docker ps -a

# View logs
docker logs dhti_langserve_1
docker logs dhti_openmrs_1
```

#### 4. Check Service Health

```bash
# Test LangServe endpoint
curl http://localhost:8001/langserve

# Test OpenMRS endpoint
curl http://localhost:80/openmrs

# Test gateway
curl http://localhost:80
```

#### 5. Playwright Debug Mode

```bash
# Run single test in debug mode
npx playwright test test/e2e/browser/openmrs.spec.ts --debug

# Show browser during test
PWDEBUG=1 npx playwright test test/e2e/browser/openmrs.spec.ts
```

## CI/CD Integration

### GitHub Actions

Example workflow file (`.github/workflows/e2e.yml`):

```yaml
name: E2E Tests

on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

jobs:
  e2e-fast:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '18'

      - name: Install dependencies
        run: npm ci

      - name: Build CLI
        run: npm run build

      - name: Run fast E2E tests
        run: ./e2e.sh --fast --no-browser

  e2e-full:
    runs-on: ubuntu-latest
    if: github.event_name == 'push' && github.ref == 'refs/heads/main'
    steps:
      - uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '18'

      - name: Install dependencies
        run: npm ci

      - name: Build CLI
        run: npm run build

      - name: Install Playwright
        run: npx playwright install --with-deps chromium

      - name: Run full E2E tests
        run: ./e2e.sh --verbose

      - name: Upload test report
        uses: actions/upload-artifact@v4
        if: always()
        with:
          name: playwright-report
          path: playwright-report/
```

### Test Results in CI

- **Fast tests** run on every PR (< 5 min)
- **Full tests** run on merge to main (20-30 min)
- **HTML reports** uploaded as artifacts
- **JSON reports** for test analytics

## Contributing New Tests

### Adding a CLI Command Test

1. Create test file: `test/e2e/<command>.e2e.test.ts`
2. Use `runCommand()` helper from `helpers.ts`
3. Validate output with `validateCLIOutput()`
4. Add `@cli` tag for categorization

Example:

```typescript
import {test, expect} from '@playwright/test'
import {runCommand, validateCLIOutput} from './helpers.js'

test.describe('mycommand CLI', () => {
  test('@cli should execute mycommand', () => {
    const {stdout, exitCode} = runCommand('dhti-cli mycommand --help')

    expect(exitCode).toBe(0)
    expect(validateCLIOutput(stdout, ['mycommand', 'help'])).toBe(true)
  })
})
```

### Adding a Browser Test

1. Create test file: `test/e2e/browser/<feature>.spec.ts`
2. Use Playwright's `page` API
3. Add `@browser` tag for categorization
4. Ensure Docker services are started before test

Example:

```typescript
import {test, expect} from '@playwright/test'

test.describe('OpenMRS UI', () => {
  test('@browser should login successfully', async ({page}) => {
    await page.goto('/openmrs/spa/home')

    // Fill login form
    await page.fill('#username', 'admin')
    await page.fill('#password', 'Admin123')
    await page.click('#login-button')

    // Verify login succeeded
    await expect(page.locator('.patient-dashboard')).toBeVisible()
  })
})
```

### Adding a Workflow Test

1. Create test file: `test/e2e/workflows/<workflow>.spec.ts`
2. Combine CLI commands, Docker operations, and browser tests
3. Add `@workflow` tag for categorization
4. Include cleanup in `afterEach()` block

Example:

```typescript
import {test, expect} from '@playwright/test'
import {runCommand} from './helpers.js'
import {startServices, stopServices} from './docker-utils.js'

test.describe('Elixir Workflow', () => {
  test('@workflow should complete elixir lifecycle', async () => {
    // Setup
    runCommand('dhti-cli compose add -m langserve')
    runCommand('dhti-cli elixir init -n test-elixir')

    // Build and start
    runCommand('dhti-cli docker -t elixir -n test-elixir:1.0')
    startServices()

    // Test
    const response = await fetch('http://localhost:8001/langserve')
    expect(response.ok).toBe(true)

    // Cleanup
    stopServices()
  })
})
```

## Test Maintenance

### Updating Test Expectations

When CLI output changes:

1. Update expected strings in `validateCLIOutput()` calls
2. Update regex patterns in test assertions
3. Run tests to verify: `npm test`

### Adding New Docker Services

When adding services to `docker-compose-master.yml`:

1. Update `waitForAllServices()` in workflow tests
2. Add health check endpoint to `checkServiceHealth()`
3. Update service port mappings in browser tests

### Rotating Test Credentials

For OpenMRS login credentials:

1. Update `test/e2e/browser/openmrs.spec.ts`
2. Update environment variables in `e2e.sh`
3. Document new credentials in this guide

## Performance Tips

### Reduce Test Duration

1. **Run only needed tests:**

   ```bash
   ./e2e.sh --fast  # Skip workflows
   ./e2e.sh --no-browser  # Skip browser tests
   ```

2. **Use parallel execution:**

   ```bash
   npx playwright test --workers=4
   ```

3. **Skip image builds (use cached images):**
   ```bash
   export SKIP_BUILD=true
   ./e2e.sh
   ```

### Optimize Resource Usage

1. **Limit Docker resources:**

   ```bash
   # Set Docker memory limit
   docker update --memory=4g <container-id>
   ```

2. **Clean up between runs:**

   ```bash
   docker system prune -a --volumes
   rm -rf ~/dhti-e2e-test
   ```

3. **Use test-specific Docker network:**
   ```bash
   docker network create dhti-e2e-test
   ```

## Appendix

### Service Port Mappings

| Service         | Port  | URL                             |
| --------------- | ----- | ------------------------------- |
| Gateway (nginx) | 80    | http://localhost:80             |
| LangServe       | 8001  | http://localhost:8001/langserve |
| OpenMRS Backend | 8002  | http://localhost:80/openmrs     |
| OpenMRS SPA     | 8003  | http://localhost:80/openmrs/spa |
| HAPI FHIR       | 8005  | http://localhost:80/fhir        |
| Ollama          | 11434 | http://localhost:11434          |
| Langfuse        | 3000  | http://localhost:3000           |
| Redis           | 6379  | localhost:6379                  |

### Test File Structure

```
test/
├── e2e/
│   ├── helpers.ts           # Shared test utilities
│   ├── docker-utils.ts      # Docker test utilities
│   ├── compose.e2e.test.ts  # Compose command tests
│   ├── elixir.e2e.test.ts   # Elixir command tests
│   ├── conch.e2e.test.ts    # Conch command tests
│   ├── docker.e2e.test.ts   # Docker command tests
│   ├── browser/
│   │   ├── openmrs.spec.ts  # OpenMRS UI tests
│   │   ├── cds-hook.spec.ts # CDS-Hook sandbox tests
│   │   └── langserve.spec.ts # LangServe API tests
│   └── workflows/
│       ├── elixir-workflow.spec.ts
│       ├── conch-workflow.spec.ts
│       ├── integration.spec.ts
│       └── synthea-workflow.spec.ts
```

### Useful Commands

```bash
# Check Docker disk usage
docker system df

# List all containers (including stopped)
docker ps -a

# View real-time container logs
docker logs -f dhti_langserve_1

# Execute command in container
docker exec -it dhti_openmrs_1 bash

# Stop all containers quickly
docker stop $(docker ps -q)

# Remove all containers
docker rm $(docker ps -aq)

# Remove all images
docker rmi $(docker images -q)

# Complete Docker cleanup
docker system prune -a --volumes -f
```

## Support

For issues or questions:

1. Check this guide's troubleshooting section
2. Review test logs with `--verbose` flag
3. Open an issue on GitHub: https://github.com/dermatologist/dhti/issues
4. Check existing issues for known problems
