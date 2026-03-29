const BASE_URL = 'http://localhost:3000/todos';

export async function fetchTodos() {
  const res = await fetch(BASE_URL);
  if (!res.ok) throw new Error(`GET failed: ${res.status}`);
  return res.json();
}

export async function createTodo(content) {
  const res = await fetch(BASE_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ content, done: false }),
  });
  if (!res.ok) throw new Error(`POST failed: ${res.status}`);
  return res.json();
}

export async function deleteTodo(id) {
  const res = await fetch(`${BASE_URL}/${id}`, { method: 'DELETE' });
  if (!res.ok) throw new Error(`DELETE failed: ${res.status}`);
  return res.json();
}

export async function toggleTodo(id, completed) {
  const res = await fetch(`${BASE_URL}/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ done: completed }),
  });
  if (!res.ok) throw new Error(`PUT failed: ${res.status}`);
  return res.json();
}
