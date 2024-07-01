import {runCommand} from '@oclif/test'
import {expect} from 'chai'

describe('compose', () => {
  it('runs compose cmd', async () => {
    const {stdout} = await runCommand('compose')
    expect(stdout).to.contain('hello world')
  })

  it('runs compose --name oclif', async () => {
    const {stdout} = await runCommand('compose --name oclif')
    expect(stdout).to.contain('hello oclif')
  })
})
