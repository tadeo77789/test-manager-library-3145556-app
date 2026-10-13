const BASE = (import.meta.env.VITE_API_URL || 'http://localhost:8000/api/v1').replace(/\/$/, '');

export const session = {
  get token() { return localStorage.getItem('token'); },
  get role() { return localStorage.getItem('role'); },
  set(token, role) { localStorage.setItem('token', token); localStorage.setItem('role', role); },
  clear() { localStorage.removeItem('token'); localStorage.removeItem('role'); },
};

export class ApiError extends Error {
  constructor(status, body) {
    super(body?.message || 'Error inesperado');
    this.status = status;
    this.code = body?.code;
    this.details = body?.details || [];
  }
}

function qs(params) {
  const p = new URLSearchParams();
  Object.entries(params || {}).forEach(([k, v]) => {
    if (v !== '' && v !== undefined && v !== null) p.set(k, v);
  });
  const s = p.toString();
  return s ? `?${s}` : '';
}

async function request(method, path, { params, body, form } = {}) {
  const headers = {};
  if (session.token) headers.Authorization = `Bearer ${session.token}`;
  let payload;
  if (form) payload = form;
  else if (body !== undefined) { headers['Content-Type'] = 'application/json'; payload = JSON.stringify(body); }
  let res;
  try {
    res = await fetch(BASE + path + qs(params), { method, headers, body: payload });
  } catch {
    throw new ApiError(0, { message: 'No se pudo conectar con el servidor.' });
  }
  if (res.status === 204) return null;
  let data = null;
  try { data = await res.json(); } catch { /* empty body */ }
  if (!res.ok) {
    if (res.status === 401 && path !== '/auth/login') {
      session.clear();
      window.dispatchEvent(new Event('auth:expired'));
    }
    if (res.status === 403 && !data?.message) data = { message: 'No tiene permisos para esta acción.' };
    throw new ApiError(res.status, data);
  }
  return data;
}

export const api = {
  login: (username, password) => request('POST', '/auth/login', { body: { username, password } }),
  createUser: (b) => request('POST', '/users', { body: b }),
  categories: () => request('GET', '/categories'),
  books: (params) => request('GET', '/books', { params }),
  createBook: (b) => request('POST', '/books', { body: b }),
  updateBook: (id, b) => request('PUT', `/books/${id}`, { body: b }),
  deleteBook: (id) => request('DELETE', `/books/${id}`),
  uploadCover: (id, file) => { const f = new FormData(); f.append('file', file); return request('PUT', `/books/${id}/cover`, { form: f }); },
  deleteCover: (id) => request('DELETE', `/books/${id}/cover`),
  members: (params) => request('GET', '/members', { params }),
  member: (id) => request('GET', `/members/${id}`),
  createMember: (b) => request('POST', '/members', { body: b }),
  createLoan: (b) => request('POST', '/loans', { body: b }),
  loans: (params) => request('GET', '/loans', { params }),
  loan: (id) => request('GET', `/loans/${id}`),
  returnItem: (loanId, itemId) => request('POST', `/loans/${loanId}/items/${itemId}/return`),
  overdue: (params) => request('GET', '/loans/overdue', { params }),
  report: (params) => request('GET', '/reports/most-borrowed', { params }),
  /** The cover endpoint needs the bearer token, so it is fetched as a blob. */
  async coverBlobUrl(id) {
    try {
      const res = await fetch(`${BASE}/books/${id}/cover`, { headers: { Authorization: `Bearer ${session.token}` } });
      if (!res.ok) return null;
      return URL.createObjectURL(await res.blob());
    } catch { return null; }
  },
};

export const fmtDate = (iso) => (iso ? new Date(iso).toLocaleString('es-CO', { dateStyle: 'medium', timeStyle: 'short' }) : '—');
