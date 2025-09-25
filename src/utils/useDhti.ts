import axios from 'axios'
import {CDSHookRequest} from './request'

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

  const endpoint = process.env.LANGSERVE_POST_ENDPOINT || '/langserve/dhti_elixir_template/invoke'
  return axios.post(endpoint, {
    input: _request,
    config: {},
    kwargs: {},
  })
}

export default handleBundle
