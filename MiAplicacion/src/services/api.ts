const API_URL = 'https://apicasa.raelvispaulino.dev';

export type Tarea = { id: number; titulo: string; completada: boolean };
type RequestOptions = { method?: 'GET' | 'POST' | 'PUT' | 'DELETE'; body?: unknown; token?: string };

async function request<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const headers: Record<string, string> = { Accept: 'application/json' };
  if (options.body !== undefined) headers['Content-Type'] = 'application/json';
  if (options.token) headers.Authorization = `Bearer ${options.token}`;
  const response = await fetch(`${API_URL}${path}`, {
    method: options.method ?? 'GET', headers,
    ...(options.body === undefined ? {} : { body: JSON.stringify(options.body) }),
  });
  const data = await response.json().catch(() => null) as (T & { error?: string; mensaje?: string }) | null;
  if (!response.ok) throw new Error(data?.error || data?.mensaje || `Error del servidor (${response.status}).`);
  return data as T;
}

export const authApi = {
  registro: (body: { nombre: string; email: string; password: string }) =>
    request<{ id: number; nombre: string; rol: string }>('/auth/registro', { method: 'POST', body }),
  login: (body: { email: string; password: string }) =>
    request<{ token: string }>('/auth/login', { method: 'POST', body }),
};

export const tareasApi = {
  listar: (token: string) => request<Tarea[]>('/v2/tareas', { token }),
  crear: (token: string, titulo: string) => request<Tarea>('/v2/tareas', { method: 'POST', token, body: { titulo } }),
  actualizar: (token: string, tarea: Tarea, completada: boolean) =>
    request<Tarea>(`/v2/tareas/${tarea.id}`, { method: 'PUT', token, body: { titulo: tarea.titulo, completada } }),
  eliminar: (token: string, id: number) =>
    request<{ mensaje: string }>(`/v2/tareas/${id}`, { method: 'DELETE', token }),
};
