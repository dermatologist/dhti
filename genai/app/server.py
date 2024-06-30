from fastapi import FastAPI
from langserve import add_routes
from langchain_core.runnables.config import RunnableConfig
# ! DO NOT REMOVE THE COMMENT BELOW
#DHTI_CLI_IMPORT_BEGIN
from dhti_elixir_fhire import chain as fhire_chain
#DHTI_CLI_IMPORT_END
import uvicorn

from bootstrap import bootstrap
bootstrap()

app = FastAPI(title="LangServe Launch Example")

try:
    from langfuse import Langfuse
    from langfuse.callback import CallbackHandler
    langfuse_handler.auth_check()
    langfuse_handler = CallbackHandler()
    config = RunnableConfig(callbacks=[langfuse_handler])
    # ! DO NOT REMOVE THE COMMENT BELOW
    #DHTI_CLI_LANGFUSE_BEGIN
    add_routes(app, fhire_chain.with_config(config), path="/fhire")
    #DHTI_CLI_LANGFUSE_END
except:
    # ! DO NOT REMOVE THE COMMENT BELOW
    #DHTI_CLI_ROUTE_BEGIN
    add_routes(app, fhire_chain, path="/fhire")
    #DHTI_CLI_ROUTE_END

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8001)