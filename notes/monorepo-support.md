# Monorepo Support for Elixirs and Conches

DHTI now supports installing elixirs and conches from subdirectories within GitHub repositories, enabling full support for monorepo architectures.

## Overview

When working with monorepos, multiple packages (elixirs or conches) may be stored in different subdirectories of a single repository. The `-s` or `--subdirectory` flag allows you to specify which subdirectory contains the package you want to install.

## Usage

### Installing Elixirs from Subdirectories

To install an elixir from a subdirectory in a GitHub repository:

```bash
dhti-cli elixir install \
  -n my-elixir \
  -g https://github.com/org/monorepo.git \
  -s packages/my-elixir \
  -b main
```

**Parameters:**
- `-n, --name`: Name of the elixir to install
- `-g, --git`: GitHub repository URL
- `-s, --subdirectory`: Path to the subdirectory containing the elixir (relative to repository root)
- `-b, --branch`: Git branch to install from (default: develop)

### Installing Conches from Subdirectories

To install a conch from a subdirectory in a GitHub repository:

```bash
dhti-cli conch install \
  -n openmrs-esm-my-conch \
  -g https://github.com/org/monorepo.git \
  -s packages/openmrs-esm-my-conch \
  -b main
```

**Parameters:**
- `-n, --name`: Name of the conch to install
- `-g, --git`: GitHub repository URL
- `-s, --subdirectory`: Path to the subdirectory containing the conch (relative to repository root)
- `-b, --branch`: Git branch to install from (default: develop)

## How It Works

### Elixirs (Python/uv packages)

When installing an elixir from a subdirectory, DHTI uses uv's native subdirectory support in the `pyproject.toml` file. The dependency is added with the `subdirectory` parameter:

```toml
[tool.uv.sources]
my-elixir = { git = "https://github.com/org/monorepo.git", branch = "main", subdirectory = "packages/my-elixir" }
```

This tells uv to:
1. Clone the repository
2. Navigate to the specified subdirectory
3. Install the Python package from that location

### Conches (JavaScript/React packages)

When installing a conch from a subdirectory, DHTI uses Git's sparse checkout feature to efficiently clone only the required subdirectory:

```bash
# Initialize sparse checkout
git init
git remote add origin <repository-url>
git config core.sparseCheckout true
echo "packages/my-conch/*" >> .git/info/sparse-checkout

# Fetch and checkout the branch
git fetch --depth=1 origin <branch>
git checkout <branch>

# Move contents to root
mv packages/my-conch/* .
rm -rf packages/my-conch
```

This approach:
- Minimizes download size by only fetching the required subdirectory
- Maintains the package structure expected by DHTI
- Works efficiently with large monorepos

## Dry Run Mode

Test your installation command before executing it:

```bash
# Test elixir installation
dhti-cli elixir install \
  -n my-elixir \
  -g https://github.com/org/monorepo.git \
  -s packages/my-elixir \
  --dry-run

# Test conch installation
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
│   ├── elixir-chatbot/
│   │   ├── pyproject.toml
│   │   └── src/
│   ├── elixir-summarizer/
│   │   ├── pyproject.toml
│   │   └── src/
│   └── shared-utils/
│       ├── pyproject.toml
│       └── src/
```

Install the chatbot elixir:

```bash
dhti-cli elixir install \
  -n dhti-elixir-chatbot \
  -g https://github.com/myorg/my-dhti-monorepo.git \
  -s packages/elixir-chatbot \
  -b main
```

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
