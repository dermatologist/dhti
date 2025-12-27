# MCPX Aggregator and Docktor

This document describes the integration of MCPX and the `docktor` command in DHTI.

## Architecture

DHTI uses [MCPX](https://github.com/TheLunarCompany/lunar/tree/main/mcpx) (Model Context Protocol Gateway) to aggregate multiple Model Context Protocol (MCP) servers. This allows agentic tools to interact with various inference pipelines through a single gateway.

The `docktor` command manages these inference pipelines, which are packaged as Docker images. Each pipeline exposes its functionality as an MCP server.

### Components

1.  **MCPX Container**: The gateway that manages and exposes tools from connected MCP servers.
2.  **Inference Pipelines**: Docker containers running MCP servers (e.g., for skin cancer classification).
3.  **Docktor CLI**: A command-line tool to add, remove, and list inference pipelines in the MCPX configuration.

## Usage

### Prerequisites
- DHTI CLI installed.
- Docker running.

### Adding an Inference Pipeline

To add a new pipeline, use the `docktor install` command:

```bash
dhti-cli docktor install my-pipeline --image my-image:latest --model-path ./path/to/models

dhti-cli docktor install my-pipeline --image my-image:latest --model-path ./path/to/models -e DEBUG=true
```

- `install`: The operation to perform.
- `my-pipeline`: A unique name for the server.
- `--image`: The Docker image containing the MCP server.
- `--model-path`: (Optional) Local path to a directory containing models. This will be mounted to `/model` inside the container.

### Removing an Inference Pipeline

To remove a pipeline:

```bash
dhti-cli docktor remove my-pipeline
```

### Listing Pipelines

To list all installed pipelines:

```bash
dhti-cli docktor list
```

## Creating an Inference Pipeline Docker Image

To create a compatible inference pipeline, follow these recommendations:

1.  **Base Image**: Use a lightweight Python image (e.g., `python:3.9-slim`).
2.  **MCP Sdk**: Install the `mcp` python package.
3.  **Server Logic**: Implement an MCP server that exposes your inference functions as tools.
4.  **Model Loading**: Load models from the `/model` directory.
5.  **Data Handling**: Data can be obtained from the FHIR server or added as filename statrting with patientId in the /model directory. The input to all mcp tools should include the patientId whenever possible.
6.  **Entrypoint**: Set the container entrypoint to run your server script.

### Examples

* See /docktor directory for complete examples.
