import { StringOutputParser } from "@langchain/core/output_parsers";
import { RunnablePassthrough, RunnableSequence } from "@langchain/core/runnables";

export class ChainService {

    container: any;

    constructor(container: any) {
        this.container = container;
    }

    async Chain(input: any) {

        const output = RunnableSequence.from([
        new RunnablePassthrough(),
        this.container.resolve("prompt"),
        this.container.resolve("main-llm"),
        new StringOutputParser(),
        ]);
        return  output.invoke(input);
    }

}


