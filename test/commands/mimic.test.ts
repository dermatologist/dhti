import {runCommand} from '@oclif/test'
import {expect} from 'chai'

describe('mimic', () => {
  it('runs mimic cmd', async () => {
    const {stdout} = await runCommand('mimic')
  })

})
