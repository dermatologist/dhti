import {StringOutputParser} from '@langchain/core/output_parsers'

export class ChainService {
  container: any

  constructor(container: any) {
    this.container = container
  }

  async Chain(input: any) {
    const prompt = this.container.resolve('prompt')
    const llm = this.container.resolve('main-llm')
    const outputParser = new StringOutputParser()

    // Create chain using pipe() method
    const chain = prompt.pipe(llm).pipe(outputParser)
    return chain.invoke(input)
  }
}
