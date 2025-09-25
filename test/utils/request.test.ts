import {expect} from 'chai'
import {CDSHookRequest} from '../../src/utils/request'

describe('CDSHookRequest', () => {
  it('should construct with default values', () => {
    const req = new CDSHookRequest()
    expect(req).to.be.instanceOf(CDSHookRequest)
    expect(req.hookInstance).to.be.undefined
    expect(req.fhirServer).to.be.undefined
    expect(req.fhirAuthorization).to.be.undefined
    expect(req.hook).to.be.undefined
    expect(req.context).to.be.undefined
    expect(req.prefetch).to.be.undefined
  })

  it('should construct with initial values', () => {
    const init = {
      hookInstance: 'abc',
      fhirServer: 'https://fhir',
      fhirAuthorization: {token: '123'},
      hook: 'patient-view',
      context: {patientId: 'p1'},
      prefetch: {obs: {}},
    }
    const req = new CDSHookRequest(init)
    expect(req.hookInstance).to.equal('abc')
    expect(req.fhirServer).to.equal('https://fhir')
    expect(req.fhirAuthorization).to.deep.equal({token: '123'})
    expect(req.hook).to.equal('patient-view')
    expect(req.context).to.deep.equal({patientId: 'p1'})
    expect(req.prefetch).to.deep.equal({obs: {}})
  })

  it('should build from plain object using from()', () => {
    const obj = {hook: 'order-select', context: {order: 'med'}}
    const req = CDSHookRequest.from(obj)
    expect(req).to.be.instanceOf(CDSHookRequest)
    expect(req.hook).to.equal('order-select')
    expect(req.context).to.deep.equal({order: 'med'})
  })
})
