const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

export async function apiRequest<T>(
  path: string,
  options: RequestInit = {},
): Promise<T> {
  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
  
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...options.headers,
  };

  const response = await fetch(`${API_URL}${path}`, {
    ...options,
    headers,
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: 'Request failed' }));
    throw new Error((error as { message?: string }).message || 'Request failed');
  }

  if (response.status === 204) {
    return undefined as T;
  }

  return response.json() as Promise<T>;
}

export const auth = {
  login: (email: string, password: string) =>
    apiRequest<{ access_token: string; user: { id: string; email: string; createdAt: string } }>(
      '/auth/login',
      { method: 'POST', body: JSON.stringify({ email, password }) },
    ),
  register: (email: string, password: string) =>
    apiRequest<{ access_token: string; user: { id: string; email: string; createdAt: string } }>(
      '/auth/register',
      { method: 'POST', body: JSON.stringify({ email, password }) },
    ),
};

export const tasks = {
  getAll: () =>
    apiRequest<Array<{ id: string; title: string; completed: boolean; createdAt: string }>>('/tasks'),
  create: (title: string) =>
    apiRequest<{ id: string; title: string; completed: boolean; createdAt: string }>(
      '/tasks',
      { method: 'POST', body: JSON.stringify({ title }) },
    ),
  update: (id: string, data: { title?: string; completed?: boolean }) =>
    apiRequest<{ id: string; title: string; completed: boolean; createdAt: string }>(
      `/tasks/${id}`,
      { method: 'PUT', body: JSON.stringify(data) },
    ),
  delete: (id: string) =>
    apiRequest<void>(`/tasks/${id}`, { method: 'DELETE' }),
};
