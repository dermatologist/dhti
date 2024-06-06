from fastapi import FastAPI
from langserve import add_routes
from langchain_core.runnables.config import RunnableConfig
from pirate_speak.chain import chain as pirate_speak_chain
from dhti_elixir_fhire import chain as fhire_chain

from .bootstrap import bootstrap
bootstrap()

app = FastAPI(title="LangServe Launch Example")

try:
    from langfuse import Langfuse
    from langfuse.callback import CallbackHandler
    langfuse_handler.auth_check()
    langfuse_handler = CallbackHandler()
    config = RunnableConfig(callbacks=[langfuse_handler])
    add_routes(app, pirate_speak_chain.with_config(config), path="/pirate-speak")
    add_routes(app, fhire_chain.with_config(config), path="/fhire")
except:
    add_routes(app, pirate_speak_chain, path="/pirate-speak")
    add_routes(app, fhire_chain, path="/fhire")

if __name__ == "__main__":
    import uvicorn

    uvicorn.run(app, host="0.0.0.0", port=8001)