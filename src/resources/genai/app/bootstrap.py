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
