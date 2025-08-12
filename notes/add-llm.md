
# Swapping the LLM

## Update bootstrap (~/dhti/elixir/app/bootstrap.py)

```
....
....

## Override the default configuration of elixirs here if needed
from langchain_google_genai import ChatGoogleGenerativeAI


def bootstrap():
    load_dotenv()
    fake_llm = FakeListLLM(responses=["Paris", "I don't know"])
    llm = ChatGoogleGenerativeAI(
        model="gemini-2.5-flash"
    )
    di["main_prompt"] = PromptTemplate.from_template(
        "Summarize the following in 100 words: {input}"
    )
    di["main_llm"] = llm
```

## Add langchain-google-genai dependency (~/dhti/elixir/pyproject.toml)

```
[tool.poetry.dependencies]
dhti-elixir-template = { git = "https://github.com/dermatologist/dhti-elixir-template.git", branch = "develop" }
python = ">=3.10.0,<4.0"
langserve = { version = ">=0.0.51", extras = ["server"] }
langfuse = ">=2.31.0"
tiktoken = ">=0.4.0"
uvicorn = {extras = ["standard"], version = ">=0.22.0"}
langchain-google-genai = "*"
```

## Add Google API Key (~/dhti/docker-compose.yml)

```

....
....

  langserve:
    image: beapen/genai-test:1.0
    pull_policy: if_not_present
    ports:
      - '8001:8001'
    restart: unless-stopped
    environment:
      - OLLAMA_SERVER_URL==http://ollama:11434
      - OLLAMA_WEBUI=http://ollama-webui:8080
      - LANGFUSE_HOST=http://langfuse:3000
      - LANGFUSE_PUBLIC_KEY=pk-lf-abcd
      - LANGFUSE_SECRET_KEY=sk-lf-abcd
      - GOOGLE_API_KEY=YourAPIKey

....

```
