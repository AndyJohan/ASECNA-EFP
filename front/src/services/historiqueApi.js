import { httpClient } from './httpClient';

export async function fetchHistoriqueSummary(period) {
  const { data } = await httpClient.get('/historique/summary', {
    params: period ? { period } : undefined,
  });
  return data;
}

export async function fetchHistoriqueDetails(period) {
  const { data } = await httpClient.get('/historique/details', {
    params: period ? { period } : undefined,
  });
  return Array.isArray(data) ? data : [];
}

export async function uploadHistoriqueFile(formData, config = {}) {
  const { data } = await httpClient.post('/import/upload', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
    ...config,
  });
  return data;
}
