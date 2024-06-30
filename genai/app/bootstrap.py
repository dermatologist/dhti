from kink import di
from dotenv import load_dotenv
import dhti_elixir_base # Make sure to import the base package
from langchain_community.llms import Ollama
from langchain_core.prompts import PromptTemplate
from os import getenv
from langchain_community.vectorstores import Redis
from pkg_resources import resource_filename
# from langchain_community.embeddings import HuggingFaceEmbeddings
from langchain_community.embeddings import OllamaEmbeddings


# Create vectorstore
# _embedder = HuggingFaceEmbeddings(model_name=getenv("EMBEDDING_MODEL", "BAAI/bge-small-en-v1.5"))
_embedder = OllamaEmbeddings(
    model="all-minilm",
    base_url="http://ollama:11434",
)

def create_vectorstore(chunks, patient_id):
    # Store in Redis
    db = Redis.from_texts(
        texts=[chunk["page_content"] for chunk in chunks],
        metadatas=[chunk["metadata"] for chunk in chunks],
        embedding=_embedder,
        index_name=patient_id,
        index_schema=resource_filename(__name__, '') + '/redis_schema.yaml',
        redis_url=getenv("REDIS_URL", "redis://redis:6379")
    )
    assert db is not None
    return True

def read_vectorstore(patient_id):
    return Redis.from_existing_index(
                embedding=_embedder,
                index_name=patient_id,
                schema=resource_filename(__name__, '') + '/redis_schema.yaml',
                redis_url=getenv("REDIS_URL", "redis://redis:6379")
            )

def bootstrap():
    load_dotenv()
    di["main_prompt"] = PromptTemplate.from_template("{input}")
    di["main_llm"] = Ollama(model="phi3", verbose=True, base_url="http://ollama:11434")
    di["clinical_llm"] = Ollama(
        model="phi3",
        verbose=True,
        base_url="http://ollama:11434",
        temperature=0.1,
        )
    di["rag_k"] = getenv("RAG_K", 3)
    di["create_vectorstore"] = create_vectorstore
    di["read_vectorstore"] = read_vectorstore