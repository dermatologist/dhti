import axios from 'axios'

import {CDSHookRequest} from './request.js'

/**
 * Sends a CDS Hook Request where the request.context contains the user's input message.
 */
const handleBundle = (newMessage: string) => {
  const request = new CDSHookRequest({
    context: {input: newMessage},
  })

  // TODO: Investigate why nested input is required
  const _request = {
    input: request,
  }

  const endpoint = process.env.LANGSERVE_POST_ENDPOINT || '/langserve/dhti_elixir_template/cds-services/dhti-service'
  return axios.post(endpoint, {
    config: {},
    input: _request,
    kwargs: {},
  })
}

export default handleBundle
