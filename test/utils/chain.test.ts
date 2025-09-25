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
    // Mock container with resolve
    const mockPrompt = (input: any) => input + ' prompt'
    const mockMainLLM = (input: any) => input + ' llm'
    const container = {
      resolve(name: string) {
        if (name === 'prompt') return mockPrompt
        if (name === 'main-llm') return mockMainLLM
      },
    }
    const service = new ChainService(container)
    const result = await service.Chain('test')
    expect(result).to.equal('test prompt llm')
  })
})
