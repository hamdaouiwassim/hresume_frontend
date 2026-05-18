import axiosInstance from '../api/axiosInstance';

export async function createCheckoutSession(region) {
  const body = region ? { region } : {};
  return axiosInstance.post('/billing/checkout', body);
}

export async function confirmCheckoutSession(sessionId) {
  return axiosInstance.post('/billing/checkout/confirm', { session_id: sessionId });
}
