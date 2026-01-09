# Quick Start Guide

This is a condensed reference for using the start-dhti skill to create complete DHTI applications.

## Basic Workflow

```
1. Generate Elixir → 2. Generate Conch → 3. Setup Infrastructure → 
4. Install Elixir → 5. Install Conch → 6. Start Server → 7. Verify
```

## Minimal Example

### Requirements

**Elixir**: Simple patient information retrieval
- Project: `dhti-elixir-simple`
- Functionality: Query patient demographics and return summary

**Conch**: Display patient summary widget
- Project: `openmrs-esm-dhti-simple`
- Location: Patient chart summary tab

### Invocation

```
Create a simple DHTI application:

Elixir: dhti-elixir-simple
- Query patient demographics from FHIR
- Return formatted patient summary

Conch: openmrs-esm-dhti-simple
- Display in patient chart summary tab
- Show patient summary from DHTI service

Use start-dhti skill.
```

## Command Reference

### Infrastructure Setup

```bash
# Minimal setup (OpenMRS + LangServe)
npx dhti-cli compose add -m openmrs -m langserve

# Full setup (with all optional services)
npx dhti-cli compose add -m openmrs -m langserve -m ollama -m langfuse -m redis -m neo4j -m cqlFhir -m mcpFhir

# Common setups
# Development: -m openmrs -m langserve -m redis
# Production: -m openmrs -m langserve -m ollama -m langfuse -m redis
# Research: -m openmrs -m langserve -m neo4j -m cqlFhir
```

### Elixir Installation

```bash
# From local directory
npx dhti-cli elixir install -l /path/to/elixir -n elixir-name

# With dry-run
npx dhti-cli elixir install -l /path/to/elixir -n elixir-name --dry-run

# Build Docker image
npx dhti-cli docker -n username/image-name:tag -t elixir
```

### Conch Installation

```bash
# From local directory
npx dhti-cli conch install -l /path/to/conch -n conch-name

# With dry-run
npx dhti-cli conch install -l /path/to/conch -n conch-name --dry-run

# Build Docker image
npx dhti-cli docker -n username/image-name:tag -t conch
```

### Server Management

```bash
# Start all services
npx dhti-cli docker -u

# Stop and remove all services
npx dhti-cli docker -d

# Restart specific service
docker restart dhti-langserve-1

# View logs
docker compose logs -f
docker compose logs dhti-langserve-1
```

### Development Mode

```bash
# Elixir hot reload
npx dhti-cli elixir dev -d /path/to/elixir -n elixir-name

# Conch hot reload
npx dhti-cli conch dev -d /path/to/conch -n conch-name
```

## Common Patterns

### Pattern 1: Basic Patient Data App

**Use Case**: Display patient information

**Elixir**:
- FHIR Resources: Patient, Observation
- Logic: Query and format data
- Output: Structured JSON

**Conch**:
- Location: Patient chart
- Display: Cards or tables
- Interaction: Read-only

### Pattern 2: Clinical Decision Support

**Use Case**: Alert on specific conditions

**Elixir**:
- FHIR Resources: Observation, Condition, MedicationRequest
- Logic: Rule-based + AI analysis
- Output: Alerts and recommendations

**Conch**:
- Location: Patient chart (relevant tab)
- Display: Alert banners, recommendation cards
- Interaction: Accept/dismiss alerts

### Pattern 3: Chatbot Interface

**Use Case**: Conversational EMR interaction

**Elixir**:
- FHIR Resources: Any (based on query)
- Logic: NLU + FHIR search + LLM
- Output: Natural language responses

**Conch**:
- Location: Standalone page or chat panel
- Display: Chat interface
- Interaction: Text input, conversation history

### Pattern 4: Data Visualization

**Use Case**: Trend analysis and charts

**Elixir**:
- FHIR Resources: Observation (time series)
- Logic: Data aggregation + analysis
- Output: Time series data + insights

**Conch**:
- Location: Patient chart (summary or dedicated tab)
- Display: Charts, graphs, tables
- Interaction: Date range selection, export

## Troubleshooting Quick Reference

| Issue | Quick Fix |
|-------|-----------|
| Port already in use | Stop conflicting service or change port in compose |
| Docker build fails | Check Dockerfile, ensure resources exist |
| Elixir import error | Verify path in pyproject.toml |
| Conch not visible | Check routes.json, verify extension registration |
| AI responses empty | Check LLM configuration, verify API keys |
| FHIR queries fail | Verify FHIR server URL, check resource existence |
| Services won't start | Check Docker resources, verify compose syntax |
| OpenMRS login fails | Wait for initialization (2-3 min), check logs |

## Time Estimates

| Phase | Time |
|-------|------|
| Elixir generation | 5-15 min |
| Conch generation | 5-15 min |
| Infrastructure setup | 2-5 min |
| Installation & build | 5-10 min |
| Service startup | 3-5 min |
| Verification | 5-10 min |
| **Total** | **25-60 min** |

## Pre-flight Checklist

Before invoking start-dhti skill:

- [ ] Node.js >= 18 installed
- [ ] Docker running
- [ ] Python 3.x installed
- [ ] ~10 GB free disk space
- [ ] Ports 80, 8000, 8080 available
- [ ] Clear requirements for elixir
- [ ] Clear requirements for conch
- [ ] Project names decided (dhti-elixir-*, openmrs-esm-dhti-*)

## Post-completion Checklist

After skill completes:

- [ ] All services running (`docker ps`)
- [ ] OpenMRS accessible (http://localhost/openmrs/spa/)
- [ ] Can login to OpenMRS (admin/Admin123)
- [ ] Conch visible in UI
- [ ] Elixir endpoint in LangServe docs (http://localhost:8000/docs)
- [ ] Integration works end-to-end
- [ ] Documentation reviewed
- [ ] Cleanup commands documented

## Common Docker Compose Configurations

### Minimal (Development)
```yaml
services:
  - OpenMRS
  - LangServe
  - FHIR Server (HAPI)
  - PostgreSQL (FHIR)
  - PostgreSQL (OpenMRS)
  - Gateway (Nginx)
```

### Standard (Development + Analytics)
```yaml
services:
  - OpenMRS
  - LangServe
  - FHIR Server (HAPI)
  - Redis (Vector Store)
  - PostgreSQL (FHIR)
  - PostgreSQL (OpenMRS)
  - Gateway (Nginx)
```

### Full (Production-like)
```yaml
services:
  - OpenMRS
  - LangServe
  - FHIR Server (HAPI)
  - Ollama (Local LLM)
  - Langfuse (Monitoring)
  - Redis (Vector Store)
  - Neo4j (Graph DB)
  - MCP Server (FHIR Tools)
  - PostgreSQL (FHIR)
  - PostgreSQL (OpenMRS)
  - Gateway (Nginx)
```

## Access URLs

After services start:

| Service | URL | Credentials |
|---------|-----|-------------|
| OpenMRS | http://localhost/openmrs/spa/ | admin/Admin123 |
| LangServe Docs | http://localhost:8000/docs | N/A |
| FHIR Server | http://localhost:8080/fhir | N/A |
| Langfuse (if enabled) | http://localhost:3000 | See docs |
| Neo4j (if enabled) | http://localhost:7474 | neo4j/password |

## Environment Variables

Common configurations in `~/dhti/elixir/app/bootstrap.py`:

```python
# LLM Configuration
OPENAI_API_KEY = os.getenv("OPENAI_API_KEY", "")
OLLAMA_BASE_URL = os.getenv("OLLAMA_BASE_URL", "http://ollama:11434")

# FHIR Configuration
FHIR_BASE_URL = os.getenv("FHIR_BASE_URL", "http://cqlfhir:8080/fhir")

# Monitoring
LANGFUSE_PUBLIC_KEY = os.getenv("LANGFUSE_PUBLIC_KEY", "")
LANGFUSE_SECRET_KEY = os.getenv("LANGFUSE_SECRET_KEY", "")
```

## Testing Checklist

- [ ] Elixir tests pass
- [ ] Conch tests pass
- [ ] Docker images build successfully
- [ ] Services start without errors
- [ ] OpenMRS login works
- [ ] Conch visible in correct location
- [ ] Elixir endpoint responds
- [ ] Integration works (conch → elixir → response)
- [ ] Error handling works
- [ ] Loading states work
- [ ] Logs show no critical errors

## Next Steps After Completion

1. **Version Control**:
   ```bash
   cd dhti-elixir-<name>
   git init && git add . && git commit -m "Initial commit"
   gh repo create --private --source=.
   git push -u origin main
   ```

2. **Iterate**:
   - Make changes to elixir/conch
   - Use dev mode for hot reload
   - Test changes immediately

3. **Document**:
   - Update README files
   - Add usage examples
   - Document configuration options

4. **Share**:
   - Push Docker images to registry
   - Share Git repository with team
   - Write deployment guide

5. **Deploy**:
   - Test in staging environment
   - Gather feedback
   - Plan production deployment

## Resources

- [DHTI Documentation](https://dermatologist.github.io/dhti/)
- [DHTI Wiki](https://github.com/dermatologist/dhti/wiki)
- [OpenMRS O3 Docs](https://o3-docs.openmrs.org/)
- [LangChain Docs](https://python.langchain.com/)
- [FHIR Specification](https://www.hl7.org/fhir/)

## Tips

- Always use dry-run first to verify commands
- Keep elixir and conch in separate directories
- Use descriptive project names
- Document as you go
- Test incrementally
- Use version control early
- Monitor Docker logs during development
- Keep compose configuration minimal initially
- Add services as needed
- Use Ollama for privacy-sensitive data
