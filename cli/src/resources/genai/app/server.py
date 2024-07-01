from fastapi import FastAPI
from langserve import add_routes
from langchain_core.runnables.config import RunnableConfig
# ! DO NOT REMOVE THE COMMENT BELOW
#DHTI_CLI_IMPORT
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
    #DHTI_CLI_LANGFUSE
    
except:
    # ! DO NOT REMOVE THE COMMENT BELOW
    #DHTI_CLI_ROUTE

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8001)