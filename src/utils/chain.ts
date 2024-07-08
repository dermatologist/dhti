import { StringOutputParser } from "@langchain/core/output_parsers";
import { RunnableSequence } from "@langchain/core/runnables";

export class ChainService {

    container: any;

    constructor(container: any) {
        this.container = container;
    }

    async Chain(input: any) {

        const output = RunnableSequence.from([
        input,
        this.container.resolve("main-llm"),
        new StringOutputParser(),
        ]);
        return  output.invoke(input);
    }

}


