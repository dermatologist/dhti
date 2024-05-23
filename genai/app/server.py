from fastapi import FastAPI
from langserve import add_routes
from langchain_core.runnables.config import RunnableConfig
from pirate_speak.chain import chain as pirate_speak_chain

app = FastAPI(title="LangServe Launch Example")

try:
    from langfuse import Langfuse
    from langfuse.callback import CallbackHandler
    langfuse_handler.auth_check()
    langfuse_handler = CallbackHandler()
    config = RunnableConfig(callbacks=[langfuse_handler])
    add_routes(app, pirate_speak_chain.with_config(config), path="/pirate-speak")
except:
    add_routes(app, pirate_speak_chain, path="/pirate-speak")

if __name__ == "__main__":
    import uvicorn

    uvicorn.run(app, host="0.0.0.0", port=8001)