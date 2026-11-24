import {fhirBaseUrl, openmrsFetch, useConfig} from '@openmrs/esm-framework'
import axios from 'axios'
import {useState} from 'react'

import {CDSHookCard} from '../models/card'
import {CDSHookRequest} from '../models/request'

interface UseDhtiReturn {
  error: null | string
  loading: boolean
  submitMessage: (newMessage: string, patientId?: string) => Promise<CDSHookCard | null>
}

/**
 * Custom hook to handle DHTI service submissions
 * @returns Object with submitMessage function, loading state, and error state
 */
export const useDhti = (): UseDhtiReturn => {
  const [loading, setLoading] = useState<boolean>(false)
  const [error, setError] = useState<null | string>(null)
  const config = useConfig()

  const submitMessage = async (newMessage: string, patientId?: string): Promise<CDSHookCard | null> => {
    setLoading(true)
    setError(null)

    try {
      const request = new CDSHookRequest({
        context: {input: newMessage, patientId: patientId || undefined},
      })

      // TODO: Investigate why nested input is required
      const _request = {
        input: request,
      }

      const response = await axios.post(
        config?.dhtiRoute || 'http://localhost:8001/langserve/dhti_elixir_template/cds-services/dhti-service',
        {
          config: {},
          input: _request,
          kwargs: {},
        },
        {
          headers: {
            'Access-Control-Allow-Origin': '*',
          },
        },
      )

      // Assuming the response contains a card or cards
      if (response.data && response.data.cards && response.data.cards.length > 0) {
        return CDSHookCard.from(response.data.cards[0])
      }

 if (response.data && response.data.summary) {
        // Handle case where response is directly a card (must have summary property)
        return CDSHookCard.from(response.data)
      }

      return null
    } catch (error_: any) {
      const errorMessage = error_.response?.data?.message || error_.message || 'Failed to submit message'
      setError(errorMessage)
      return null
    } finally {
      setLoading(false)
    }
  }

  return {error, loading, submitMessage}
}
