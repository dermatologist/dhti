# DHTI Quick Reference - Fixed Commands

## ✅ Fixed: Conch Install with Local Directory

### Before (Broken)

```bash
# This was documented but didn't work
npx dhti-cli conch install -l /path/to/local/conch -n myconch
```

### After (Working)

```bash
# Install from local directory
npx dhti-cli conch install -l /path/to/local/conch -n myconch -w ~/dhti

# Install from GitHub repository (still works)
npx dhti-cli conch install -g dermatologist/openmrs-esm-dhti -n myconch -w ~/dhti

# Dry-run to preview
npx dhti-cli conch install -l /path/to/local/conch -n myconch -w ~/dhti --dry-run
```

---

## 📝 Updated: Basic Demo Workflow

```bash
# All commands use ~/dhti as the default working directory
npx dhti-cli help                         # list commands
npx dhti-cli compose add -m langserve     # add LangServe to ~/dhti/docker-compose.yml
npx dhti-cli compose read                 # view generated compose
npx dhti-cli elixir install -g https://github.com/dermatologist/dhti-elixir.git -n dhti-elixir-schat -s packages/simple_chat

# Build Docker image (explicit path)
npx dhti-cli docker ~/dhti -n yourdockerhandle/genai-test:1.0 -t elixir

# Start services
npx dhti-cli docker -u

# Stop and remove Docker Compose stack (containers and networks)
npx dhti-cli docker -d
```

---

## 🔧 Updated: CDS-Hooks Sandbox Testing

### Prerequisites

- `yarn` installed
- `corepack` enabled
- Docker Compose running

### Commands

```bash
# Start elixir with CDS-Hooks sandbox
npx dhti-cli elixir start -n dhti-elixir-schat

# With custom FHIR endpoint
npx dhti-cli elixir start -n dhti-elixir-schat -f http://localhost:8080/openmrs/ws/fhir2/R4

# Dry-run to see what will happen
npx dhti-cli elixir start -n dhti-elixir-schat --dry-run
```

### What Happens

1. Elixir endpoint: `http://localhost:8001/langserve/dhti_elixir_schat/cds-services`
2. Default FHIR server: `hapi.fhir.org/baseR4`
3. Sandbox cloned to: `~/dhti/cds-hooks-sandbox` (if not exists)
4. Navigate to sandbox URL shown in console
5. Use **Rx View** tab for testing

---

## 🎨 Updated: Conch Workflows

### Option A: Install from GitHub (Flat Clone)

```bash
npx dhti-cli conch install -g dermatologist/openmrs-esm-dhti -n esm-chatbot-agent -w ~/dhti
npx dhti-cli conch start -w ~/dhti -n esm-chatbot-agent
```

### Option B: Create from Template (Monorepo)

```bash
# Creates /path/to/workspace/openmrs-esm-dhti with a new package
npx dhti-cli conch init -w /path/to/workspace -n esm-dhti-myconch

# Then run the printed start command (uses --local and --sources)
# Example: dhti-cli conch start --local /path/to/workspace/openmrs-esm-dhti --sources 'packages/esm-dhti-myconch'
```

### Option C: Install from Local Directory (NEW!)

```bash
# Copy local conch to ~/dhti/myconch
npx dhti-cli conch install -l /path/to/local/conch -n myconch -w ~/dhti

# Start it
npx dhti-cli conch start -w ~/dhti -n myconch
```

### Option D: Start Local Development

```bash
# Start from local directory directly
npx dhti-cli conch start --local /path/to/local/conch

# With multiple sources (monorepo)
npx dhti-cli conch start --local /path/to/workspace/openmrs-esm-dhti --sources 'packages/package1' --sources 'packages/package2'
```

---

## ⚙️ Updated: Bootstrap Configuration

```bash
# Copy bootstrap.py TO container (if file exists locally)
npx dhti-cli docker bootstrap -f ~/dhti/bootstrap.py

# Copy bootstrap.py FROM container (if file doesn't exist locally)
npx dhti-cli docker bootstrap -f ~/dhti/bootstrap.py

# Dry-run to see direction
npx dhti-cli docker bootstrap -f ~/dhti/bootstrap.py --dry-run
```

### Behavior

- **File exists locally**: Copies to container → restarts service
- **File doesn't exist**: Copies from container → saves locally
- Use to configure default models and hyperparameters

---

## 🔗 Fixed: Documentation Links

### Skills Directory

- ✅ `.agents/skills/` (correct)
- ❌ `/.agents/skills/` (broken - leading slash)
- ❌ `/.github/skills/` (broken - wrong directory)

### Example Files

- ✅ `.agents/skills/start-dhti/examples/e2e-sample.md` (correct)
- ❌ `/prompts/e2e-sample.md` (broken - doesn't exist)

### Contributing

- ❌ `CONTRIBUTING.md` (doesn't exist - removed reference)
- ✅ Use repository README and skill documentation instead

---

## 🧪 Testing Commands (Dry-Run Mode)

### All Commands Support `--dry-run`

```bash
# Compose
npx dhti-cli compose add -m langserve --dry-run
npx dhti-cli compose delete -m ollama --dry-run

# Elixir
npx dhti-cli elixir install -g https://github.com/dermatologist/dhti-elixir.git -n test --dry-run
npx dhti-cli elixir install -l /path/to/local -n test --dry-run
npx dhti-cli elixir start -n test --dry-run

# Conch
npx dhti-cli conch install -g dermatologist/openmrs-esm-dhti -n test --dry-run
npx dhti-cli conch install -l /path/to/local -n test --dry-run
npx dhti-cli conch init -n test -w ~/workspace --dry-run
npx dhti-cli conch start -n test -w ~/dhti --dry-run

# Docker
npx dhti-cli docker ~/dhti -n test/image:1 -t elixir --dry-run
npx dhti-cli docker -u --dry-run
npx dhti-cli docker -d --dry-run
npx dhti-cli docker bootstrap -f bootstrap.py --dry-run
```

---

## 📂 Default Paths

| Component         | Default Path                         |
| ----------------- | ------------------------------------ |
| Working Directory | `~/dhti`                             |
| Docker Compose    | `~/dhti/docker-compose.yml`          |
| Elixir Directory  | `~/dhti/elixir`                      |
| CDS-Hooks Sandbox | `~/dhti/cds-hooks-sandbox`           |
| Conch (GitHub)    | `~/dhti/<name>`                      |
| Conch (Local)     | `~/dhti/<name>` (copied from source) |
| Bootstrap File    | `~/dhti/bootstrap.py`                |

---

## 🚨 Common Issues & Solutions

### Issue: "workdir flag is required"

**Solution**: Use `-w` or `--workdir` flag, or ensure `~/dhti` exists

### Issue: "Directory does not exist" for conch start

**Solution**: Install the conch first, or use `--local` with an existing path

### Issue: Docker build fails

**Solution**: Ensure elixir is installed first: `npx dhti-cli elixir install ...`

### Issue: "Application URL not displayed"

**Solution**: The URL is constructed as `http://localhost:8001/langserve/<name>/cds-services`

### Issue: Bootstrap file not syncing

**Solution**: Check if file exists locally. If yes, it copies TO container. If no, it copies FROM container.

---

## 📚 Documentation Updates

All links now point to:

- Skills: `.agents/skills/`
- Examples: `.agents/skills/start-dhti/examples/`
- Elixir templates: https://github.com/dermatologist/dhti-elixir
- Conch templates: https://github.com/dermatologist/openmrs-esm-dhti

---

**Last Updated**: 2026-11-23
**Version**: 1.3.6
