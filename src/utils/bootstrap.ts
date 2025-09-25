import { ChatPromptTemplate} from "@langchain/core/prompts";
import {Ollama } from "@langchain/ollama";
import "reflect-metadata";
import { container } from "tsyringe";
// import { VertexAI } from "@langchain/google-vertexai";
// import { GoogleVertexAIEmbeddings } from "@langchain/community/embeddings/googlevertexai";
import { FakeListChatModel } from "@langchain/core/utils/testing";

const bootstrap = async () => {


    let main_llm = null;

    // try{
    // const vertex = new VertexAI({
    //     temperature: 0.6,
    //     maxOutputTokens: 256,
    //     model: "gemini-pro",
    // })
    // main_llm = vertex;
    // } catch (error) {
    const ollama = new Ollama({
        baseUrl: process.env.NEXT_PUBLIC_OLLAMA_URL || "http://localhost:11434",
        model: process.env.NEXT_PUBLIC_OLLAMA_MODEL || "phi3:mini",
        numPredict: 128,
        temperature: 0.6,
    });

    const fake_llm = new FakeListChatModel({
        responses: ["I'll callback later.", "You 'console' them!"],
    });

    main_llm = fake_llm;
    // }



    // const main_llm = new OllamaFunctions({
    //     temperature: 0.6,
    //     model: "phi3:mini",
    //     numPredict: 32,
    // });



    const gen_prompt = ChatPromptTemplate.fromMessages([
    [
        "system",
        "You are a medical doctor.",
    ],
    ["human", "{input}"],
    ]);

    const instruct_prompt = ChatPromptTemplate.fromMessages([
    [
        "system",
        "You are a HL7 FHIR expert.",
    ],
    ["human", "{prompt} {input}"],
    ]);


    const prompt = instruct_prompt;


    container.register("main-llm", {
        useValue: main_llm,
    });


    container.register("prompt", {
        useValue: prompt,
    });



    return container;
}

export default bootstrap;