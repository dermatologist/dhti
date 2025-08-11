from kink import di
from os import getenv
from dotenv import load_dotenv
from langchain_core.prompts import PromptTemplate
from langchain_core.language_models.fake import FakeListLLM

## Override the default configuration of elixirs here if needed


def bootstrap():
    load_dotenv()
    fake_llm = FakeListLLM(responses=["Paris", "I don't know"])
    di["main_prompt"] = PromptTemplate.from_template(
        "Summarize the following in 100 words: {input}"
    )
    di["main_llm"] = fake_llm
