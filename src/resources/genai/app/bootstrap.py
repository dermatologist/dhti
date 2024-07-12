from kink import di
from os import getenv
from dotenv import load_dotenv
import dhti_elixir_base # Make sure to import the base package

## Override the default configuration of elixirs here if needed

def bootstrap():
    load_dotenv()
