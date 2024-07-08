import {runCommand} from '@oclif/test'
import {expect} from 'chai'

describe('synthetic', () => {
  it('runs synthetic cmd', async () => {
    const {stdout} = await runCommand('synthetic')
    expect(stdout).to.contain('hello world')
  })

  it('runs synthetic --name oclif', async () => {
    const {stdout} = await runCommand('synthetic --name oclif')
    expect(stdout).to.contain('hello oclif')
  })
})
