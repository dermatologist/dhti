from kink import di
import os
from dotenv import load_dotenv
from langchain.chat_models import init_chat_model
from langchain_community.llms.fake import FakeListLLM
from langchain_core.prompts import PromptTemplate
from langchain_google_genai import ChatGoogleGenerativeAI
from langchain_openai import ChatOpenAI

## Override the default configuration of elixirs here if needed


def bootstrap():
    load_dotenv()
    di["fhir_access_token"] = os.environ.get(
        "FHIR_ACCESS_TOKEN", "YWRtaW46QWRtaW4xMjM="
    )  # admin:Admin123 in base64
    di["fhir_base_url"] = os.environ.get(
        "FHIR_BASE_URL", "http://backend:8080/openmrs/ws/fhir2/R4"
    )
    # Check if google api key is set in the environment
    if os.environ.get("GOOGLE_API_KEY"):
        llm = ChatGoogleGenerativeAI(model="gemini-2.5-flash")
    # Check if openai api key is set in the environment
    elif os.environ.get("OPENAI_API_KEY"):
        llm = ChatOpenAI(model="gpt-4o", temperature=0)
    else:
        llm = FakeListLLM(responses=["I am a fake LLM", "I don't know"])
    di["main_llm"] = llm

    openrouter_api_key = os.environ.get("OPENROUTER_API_KEY")
    if openrouter_api_key:
        model = init_chat_model(
            model="nvidia/nemotron-nano-9b-v2:free",
            model_provider="openai",
            base_url="https://openrouter.ai/api/v1",
            api_key=openrouter_api_key,
        )
    else:
        # Fallback to the main LLM if no OpenRouter API key is configured
        model = llm

    di["function_llm"] = model
    di["main_prompt"] = PromptTemplate.from_template(
        "Summarize the following in 100 words: {input}"
    )
    di["cds_hook_discovery"] = {
        "services": [
            {
                "id": "dhti-service",
                "hook": "order-select",
                "title": "MyOrg Order Assistant",
                "description": "Provides suggestions and actions for selected draft orders, including handling CommunicationRequest resources.",
                "prefetch": {
                    "patient": "Patient/{{context.patientId}}",
                    "draftOrders": "Bundle?patient={{context.patientId}}&status=draft",
                },
                "scopes": [
                    "launch",
                    "patient/Patient.read",
                    "user/Practitioner.read",
                    "patient/CommunicationRequest.read",
                ],
                "metadata": {
                    "author": "MyOrg CDS Team",
                    "version": "1.0.0",
                    "supportedResources": [
                        "CommunicationRequest",
                    ],
                },
            }
        ]
    }
