from fastapi import FastAPI
from langserve import add_routes
from langchain_core.runnables.config import RunnableConfig
from dhti_elixir_base.cds_hook.routes import add_services, add_invokes
from fastapi.middleware.cors import CORSMiddleware

# ! DO NOT REMOVE THE COMMENT BELOW
#DHTI_CLI_IMPORT
import uvicorn

# Comes after elixir bootstraps, so can override elixir configurations
from bootstrap import bootstrap
bootstrap()

app = FastAPI(title="LangServe Launch Example")

origins = [
    "*",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

try:
    from langfuse import Langfuse
    from langfuse.callback import CallbackHandler
    langfuse_handler.auth_check()
    langfuse_handler = CallbackHandler()
    config = RunnableConfig(callbacks=[langfuse_handler])
    # ! DO NOT REMOVE THE COMMENT BELOW
    #DHTI_LANGFUSE_ROUTE

except:
    # ! DO NOT REMOVE THE COMMENT BELOW
    #DHTI_NORMAL_ROUTE
    x = True

# ! DO NOT REMOVE THE COMMENT BELOW
#DHTI_COMMON_ROUTE


if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8001)
