# Restart gateway
dhti-cli docker -g

# Restart any container
dhti-cli docker -r dhti-langserve-1

# Preview without executing
dhti-cli docker -g --dry-run