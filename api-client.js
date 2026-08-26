/*
  REST boundary for a future FastAPI / YOLO / OpenCV backend.
  Example endpoint flow:
  POST /api/uploads -> { imageUrl }
  POST /api/analysis -> { detections, risks, compliance }
  POST /api/inspections -> persisted inspection record
*/
const API_BASE_URL = '/api';

async function request(path, options = {}) {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    headers: { 'Content-Type': 'application/json', ...options.headers },
    ...options
  });
  if (!response.ok) throw new Error(`API request failed: ${response.status}`);
  return response.status === 204 ? null : response.json();
}

export const inspectionApi = {
  uploadImage(file) {
    const body = new FormData();
    body.append('file', file);
    return fetch(`${API_BASE_URL}/uploads`, { method: 'POST', body }).then(r => r.json());
  },
  analyzeImage(imageUrl, metadata) {
    return request('/analysis', { method: 'POST', body: JSON.stringify({ image_url: imageUrl, ...metadata }) });
  },
  createInspection(payload) {
    return request('/inspections', { method: 'POST', body: JSON.stringify(payload) });
  },
  listInspections(filters = {}) {
    const query = new URLSearchParams(filters).toString();
    return request(`/inspections?${query}`);
  }
};
