from fastapi import FastAPI
from langserve import add_routes
from langchain_core.runnables.config import RunnableConfig
from langfuse import Langfuse
from langfuse.callback import CallbackHandler
from pirate_speak.chain import chain as pirate_speak_chain
langfuse_handler = CallbackHandler()

# Tests the SDK connection with the server
langfuse_handler.auth_check()
config = RunnableConfig(callbacks=[langfuse_handler])

app = FastAPI(title="LangServe Launch Example")

add_routes(app, pirate_speak_chain.with_config(config), path="/pirate-speak")

if __name__ == "__main__":
    import uvicorn

    uvicorn.run(app, host="0.0.0.0", port=8001)