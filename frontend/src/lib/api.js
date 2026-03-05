/**
 * apiFetch — cross-origin fetch helper targeting FastAPI.
 * Attaches a Supabase JWT Bearer token if a session exists.
 *
 * Usage:
 *   const res = await apiFetch('/matches', { method: 'GET' })
 *   const data = await res.json()
 */
export async function apiFetch(path, options = {}) {
  const { createClient } = await import('./supabase/client')
  const supabase = createClient()
  const {
    data: { session },
  } = await supabase.auth.getSession()

  const headers = {
    'Content-Type': 'application/json',
    ...(session ? { Authorization: `Bearer ${session.access_token}` } : {}),
    ...(options.headers || {}),
  }

  return fetch(`${process.env.NEXT_PUBLIC_API_URL}${path}`, {
    ...options,
    headers,
  })
}
