/**
 * Shared type definitions for DHTI CLI
 */

/** Docker Compose service configuration */
export interface DockerComposeService {
  image?: string
  environment?: (string | Record<string, string>)[]
  pull_policy?: string
  ports?: (string | number)[]
  volumes?: string[]
  depends_on?: string[]
  [key: string]: unknown
}

/** Docker Compose configuration */
export interface DockerComposeConfig {
  version: string
  services: Record<string, DockerComposeService>
  volumes?: Record<string, unknown>
  networks?: Record<string, unknown>
}

/** MCP (Model Context Protocol) server configuration */
export interface MCPServerConfig {
  command: string
  args: string[]
  env?: Record<string, string>
  [key: string]: unknown
}

/** MCP configuration */
export interface MCPConfig {
  mcpServers: Record<string, MCPServerConfig>
  [key: string]: unknown
}

/** PyProject TOML configuration for Python projects */
export interface PyProjectConfig {
  project: {
    name: string
    version: string
    description?: string
    dependencies?: string[]
    [key: string]: unknown
  }
  build_system?: {
    requires: string[]
    build_backend: string
  }
  [key: string]: unknown
}

/** Server.py template variables */
export interface ServerTemplateVars {
  projectName: string
  dependencies: string[]
  [key: string]: unknown
}
