import Cookies from 'js-cookie';

// Build the Authorization header for client-side fetches using the flp_token
export function authHeaders() {
  const token =
    Cookies.get('flp_token') ||
    (typeof window !== 'undefined' ? localStorage.getItem('flp_token') : null);
  return token ? { Authorization: `Bearer ${token}` } : {};
}
