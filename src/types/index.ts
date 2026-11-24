/**
 * Shared type definitions for DHTI CLI
 */

/** Docker Compose service configuration */
export interface DockerComposeService {
  [key: string]: unknown
  depends_on?: string[]
  environment?: (Record<string, string> | string)[]
  image?: string
  ports?: (number | string)[]
  pull_policy?: string
  volumes?: string[]
}

/** Docker Compose configuration */
export interface DockerComposeConfig {
  networks?: Record<string, unknown>
  services: Record<string, DockerComposeService>
  version: string
  volumes?: Record<string, unknown>
}

/** MCP (Model Context Protocol) server configuration */
export interface MCPServerConfig {
  [key: string]: unknown
  args: string[]
  command: string
  env?: Record<string, string>
}

/** MCP configuration */
export interface MCPConfig {
  [key: string]: unknown
  mcpServers: Record<string, MCPServerConfig>
}

/** PyProject TOML configuration for Python projects */
export interface PyProjectConfig {
  [key: string]: unknown
  build_system?: {
    build_backend: string
    requires: string[]
  }
  project: {
    [key: string]: unknown
    dependencies?: string[]
    description?: string
    name: string
    version: string
  }
}

/** Server.py template variables */
export interface ServerTemplateVars {
  [key: string]: unknown
  dependencies: string[]
  projectName: string
}
