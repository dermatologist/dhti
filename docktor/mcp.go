package main

import (
	"context"
	"fmt"
	"log"
	"os"
	"path/filepath"

	"github.com/modelcontextprotocol/go-sdk/mcp"
)

type Input struct {
	PatientId string `json:"patientId" jsonschema:"the ID of the patient"`
}

type Output struct {
	Summary string `json:"summary" jsonschema:"the summary of the file"`
}

func SayHi(ctx context.Context, req *mcp.CallToolRequest, input Input) (
	*mcp.CallToolResult,
	Output,
	error,
) {
	filePath := filepath.Join("/model", input.PatientId+".txt")
	content, err := os.ReadFile(filePath)
	if err != nil {
		return nil, Output{Summary: fmt.Sprintf("Error reading file: %v", err)}, fmt.Errorf("failed to read file %s: %w", filePath, err)
	}
	return nil, Output{Summary: string(content)}, nil
}

func main() {
	// Create a server with a single tool.
	server := mcp.NewServer(&mcp.Implementation{Name: "summarizer", Version: "v1.0.0"}, nil)
	mcp.AddTool(server, &mcp.Tool{Name: "summarize", Description: "summarize file content"}, SayHi)
	// Run the server over stdin/stdout, until the client disconnects.
	if err := server.Run(context.Background(), &mcp.StdioTransport{}); err != nil {
		log.Fatal(err)
	}
}