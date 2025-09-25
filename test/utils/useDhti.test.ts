import axios from 'axios'
import {expect} from 'chai'
import sinon from 'sinon'

import {CDSHookRequest} from '../../src/utils/request'
import handleBundle from '../../src/utils/useDhti'

describe('handleBundle', () => {
  let postStub: sinon.SinonStub

  beforeEach(() => {
    postStub = sinon.stub(axios, 'post')
  })

  afterEach(() => {
    postStub.restore()
  })

  it('should send a POST request with correct structure', async () => {
    postStub.resolves({data: 'ok'})
    const message = 'hello world'
    await handleBundle(message)
    expect(postStub.calledOnce).to.be.true
    const [url, body] = postStub.firstCall.args
    expect(url).to.equal('/langserve/dhti_elixir_template/invoke')
    expect(body.input.input).to.be.instanceOf(CDSHookRequest)
    expect(body.input.input.context).to.deep.equal({input: message})
    expect(body.config).to.deep.equal({})
    expect(body.kwargs).to.deep.equal({})
  })
})
