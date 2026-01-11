import React, { useEffect, useState } from 'react';
import { useConfig, openmrsFetch, fhirBaseUrl } from '@openmrs/esm-framework';
import useSWR from 'swr';
import styles from './glycemic.scss';
import { useDhti } from './hooks/useDhti';

interface GlycemicWidgetProps {
    patientUuid: string;
}

const GlycemicWidget: React.FC<GlycemicWidgetProps> = ({ patientUuid }) => {
    const config = useConfig();
    const serviceName = config?.dhtiServiceName || 'dhti_elixir_glycemic';
    const { submitMessage, loading: aiLoading, error: aiError } = useDhti();
    const [aiResponse, setAiResponse] = useState<any>(null);

    // Check for Diabetes (SNOMED 44054006)
    const { data: conditionsData, isLoading: conditionsLoading } = useSWR<any>(
        patientUuid ? `${fhirBaseUrl}/Condition?patient=${patientUuid}&code=44054006` : null,
        openmrsFetch
    );

    const isDiabetic = conditionsData?.data?.entry?.length > 0;

    // Fetch HbA1c (4548-4) and Glucose (2339-0) observations
    const { data: obsData, isLoading: obsLoading } = useSWR<any>(
        isDiabetic ? `${fhirBaseUrl}/Observation?patient=${patientUuid}&code=4548-4,2339-0&_sort=-date&_count=5` : null,
        openmrsFetch
    );

    useEffect(() => {
        if (!isDiabetic && !aiResponse && !aiLoading && !aiError) {
            submitMessage('Analyze glycemic control', patientUuid).then(setAiResponse);
        }
    }, [isDiabetic, patientUuid, submitMessage, aiResponse, aiLoading, aiError]);

    // if (conditionsLoading) return null;
    // if (!isDiabetic) return null;

    return (
        <div className={styles.container}>
            <div className={styles.header}>
                <h3>{config?.dhtiTitle || 'DHTI Glycemic Widget'}</h3>
            </div>

            <div className={styles.content}>
                <div className={styles.observations}>
                    <h4>Latest Readings</h4>
                    {obsLoading ? (
                        <p>Loading observations...</p>
                    ) : obsData?.data?.entry?.length > 0 ? (
                        <ul>
                            {obsData.data.entry.map((entry: any) => {
                                const obs = entry.resource;
                                const value = obs.valueQuantity ? `${obs.valueQuantity.value} ${obs.valueQuantity.unit}` : obs.valueString;
                                const date = new Date(obs.effectiveDateTime).toLocaleDateString();
                                const name = obs.code?.text || obs.code?.coding?.[0]?.display || 'Observation';
                                return (
                                    <li key={obs.id}>
                                        <strong>{name}:</strong> {value} <small>({date})</small>
                                    </li>
                                );
                            })}
                        </ul>
                    ) : (
                        <p>No recent HbA1c or Glucose readings found.</p>
                    )}
                </div>

                <div className={styles.aiInsights}>
                    <h4>GenAI Interpretation</h4>
                    {aiLoading && <p>Generating insights...</p>}
                    {aiError && <p className={styles.error}>Error: {aiError}</p>}
                    {aiResponse && (
                        <div className={styles.aiContent}>
                            <p>{aiResponse.summary}</p>
                            {aiResponse.detail && <p><small>{aiResponse.detail}</small></p>}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default GlycemicWidget;
