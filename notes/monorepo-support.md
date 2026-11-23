# Monorepo Support for Elixirs and Conches

DHTI supports multiple workflows for working with monorepos and individual packages. This document clarifies the different approaches and when to use each.

## Workflows Overview

### 1. **Init Workflow** (Create Monorepo from Template)

Use `init` to create a full monorepo structure from the template repository:

```bash
dhti-cli conch init -n my-app -w ~/projects
```

**What it does:**

- Clones `dermatologist/openmrs-esm-dhti` to `~/projects/openmrs-esm-dhti/`
- Copies `packages/esm-starter-app` to `packages/my-app/`
- Creates full monorepo with yarn workspace setup

**To start development:**

```bash
dhti-cli conch start --local ~/projects/openmrs-esm-dhti --sources 'packages/my-app'
```

**Use case:** When you want to create a new conch within a monorepo structure with full workspace support.

---

### 2. **Install Workflow** (Clone Single Package)

Use `install` to clone a single package (flat structure, no monorepo):

```bash
dhti-cli conch install -n my-app -w ~/projects -g dermatologist/openmrs-esm-dhti-template
```

**What it does:**

- Clones repository to `~/projects/esm-dhti-my-app/` (flat structure)
- No monorepo setup, standalone package

**To start development:**

```bash
dhti-cli conch start -n my-app -w ~/projects
```

**Use case:** When you want a simple, standalone package without monorepo complexity.

---

### 3. **Subdirectory Install** (Install from Monorepo Subdirectory)

Use `-s/--subdirectory` flag to install a specific package from a monorepo:

```bash
dhti-cli conch install \
  -n my-conch \
  -g https://github.com/org/monorepo.git \
  -s packages/my-conch \
  -b main
```

**What it does:**

- Uses Git sparse checkout to efficiently clone only the specified subdirectory
- Installs package from `packages/my-conch/` within the monorepo
- Creates flat structure at `~/projects/esm-dhti-my-conch/`

**To start development:**

```bash
dhti-cli conch start -n my-conch -w ~/projects
```

**Use case:** When the package exists in a monorepo but you want to work on it standalone.

---

## Flag Reference

### `--sources` Flag (for `start` command)

Specifies which packages to load when starting a **monorepo**:

```bash
dhti-cli conch start --local /path/to/monorepo --sources 'packages/my-app'
```

- **Required for:** Monorepo workflow (after `init`)
- **Format:** `packages/<package-name>`
- **Multiple packages:** `--sources 'packages/app1' --sources 'packages/app2'`

### `-s/--subdirectory` Flag (for `install` command)

Specifies which subdirectory to clone from a **monorepo repository**:

```bash
dhti-cli conch install -n my-app -g org/repo.git -s packages/my-app
```

- **Used for:** Installing specific package from monorepo
- **Format:** Relative path from repo root (e.g., `packages/my-app`)
- **Result:** Flat clone, not monorepo

---

## Elixir Monorepo Support

Elixirs also support subdirectory installation:

```bash
dhti-cli elixir install \
  -n my-elixir \
  -g https://github.com/org/monorepo.git \
  -s packages/my-elixir \
  -b main
```

This uses uv's native subdirectory support in `pyproject.toml`:

```toml
[tool.uv.sources]
my-elixir = { git = "https://github.com/org/monorepo.git", branch = "main", subdirectory = "packages/my-elixir" }
```

---

## Summary Table

| Workflow         | Command                          | Creates                              | Start Command                                                 | Use Case                       |
| ---------------- | -------------------------------- | ------------------------------------ | ------------------------------------------------------------- | ------------------------------ |
| **Init**         | `conch init -n app -w dir`       | `dir/openmrs-esm-dhti/packages/app/` | `start --local dir/openmrs-esm-dhti --sources 'packages/app'` | New conch in monorepo          |
| **Install**      | `conch install -n app -w dir`    | `dir/esm-dhti-app/`                  | `start -n app -w dir`                                         | Standalone package             |
| **Subdirectory** | `install -n app -g repo -s path` | `dir/esm-dhti-app/`                  | `start -n app -w dir`                                         | Package from existing monorepo |

---

## Dry Run Mode

Test any command before executing:

```bash
dhti-cli conch init -n my-app -w ~/projects --dry-run
dhti-cli conch install -n my-app -w ~/projects --dry-run
dhti-cli conch start --local ~/projects/openmrs-esm-dhti --sources 'packages/my-app' --dry-run
```

dhti-cli conch install \
 -n openmrs-esm-my-conch \
 -g https://github.com/org/monorepo.git \
 -s packages/openmrs-esm-my-conch \
 --dry-run

```

The `--dry-run` flag shows what changes would be made without actually executing them.

## Examples

### Example 1: Installing from a Python Monorepo

Suppose you have a monorepo with the following structure:

```

my-dhti-monorepo/
├── packages/
│ ├── elixir-chatbot/
│ │ ├── pyproject.toml
│ │ └── src/
│ ├── elixir-summarizer/
│ │ ├── pyproject.toml
│ │ └── src/
│ └── shared-utils/
│ ├── pyproject.toml
│ └── src/

````

Install the chatbot elixir:

```bash
dhti-cli elixir install \
  -n dhti-elixir-chatbot \
  -g https://github.com/myorg/my-dhti-monorepo.git \
  -s packages/elixir-chatbot \
  -b main
````

### Example 2: Installing from a React Monorepo

Suppose you have a monorepo with the following structure:

```
openmrs-esm-apps/
├── packages/
│   ├── esm-genai/
│   │   ├── package.json
│   │   └── src/
│   ├── esm-patient-summary/
│   │   ├── package.json
│   │   └── src/
│   └── esm-forms/
│       ├── package.json
│       └── src/
```

Install the GenAI conch:

```bash
dhti-cli conch install \
  -n openmrs-esm-genai \
  -g https://github.com/openmrs/openmrs-esm-apps.git \
  -s packages/esm-genai \
  -b main \
  -v 1.0.0
```

### Example 3: Installing from Deeply Nested Directories

You can specify paths with multiple levels:

```bash
dhti-cli elixir install \
  -n my-elixir \
  -g https://github.com/org/repo.git \
  -s apps/healthcare/elixirs/my-elixir \
  -b develop
```

## Troubleshooting

### Common Issues

1. **Invalid subdirectory path**: Ensure the path is relative to the repository root and exists in the specified branch.

2. **Missing package files**: Make sure the subdirectory contains all necessary package files:
   - For elixirs: `pyproject.toml`, `src/` directory
   - For conches: `package.json`, `src/` directory

3. **Branch not found**: Verify the branch name is correct using the `-b` flag.

4. **Permission issues**: Ensure you have access to the repository (for private repos, you may need to configure Git credentials).

## Best Practices

1. **Use dry-run first**: Always test with `--dry-run` before executing the actual installation.

2. **Consistent naming**: Follow DHTI naming conventions:
   - Elixirs: `dhti-elixir-*`
   - Conches: `openmrs-esm-*`

3. **Version management**: Use the `-v` flag to specify versions explicitly for better reproducibility.

4. **Branch selection**: Use stable branches (e.g., `main`, `master`) for production installations, and development branches (e.g., `develop`, `dev`) for testing.

## See Also

- [Elixir Development Guide](steps.md)
- [Conch Development Guide](spa-steps.md)
- [DHTI CLI Documentation](README.md)
