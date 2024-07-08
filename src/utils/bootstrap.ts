import "reflect-metadata";

import {Ollama } from "@langchain/community/llms/ollama";
import { ChatPromptTemplate} from "@langchain/core/prompts";
import { container } from "tsyringe";
// import { VertexAI } from "@langchain/google-vertexai";
// import { GoogleVertexAIEmbeddings } from "@langchain/community/embeddings/googlevertexai";

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
    main_llm = ollama;
    // }



    // const main_llm = new OllamaFunctions({
    //     temperature: 0.6,
    //     model: "phi3",
    //     numPredict: 32,
    // });



    const gen_prompt = ChatPromptTemplate.fromMessages([
    [
        "system",
        "You are a medical doctor.",
    ],
    ["human", "{question}"],
    ]);


    const prompt = gen_prompt;


    container.register("main-llm", {
        useValue: main_llm,
    });


    container.register("prompt", {
        useValue: prompt,
    });



    return container;
}

export default bootstrap;