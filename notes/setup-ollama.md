### Shut down services

```
dhti-cli docker -d
```

### Add Ollama docker containers

```
dhti-cli compose add -m ollama
```

### Restart services

```
dhti-cli docker -u
```

### 💾 Download an LLM/Embedding models to use.
* Go to `localhost:8080`
* Create an account and login in webui. (The account is created in your local machine.)
  - Click on your name on left bottom corner
  - Click on settings -> Admin Panel -> Models
* Download the following models
    - phi3:mini
    - all-minilm