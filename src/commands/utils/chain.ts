import { StringOutputParser } from "@langchain/core/output_parsers";
import { RunnableSequence } from "@langchain/core/runnables";
import { BaseChain } from "medpromptjs";

export class ChainService extends BaseChain {

    async Chain(input: any) {

        const output = RunnableSequence.from([
        input,
        this.llm,
        new StringOutputParser(),
        ]);
        return  output.invoke(input);
    }

}


