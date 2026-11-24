import {ChatPromptTemplate} from '@langchain/core/prompts'
import {RunnableLambda} from '@langchain/core/runnables'
import {FakeListChatModel} from '@langchain/core/utils/testing'
import {expect} from 'chai'

import {ChainService} from '../../src/utils/chain'

describe('ChainService', () => {
  it('should instantiate with a container', () => {
    const container = {}
    const service = new ChainService(container)
    expect(service).to.be.instanceOf(ChainService)
    expect(service.container).to.equal(container)
  })

  it('should call Chain and return output', async () => {
    // Create proper LangChain runnables for testing
    const mockPrompt = ChatPromptTemplate.fromTemplate('{input}')
    const mockMainLLM = new FakeListChatModel({
      responses: ['test response'],
    })
    const container = {
      resolve(name: string) {
        if (name === 'prompt') return mockPrompt
        if (name === 'main-llm') return mockMainLLM
      },
    }
    const service = new ChainService(container)
    const result = await service.Chain({input: 'test'})
    expect(result).to.equal('test response')
  })
})
